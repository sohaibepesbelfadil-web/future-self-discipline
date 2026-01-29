import React from 'react';
import { Navigate, Link, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import {
  useGroup,
  useGroupMembers,
  useLeaveGroup,
  usePendingGroupMembers,
  useApproveMember,
} from '@/hooks/useGroups';
import { getRankFromScore } from '@/hooks/useScores';
import Navbar from '@/components/Navbar';
import RankBadge from '@/components/RankBadge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Lock, Globe, LogOut, Check, X, Crown } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const GroupDetail: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const { user, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: group, isLoading: groupLoading } = useGroup(groupId || '');
  const { data: members, isLoading: membersLoading } = useGroupMembers(groupId || '');
  const { data: pendingMembers } = usePendingGroupMembers(groupId || '');

  const leaveGroup = useLeaveGroup();
  const approveMember = useApproveMember();

  const isLoading = authLoading || profileLoading || groupLoading || membersLoading;
  const isOwner = group?.owner_id === user?.id;
  const isAdmin = members?.some(m => m.user_id === user?.id && m.status === 'admin');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground font-mono">Loading...</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (profile && !profile.onboarding_completed) return <Navigate to="/onboarding" replace />;
  if (!group) return <Navigate to="/groups" replace />;

  const groupRank = getRankFromScore(Math.round(group.average_score || 0));

  const handleLeave = async () => {
    if (isOwner) {
      toast.error('Owners cannot leave their group');
      return;
    }
    try {
      await leaveGroup.mutateAsync(groupId!);
      toast.success('Left group');
    } catch (error: any) {
      toast.error(error.message || 'Failed to leave group');
    }
  };

  const handleApprove = async (memberId: string, approve: boolean) => {
    try {
      await approveMember.mutateAsync({ memberId, approve });
      toast.success(approve ? 'Member approved' : 'Request rejected');
    } catch (error: any) {
      toast.error(error.message || 'Failed to process request');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-12 px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Link
              to="/groups"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Groups
            </Link>
            {!isOwner && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLeave}
                disabled={leaveGroup.isPending}
                className="text-destructive hover:text-destructive"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Leave
              </Button>
            )}
          </div>

          {/* Group Header */}
          <div className="glass-card p-8 text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              {group.group_type === 'private' ? (
                <Lock className="w-5 h-5" />
              ) : (
                <Globe className="w-5 h-5" />
              )}
              <span className="text-xs font-mono uppercase">{group.group_type}</span>
            </div>
            <h1 className="text-3xl font-mono font-bold">{group.name}</h1>
            {group.description && (
              <p className="text-muted-foreground max-w-lg mx-auto">{group.description}</p>
            )}
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="text-center">
                <p className="text-2xl font-mono font-bold">{group.member_count}</p>
                <p className="text-xs text-muted-foreground uppercase">Members</p>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center">
                <p className="text-2xl font-mono font-bold">{Math.round(group.average_score || 0)}</p>
                <p className="text-xs text-muted-foreground uppercase">Avg Score</p>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center">
                <p className="text-2xl font-mono font-bold text-primary">{groupRank}</p>
                <p className="text-xs text-muted-foreground uppercase">Rank</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Created {format(new Date(group.created_at), 'MMMM d, yyyy')}
            </p>
          </div>

          {/* Pending Requests (Admin only) */}
          {isAdmin && pendingMembers && pendingMembers.length > 0 && (
            <div className="glass-card p-6 space-y-4">
              <h2 className="font-mono uppercase tracking-widest text-sm text-warning">
                Pending Requests ({pendingMembers.length})
              </h2>
              <div className="space-y-2">
                {pendingMembers.map((member: any) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 bg-muted/50 border border-border"
                  >
                    <span className="font-mono">
                      {member.profile?.display_name || member.profile?.username || 'Anonymous'}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(member.id, true)}
                        disabled={approveMember.isPending}
                        className="bg-success hover:bg-success/80"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleApprove(member.id, false)}
                        disabled={approveMember.isPending}
                        className="text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Members Table */}
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="font-mono uppercase tracking-widest text-sm text-muted-foreground">
                Members
              </h2>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border hover:bg-transparent">
                  <TableHead className="w-16 font-mono uppercase tracking-widest text-xs">
                    #
                  </TableHead>
                  <TableHead className="font-mono uppercase tracking-widest text-xs">
                    Member
                  </TableHead>
                  <TableHead className="font-mono uppercase tracking-widest text-xs">
                    Rank
                  </TableHead>
                  <TableHead className="text-right font-mono uppercase tracking-widest text-xs">
                    Score
                  </TableHead>
                  <TableHead className="text-right font-mono uppercase tracking-widest text-xs">
                    Consistency
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members?.map((member, index) => {
                  const isMe = member.user_id === user.id;
                  const isMemberOwner = member.user_id === group.owner_id;

                  return (
                    <TableRow
                      key={member.id}
                      className={`border-b border-border/50 ${isMe ? 'bg-primary/10' : ''}`}
                    >
                      <TableCell className="font-mono font-bold text-muted-foreground">
                        #{index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {isMemberOwner && <Crown className="w-4 h-4 text-warning" />}
                          <span className={`font-mono ${isMe ? 'text-primary' : ''}`}>
                            {member.profile?.display_name || member.profile?.username || 'Anonymous'}
                            {isMe && <span className="text-xs text-muted-foreground ml-2">(You)</span>}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <RankBadge score={member.score?.discipline_score || 0} size="sm" />
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold">
                        {member.score?.discipline_score || 0}
                      </TableCell>
                      <TableCell className="text-right font-mono text-muted-foreground">
                        {Number(member.score?.consistency_percentage || 0).toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  );
                })}

                {(!members || members.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                      No members yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Group Rules */}
          <div className="message-box">
            <h3 className="font-mono uppercase tracking-widest text-xs text-muted-foreground mb-2">
              Group Rules
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>No chat. No reactions. No excuses.</li>
              <li>Your discipline is visible to all members.</li>
              <li>Your failures drag down the group average.</li>
              <li>Your success lifts everyone.</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GroupDetail;
