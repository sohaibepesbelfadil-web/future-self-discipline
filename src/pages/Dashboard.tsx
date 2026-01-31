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
import { StaggerContainer, StaggerItem, PremiumCard } from '@/components/PageTransition';
import { motion } from 'framer-motion';
import { Trophy, Users, UserCircle, ChevronRight } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: myScore } = useMyScore();

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-muted-foreground font-mono"
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (profile && !profile.onboarding_completed) return <Navigate to="/onboarding" replace />;

  return (
    <div className="min-h-screen bg-background">
      <ResponsiveNavbar />
      <main className="pt-16 md:pt-20 pb-24 md:pb-12 px-4 md:px-6">
        <StaggerContainer className="max-w-6xl mx-auto space-y-6 md:space-y-8">
          {/* Score Banner */}
          {myScore && (
            <StaggerItem>
              <Link to="/profile">
                <PremiumCard className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 md:gap-6">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="avatar-premium w-14 h-14 md:w-16 md:h-16"
                      >
                        <span className="relative z-10 text-xl md:text-2xl font-mono font-bold text-muted-foreground">
                          {(profile?.real_name || profile?.display_name || profile?.username || 'U')[0].toUpperCase()}
                        </span>
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
                { to: '/leaderboard', icon: Trophy, label: 'Ranks' },
                { to: '/connections', icon: Users, label: 'Connections' },
                { to: '/groups', icon: UserCircle, label: 'Groups' },
              ].map(({ to, icon: Icon, label }) => (
                <Link key={to} to={to}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="glass-card p-4 flex flex-col items-center gap-2 hover:border-primary/50 transition-all"
                  >
                    <Icon className="w-5 h-5 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">{label}</span>
                  </motion.div>
                </Link>
              ))}
            </div>
          </StaggerItem>

          <StaggerItem>
            <FutureMessage />
          </StaggerItem>

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
