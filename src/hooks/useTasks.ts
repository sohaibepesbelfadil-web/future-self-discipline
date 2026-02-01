import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  task_date: string;
  start_time: string;
  end_time: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export const useTasks = (date?: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['tasks', user?.id, date],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('task_date', { ascending: true })
        .order('start_time', { ascending: true });
      
      if (date) {
        query = query.eq('task_date', date);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Task[];
    },
    enabled: !!user,
  });
};

export const useTasksByDateRange = (startDate: string, endDate: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['tasks', user?.id, startDate, endDate],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .gte('task_date', startDate)
        .lte('task_date', endDate)
        .order('task_date', { ascending: true })
        .order('start_time', { ascending: true });
      
      if (error) throw error;
      return data as Task[];
    },
    enabled: !!user && !!startDate && !!endDate,
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (task: { title: string; description?: string; task_date: string; start_time: string; end_time: string; color: string }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('tasks')
        .insert({ ...task, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({ title: 'Task created', description: 'Your task has been added to the calendar.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Task> & { id: string }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({ title: 'Task updated', description: 'Your changes have been saved.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({ title: 'Task deleted', description: 'Your task has been removed.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
};
