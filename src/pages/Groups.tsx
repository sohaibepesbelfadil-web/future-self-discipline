import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useGroups, useMyGroups, useCreateGroup, useJoinGroup, GroupType } from '@/hooks/useGroups';
import { getRankFromScore } from '@/hooks/useScores';
import ResponsiveNavbar from '@/components/ResponsiveNavbar';
import BottomNavbar from '@/components/BottomNavbar';
import { StaggerContainer, StaggerItem, PremiumCard } from '@/components/PageTransition';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Users, Lock, Globe, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

const GroupCard: React.FC<{
  group: any;
  isMember?: boolean;
  onJoin?: () => void;
  isJoining?: boolean;
}> = ({ group, isMember, onJoin, isJoining }) => {
  const rank = getRankFromScore(Math.round(group.average_score || 0));

  return (
    <Link
      to={isMember ? `/groups/${group.id}` : '#'}
      onClick={(e) => {
        if (!isMember) e.preventDefault();
      }}
    >
      <motion.div
        whileHover={isMember ? { scale: 1.01 } : undefined}
        whileTap={isMember ? { scale: 0.99 } : undefined}
        className={`premium-card p-4 ${isMember ? '' : 'cursor-default'}`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {group.group_type === 'private' ? (
                <Lock className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Globe className="w-4 h-4 text-primary" />
              )}
              <h3 className="font-semibold">{group.name}</h3>
            </div>
            {group.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {group.description}
              </p>
            )}
            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground font-mono">
              <span>{group.member_count} members</span>
              <span>Avg: {Math.round(group.average_score || 0)} pts</span>
              <span className="text-primary">{rank}</span>
            </div>
          </div>
          {isMember ? (
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          ) : onJoin ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.preventDefault();
                onJoin();
              }}
              disabled={isJoining}
              className="btn-harsh text-xs py-2 px-4"
            >
              {group.group_type === 'private' ? 'Request' : 'Join'}
            </motion.button>
          ) : null}
        </div>
      </motion.div>
    </Link>
  );
};

const Groups: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: allGroups, isLoading: groupsLoading } = useGroups();
  const { data: myGroups } = useMyGroups();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    group_type: 'public' as GroupType,
  });

  const createGroup = useCreateGroup();
  const joinGroup = useJoinGroup();

  const isLoading = authLoading || profileLoading || groupsLoading;

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
  if (profile && !profile.onboarding_completed) return <Navigate to="/onboarding" replace />;

  const myGroupIds = new Set(myGroups?.map((g: any) => g.id) || []);
  const availableGroups = allGroups?.filter(g => !myGroupIds.has(g.id)) || [];

  const handleCreateGroup = async () => {
    if (!newGroup.name.trim()) {
      toast.error('Group name is required');
      return;
    }

    try {
      await createGroup.mutateAsync({
        name: newGroup.name.trim(),
        description: newGroup.description.trim() || undefined,
        group_type: newGroup.group_type,
      });
      toast.success('Group created');
      setIsCreateOpen(false);
      setNewGroup({ name: '', description: '', group_type: 'public' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to create group');
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    try {
      await joinGroup.mutateAsync(groupId);
      toast.success('Joined group');
    } catch (error: any) {
      toast.error(error.message || 'Failed to join group');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <ResponsiveNavbar />
      <main className="pt-16 md:pt-20 pb-24 md:pb-12 px-4 md:px-6">
        <StaggerContainer className="max-w-3xl mx-auto space-y-6 md:space-y-8">
          {/* Header */}
          <StaggerItem>
            <div className="flex items-center justify-between">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </Link>
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-harsh text-xs flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-1 md:mr-2" />
                    <span className="hidden sm:inline">Create Group</span>
                    <span className="sm:hidden">Create</span>
                  </motion.button>
                </DialogTrigger>
                <DialogContent className="premium-card border-border mx-4">
                  <DialogHeader>
                    <DialogTitle className="font-bold text-lg">
                      Create Discipline Group
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <label className="text-xs font-mono uppercase text-muted-foreground">
                        Group Name
                      </label>
                      <Input
                        value={newGroup.name}
                        onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                        placeholder="e.g., Morning Warriors"
                        className="mt-1 rounded-xl bg-muted/50"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-mono uppercase text-muted-foreground">
                        Description
                      </label>
                      <Textarea
                        value={newGroup.description}
                        onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                        placeholder="What discipline does this group focus on?"
                        className="mt-1 rounded-xl bg-muted/50"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-mono uppercase text-muted-foreground">
                        Type
                      </label>
                      <div className="flex gap-2 mt-1">
                        <Button
                          type="button"
                          variant={newGroup.group_type === 'public' ? 'default' : 'outline'}
                          className="flex-1 rounded-xl"
                          onClick={() => setNewGroup({ ...newGroup, group_type: 'public' })}
                        >
                          <Globe className="w-4 h-4 mr-2" />
                          Public
                        </Button>
                        <Button
                          type="button"
                          variant={newGroup.group_type === 'private' ? 'default' : 'outline'}
                          className="flex-1 rounded-xl"
                          onClick={() => setNewGroup({ ...newGroup, group_type: 'private' })}
                        >
                          <Lock className="w-4 h-4 mr-2" />
                          Private
                        </Button>
                      </div>
                    </div>
                    <Button
                      onClick={handleCreateGroup}
                      disabled={createGroup.isPending}
                      className="w-full btn-harsh"
                    >
                      {createGroup.isPending ? 'Creating...' : 'Create Group'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="text-center space-y-2">
              <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-wider">
                Groups
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground">
                Shared discipline. Silent competition.
              </p>
            </div>
          </StaggerItem>

          {/* Groups Tabs */}
          <StaggerItem>
            <Tabs defaultValue="my-groups" className="w-full">
              <TabsList className="w-full bg-muted/50 border border-border/50 rounded-xl p-1">
                <TabsTrigger value="my-groups" className="flex-1 font-mono uppercase tracking-widest text-xs rounded-lg">
                  My Groups ({myGroups?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="discover" className="flex-1 font-mono uppercase tracking-widest text-xs rounded-lg">
                  Discover ({availableGroups.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="my-groups" className="space-y-3 mt-4">
                {!myGroups || myGroups.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12 text-muted-foreground premium-card"
                  >
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>You're not in any groups yet.</p>
                    <p className="text-sm mt-2">Join a group or create your own.</p>
                  </motion.div>
                ) : (
                  myGroups.map((group: any) => (
                    <GroupCard key={group.id} group={group} isMember />
                  ))
                )}
              </TabsContent>

              <TabsContent value="discover" className="space-y-3 mt-4">
                {availableGroups.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12 text-muted-foreground premium-card"
                  >
                    <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No groups to discover.</p>
                    <p className="text-sm mt-2">Create the first one.</p>
                  </motion.div>
                ) : (
                  availableGroups.map((group) => (
                    <GroupCard
                      key={group.id}
                      group={group}
                      onJoin={() => handleJoinGroup(group.id)}
                      isJoining={joinGroup.isPending}
                    />
                  ))
                )}
              </TabsContent>
            </Tabs>
          </StaggerItem>

          {/* Philosophy note */}
          <StaggerItem>
            <div className="message-box">
              <p className="text-sm text-muted-foreground italic">
                "Groups are not for support. They are for pressure. 
                Your failure becomes visible. Your discipline, undeniable."
              </p>
            </div>
          </StaggerItem>
        </StaggerContainer>
      </main>
      <BottomNavbar />
    </div>
  );
};

export default Groups;
