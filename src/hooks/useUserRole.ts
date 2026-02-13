import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useUserRole = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-role', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (error) return 'user' as const;
      return data.role as 'admin' | 'moderator' | 'user';
    },
    enabled: !!user,
  });
};

export const useIsAdminOrMod = () => {
  const { data: role, isLoading } = useUserRole();
  return {
    isAdmin: role === 'admin',
    isModerator: role === 'moderator',
    isAdminOrMod: role === 'admin' || role === 'moderator',
    isLoading,
  };
};
