import React from 'react';
import { getRankFromScore } from '@/hooks/useScores';
import { cn } from '@/lib/utils';

interface RankBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showScore?: boolean;
}

const rankStyles: Record<string, string> = {
  Observer: 'border-muted-foreground/50 text-muted-foreground',
  Builder: 'border-primary/50 text-primary',
  Disciplined: 'border-success/50 text-success',
  Relentless: 'border-warning/50 text-warning',
  Unbreakable: 'border-accent-foreground text-accent-foreground glow-primary',
};

const RankBadge: React.FC<RankBadgeProps> = ({ score, size = 'md', showScore = false }) => {
  const rank = getRankFromScore(score);
  const style = rankStyles[rank] || rankStyles.Observer;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          'font-mono uppercase tracking-widest border',
          style,
          sizeClasses[size]
        )}
      >
        {rank}
      </span>
      {showScore && (
        <span className="font-mono text-muted-foreground">{score}</span>
      )}
    </div>
  );
};

export default RankBadge;
