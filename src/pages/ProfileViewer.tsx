import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePublicProfile } from '@/hooks/usePublicProfile';
import { useUserScore, getRankFromScore } from '@/hooks/useScores';
import ResponsiveNavbar from '@/components/ResponsiveNavbar';
import BottomNavbar from '@/components/BottomNavbar';
import RankBadge from '@/components/RankBadge';
import ScoreCard from '@/components/ScoreCard';
import { StaggerContainer, StaggerItem, PremiumCard } from '@/components/PageTransition';
import { ArrowLeft, Lock, Unlock, User, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const ProfileViewer: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = usePublicProfile(username || '');
  const { data: score, isLoading: scoreLoading } = useUserScore(profile?.user_id || '');

  const isLoading = profileLoading || scoreLoading;
  const isOwnProfile = user?.id === profile?.user_id;

  if (isLoading) {
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

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <ResponsiveNavbar />
        <main className="pt-16 md:pt-20 pb-24 md:pb-12 px-4 md:px-6">
          <StaggerContainer className="max-w-2xl mx-auto text-center space-y-6">
            <StaggerItem>
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="profile-card p-8"
              >
                <div className="relative z-10 space-y-4">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-muted/50 flex items-center justify-center">
                    <User className="w-10 h-10 text-muted-foreground/50" />
                  </div>
                  <h1 className="text-2xl font-bold">Profile Not Found</h1>
                  <p className="text-muted-foreground">This user doesn't exist or has been removed.</p>
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                  </Link>
                </div>
              </motion.div>
            </StaggerItem>
          </StaggerContainer>
        </main>
        <BottomNavbar />
      </div>
    );
  }

  // Private profile - Premium locked UI
  if (!profile.profile_visible && !isOwnProfile) {
    return (
      <div className="min-h-screen bg-background">
        <ResponsiveNavbar />
        <main className="pt-16 md:pt-20 pb-24 md:pb-12 px-4 md:px-6">
          <StaggerContainer className="max-w-2xl mx-auto space-y-6">
            <StaggerItem>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Link>
            </StaggerItem>

            <StaggerItem>
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="profile-card p-8 text-center"
              >
                <div className="relative z-10 space-y-6">
                  {/* Locked Avatar */}
                  <motion.div
                    animate={{ 
                      boxShadow: ['0 0 20px hsl(var(--muted) / 0.3)', '0 0 40px hsl(var(--muted) / 0.5)', '0 0 20px hsl(var(--muted) / 0.3)']
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-24 h-24 mx-auto rounded-2xl bg-muted border-2 border-border flex items-center justify-center"
                  >
                    <Lock className="w-10 h-10 text-muted-foreground" />
                  </motion.div>

                  {/* Username */}
                  <div>
                    <h1 className="text-2xl font-mono font-bold">@{profile.username}</h1>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-full bg-muted/50 border border-border"
                    >
                      <Lock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground font-medium">Private Profile</span>
                    </motion.div>
                  </div>

                  {/* Privacy Message */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="max-w-sm mx-auto"
                  >
                    <p className="text-muted-foreground">
                      This profile is private. Only the owner can view their full information.
                    </p>
                  </motion.div>

                  {/* Blurred placeholder content */}
                  <div className="relative mt-8">
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card/80 backdrop-blur border border-border">
                        <Lock className="w-4 h-4" />
                        <span className="text-sm font-medium">Content Hidden</span>
                      </div>
                    </div>
                    <div className="blur-md opacity-30 pointer-events-none space-y-4">
                      <div className="h-24 bg-muted rounded-2xl" />
                      <div className="h-32 bg-muted rounded-2xl" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </StaggerItem>
          </StaggerContainer>
        </main>
        <BottomNavbar />
      </div>
    );
  }

  // Public profile view
  return (
    <div className="min-h-screen bg-background">
      <ResponsiveNavbar />
      <main className="pt-16 md:pt-20 pb-24 md:pb-12 px-4 md:px-6">
        <StaggerContainer className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <StaggerItem>
            <div className="flex items-center justify-between">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Link>
              {isOwnProfile && (
                <Link
                  to="/profile"
                  className="text-xs font-mono uppercase tracking-widest text-primary hover:underline"
                >
                  Edit Profile
                </Link>
              )}
            </div>
          </StaggerItem>

          {/* Profile Header */}
          <StaggerItem>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="profile-card p-6 md:p-8"
            >
              <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                {/* Avatar */}
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="avatar-premium"
                >
                  <span className="relative z-10 text-3xl font-mono font-bold text-muted-foreground">
                    {(profile.display_name || profile.real_name || profile.username || 'U')[0].toUpperCase()}
                  </span>
                </motion.div>

                {/* Name & Username */}
                <div className="space-y-1">
                  <h1 className="text-2xl md:text-3xl font-bold">
                    {profile.real_name || profile.display_name || profile.username}
                  </h1>
                  {profile.username && (
                    <p className="text-sm text-muted-foreground font-mono">@{profile.username}</p>
                  )}
                </div>

                {/* Public Badge */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="status-badge status-badge-public"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Public</span>
                </motion.div>

                {score && <RankBadge score={score.discipline_score} size="lg" showScore />}

                {/* Profile Info */}
                <div className="pt-4 border-t border-border/30 w-full grid grid-cols-2 gap-4 text-sm">
                  {profile.gender && (
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <User className="w-4 h-4" />
                      <span className="capitalize">{profile.gender}</span>
                    </div>
                  )}
                  {profile.age && (
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <span>🎂</span>
                      <span>{profile.age} years</span>
                    </div>
                  )}
                  <div className="flex items-center justify-center gap-2 text-muted-foreground col-span-2">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {format(new Date(profile.created_at), 'MMMM yyyy')}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </StaggerItem>

          {/* Score Card */}
          {score && (
            <StaggerItem>
              <PremiumCard className="p-6">
                <ScoreCard
                  score={score.discipline_score}
                  keptCount={score.promises_kept}
                  brokenCount={score.promises_broken}
                  consistency={Number(score.consistency_percentage)}
                  currentStreak={score.current_streak}
                  longestStreak={score.longest_streak}
                />
              </PremiumCard>
            </StaggerItem>
          )}

          {/* Rank Progression */}
          <StaggerItem>
            <PremiumCard className="p-6">
              <h3 className="font-mono uppercase tracking-widest text-sm text-muted-foreground mb-4">
                Rank Progression
              </h3>
              <div className="space-y-2">
                {['Observer', 'Builder', 'Disciplined', 'Relentless', 'Unbreakable'].map((rank, i) => {
                  const thresholds = [0, 100, 300, 700, 1500];
                  const currentRank = score ? getRankFromScore(score.discipline_score) : 'Observer';
                  const isCurrentRank = rank === currentRank;
                  const rankIndex = ['Observer', 'Builder', 'Disciplined', 'Relentless', 'Unbreakable'].indexOf(currentRank);
                  const isAchieved = i <= rankIndex;

                  return (
                    <motion.div
                      key={rank}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                        isCurrentRank
                          ? 'border-primary bg-primary/10'
                          : isAchieved
                          ? 'border-success/30 bg-success/5'
                          : 'border-border/30 bg-muted/30'
                      }`}
                    >
                      <span className={`font-mono text-sm ${
                        isCurrentRank ? 'text-primary font-semibold' : isAchieved ? 'text-success' : 'text-muted-foreground'
                      }`}>
                        {rank}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">
                        {thresholds[i]}+ pts
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </PremiumCard>
          </StaggerItem>
        </StaggerContainer>
      </main>
      <BottomNavbar />
    </div>
  );
};

export default ProfileViewer;
