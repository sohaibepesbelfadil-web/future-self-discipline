import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useLeaderboard, getRankFromScore, useMyScore } from '@/hooks/useScores';
import Navbar from '@/components/Navbar';
import RankBadge from '@/components/RankBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Crown, Medal, Award } from 'lucide-react';

const Leaderboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: leaderboard, isLoading: leaderboardLoading } = useLeaderboard(100);
  const { data: myScore } = useMyScore();

  const isLoading = authLoading || profileLoading || leaderboardLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground font-mono">Loading...</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (profile && !profile.onboarding_completed) return <Navigate to="/onboarding" replace />;

  // Find current user's position
  const myPosition = leaderboard?.findIndex(entry => entry.user_id === user.id);

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 0:
        return <Crown className="w-5 h-5 text-warning" />;
      case 1:
        return <Medal className="w-5 h-5 text-muted-foreground" />;
      case 2:
        return <Award className="w-5 h-5 text-primary" />;
      default:
        return null;
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
              to="/dashboard"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
          </div>

          <div className="text-center space-y-2">
            <h1 className="text-3xl font-mono font-bold uppercase tracking-widest">
              Classement
            </h1>
            <p className="text-sm text-muted-foreground">
              Ranked by discipline. Sorted by commitment.
            </p>
          </div>

          {/* My Position */}
          {myScore && myPosition !== undefined && myPosition >= 0 && (
            <div className="glass-card p-6 text-center">
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
                Your Position
              </p>
              <div className="flex items-center justify-center gap-4">
                <span className="text-4xl font-mono font-bold text-primary">
                  #{myPosition + 1}
                </span>
                <div className="text-left">
                  <RankBadge score={myScore.discipline_score} />
                  <p className="text-sm text-muted-foreground mt-1">
                    {myScore.discipline_score} points
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Leaderboard Table */}
          <div className="glass-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border hover:bg-transparent">
                  <TableHead className="w-16 font-mono uppercase tracking-widest text-xs">
                    Rank
                  </TableHead>
                  <TableHead className="font-mono uppercase tracking-widest text-xs">
                    User
                  </TableHead>
                  <TableHead className="font-mono uppercase tracking-widest text-xs">
                    Title
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
                {leaderboard?.map((entry, index) => {
                  const isMe = entry.user_id === user.id;
                  const displayName = entry.profiles?.username || 
                    entry.profiles?.display_name || 
                    'Anonymous';

                  return (
                    <TableRow
                      key={entry.id}
                      className={`border-b border-border/50 ${
                        isMe ? 'bg-primary/10' : ''
                      }`}
                    >
                      <TableCell className="font-mono font-bold">
                        <div className="flex items-center gap-2">
                          {getPositionIcon(index) || <span className="text-muted-foreground">#{index + 1}</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`font-mono ${isMe ? 'text-primary' : ''}`}>
                          {displayName}
                          {isMe && <span className="text-xs text-muted-foreground ml-2">(You)</span>}
                        </span>
                      </TableCell>
                      <TableCell>
                        <RankBadge score={entry.discipline_score} size="sm" />
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold">
                        {entry.discipline_score}
                      </TableCell>
                      <TableCell className="text-right font-mono text-muted-foreground">
                        {Number(entry.consistency_percentage).toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  );
                })}

                {(!leaderboard || leaderboard.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                      No entries yet. Start keeping your promises.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Philosophy note */}
          <div className="message-box">
            <p className="text-sm text-muted-foreground italic">
              "Discipline is not about being better than others. It's about being better than your excuses. 
              This leaderboard exists not to glorify, but to witness."
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Leaderboard;
