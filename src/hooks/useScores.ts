import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserScore {
  id: string;
  user_id: string;
  discipline_score: number;
  total_promises: number;
  promises_kept: number;
  promises_broken: number;
  current_streak: number;
  longest_streak: number;
  consistency_percentage: number;
  leaderboard_visible: boolean;
  created_at: string;
  updated_at: string;
}

// Rank thresholds and titles
export const RANKS = [
  { name: 'Observer', minScore: 0, maxScore: 99 },
  { name: 'Builder', minScore: 100, maxScore: 299 },
  { name: 'Disciplined', minScore: 300, maxScore: 699 },
  { name: 'Relentless', minScore: 700, maxScore: 1499 },
  { name: 'Unbreakable', minScore: 1500, maxScore: Infinity },
] as const;

export const getRankFromScore = (score: number): string => {
  const rank = RANKS.find(r => score >= r.minScore && score <= r.maxScore);
  return rank?.name || 'Observer';
};

export const getRankProgress = (score: number): { current: string; next: string | null; progress: number } => {
  const currentRankIndex = RANKS.findIndex(r => score >= r.minScore && score <= r.maxScore);
  const currentRank = RANKS[currentRankIndex] || RANKS[0];
  const nextRank = RANKS[currentRankIndex + 1];

  if (!nextRank) {
    return { current: currentRank.name, next: null, progress: 100 };
  }

  const rangeSize = currentRank.maxScore - currentRank.minScore + 1;
  const progressInRange = score - currentRank.minScore;
  const progress = Math.min(100, Math.round((progressInRange / rangeSize) * 100));

  return { current: currentRank.name, next: nextRank.name, progress };
};

export const useMyScore = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user_score', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_scores')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as UserScore | null;
    },
    enabled: !!user,
  });
};

export const useUserScore = (userId: string) => {
  return useQuery({
    queryKey: ['user_score', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_scores')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return data as UserScore | null;
    },
    enabled: !!userId,
  });
};

export const useLeaderboard = (limit = 50) => {
  return useQuery({
    queryKey: ['leaderboard', limit],
    queryFn: async () => {
      // First get all visible scores
      const { data: scores, error } = await supabase
        .from('user_scores')
        .select('*')
        .eq('leaderboard_visible', true)
        .order('discipline_score', { ascending: false })
        .order('consistency_percentage', { ascending: false })
        .limit(limit);

      if (error) throw error;
      if (!scores || scores.length === 0) return [];

      // Get profiles for these users
      const userIds = scores.map(s => s.user_id);
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, username, display_name, profile_visible')
        .in('user_id', userIds);

      if (profileError) throw profileError;

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      return scores.map(score => ({
        ...score,
        profiles: profileMap.get(score.user_id),
      }));
    },
  });
};

export const useUpdateScoreSettings = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (updates: { leaderboard_visible?: boolean }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_scores')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_score'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    },
  });
};
