import React, { useState, useRef } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useCommunityPosts, useCreateCommunityPost, useDeleteCommunityPost } from '@/hooks/useCommunityPosts';
import ResponsiveNavbar from '@/components/ResponsiveNavbar';
import BottomNavbar from '@/components/BottomNavbar';
import { StaggerContainer, StaggerItem, PremiumCard } from '@/components/PageTransition';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Trash2, Users, MessageSquare, Image, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { format, formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

const Community: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: posts = [], isLoading: postsLoading } = useCommunityPosts();
  const createPost = useCreateCommunityPost();
  const deletePost = useDeleteCommunityPost();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [newPost, setNewPost] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Image too large',
          description: 'Please select an image under 5MB',
          variant: 'destructive',
        });
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!newPost.trim() && !selectedImage) return;

    setIsUploading(true);
    let imageUrl: string | null = null;

    try {
      // Upload image if selected
      if (selectedImage && user) {
        const fileExt = selectedImage.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('community-images')
          .upload(fileName, selectedImage);

        if (uploadError) throw uploadError;

        const { data: publicUrl } = supabase.storage
          .from('community-images')
          .getPublicUrl(fileName);

        imageUrl = publicUrl.publicUrl;
      }

      // Create post with or without image
      const { error } = await supabase
        .from('community_posts')
        .insert({
          user_id: user!.id,
          content: newPost.trim() || ' ',
          image_url: imageUrl,
        });

      if (error) throw error;

      // Refresh posts
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
      
      toast({ title: 'Posted', description: 'Your progression has been shared.' });
      setNewPost('');
      clearImage();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create post',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
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

              {/* Image Preview */}
              <AnimatePresence>
                {imagePreview && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="relative mb-3 overflow-hidden rounded-xl"
                  >
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full max-h-64 object-cover rounded-xl"
                    />
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={clearImage}
                      className="absolute top-2 right-2 p-2 rounded-full bg-background/80 backdrop-blur-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    id="image-upload"
                  />
                  <motion.label
                    htmlFor="image-upload"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/50 text-muted-foreground hover:text-foreground cursor-pointer transition-colors text-sm"
                  >
                    <Image className="w-4 h-4" />
                    <span className="hidden sm:inline">Add Photo</span>
                  </motion.label>
                  <span className="text-xs text-muted-foreground hidden sm:inline">
                    Press ⌘ + Enter to post
                  </span>
                </div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={handleSubmit}
                    disabled={(!newPost.trim() && !selectedImage) || isUploading}
                    className="gap-2"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Post
                      </>
                    )}
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

                        {post.content && post.content.trim() && (
                          <p className="text-sm leading-relaxed whitespace-pre-wrap mb-3">
                            {post.content}
                          </p>
                        )}

                        {/* Post Image */}
                        {(post as any).image_url && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="rounded-xl overflow-hidden"
                          >
                            <img
                              src={(post as any).image_url}
                              alt="Post"
                              className="w-full max-h-96 object-cover rounded-xl"
                              loading="lazy"
                            />
                          </motion.div>
                        )}
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
