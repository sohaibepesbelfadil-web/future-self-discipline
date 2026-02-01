import React, { useRef } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile, useUpdateProfile, Profile as ProfileType } from '@/hooks/useProfile';
import { useMyScore, useUserScore, getRankFromScore, useUpdateScoreSettings } from '@/hooks/useScores';
import ResponsiveNavbar from '@/components/ResponsiveNavbar';
import BottomNavbar from '@/components/BottomNavbar';
import RankBadge from '@/components/RankBadge';
import ScoreCard from '@/components/ScoreCard';
import { StaggerContainer, StaggerItem, PremiumCard } from '@/components/PageTransition';
import { PrivacyToggle } from '@/components/AnimatedToggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Settings, Lock, Unlock, ExternalLink, User, Calendar, X, Camera } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Profile: React.FC = () => {
  const { userId } = useParams<{ userId?: string }>();
  const { user, loading: authLoading } = useAuth();
  const [isEditing, setIsEditing] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = React.useState({
    username: '',
    real_name: '',
    gender: '',
    age: '',
  });

  const isOwnProfile = !userId || userId === user?.id;

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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Please select an image file', variant: 'destructive' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Image must be less than 5MB', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Add cache buster to force refresh
      const avatarUrl = `${publicUrl}?t=${Date.now()}`;
      
      await updateProfile.mutateAsync({ avatar_url: avatarUrl });
      toast({ title: 'Profile picture updated' });
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({ title: 'Failed to upload image', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

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

  if (!user) return <Navigate to="/auth" replace />;
  if (isOwnProfile && myProfile && !myProfile.onboarding_completed) {
    return <Navigate to="/onboarding" replace />;
  }

  const handleSave = async () => {
    if (!formData.username.trim()) {
      toast({ title: 'Username required', variant: 'destructive' });
      return;
    }

    const age = formData.age ? parseInt(formData.age, 10) : null;
    if (age !== null && (isNaN(age) || age < 13)) {
      toast({ title: 'Age must be 13 or older', variant: 'destructive' });
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
      toast({ title: 'Profile updated' });
    } catch (error: any) {
      if (error.message?.includes('duplicate') || error.code === '23505') {
        toast({ title: 'Username taken', variant: 'destructive' });
      } else {
        toast({ title: 'Failed to update', variant: 'destructive' });
      }
    }
  };

  const handleToggleVisibility = async () => {
    if (!myProfile) return;
    try {
      await updateProfile.mutateAsync({ profile_visible: !myProfile.profile_visible });
      toast({ title: myProfile.profile_visible ? 'Profile is now private' : 'Profile is now public' });
    } catch {
      toast({ title: 'Failed to update', variant: 'destructive' });
    }
  };

  const handleToggleLeaderboard = async () => {
    if (!myScore) return;
    await updateScoreSettings.mutateAsync({ leaderboard_visible: !myScore.leaderboard_visible });
  };

  const renderAvatar = (profileData: ProfileType | null | undefined, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-10 h-10 text-lg',
      md: 'w-20 h-20 md:w-24 md:h-24 text-3xl',
      lg: 'w-24 h-24 md:w-32 md:h-32 text-4xl',
    };

    if (profileData?.avatar_url) {
      return (
        <img 
          src={profileData.avatar_url} 
          alt="Profile" 
          className={`${sizeClasses[size]} rounded-2xl object-cover border-2 border-border`}
        />
      );
    }

    return (
      <div className={`avatar-premium ${sizeClasses[size]}`}>
        <span className="relative z-10 font-mono font-bold text-muted-foreground">
          {(profileData?.real_name || profileData?.display_name || profileData?.username || 'U')[0].toUpperCase()}
        </span>
      </div>
    );
  };

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
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                >
                  {isEditing ? <X className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
                  <span className="text-sm font-medium">{isEditing ? 'Cancel' : 'Edit'}</span>
                </motion.button>
              )}
            </div>
          </StaggerItem>

          {/* Profile Header Card */}
          <StaggerItem>
            <motion.div
              layout
              className="profile-card p-6 md:p-8"
            >
              <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                {/* Avatar with upload capability */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="relative"
                >
                  {renderAvatar(profile, 'md')}
                  
                  {isOwnProfile && (
                    <>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="absolute -bottom-1 -right-1 w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                      >
                        <Camera className="w-4 h-4 text-primary-foreground" />
                      </motion.button>
                    </>
                  )}
                </motion.div>

                <AnimatePresence mode="wait">
                  {isEditing ? (
                    <motion.div
                      key="edit-form"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="w-full max-w-sm space-y-4 text-left"
                    >
                      <div className="space-y-2">
                        <Label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                          Username *
                        </Label>
                        <Input
                          value={formData.username}
                          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                          placeholder="your_username"
                          className="rounded-xl bg-muted/50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                          Real Name
                        </Label>
                        <Input
                          value={formData.real_name}
                          onChange={(e) => setFormData({ ...formData, real_name: e.target.value })}
                          placeholder="Your Name"
                          className="rounded-xl bg-muted/50"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                            Gender
                          </Label>
                          <Select
                            value={formData.gender}
                            onValueChange={(value) => setFormData({ ...formData, gender: value })}
                          >
                            <SelectTrigger className="rounded-xl bg-muted/50">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                            Age (13+)
                          </Label>
                          <Input
                            type="number"
                            min="13"
                            value={formData.age}
                            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                            placeholder="18"
                            className="rounded-xl bg-muted/50"
                          />
                        </div>
                      </div>

                      <Button
                        onClick={handleSave}
                        disabled={updateProfile.isPending}
                        className="btn-harsh w-full"
                      >
                        {updateProfile.isPending ? 'Saving...' : 'Save Profile'}
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="profile-info"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-3"
                    >
                      <div>
                        <h1 className="text-2xl md:text-3xl font-bold">
                          {profile?.real_name || profile?.display_name || profile?.username || 'Anonymous'}
                        </h1>
                        {profile?.username && (
                          <p className="text-sm text-muted-foreground font-mono">@{profile.username}</p>
                        )}
                      </div>

                      {/* Privacy Badge */}
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className={`status-badge ${profile?.profile_visible ? 'status-badge-public' : 'status-badge-private'}`}
                      >
                        {profile?.profile_visible ? (
                          <>
                            <Unlock className="w-3.5 h-3.5" />
                            <span>Public</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3.5 h-3.5" />
                            <span>Private</span>
                          </>
                        )}
                      </motion.div>

                      {/* View Public Link */}
                      {profile?.username && profile?.profile_visible && (
                        <Link
                          to={`/u/${profile.username}`}
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          View public profile <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}

                      {/* Info Grid */}
                      <div className="pt-4 border-t border-border/30 grid grid-cols-2 gap-4 text-sm">
                        {profile?.gender && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <User className="w-4 h-4" />
                            <span className="capitalize">{profile.gender}</span>
                          </div>
                        )}
                        {profile?.age && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <span className="font-mono text-sm">{profile.age} years</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                          <Calendar className="w-4 h-4" />
                          <span>Joined {profile?.created_at ? format(new Date(profile.created_at), 'MMMM yyyy') : 'Unknown'}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {score && !isEditing && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <RankBadge score={score.discipline_score} size="lg" showScore />
                  </motion.div>
                )}
              </div>
            </motion.div>
          </StaggerItem>

          {/* Score Card */}
          {score && !isEditing && (
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

          {/* Privacy Settings */}
          {isOwnProfile && myProfile && (
            <StaggerItem>
              <PremiumCard className="p-6 space-y-4">
                <h3 className="font-mono uppercase tracking-widest text-sm text-muted-foreground">
                  Privacy Settings
                </h3>

                <PrivacyToggle
                  isPublic={myProfile.profile_visible}
                  onToggle={handleToggleVisibility}
                  disabled={updateProfile.isPending}
                />

                {myScore && (
                  <div className="flex items-center justify-between py-3 border-t border-border/30">
                    <div>
                      <p className="text-sm font-medium">Leaderboard Visibility</p>
                      <p className="text-xs text-muted-foreground">Show on public rankings</p>
                    </div>
                    <Switch
                      checked={myScore.leaderboard_visible}
                      onCheckedChange={handleToggleLeaderboard}
                      disabled={updateScoreSettings.isPending}
                    />
                  </div>
                )}
              </PremiumCard>
            </StaggerItem>
          )}

          {/* Rank Progression */}
          {!isEditing && (
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
          )}
        </StaggerContainer>
      </main>
      <BottomNavbar />
    </div>
  );
};

export default Profile;
