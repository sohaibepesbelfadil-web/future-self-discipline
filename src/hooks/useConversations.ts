import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export function useConversations() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data as Conversation[];
    },
    enabled: !!user,
  });
}

export function useConversationMessages(conversationId: string | null) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['chat_messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as ChatMessage[];
    },
    enabled: !!user && !!conversationId,
  });
}

export function useCreateConversation() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (title: string) => {
      const { data, error } = await supabase
        .from('conversations')
        .insert({ user_id: user!.id, title })
        .select()
        .single();
      if (error) throw error;
      return data as Conversation;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['conversations'] }),
  });
}

export function useSaveMessage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ conversationId, role, content }: { conversationId: string; role: 'user' | 'assistant'; content: string }) => {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({ conversation_id: conversationId, user_id: user!.id, role, content })
        .select()
        .single();
      if (error) throw error;
      // Update conversation timestamp
      await supabase.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', conversationId);
      return data as ChatMessage;
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['chat_messages', vars.conversationId] }),
  });
}

export function useDeleteConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('conversations').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['conversations'] }),
  });
}
