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
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Trophy, Users, ChevronRight, Sparkles, FileText, CalendarCheck, Target, Shield, Flame, ArrowRight, Zap } from 'lucide-react';

const AnimatedCounter: React.FC<{ value: number; suffix?: string }> = ({ value, suffix = '' }) => {
  const [display, setDisplay] = React.useState(0);

  React.useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;
    const duration = 1200;
    const stepTime = Math.max(Math.floor(duration / end), 16);
    const timer = setInterval(() => {
      start += 1;
      setDisplay(start);
      if (start >= end) clearInterval(timer);
    }, stepTime);
    return () => clearInterval(timer);
  }, [value]);

  return <>{display}{suffix}</>;
};

const FeatureCard: React.FC<{ icon: React.ElementType; title: string; desc: string; to: string; gradient: string; delay: number }> = ({
  icon: Icon, title, desc, to, gradient, delay
}) => (
  <Link to={to}>
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 300, damping: 25 }}
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.97 }}
      className={`glass-card p-5 group hover:border-primary/30 transition-all duration-300 relative overflow-hidden`}
    >
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${gradient}`} />
      <div className="relative z-10">
        <motion.div
          className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center mb-3 group-hover:border-primary/30 transition-colors"
          whileHover={{ rotate: [0, -8, 8, 0] }}
          transition={{ duration: 0.5 }}
        >
          <Icon className="w-5 h-5 text-primary" />
        </motion.div>
        <h4 className="font-semibold text-sm mb-1">{title}</h4>
        <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  </Link>
);

const Dashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: myScore } = useMyScore();

  if (authLoading || profileLoading) {
    return <PageLoading />;
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (profile && !profile.onboarding_completed) return <Navigate to="/onboarding" replace />;

  const firstName = (profile?.real_name || profile?.display_name || profile?.username || 'Champion').split(' ')[0];

  return (
    <div className="min-h-screen bg-background">
      <ResponsiveNavbar />

      {/* Animated background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-20 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.04]"
          style={{ background: 'hsl(var(--primary))' }}
        />
        <motion.div
          animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-40 right-1/4 w-[400px] h-[400px] rounded-full blur-[100px] opacity-[0.03]"
          style={{ background: 'hsl(var(--success))' }}
        />
      </div>

      <main className="relative z-10 pt-20 md:pt-24 pb-28 md:pb-16 px-4 md:px-6">
        <StaggerContainer className="max-w-6xl mx-auto space-y-6 md:space-y-8">

          {/* ─── Hero Section ─── */}
          <StaggerItem>
            <div className="relative overflow-hidden rounded-3xl">
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-card to-card" />
              <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent" />
              <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

              <div className="relative p-6 md:p-10">
                {/* Greeting */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                  className="flex items-center gap-3 mb-4"
                >
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full">
                    <Zap className="w-3.5 h-3.5 text-primary" />
                    <span className="text-[10px] font-mono uppercase tracking-widest text-primary">
                      Your Discipline Hub
                    </span>
                  </div>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
                  className="text-3xl md:text-5xl font-bold tracking-tight mb-3"
                >
                  Welcome back,{' '}
                  <span className="text-gradient">{firstName}</span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed mb-6"
                >
                  Track your promises, build unbreakable habits, and become the person your future self will thank.
                </motion.p>

                {/* Score + Streak inline */}
                {myScore && (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="flex flex-wrap items-center gap-3 mb-6"
                  >
                    <Link to="/profile">
                      <motion.div
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="inline-flex items-center gap-3 px-4 py-2.5 glass-card hover:border-primary/30 transition-all"
                      >
                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-primary/20 flex items-center justify-center bg-muted">
                          {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-sm font-mono font-bold text-muted-foreground">
                              {firstName[0].toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <RankBadge score={myScore.discipline_score} showScore />
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </motion.div>
                    </Link>
                    <div className="flex items-center gap-2 px-4 py-2.5 glass-card">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="text-warning"
                      >
                        <Flame className="w-5 h-5" />
                      </motion.div>
                      <span className="font-bold font-mono text-lg">
                        <AnimatedCounter value={myScore.current_streak} />
                      </span>
                      <span className="text-xs text-muted-foreground">day streak</span>
                    </div>
                  </motion.div>
                )}

                {/* CTA buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-wrap gap-3"
                >
                  <Link to="/tasks">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="btn-harsh group flex items-center gap-2 text-xs"
                    >
                      <CalendarCheck className="w-4 h-4" />
                      Start a Task
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </motion.button>
                  </Link>
                  <Link to="/notes">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="btn-outline-harsh text-xs flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      Create a Note
                    </motion.button>
                  </Link>
                  <Link to="/leaderboard">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="btn-outline-harsh text-xs flex items-center gap-2"
                    >
                      <Trophy className="w-4 h-4" />
                      View Classement
                    </motion.button>
                  </Link>
                </motion.div>
              </div>
            </div>
          </StaggerItem>

          {/* ─── Feature Cards Grid ─── */}
          <StaggerItem>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <FeatureCard icon={CalendarCheck} title="Tasks" desc="Organize your day" to="/tasks" gradient="from-primary/10 to-transparent" delay={0.35} />
              <FeatureCard icon={FileText} title="Notes" desc="Capture thoughts" to="/notes" gradient="from-success/10 to-transparent" delay={0.4} />
              <FeatureCard icon={Users} title="Groups" desc="Grow together" to="/groups" gradient="from-info/10 to-transparent" delay={0.45} />
              <FeatureCard icon={Trophy} title="Classement" desc="Compete & climb" to="/leaderboard" gradient="from-warning/10 to-transparent" delay={0.5} />
              <FeatureCard icon={Sparkles} title="Ask AI" desc="Get guidance" to="/ask" gradient="from-accent/30 to-transparent" delay={0.55} />
            </div>
          </StaggerItem>

          {/* ─── Motivational Quote ─── */}
          <StaggerItem>
            <motion.div
              className="text-center py-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-xs font-mono text-muted-foreground/60 uppercase tracking-[0.2em]">
                "Discipline is choosing between what you want now and what you want most."
              </p>
            </motion.div>
          </StaggerItem>

          {/* ─── Future Message ─── */}
          <StaggerItem>
            <FutureMessage />
          </StaggerItem>

          {/* ─── Streak Display ─── */}
          {myScore && (
            <StaggerItem>
              <StreakDisplay
                currentStreak={myScore.current_streak}
                longestStreak={myScore.longest_streak}
                variant="full"
              />
            </StaggerItem>
          )}

          {/* ─── Stats ─── */}
          <StaggerItem>
            <StatsSection />
          </StaggerItem>

          {/* ─── Charts + Calendar ─── */}
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
