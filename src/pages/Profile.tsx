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
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { ArrowLeft, Settings, Lock, Unlock, ExternalLink } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Profile: React.FC = () => {
  const { userId } = useParams<{ userId?: string }>();
  const { user, loading: authLoading } = useAuth();
  const [isEditing, setIsEditing] = React.useState(false);
  const [formData, setFormData] = React.useState({
    username: '',
    real_name: '',
    gender: '',
    age: '',
  });

  const isOwnProfile = !userId || userId === user?.id;

  // Fetch appropriate data
  const { data: myProfile, isLoading: myProfileLoading } = useProfile();
  const { data: myScore, isLoading: myScoreLoading } = useMyScore();
  const { data: otherScore, isLoading: otherScoreLoading } = useUserScore(userId || '');

  const updateProfile = useUpdateProfile();
  const updateScoreSettings = useUpdateScoreSettings();

  const profile = isOwnProfile ? myProfile : null;
  const score = isOwnProfile ? myScore : otherScore;
  const isLoading = authLoading || myProfileLoading || myScoreLoading || (!isOwnProfile && otherScoreLoading);

  React.useEffect(() => {
    if (myProfile) {
      setFormData({
        username: myProfile.username || '',
        real_name: myProfile.real_name || '',
        gender: myProfile.gender || '',
        age: myProfile.age?.toString() || '',
      });
    }
  }, [myProfile]);

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

  const handleSave = async () => {
    if (!formData.username.trim()) {
      toast({
        title: 'Username required',
        description: 'Please enter a username.',
        variant: 'destructive',
      });
      return;
    }

    const age = formData.age ? parseInt(formData.age, 10) : null;
    if (age !== null && (isNaN(age) || age < 13)) {
      toast({
        title: 'Invalid age',
        description: 'Age must be 13 or older.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await updateProfile.mutateAsync({
        username: formData.username.trim(),
        real_name: formData.real_name.trim() || null,
        gender: formData.gender || null,
        age,
      });
      setIsEditing(false);
      toast({
        title: 'Profile updated',
        description: 'Your profile has been saved.',
      });
    } catch (error: any) {
      if (error.message?.includes('duplicate') || error.code === '23505') {
        toast({
          title: 'Username taken',
          description: 'This username is already in use.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to update profile.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleToggleVisibility = async () => {
    if (!myProfile) return;
    try {
      await updateProfile.mutateAsync({
        profile_visible: !myProfile.profile_visible,
      });
      toast({
        title: myProfile.profile_visible ? 'Profile is now private' : 'Profile is now public',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update visibility.',
        variant: 'destructive',
      });
    }
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
                {isEditing ? 'Cancel' : 'Edit'}
              </Button>
            )}
          </div>

          {/* Profile Header */}
          <div className="glass-card p-6 md:p-8 text-center space-y-4">
            <div className="w-16 h-16 md:w-20 md:h-20 mx-auto bg-muted border border-border flex items-center justify-center">
              <span className="text-2xl md:text-3xl font-mono font-bold text-muted-foreground">
                {(profile?.real_name || profile?.display_name || profile?.username || 'U')[0].toUpperCase()}
              </span>
            </div>

            {isEditing ? (
              <div className="max-w-sm mx-auto space-y-4 text-left">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                    Username *
                  </Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="your_username"
                    className="font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="real_name" className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                    Real Name
                  </Label>
                  <Input
                    id="real_name"
                    value={formData.real_name}
                    onChange={(e) => setFormData({ ...formData, real_name: e.target.value })}
                    placeholder="Your Name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                    Gender
                  </Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => setFormData({ ...formData, gender: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age" className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                    Age (must be 13+)
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    min="13"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="18"
                  />
                </div>

                <Button
                  onClick={handleSave}
                  disabled={updateProfile.isPending}
                  className="btn-harsh w-full"
                >
                  {updateProfile.isPending ? 'Saving...' : 'Save Profile'}
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  <h1 className="text-xl md:text-2xl font-mono font-bold">
                    {profile?.real_name || profile?.display_name || profile?.username || 'Anonymous'}
                  </h1>
                  {profile?.username && (
                    <p className="text-sm text-muted-foreground font-mono">@{profile.username}</p>
                  )}
                </div>

                {/* Privacy Status */}
                <div className="flex items-center justify-center gap-2">
                  {profile?.profile_visible ? (
                    <>
                      <Unlock className="w-3 h-3 text-success" />
                      <span className="text-xs font-mono text-success">Public Profile</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs font-mono text-muted-foreground">Private Profile</span>
                    </>
                  )}
                </div>

                {/* View Public Profile Link */}
                {profile?.username && profile?.profile_visible && (
                  <Link
                    to={`/u/${profile.username}`}
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-mono"
                  >
                    View public profile <ExternalLink className="w-3 h-3" />
                  </Link>
                )}

                {/* Profile Details */}
                <div className="pt-4 border-t border-border space-y-2 text-sm">
                  {profile?.gender && (
                    <div className="flex justify-between text-muted-foreground">
                      <span className="font-mono uppercase tracking-widest text-xs">Gender</span>
                      <span className="capitalize">{profile.gender}</span>
                    </div>
                  )}
                  {profile?.age && (
                    <div className="flex justify-between text-muted-foreground">
                      <span className="font-mono uppercase tracking-widest text-xs">Age</span>
                      <span>{profile.age}</span>
                    </div>
                  )}
                </div>
              </>
            )}

            {score && !isEditing && <RankBadge score={score.discipline_score} size="lg" showScore />}

            <p className="text-xs text-muted-foreground font-mono">
              Member since {profile?.created_at ? format(new Date(profile.created_at), 'MMMM yyyy') : 'Unknown'}
            </p>
          </div>

          {/* Score Card */}
          {score && !isEditing && (
            <ScoreCard
              score={score.discipline_score}
              keptCount={score.promises_kept}
              brokenCount={score.promises_broken}
              consistency={Number(score.consistency_percentage)}
              currentStreak={score.current_streak}
              longestStreak={score.longest_streak}
            />
          )}

          {/* Privacy & Visibility Settings (own profile only) */}
          {isOwnProfile && myProfile && (
            <div className="glass-card p-6 space-y-4">
              <h3 className="font-mono uppercase tracking-widest text-sm text-muted-foreground">
                Privacy Settings
              </h3>
              
              <div className="flex items-center justify-between py-2 border-b border-border">
                <div>
                  <p className="text-sm font-medium flex items-center gap-2">
                    {myProfile.profile_visible ? (
                      <Unlock className="w-4 h-4 text-success" />
                    ) : (
                      <Lock className="w-4 h-4 text-muted-foreground" />
                    )}
                    Profile Visibility
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {myProfile.profile_visible
                      ? 'Anyone can view your profile at /u/' + (myProfile.username || 'username')
                      : 'Only you can see your full profile'}
                  </p>
                </div>
                <Switch
                  checked={myProfile.profile_visible}
                  onCheckedChange={handleToggleVisibility}
                  disabled={updateProfile.isPending}
                />
              </div>

              {myScore && (
                <div className="flex items-center justify-between py-2">
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
              )}
            </div>
          )}

          {/* Rank Progression */}
          {!isEditing && (
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
          )}
        </div>
      </main>
    </div>
  );
};

export default Profile;
