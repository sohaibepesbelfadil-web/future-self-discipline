import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Trophy, TrendingUp } from 'lucide-react';

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
  variant?: 'compact' | 'full';
  className?: string;
}

const StreakDisplay: React.FC<StreakDisplayProps> = ({
  currentStreak,
  longestStreak,
  variant = 'compact',
  className = '',
}) => {
  const getFireColor = () => {
    if (currentStreak >= 30) return 'text-warning';
    if (currentStreak >= 14) return 'text-warning';
    if (currentStreak >= 7) return 'text-warning/80';
    return 'text-muted-foreground';
  };

  const getFireScale = () => {
    if (currentStreak >= 30) return 1.3;
    if (currentStreak >= 14) return 1.2;
    if (currentStreak >= 7) return 1.1;
    return 1;
  };

  if (variant === 'compact') {
    return (
      <motion.div
        className={`flex items-center gap-2 ${className}`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <motion.div
          animate={{ scale: [1, getFireScale(), 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className={getFireColor()}
        >
          <Flame className="w-5 h-5" />
        </motion.div>
        <div className="flex items-baseline gap-1">
          <motion.span
            key={currentStreak}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-bold text-lg font-mono"
          >
            {currentStreak}
          </motion.span>
          <span className="text-xs text-muted-foreground">day streak</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-card p-6 ${className}`}
    >
      <div className="flex items-center gap-3 mb-6">
        <motion.div
          animate={{ scale: [1, getFireScale(), 1], rotate: [0, -3, 3, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-12 h-12 rounded-xl bg-warning/10 border border-warning/20 flex items-center justify-center text-warning"
        >
          <Flame className="w-6 h-6" />
        </motion.div>
        <div>
          <h3 className="font-semibold text-lg">Discipline Streak</h3>
          <p className="text-sm text-muted-foreground">Keep the momentum going</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-4 rounded-xl bg-primary/5 border border-primary/15"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">
              Current
            </span>
          </div>
          <motion.div
            key={currentStreak}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-baseline gap-1"
          >
            <span className="text-3xl font-bold font-mono text-gradient">{currentStreak}</span>
            <span className="text-sm text-muted-foreground">days</span>
          </motion.div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-4 rounded-xl bg-warning/5 border border-warning/15"
        >
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-4 h-4 text-warning" />
            <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">
              Best
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold font-mono text-gradient-warm">{longestStreak}</span>
            <span className="text-sm text-muted-foreground">days</span>
          </div>
        </motion.div>
      </div>

      {currentStreak > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 pt-4 border-t border-border/50"
        >
          <p className="text-sm text-muted-foreground text-center">
            {currentStreak >= longestStreak ? (
              <span className="text-primary font-medium">
                You're on a record streak! Keep pushing!
              </span>
            ) : (
              <span>
                {longestStreak - currentStreak} more days to beat your record
              </span>
            )}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default StreakDisplay;
