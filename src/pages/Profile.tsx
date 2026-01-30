import React from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { useMyScore, useUserScore, getRankFromScore, useUpdateScoreSettings } from '@/hooks/useScores';
import ResponsiveNavbar from '@/components/ResponsiveNavbar';
import RankBadge from '@/components/RankBadge';
import ScoreCard from '@/components/ScoreCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { format } from 'date-fns';
import { ArrowLeft, Settings } from 'lucide-react';

const Profile: React.FC = () => {
  const { userId } = useParams<{ userId?: string }>();
  const { user, loading: authLoading } = useAuth();
  const [isEditing, setIsEditing] = React.useState(false);
  const [username, setUsername] = React.useState('');

  const isOwnProfile = !userId || userId === user?.id;

  // Fetch appropriate data
  const { data: myProfile, isLoading: myProfileLoading } = useProfile();
  const { data: myScore, isLoading: myScoreLoading } = useMyScore();
  const { data: otherScore, isLoading: otherScoreLoading } = useUserScore(userId || '');

  const updateProfile = useUpdateProfile();
  const updateScoreSettings = useUpdateScoreSettings();

  const profile = isOwnProfile ? myProfile : null; // Other profiles need a separate query
  const score = isOwnProfile ? myScore : otherScore;
  const isLoading = authLoading || myProfileLoading || myScoreLoading || (!isOwnProfile && otherScoreLoading);

  React.useEffect(() => {
    if (myProfile?.username) {
      setUsername(myProfile.username);
    }
  }, [myProfile?.username]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground font-mono">Loading...</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (isOwnProfile && myProfile && !myProfile.onboarding_completed) {
    return <Navigate to="/onboarding" replace />;
  }

  const handleSaveUsername = async () => {
    if (!username.trim()) return;
    await updateProfile.mutateAsync({ username: username.trim() });
    setIsEditing(false);
  };

  const handleToggleLeaderboard = async () => {
    if (!myScore) return;
    await updateScoreSettings.mutateAsync({
      leaderboard_visible: !myScore.leaderboard_visible,
    });
  };

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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="font-mono uppercase tracking-widest text-xs"
              >
                <Settings className="w-4 h-4 mr-2" />
                {isEditing ? 'Done' : 'Edit'}
              </Button>
            )}
          </div>

          {/* Profile Header */}
          <div className="glass-card p-6 md:p-8 text-center space-y-4">
            <div className="w-16 h-16 md:w-20 md:h-20 mx-auto bg-muted border border-border flex items-center justify-center">
              <span className="text-2xl md:text-3xl font-mono font-bold text-muted-foreground">
                {(profile?.display_name || profile?.username || 'U')[0].toUpperCase()}
              </span>
            </div>

            {isEditing ? (
              <div className="max-w-xs mx-auto space-y-3">
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  className="text-center font-mono"
                />
                <Button
                  onClick={handleSaveUsername}
                  disabled={updateProfile.isPending}
                  className="btn-harsh w-full"
                >
                  {updateProfile.isPending ? 'Saving...' : 'Save Username'}
                </Button>
              </div>
            ) : (
              <>
                <h1 className="text-xl md:text-2xl font-mono font-bold">
                  {profile?.display_name || profile?.username || 'Anonymous'}
                </h1>
                {profile?.username && (
                  <p className="text-sm text-muted-foreground font-mono">@{profile.username}</p>
                )}
              </>
            )}

            {score && <RankBadge score={score.discipline_score} size="lg" showScore />}

            <p className="text-xs text-muted-foreground font-mono">
              Member since {profile?.created_at ? format(new Date(profile.created_at), 'MMMM yyyy') : 'Unknown'}
            </p>
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

          {/* Privacy Settings (own profile only) */}
          {isOwnProfile && isEditing && myScore && (
            <div className="glass-card p-6 space-y-4">
              <h3 className="font-mono uppercase tracking-widest text-sm text-muted-foreground">
                Privacy Settings
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Show on Leaderboard</p>
                  <p className="text-xs text-muted-foreground">
                    Allow others to see your rank on the public leaderboard
                  </p>
                </div>
                <Switch
                  checked={myScore.leaderboard_visible}
                  onCheckedChange={handleToggleLeaderboard}
                  disabled={updateScoreSettings.isPending}
                />
              </div>
            </div>
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

export default Profile;
