import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useGroups, useMyGroups, useCreateGroup, useJoinGroup, GroupType } from '@/hooks/useGroups';
import { getRankFromScore } from '@/hooks/useScores';
import ResponsiveNavbar from '@/components/ResponsiveNavbar';
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
import { ArrowLeft, Plus, Users, Lock, Globe, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

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
      className={`glass-card p-4 block ${isMember ? 'hover:border-primary/50 transition-colors' : ''}`}
      onClick={(e) => {
        if (!isMember) {
          e.preventDefault();
        }
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {group.group_type === 'private' ? (
              <Lock className="w-4 h-4 text-muted-foreground" />
            ) : (
              <Globe className="w-4 h-4 text-muted-foreground" />
            )}
            <h3 className="font-mono font-bold">{group.name}</h3>
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
          <Button
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              onJoin();
            }}
            disabled={isJoining}
            className="btn-harsh text-xs py-1"
          >
            {group.group_type === 'private' ? 'Request' : 'Join'}
          </Button>
        ) : null}
      </div>
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
        <div className="text-muted-foreground font-mono">Loading...</div>
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
      <main className="pt-16 md:pt-20 pb-12 px-4 md:px-6">
        <div className="max-w-3xl mx-auto space-y-6 md:space-y-8">
          {/* Header */}
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
                <Button className="btn-harsh text-xs">
                  <Plus className="w-4 h-4 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">Create Group</span>
                  <span className="sm:hidden">Create</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-card border-border mx-4">
                <DialogHeader>
                  <DialogTitle className="font-mono uppercase tracking-widest">
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
                      className="mt-1"
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
                      className="mt-1"
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
                        className="flex-1"
                        onClick={() => setNewGroup({ ...newGroup, group_type: 'public' })}
                      >
                        <Globe className="w-4 h-4 mr-2" />
                        Public
                      </Button>
                      <Button
                        type="button"
                        variant={newGroup.group_type === 'private' ? 'default' : 'outline'}
                        className="flex-1"
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

          <div className="text-center space-y-2">
            <h1 className="text-2xl md:text-3xl font-mono font-bold uppercase tracking-widest">
              Groups
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground">
              Shared discipline. Silent competition.
            </p>
          </div>

          {/* Groups Tabs */}
          <Tabs defaultValue="my-groups" className="w-full">
            <TabsList className="w-full bg-muted border border-border">
              <TabsTrigger value="my-groups" className="flex-1 font-mono uppercase tracking-widest text-xs">
                My Groups ({myGroups?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="discover" className="flex-1 font-mono uppercase tracking-widest text-xs">
                Discover ({availableGroups.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="my-groups" className="space-y-3 mt-4">
              {!myGroups || myGroups.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>You're not in any groups yet.</p>
                  <p className="text-sm mt-2">Join a group or create your own.</p>
                </div>
              ) : (
                myGroups.map((group: any) => (
                  <GroupCard key={group.id} group={group} isMember />
                ))
              )}
            </TabsContent>

            <TabsContent value="discover" className="space-y-3 mt-4">
              {availableGroups.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No groups to discover.</p>
                  <p className="text-sm mt-2">Create the first one.</p>
                </div>
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

          {/* Philosophy note */}
          <div className="message-box">
            <p className="text-sm text-muted-foreground italic">
              "Groups are not for support. They are for pressure. 
              Your failure becomes visible. Your discipline, undeniable."
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Groups;
