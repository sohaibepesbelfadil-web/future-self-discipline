import React from 'react';
import { Promise, DailyLog, useLogDay } from '@/hooks/usePromises';
import { format, isToday, parseISO, isBefore, startOfDay } from 'date-fns';

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
    <div className={`glass-card p-6 ${isExpired ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg mb-1">{promise.title}</h3>
          {promise.description && (
            <p className="text-sm text-muted-foreground">{promise.description}</p>
          )}
        </div>
        {isExpired && (
          <span className="text-xs font-mono bg-muted px-2 py-1 text-muted-foreground uppercase">
            Completed
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs font-mono text-muted-foreground mb-2">
          <span>{format(startDate, 'MMM d')} - {format(endDate, 'MMM d')}</span>
          <span>{progress}% complete</span>
        </div>
        <div className="h-1.5 bg-muted">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-4 mb-4 text-sm">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 bg-success" />
          <span className="text-muted-foreground">{keptDays} kept</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 bg-destructive" />
          <span className="text-muted-foreground">{brokenDays} broken</span>
        </div>
      </div>

      {/* Today's action */}
      {!isExpired && (
        <div className="border-t border-border pt-4">
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">
            Today
          </p>

          {todayLog ? (
            <div
              className={`text-center py-3 ${
                todayLog.status === 'kept'
                  ? 'bg-success/10 text-success border border-success/20'
                  : 'bg-destructive/10 text-destructive border border-destructive/20'
              }`}
            >
              <span className="text-sm font-medium uppercase tracking-widest">
                {todayLog.status === 'kept' ? 'Promise Kept' : 'Promise Broken'}
              </span>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => handleLog('kept')}
                disabled={logDay.isPending}
                className="flex-1 py-3 bg-success/10 text-success border border-success/20 hover:bg-success/20 transition-colors text-sm font-medium uppercase tracking-widest disabled:opacity-50"
              >
                Kept
              </button>
              <button
                onClick={() => handleLog('broken')}
                disabled={logDay.isPending}
                className="flex-1 py-3 bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 transition-colors text-sm font-medium uppercase tracking-widest disabled:opacity-50"
              >
                Broken
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PromiseCard;
