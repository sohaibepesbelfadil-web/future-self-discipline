import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useMyScore, getRankFromScore } from '@/hooks/useScores';
import Navbar from '@/components/Navbar';
import FutureMessage from '@/components/FutureMessage';
import StatsSection from '@/components/StatsSection';
import ProgressGraph from '@/components/ProgressGraph';
import CalendarPreview from '@/components/CalendarPreview';
import RankBadge from '@/components/RankBadge';
import { Trophy, Users, UserCircle } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: myScore } = useMyScore();

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground font-mono">Loading...</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (profile && !profile.onboarding_completed) return <Navigate to="/onboarding" replace />;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-12 px-6">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Score Banner */}
          {myScore && (
            <div className="glass-card p-6 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Link to="/profile" className="group">
                  <div className="w-16 h-16 bg-muted border border-border flex items-center justify-center group-hover:border-primary transition-colors">
                    <span className="text-2xl font-mono font-bold text-muted-foreground">
                      {(profile?.display_name || profile?.username || 'U')[0].toUpperCase()}
                    </span>
                  </div>
                </Link>
                <div>
                  <p className="font-mono text-lg font-bold">
                    {profile?.display_name || profile?.username || 'Anonymous'}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <RankBadge score={myScore.discipline_score} showScore />
                    <span className="text-sm text-muted-foreground">
                      {myScore.current_streak} day streak
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  to="/leaderboard"
                  className="p-3 glass-card hover:border-primary/50 transition-colors"
                  title="Leaderboard"
                >
                  <Trophy className="w-5 h-5 text-muted-foreground" />
                </Link>
                <Link
                  to="/connections"
                  className="p-3 glass-card hover:border-primary/50 transition-colors"
                  title="Connections"
                >
                  <Users className="w-5 h-5 text-muted-foreground" />
                </Link>
                <Link
                  to="/groups"
                  className="p-3 glass-card hover:border-primary/50 transition-colors"
                  title="Groups"
                >
                  <UserCircle className="w-5 h-5 text-muted-foreground" />
                </Link>
              </div>
            </div>
          )}

          <FutureMessage />
          <StatsSection />
          <div className="grid md:grid-cols-2 gap-6">
            <ProgressGraph />
            <CalendarPreview />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
