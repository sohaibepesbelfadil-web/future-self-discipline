import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useMyScore } from '@/hooks/useScores';
import ResponsiveNavbar from '@/components/ResponsiveNavbar';
import BottomNavbar from '@/components/BottomNavbar';
import FutureMessage from '@/components/FutureMessage';
import StatsSection from '@/components/StatsSection';
import ProgressGraph from '@/components/ProgressGraph';
import CalendarPreview from '@/components/CalendarPreview';
import RankBadge from '@/components/RankBadge';
import StreakDisplay from '@/components/StreakDisplay';
import { StaggerContainer, StaggerItem, PremiumCard, PageLoading } from '@/components/PageTransition';
import { motion } from 'framer-motion';
import { Trophy, Users, ChevronRight, Sparkles } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: myScore } = useMyScore();

  if (authLoading || profileLoading) {
    return <PageLoading />;
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (profile && !profile.onboarding_completed) return <Navigate to="/onboarding" replace />;

  return (
    <div className="min-h-screen bg-background">
      <ResponsiveNavbar />
      <main className="pt-16 md:pt-20 pb-24 md:pb-12 px-4 md:px-6">
        <StaggerContainer className="max-w-6xl mx-auto space-y-5 md:space-y-7">
          {/* Score Banner */}
          {myScore && (
            <StaggerItem>
              <Link to="/profile">
                <PremiumCard className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 md:gap-6">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="w-14 h-14 md:w-16 md:h-16 rounded-2xl overflow-hidden border-2 border-primary/20 flex items-center justify-center bg-muted"
                        style={{ boxShadow: 'var(--glow-primary)' }}
                      >
                        {profile?.avatar_url ? (
                          <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xl md:text-2xl font-mono font-bold text-muted-foreground">
                            {(profile?.real_name || profile?.display_name || profile?.username || 'U')[0].toUpperCase()}
                          </span>
                        )}
                      </motion.div>
                      <div>
                        <p className="font-semibold text-base md:text-lg">
                          {profile?.real_name || profile?.display_name || profile?.username || 'Anonymous'}
                        </p>
                        <div className="flex items-center gap-2 md:gap-3 mt-1">
                          <RankBadge score={myScore.discipline_score} showScore />
                          <span className="text-xs md:text-sm text-muted-foreground">
                            {myScore.current_streak} day streak
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </PremiumCard>
              </Link>
            </StaggerItem>
          )}

          {/* Quick Actions */}
          <StaggerItem>
            <div className="grid grid-cols-3 gap-3">
              {[
                { to: '/ask', icon: Sparkles, label: 'Ask AI', gradient: 'from-primary/10 to-accent/10' },
                { to: '/leaderboard', icon: Trophy, label: 'Ranks', gradient: 'from-warning/10 to-primary/10' },
                { to: '/connections', icon: Users, label: 'Connect', gradient: 'from-success/10 to-primary/10' },
              ].map(({ to, icon: Icon, label, gradient }) => (
                <Link key={to} to={to}>
                  <motion.div
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className={`glass-card p-4 flex flex-col items-center gap-2 bg-gradient-to-br ${gradient} hover:border-primary/30 transition-all`}
                  >
                    <Icon className="w-5 h-5 text-primary" />
                    <span className="text-xs font-medium text-foreground/80">{label}</span>
                  </motion.div>
                </Link>
              ))}
            </div>
          </StaggerItem>

          <StaggerItem>
            <FutureMessage />
          </StaggerItem>

          {myScore && (
            <StaggerItem>
              <StreakDisplay
                currentStreak={myScore.current_streak}
                longestStreak={myScore.longest_streak}
                variant="full"
              />
            </StaggerItem>
          )}

          <StaggerItem>
            <StatsSection />
          </StaggerItem>

          <StaggerItem>
            <div className="grid md:grid-cols-2 gap-4 md:gap-6">
              <ProgressGraph />
              <CalendarPreview />
            </div>
          </StaggerItem>
        </StaggerContainer>
      </main>
      <BottomNavbar />
    </div>
  );
};

export default Dashboard;
