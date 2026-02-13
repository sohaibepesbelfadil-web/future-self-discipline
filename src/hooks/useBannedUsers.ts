import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface BannedUser {
  id: string;
  user_id: string;
  banned_by: string;
  reason: string | null;
  ban_type: string;
  expires_at: string | null;
  created_at: string;
  profile?: {
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
    email: string | null;
  };
}

export const useBannedUsers = () => {
  return useQuery({
    queryKey: ['banned-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('banned_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data) return [];

      const userIds = [...new Set(data.map(b => b.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, username, display_name, avatar_url, email')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      return data.map(ban => ({
        ...ban,
        profile: profileMap.get(ban.user_id) || undefined,
      })) as BannedUser[];
    },
  });
};

export const useBanUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      userId,
      bannedBy,
      reason,
      banType,
      expiresAt,
    }: {
      userId: string;
      bannedBy: string;
      reason?: string;
      banType: 'permanent' | 'temporary';
      expiresAt?: string;
    }) => {
      const { error } = await supabase.from('banned_users').insert({
        user_id: userId,
        banned_by: bannedBy,
        reason: reason || null,
        ban_type: banType,
        expires_at: expiresAt || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banned-users'] });
      toast({ title: 'User banned', description: 'The user has been banned successfully.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
};

export const useUnbanUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (banId: string) => {
      const { error } = await supabase
        .from('banned_users')
        .delete()
        .eq('id', banId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banned-users'] });
      toast({ title: 'User unbanned', description: 'The ban has been removed.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
};
