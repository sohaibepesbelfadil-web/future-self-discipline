import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PublicProfile {
  id: string;
  user_id: string;
  username: string | null;
  display_name: string | null;
  real_name: string | null;
  gender: string | null;
  age: number | null;
  profile_visible: boolean;
  created_at: string;
}

export const usePublicProfile = (username: string) => {
  return useQuery({
    queryKey: ['public-profile', username],
    queryFn: async () => {
      if (!username) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_id, username, display_name, real_name, gender, age, profile_visible, created_at')
        .eq('username', username)
        .maybeSingle();

      if (error) throw error;
      return data as PublicProfile | null;
    },
    enabled: !!username,
  });
};
