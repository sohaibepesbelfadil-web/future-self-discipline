import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  category: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export const useSupportTickets = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['support-tickets', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SupportTicket[];
    },
    enabled: !!user,
  });
};

export const useCreateSupportTicket = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (ticket: { subject: string; message: string; category: string }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('support_tickets')
        .insert({
          user_id: user.id,
          ...ticket,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      toast({ title: 'Ticket submitted', description: 'We\'ll get back to you soon.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
};
