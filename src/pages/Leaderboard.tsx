import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useLeaderboard, getRankFromScore, useMyScore } from '@/hooks/useScores';
import ResponsiveNavbar from '@/components/ResponsiveNavbar';
import BottomNavbar from '@/components/BottomNavbar';
import RankBadge from '@/components/RankBadge';
import { StaggerContainer, StaggerItem, PremiumCard } from '@/components/PageTransition';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { motion } from 'framer-motion';
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
      <ResponsiveNavbar />
      <main className="pt-16 md:pt-20 pb-24 md:pb-12 px-4 md:px-6">
        <StaggerContainer className="max-w-4xl mx-auto space-y-6 md:space-y-8">
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
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="text-center space-y-2">
              <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-wider">
                Classement
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground">
                Ranked by discipline. Sorted by commitment.
              </p>
            </div>
          </StaggerItem>

          {/* My Position */}
          {myScore && myPosition !== undefined && myPosition >= 0 && (
            <StaggerItem>
              <PremiumCard className="p-4 md:p-6 text-center">
                <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
                  Your Position
                </p>
                <div className="flex items-center justify-center gap-3 md:gap-4">
                  <motion.span
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className="text-3xl md:text-4xl font-mono font-bold text-primary"
                  >
                    #{myPosition + 1}
                  </motion.span>
                  <div className="text-left">
                    <RankBadge score={myScore.discipline_score} />
                    <p className="text-xs md:text-sm text-muted-foreground mt-1">
                      {myScore.discipline_score} points
                    </p>
                  </div>
                </div>
              </PremiumCard>
            </StaggerItem>
          )}

          {/* Leaderboard Table - Desktop */}
          <StaggerItem>
            <PremiumCard className="overflow-hidden hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border/50 hover:bg-transparent">
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
                        className={`border-b border-border/30 transition-colors ${
                          isMe ? 'bg-primary/10' : 'hover:bg-muted/30'
                        }`}
                      >
                        <TableCell className="font-mono font-bold">
                          <div className="flex items-center gap-2">
                            {getPositionIcon(index) || <span className="text-muted-foreground">#{index + 1}</span>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Link
                            to={entry.profiles?.username ? `/u/${entry.profiles.username}` : '#'}
                            className={`font-mono hover:text-primary transition-colors ${isMe ? 'text-primary' : ''}`}
                          >
                            {displayName}
                            {isMe && <span className="text-xs text-muted-foreground ml-2">(You)</span>}
                          </Link>
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
            </PremiumCard>
          </StaggerItem>

          {/* Leaderboard Cards - Mobile */}
          <div className="space-y-3 md:hidden">
            {leaderboard?.map((entry, index) => {
              const isMe = entry.user_id === user.id;
              const displayName = entry.profiles?.username || 
                entry.profiles?.display_name || 
                'Anonymous';

              return (
                <StaggerItem key={entry.id}>
                  <Link to={entry.profiles?.username ? `/u/${entry.profiles.username}` : '#'}>
                    <motion.div
                      whileTap={{ scale: 0.98 }}
                      className={`premium-card p-4 ${isMe ? 'border-primary/50' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-muted border border-border/50">
                          {getPositionIcon(index) || (
                            <span className="text-sm font-mono font-bold text-muted-foreground">
                              {index + 1}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium text-sm truncate ${isMe ? 'text-primary' : ''}`}>
                            {displayName}
                            {isMe && <span className="text-xs text-muted-foreground ml-1">(You)</span>}
                          </p>
                          <RankBadge score={entry.discipline_score} size="sm" />
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-bold text-sm">{entry.discipline_score}</p>
                          <p className="text-xs text-muted-foreground">
                            {Number(entry.consistency_percentage).toFixed(0)}%
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                </StaggerItem>
              );
            })}

            {(!leaderboard || leaderboard.length === 0) && (
              <StaggerItem>
                <div className="text-center py-12 text-muted-foreground glass-card">
                  No entries yet. Start keeping your promises.
                </div>
              </StaggerItem>
            )}
          </div>

          {/* Philosophy note */}
          <StaggerItem>
            <div className="message-box">
              <p className="text-sm text-muted-foreground italic">
                "Discipline is not about being better than others. It's about being better than your excuses. 
                This leaderboard exists not to glorify, but to witness."
              </p>
            </div>
          </StaggerItem>
        </StaggerContainer>
      </main>
      <BottomNavbar />
    </div>
  );
};

export default Leaderboard;
