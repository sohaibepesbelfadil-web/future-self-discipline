import React from 'react';
import { Promise, DailyLog, useLogDay } from '@/hooks/usePromises';
import { format, isToday, parseISO, isBefore, startOfDay } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';

interface PromiseCardProps {
  promise: Promise;
  logs: DailyLog[];
}

const PromiseCard: React.FC<PromiseCardProps> = ({ promise, logs }) => {
  const logDay = useLogDay();
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayLog = logs.find((l) => l.log_date === today);

  const startDate = parseISO(promise.start_date);
  const endDate = parseISO(promise.end_date);
  const now = startOfDay(new Date());

  const totalDays = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  ) + 1;

  const keptDays = logs.filter((l) => l.status === 'kept').length;
  const brokenDays = logs.filter((l) => l.status === 'broken').length;
  const progress = totalDays > 0 ? Math.round(((keptDays + brokenDays) / totalDays) * 100) : 0;

  const handleLog = async (status: 'kept' | 'broken') => {
    try {
      await logDay.mutateAsync({
        promise_id: promise.id,
        log_date: today,
        status,
      });
    } catch (error) {
      console.error('Failed to log day:', error);
    }
  };

  const isExpired = isBefore(endDate, now);

  return (
    <motion.div
      layout
      className={`glass-card p-6 ${isExpired ? 'opacity-60' : ''}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: isExpired ? 0.6 : 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 350, damping: 28 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg mb-1">{promise.title}</h3>
          {promise.description && (
            <p className="text-sm text-muted-foreground">{promise.description}</p>
          )}
        </div>
        {isExpired && (
          <span className="text-xs font-mono bg-muted px-2 py-1 text-muted-foreground uppercase rounded-lg">
            Completed
          </span>
        )}
      </div>

      {/* Animated progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs font-mono text-muted-foreground mb-2">
          <span>{format(startDate, 'MMM d')} - {format(endDate, 'MMM d')}</span>
          <span>{progress}%</span>
        </div>
        <div className="progress-animated">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-4 mb-4 text-sm">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-success" />
          <span className="text-muted-foreground">{keptDays} kept</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-destructive" />
          <span className="text-muted-foreground">{brokenDays} broken</span>
        </div>
      </div>

      {/* Today's action */}
      {!isExpired && (
        <div className="border-t border-border/50 pt-4">
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">
            Today
          </p>

          <AnimatePresence mode="wait">
            {todayLog ? (
              <motion.div
                key="logged"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className={`text-center py-3 rounded-xl flex items-center justify-center gap-2 ${
                  todayLog.status === 'kept'
                    ? 'bg-success/15 text-success border border-success/20'
                    : 'bg-destructive/15 text-destructive border border-destructive/20'
                }`}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 20, delay: 0.1 }}
                >
                  {todayLog.status === 'kept' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                </motion.div>
                <span className="text-sm font-medium uppercase tracking-widest">
                  {todayLog.status === 'kept' ? 'Promise Kept' : 'Promise Broken'}
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="buttons"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex gap-2"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleLog('kept')}
                  disabled={logDay.isPending}
                  className="flex-1 py-3 bg-success/10 text-success border border-success/20 hover:bg-success/20 rounded-xl transition-colors text-sm font-medium uppercase tracking-widest disabled:opacity-50"
                >
                  Kept
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleLog('broken')}
                  disabled={logDay.isPending}
                  className="flex-1 py-3 bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 rounded-xl transition-colors text-sm font-medium uppercase tracking-widest disabled:opacity-50"
                >
                  Broken
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default PromiseCard;
