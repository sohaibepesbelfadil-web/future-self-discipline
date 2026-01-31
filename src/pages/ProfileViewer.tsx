import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePublicProfile } from '@/hooks/usePublicProfile';
import { useUserScore, getRankFromScore } from '@/hooks/useScores';
import ResponsiveNavbar from '@/components/ResponsiveNavbar';
import RankBadge from '@/components/RankBadge';
import ScoreCard from '@/components/ScoreCard';
import { ArrowLeft, Lock, Unlock } from 'lucide-react';
import { format } from 'date-fns';

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
        <div className="text-muted-foreground font-mono">Loading...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <ResponsiveNavbar />
        <main className="pt-16 md:pt-20 pb-12 px-4 md:px-6">
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <h1 className="text-2xl font-mono font-bold">Profile Not Found</h1>
            <p className="text-muted-foreground">This user doesn't exist or has been removed.</p>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Private profile check
  if (!profile.profile_visible && !isOwnProfile) {
    return (
      <div className="min-h-screen bg-background">
        <ResponsiveNavbar />
        <main className="pt-16 md:pt-20 pb-12 px-4 md:px-6">
          <div className="max-w-2xl mx-auto space-y-6">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>

            <div className="glass-card p-8 text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-muted border border-border flex items-center justify-center">
                <Lock className="w-8 h-8 text-muted-foreground" />
              </div>
              <h1 className="text-xl font-mono font-bold">@{profile.username}</h1>
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Lock className="w-4 h-4" />
                <span className="text-sm font-mono">Private Profile</span>
              </div>
              <p className="text-sm text-muted-foreground">
                This profile is private. Only the owner can view their full information.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ResponsiveNavbar />
      <main className="pt-16 md:pt-20 pb-12 px-4 md:px-6">
        <div className="max-w-2xl mx-auto space-y-6 md:space-y-8">
          {/* Header */}
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

          {/* Profile Header */}
          <div className="glass-card p-6 md:p-8 text-center space-y-4">
            <div className="w-16 h-16 md:w-20 md:h-20 mx-auto bg-muted border border-border flex items-center justify-center">
              <span className="text-2xl md:text-3xl font-mono font-bold text-muted-foreground">
                {(profile.display_name || profile.real_name || profile.username || 'U')[0].toUpperCase()}
              </span>
            </div>

            <div className="space-y-1">
              <h1 className="text-xl md:text-2xl font-mono font-bold">
                {profile.real_name || profile.display_name || profile.username}
              </h1>
              {profile.username && (
                <p className="text-sm text-muted-foreground font-mono">@{profile.username}</p>
              )}
            </div>

            {/* Privacy indicator */}
            <div className="flex items-center justify-center gap-2">
              {profile.profile_visible ? (
                <>
                  <Unlock className="w-3 h-3 text-success" />
                  <span className="text-xs font-mono text-success">Public</span>
                </>
              ) : (
                <>
                  <Lock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs font-mono text-muted-foreground">Private</span>
                </>
              )}
            </div>

            {score && <RankBadge score={score.discipline_score} size="lg" showScore />}

            {/* Profile Details */}
            <div className="pt-4 border-t border-border space-y-2 text-sm">
              {profile.gender && (
                <div className="flex justify-between text-muted-foreground">
                  <span className="font-mono uppercase tracking-widest text-xs">Gender</span>
                  <span className="capitalize">{profile.gender}</span>
                </div>
              )}
              {profile.age && (
                <div className="flex justify-between text-muted-foreground">
                  <span className="font-mono uppercase tracking-widest text-xs">Age</span>
                  <span>{profile.age}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span className="font-mono uppercase tracking-widest text-xs">Member Since</span>
                <span>{format(new Date(profile.created_at), 'MMMM yyyy')}</span>
              </div>
            </div>
          </div>

          {/* Score Card */}
          {score && (
            <ScoreCard
              score={score.discipline_score}
              keptCount={score.promises_kept}
              brokenCount={score.promises_broken}
              consistency={Number(score.consistency_percentage)}
              currentStreak={score.current_streak}
              longestStreak={score.longest_streak}
            />
          )}

          {/* Rank Progression */}
          <div className="glass-card p-6">
            <h3 className="font-mono uppercase tracking-widest text-sm text-muted-foreground mb-4">
              Rank Progression
            </h3>
            <div className="space-y-2">
              {['Observer', 'Builder', 'Disciplined', 'Relentless', 'Unbreakable'].map((rank, i) => {
                const thresholds = [0, 100, 300, 700, 1500];
                const currentRank = score ? getRankFromScore(score.discipline_score) : 'Observer';
                const isCurrentRank = rank === currentRank;
                const isAchieved = thresholds.findIndex(t => t === thresholds[i]) <= 
                  thresholds.findIndex(t => t === thresholds[['Observer', 'Builder', 'Disciplined', 'Relentless', 'Unbreakable'].indexOf(currentRank)]);

                return (
                  <div
                    key={rank}
                    className={`flex items-center justify-between p-3 border ${
                      isCurrentRank
                        ? 'border-primary bg-primary/10'
                        : isAchieved
                        ? 'border-success/30 bg-success/5'
                        : 'border-border'
                    }`}
                  >
                    <span className={`font-mono text-sm ${isCurrentRank ? 'text-primary' : isAchieved ? 'text-success' : 'text-muted-foreground'}`}>
                      {rank}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      {thresholds[i]}+ pts
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfileViewer;
