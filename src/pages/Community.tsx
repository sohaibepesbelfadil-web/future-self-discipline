import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useCommunityPosts, useCreateCommunityPost, useDeleteCommunityPost } from '@/hooks/useCommunityPosts';
import ResponsiveNavbar from '@/components/ResponsiveNavbar';
import BottomNavbar from '@/components/BottomNavbar';
import { StaggerContainer, StaggerItem, PremiumCard } from '@/components/PageTransition';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Trash2, Users, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { format, formatDistanceToNow } from 'date-fns';

const Community: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: posts = [], isLoading: postsLoading } = useCommunityPosts();
  const createPost = useCreateCommunityPost();
  const deletePost = useDeleteCommunityPost();
  const navigate = useNavigate();

  const [newPost, setNewPost] = useState('');

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-muted-foreground font-mono">
          Loading...
        </motion.div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (profile && !profile.onboarding_completed) return <Navigate to="/onboarding" replace />;

  const handleSubmit = async () => {
    if (!newPost.trim()) return;
    await createPost.mutateAsync(newPost);
    setNewPost('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <ResponsiveNavbar />
      <main className="pt-16 md:pt-20 pb-24 md:pb-12 px-4 md:px-6">
        <StaggerContainer className="max-w-2xl mx-auto">
          <StaggerItem>
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <h1 className="text-xl md:text-2xl font-bold">Community</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{posts.length} posts</span>
              </div>
            </div>
          </StaggerItem>

          {/* Create post */}
          <StaggerItem>
            <PremiumCard className="p-4 mb-6">
              <Textarea
                placeholder="Share your progression journey..."
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                onKeyDown={handleKeyDown}
                className="bg-background/50 min-h-[80px] mb-3 resize-none"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Press ⌘ + Enter to post
                </span>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={handleSubmit}
                    disabled={!newPost.trim() || createPost.isPending}
                    className="gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Post
                  </Button>
                </motion.div>
              </div>
            </PremiumCard>
          </StaggerItem>

          {/* Posts feed */}
          {postsLoading ? (
            <StaggerItem>
              <div className="flex items-center justify-center py-12">
                <div className="text-muted-foreground">Loading posts...</div>
              </div>
            </StaggerItem>
          ) : posts.length === 0 ? (
            <StaggerItem>
              <PremiumCard className="p-8 md:p-12 text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted/50 flex items-center justify-center">
                    <MessageSquare className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                  <p className="text-muted-foreground text-sm">
                    Be the first to share your progression journey with the community.
                  </p>
                </motion.div>
              </PremiumCard>
            </StaggerItem>
          ) : (
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {posts.map((post, index) => {
                  const username = post.profile?.username || post.profile?.display_name || 'Anonymous';
                  const isOwn = post.user_id === user?.id;
                  
                  return (
                    <motion.div
                      key={post.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <PremiumCard className="p-4 md:p-5">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                if (post.profile?.username) {
                                  navigate(`/u/${post.profile.username}`);
                                }
                              }}
                              className={`w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center ${
                                post.profile?.username ? 'cursor-pointer' : ''
                              }`}
                            >
                              {post.profile?.avatar_url ? (
                                <img src={post.profile.avatar_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-sm font-semibold text-primary">
                                  {username.slice(0, 2).toUpperCase()}
                                </span>
                              )}
                            </motion.div>
                            <div>
                              <button
                                onClick={() => {
                                  if (post.profile?.username) {
                                    navigate(`/u/${post.profile.username}`);
                                  }
                                }}
                                className={`font-semibold text-sm ${
                                  post.profile?.username ? 'hover:text-primary transition-colors' : ''
                                }`}
                              >
                                {username}
                              </button>
                              <div className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                              </div>
                            </div>
                          </div>
                          {isOwn && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => deletePost.mutate(post.id)}
                              className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          )}
                        </div>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {post.content}
                        </p>
                      </PremiumCard>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </StaggerContainer>
      </main>
      <BottomNavbar />
    </div>
  );
};

export default Community;
