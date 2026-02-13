import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useIsAdminOrMod } from '@/hooks/useUserRole';
import { useCommunityPosts, useDeleteCommunityPost } from '@/hooks/useCommunityPosts';
import { useBannedUsers, useBanUser, useUnbanUser } from '@/hooks/useBannedUsers';
import ResponsiveNavbar from '@/components/ResponsiveNavbar';
import BottomNavbar from '@/components/BottomNavbar';
import { StaggerContainer, StaggerItem, PremiumCard } from '@/components/PageTransition';
import { motion } from 'framer-motion';
import { Shield, Trash2, Ban, UserCheck, MessageSquare, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { formatDistanceToNow, format, addDays } from 'date-fns';

const Admin: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { isAdmin, isAdminOrMod, isLoading: roleLoading } = useIsAdminOrMod();
  const { data: posts = [], isLoading: postsLoading } = useCommunityPosts();
  const deletePost = useDeleteCommunityPost();
  const { data: bannedUsers = [], isLoading: bansLoading } = useBannedUsers();
  const banUser = useBanUser();
  const unbanUser = useUnbanUser();

  const [banReason, setBanReason] = useState('');
  const [banType, setBanType] = useState<'permanent' | 'temporary'>('permanent');
  const [banDuration, setBanDuration] = useState(7);
  const [banTargetId, setBanTargetId] = useState<string | null>(null);

  if (authLoading || profileLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-muted-foreground font-mono">
          Loading...
        </motion.div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdminOrMod) return <Navigate to="/dashboard" replace />;

  const handleBanUser = (userId: string) => {
    if (!user) return;
    banUser.mutate({
      userId,
      bannedBy: user.id,
      reason: banReason || undefined,
      banType,
      expiresAt: banType === 'temporary' ? addDays(new Date(), banDuration).toISOString() : undefined,
    });
    setBanReason('');
    setBanType('permanent');
    setBanDuration(7);
    setBanTargetId(null);
  };

  const bannedUserIds = new Set(bannedUsers.map(b => b.user_id));

  return (
    <div className="min-h-screen bg-background">
      <ResponsiveNavbar />
      <main className="pt-16 md:pt-20 pb-24 md:pb-12 px-4 md:px-6">
        <StaggerContainer className="max-w-3xl mx-auto">
          <StaggerItem>
            <div className="flex items-center gap-3 mb-6 md:mb-8">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold">Admin Panel</h1>
                <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
                  {isAdmin ? 'Administrator' : 'Moderator'}
                </p>
              </div>
            </div>
          </StaggerItem>

          <StaggerItem>
            <Tabs defaultValue="posts" className="w-full">
              <TabsList className="w-full mb-6">
                <TabsTrigger value="posts" className="flex-1 gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Posts
                </TabsTrigger>
                <TabsTrigger value="bans" className="flex-1 gap-2">
                  <Ban className="w-4 h-4" />
                  Bans
                </TabsTrigger>
              </TabsList>

              {/* Posts moderation */}
              <TabsContent value="posts">
                <div className="space-y-3">
                  {postsLoading ? (
                    <PremiumCard className="p-8 text-center text-muted-foreground">Loading posts...</PremiumCard>
                  ) : posts.length === 0 ? (
                    <PremiumCard className="p-8 text-center text-muted-foreground">No posts yet.</PremiumCard>
                  ) : (
                    posts.map((post) => {
                      const username = post.profile?.username || post.profile?.display_name || 'Anonymous';
                      const isBanned = bannedUserIds.has(post.user_id);
                      return (
                        <PremiumCard key={post.id} className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-sm truncate">{username}</span>
                                {isBanned && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-destructive/15 text-destructive font-mono">BANNED</span>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2">{post.content}</p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              {!isBanned && post.user_id !== user?.id && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-muted-foreground hover:text-warning"
                                      onClick={() => setBanTargetId(post.user_id)}
                                    >
                                      <Ban className="w-4 h-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Ban {username}?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This will restrict the user's access to the platform.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <div className="space-y-3 py-2">
                                      <div>
                                        <label className="text-sm text-muted-foreground mb-1 block">Reason</label>
                                        <input
                                          type="text"
                                          value={banReason}
                                          onChange={(e) => setBanReason(e.target.value)}
                                          placeholder="Violation of community guidelines..."
                                          className="w-full px-3 py-2 rounded-xl bg-background border border-border focus:border-primary focus:outline-none text-sm"
                                        />
                                      </div>
                                      <div>
                                        <label className="text-sm text-muted-foreground mb-1 block">Ban Type</label>
                                        <div className="flex gap-2">
                                          <Button
                                            variant={banType === 'permanent' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setBanType('permanent')}
                                          >
                                            Permanent
                                          </Button>
                                          <Button
                                            variant={banType === 'temporary' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setBanType('temporary')}
                                          >
                                            Temporary
                                          </Button>
                                        </div>
                                      </div>
                                      {banType === 'temporary' && (
                                        <div>
                                          <label className="text-sm text-muted-foreground mb-1 block">Duration (days)</label>
                                          <input
                                            type="number"
                                            min={1}
                                            max={365}
                                            value={banDuration}
                                            onChange={(e) => setBanDuration(Number(e.target.value))}
                                            className="w-full px-3 py-2 rounded-xl bg-background border border-border focus:border-primary focus:outline-none text-sm"
                                          />
                                        </div>
                                      )}
                                    </div>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleBanUser(post.user_id)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Ban User
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete this post?</AlertDialogTitle>
                                    <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deletePost.mutate(post.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </PremiumCard>
                      );
                    })
                  )}
                </div>
              </TabsContent>

              {/* Bans management */}
              <TabsContent value="bans">
                <div className="space-y-3">
                  {bansLoading ? (
                    <PremiumCard className="p-8 text-center text-muted-foreground">Loading bans...</PremiumCard>
                  ) : bannedUsers.length === 0 ? (
                    <PremiumCard className="p-8 text-center">
                      <UserCheck className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground text-sm">No banned users.</p>
                    </PremiumCard>
                  ) : (
                    bannedUsers.map((ban) => {
                      const name = ban.profile?.username || ban.profile?.display_name || 'Unknown';
                      const isExpired = ban.ban_type === 'temporary' && ban.expires_at && new Date(ban.expires_at) < new Date();
                      return (
                        <PremiumCard key={ban.id} className="p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-sm">{name}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                                  isExpired
                                    ? 'bg-muted text-muted-foreground'
                                    : ban.ban_type === 'permanent'
                                    ? 'bg-destructive/15 text-destructive'
                                    : 'bg-warning/15 text-warning'
                                }`}>
                                  {isExpired ? 'EXPIRED' : ban.ban_type === 'permanent' ? 'PERMANENT' : 'TEMPORARY'}
                                </span>
                              </div>
                              {ban.reason && <p className="text-xs text-muted-foreground mb-1">{ban.reason}</p>}
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span>Banned {formatDistanceToNow(new Date(ban.created_at), { addSuffix: true })}</span>
                                {ban.ban_type === 'temporary' && ban.expires_at && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    Expires {format(new Date(ban.expires_at), 'MMM d, yyyy')}
                                  </span>
                                )}
                              </div>
                            </div>
                            {isAdmin && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="shrink-0">
                                    <UserCheck className="w-4 h-4 mr-1" />
                                    Unban
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Unban {name}?</AlertDialogTitle>
                                    <AlertDialogDescription>This will restore the user's access.</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => unbanUser.mutate(ban.id)}>
                                      Unban
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </PremiumCard>
                      );
                    })
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </StaggerItem>
        </StaggerContainer>
      </main>
      <BottomNavbar />
    </div>
  );
};

export default Admin;
