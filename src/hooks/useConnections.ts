import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type ConnectionType = 'friend' | 'family';
export type ConnectionStatus = 'pending' | 'accepted' | 'rejected';

export interface Connection {
  id: string;
  requester_id: string;
  addressee_id: string;
  connection_type: ConnectionType;
  status: ConnectionStatus;
  hide_broken_promises: boolean;
  created_at: string;
  updated_at: string;
}

export interface ConnectionWithProfile extends Connection {
  requester_profile?: {
    username: string | null;
    display_name: string | null;
  };
  addressee_profile?: {
    username: string | null;
    display_name: string | null;
  };
}

export const useConnections = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['connections', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get connections where user is requester
      const { data: asRequester, error: error1 } = await supabase
        .from('connections')
        .select('*')
        .eq('requester_id', user.id)
        .eq('status', 'accepted');

      // Get connections where user is addressee
      const { data: asAddressee, error: error2 } = await supabase
        .from('connections')
        .select('*')
        .eq('addressee_id', user.id)
        .eq('status', 'accepted');

      if (error1) throw error1;
      if (error2) throw error2;

      // Get all connected user IDs
      const connectedIds = [
        ...(asRequester || []).map(c => c.addressee_id),
        ...(asAddressee || []).map(c => c.requester_id),
      ];

      // Fetch profiles for connected users
      if (connectedIds.length === 0) return [];

      const { data: profiles, error: error3 } = await supabase
        .from('profiles')
        .select('user_id, username, display_name')
        .in('user_id', connectedIds);

      if (error3) throw error3;

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      // Combine connections with profiles
      const connections = [
        ...(asRequester || []).map(c => ({
          ...c,
          connected_user_id: c.addressee_id,
          profile: profileMap.get(c.addressee_id),
        })),
        ...(asAddressee || []).map(c => ({
          ...c,
          connected_user_id: c.requester_id,
          profile: profileMap.get(c.requester_id),
        })),
      ];

      return connections;
    },
    enabled: !!user,
  });
};

export const usePendingRequests = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['pending_requests', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('connections')
        .select('*')
        .eq('addressee_id', user.id)
        .eq('status', 'pending');

      if (error) throw error;

      // Get requester profiles
      const requesterIds = data.map(c => c.requester_id);
      if (requesterIds.length === 0) return [];

      const { data: profiles, error: error2 } = await supabase
        .from('profiles')
        .select('user_id, username, display_name')
        .in('user_id', requesterIds);

      if (error2) throw error2;

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      return data.map(c => ({
        ...c,
        requester_profile: profileMap.get(c.requester_id),
      }));
    },
    enabled: !!user,
  });
};

export const useSendConnectionRequest = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ addressee_id, connection_type }: { addressee_id: string; connection_type: ConnectionType }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('connections')
        .insert({
          requester_id: user.id,
          addressee_id,
          connection_type,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    },
  });
};

export const useRespondToRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ connectionId, accept }: { connectionId: string; accept: boolean }) => {
      const { data, error } = await supabase
        .from('connections')
        .update({ status: accept ? 'accepted' : 'rejected' })
        .eq('id', connectionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      queryClient.invalidateQueries({ queryKey: ['pending_requests'] });
    },
  });
};

export const useRemoveConnection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (connectionId: string) => {
      const { error } = await supabase
        .from('connections')
        .delete()
        .eq('id', connectionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    },
  });
};

export const useSearchUsers = (searchTerm: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['search_users', searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return [];

      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, username, display_name')
        .neq('user_id', user?.id)
        .or(`username.ilike.%${searchTerm}%,display_name.ilike.%${searchTerm}%`)
        .limit(10);

      if (error) throw error;
      return data;
    },
    enabled: !!user && searchTerm.length >= 2,
  });
};
