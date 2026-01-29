import React from 'react';
import { getRankProgress, RANKS } from '@/hooks/useScores';
import { cn } from '@/lib/utils';

interface ScoreCardProps {
  score: number;
  keptCount: number;
  brokenCount: number;
  consistency: number;
  currentStreak: number;
  longestStreak: number;
}

const ScoreCard: React.FC<ScoreCardProps> = ({
  score,
  keptCount,
  brokenCount,
  consistency,
  currentStreak,
  longestStreak,
}) => {
  const { current, next, progress } = getRankProgress(score);

  return (
    <div className="glass-card p-6 space-y-6">
      {/* Discipline Score */}
      <div className="text-center">
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
          Discipline Score
        </p>
        <p className="text-5xl font-mono font-bold text-foreground">{score}</p>
        <p className="text-sm font-mono uppercase tracking-widest text-primary mt-1">
          {current}
        </p>
      </div>

      {/* Progress to next rank */}
      {next && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-mono text-muted-foreground">
            <span>{current}</span>
            <span>{next}</span>
          </div>
          <div className="h-1 bg-muted overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-center text-muted-foreground">
            {progress}% to next rank
          </p>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-success/10 border border-success/20">
          <p className="text-2xl font-mono font-bold text-success">{keptCount}</p>
          <p className="text-xs font-mono uppercase text-success/70">Kept</p>
        </div>
        <div className="text-center p-3 bg-destructive/10 border border-destructive/20">
          <p className="text-2xl font-mono font-bold text-destructive">{brokenCount}</p>
          <p className="text-xs font-mono uppercase text-destructive/70">Broken</p>
        </div>
      </div>

      {/* Consistency and Streaks */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Consistency</span>
          <span className={cn(
            'font-mono font-bold',
            consistency >= 80 ? 'text-success' :
            consistency >= 50 ? 'text-warning' : 'text-destructive'
          )}>
            {consistency.toFixed(1)}%
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Current Streak</span>
          <span className="font-mono font-bold text-foreground">{currentStreak} days</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Longest Streak</span>
          <span className="font-mono font-bold text-foreground">{longestStreak} days</span>
        </div>
      </div>
    </div>
  );
};

export default ScoreCard;
