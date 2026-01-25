import React from 'react';
import { useStats } from '@/hooks/usePromises';

const StatsSection: React.FC = () => {
  const { data: stats, isLoading } = useStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-card p-6 animate-pulse">
            <div className="h-4 bg-muted rounded w-20 mb-3" />
            <div className="h-8 bg-muted rounded w-16" />
          </div>
        ))}
      </div>
    );
  }

  const { kept = 0, broken = 0, total = 0, score = 0 } = stats || {};

  const getScoreClass = () => {
    if (score >= 80) return 'score-high';
    if (score >= 50) return 'score-medium';
    return 'score-low';
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="glass-card p-6">
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
          Promises Kept
        </p>
        <p className="text-3xl font-bold text-success">{kept}</p>
      </div>

      <div className="glass-card p-6">
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
          Promises Broken
        </p>
        <p className="text-3xl font-bold text-destructive">{broken}</p>
      </div>

      <div className="glass-card p-6">
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
          Total Days
        </p>
        <p className="text-3xl font-bold">{total}</p>
      </div>

      <div className="glass-card p-6">
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
          Discipline Score
        </p>
        <p className={`text-3xl font-bold ${getScoreClass()}`}>{score}%</p>
      </div>
    </div>
  );
};

export default StatsSection;
