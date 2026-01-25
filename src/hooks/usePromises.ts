import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Promise {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DailyLog {
  id: string;
  user_id: string;
  promise_id: string;
  log_date: string;
  status: 'kept' | 'broken' | 'pending';
  reflection: string | null;
  created_at: string;
  updated_at: string;
}

export const usePromises = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['promises', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('promises')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Promise[];
    },
    enabled: !!user,
  });
};

export const useActivePromises = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['promises', 'active', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('promises')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Promise[];
    },
    enabled: !!user,
  });
};

export const useCreatePromise = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (promise: { title: string; description?: string; end_date: string }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('promises')
        .insert({
          user_id: user.id,
          title: promise.title,
          description: promise.description || null,
          start_date: new Date().toISOString().split('T')[0],
          end_date: promise.end_date,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promises'] });
    },
  });
};

export const useDailyLogs = (promiseId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['daily_logs', promiseId, user?.id],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', user.id);

      if (promiseId) {
        query = query.eq('promise_id', promiseId);
      }

      const { data, error } = await query.order('log_date', { ascending: false });

      if (error) throw error;
      return data as DailyLog[];
    },
    enabled: !!user,
  });
};

export const useAllDailyLogs = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['daily_logs', 'all', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('log_date', { ascending: false });

      if (error) throw error;
      return data as DailyLog[];
    },
    enabled: !!user,
  });
};

export const useLogDay = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (log: { promise_id: string; log_date: string; status: 'kept' | 'broken'; reflection?: string }) => {
      if (!user) throw new Error('Not authenticated');

      // First try to update existing log
      const { data: existing } = await supabase
        .from('daily_logs')
        .select('id')
        .eq('promise_id', log.promise_id)
        .eq('log_date', log.log_date)
        .maybeSingle();

      if (existing) {
        const { data, error } = await supabase
          .from('daily_logs')
          .update({
            status: log.status,
            reflection: log.reflection || null,
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      }

      // Insert new log
      const { data, error } = await supabase
        .from('daily_logs')
        .insert({
          user_id: user.id,
          promise_id: log.promise_id,
          log_date: log.log_date,
          status: log.status,
          reflection: log.reflection || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily_logs'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
};

export const useStats = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['stats', user?.id],
    queryFn: async () => {
      if (!user) return { kept: 0, broken: 0, total: 0, score: 0 };

      const { data, error } = await supabase
        .from('daily_logs')
        .select('status')
        .eq('user_id', user.id);

      if (error) throw error;

      const kept = data.filter(l => l.status === 'kept').length;
      const broken = data.filter(l => l.status === 'broken').length;
      const total = kept + broken;
      const score = total > 0 ? Math.round((kept / total) * 100) : 0;

      return { kept, broken, total, score };
    },
    enabled: !!user,
  });
};
