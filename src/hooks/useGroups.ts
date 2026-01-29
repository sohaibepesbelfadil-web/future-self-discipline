import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type GroupType = 'public' | 'private';
export type GroupMemberStatus = 'pending' | 'member' | 'admin';

export interface Group {
  id: string;
  name: string;
  description: string | null;
  group_type: GroupType;
  owner_id: string;
  member_count: number;
  average_score: number;
  created_at: string;
  updated_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  status: GroupMemberStatus;
  joined_at: string | null;
  created_at: string;
  profile?: {
    username: string | null;
    display_name: string | null;
  };
  score?: {
    discipline_score: number;
    consistency_percentage: number;
  };
}

export const useGroups = () => {
  return useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .order('average_score', { ascending: false });

      if (error) throw error;
      return data as Group[];
    },
  });
};

export const useMyGroups = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['my_groups', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data: memberOf, error } = await supabase
        .from('group_members')
        .select(`
          group_id,
          status,
          groups (*)
        `)
        .eq('user_id', user.id)
        .in('status', ['member', 'admin']);

      if (error) throw error;

      return memberOf?.map(m => ({
        ...m.groups,
        my_status: m.status,
      })) || [];
    },
    enabled: !!user,
  });
};

export const useGroup = (groupId: string) => {
  return useQuery({
    queryKey: ['group', groupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .eq('id', groupId)
        .single();

      if (error) throw error;
      return data as Group;
    },
    enabled: !!groupId,
  });
};

export const useGroupMembers = (groupId: string) => {
  return useQuery({
    queryKey: ['group_members', groupId],
    queryFn: async () => {
      if (!groupId) return [];

      const { data, error } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', groupId)
        .in('status', ['member', 'admin']);

      if (error) throw error;

      // Get profiles and scores for members
      const userIds = data.map(m => m.user_id);
      
      const [{ data: profiles }, { data: scores }] = await Promise.all([
        supabase.from('profiles').select('user_id, username, display_name').in('user_id', userIds),
        supabase.from('user_scores').select('user_id, discipline_score, consistency_percentage').in('user_id', userIds),
      ]);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      const scoreMap = new Map(scores?.map(s => [s.user_id, s]) || []);

      const members = data.map(m => ({
        ...m,
        profile: profileMap.get(m.user_id),
        score: scoreMap.get(m.user_id),
      }));

      // Sort by discipline score
      return members.sort((a, b) => (b.score?.discipline_score || 0) - (a.score?.discipline_score || 0));
    },
    enabled: !!groupId,
  });
};

export const useCreateGroup = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (group: { name: string; description?: string; group_type: GroupType }) => {
      if (!user) throw new Error('Not authenticated');

      // Create the group
      const { data: newGroup, error } = await supabase
        .from('groups')
        .insert({
          name: group.name,
          description: group.description || null,
          group_type: group.group_type,
          owner_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Add creator as admin member
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: newGroup.id,
          user_id: user.id,
          status: 'admin',
          joined_at: new Date().toISOString(),
        });

      if (memberError) throw memberError;

      return newGroup;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['my_groups'] });
    },
  });
};

export const useJoinGroup = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (groupId: string) => {
      if (!user) throw new Error('Not authenticated');

      // Check if group is public or private
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .select('group_type')
        .eq('id', groupId)
        .single();

      if (groupError) throw groupError;

      const status = group.group_type === 'public' ? 'member' : 'pending';
      const joined_at = status === 'member' ? new Date().toISOString() : null;

      const { data, error } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          user_id: user.id,
          status,
          joined_at,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['my_groups'] });
      queryClient.invalidateQueries({ queryKey: ['group_members'] });
    },
  });
};

export const useLeaveGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (groupId: string) => {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['my_groups'] });
      queryClient.invalidateQueries({ queryKey: ['group_members'] });
    },
  });
};

export const useApproveMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memberId, approve }: { memberId: string; approve: boolean }) => {
      if (!approve) {
        const { error } = await supabase
          .from('group_members')
          .delete()
          .eq('id', memberId);

        if (error) throw error;
        return null;
      }

      const { data, error } = await supabase
        .from('group_members')
        .update({
          status: 'member',
          joined_at: new Date().toISOString(),
        })
        .eq('id', memberId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group_members'] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
};

export const usePendingGroupMembers = (groupId: string) => {
  return useQuery({
    queryKey: ['pending_group_members', groupId],
    queryFn: async () => {
      if (!groupId) return [];

      const { data, error } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', groupId)
        .eq('status', 'pending');

      if (error) throw error;

      const userIds = data.map(m => m.user_id);
      if (userIds.length === 0) return [];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, username, display_name')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      return data.map(m => ({
        ...m,
        profile: profileMap.get(m.user_id),
      }));
    },
    enabled: !!groupId,
  });
};
