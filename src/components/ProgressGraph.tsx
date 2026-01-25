import React, { useMemo } from 'react';
import { useAllDailyLogs } from '@/hooks/usePromises';
import { format, subDays, parseISO, startOfDay } from 'date-fns';

const ProgressGraph: React.FC = () => {
  const { data: logs = [], isLoading } = useAllDailyLogs();

  const chartData = useMemo(() => {
    const last14Days = Array.from({ length: 14 }, (_, i) => {
      const date = subDays(new Date(), 13 - i);
      return format(date, 'yyyy-MM-dd');
    });

    return last14Days.map((date) => {
      const dayLogs = logs.filter((log) => log.log_date === date);
      const kept = dayLogs.filter((l) => l.status === 'kept').length;
      const broken = dayLogs.filter((l) => l.status === 'broken').length;
      const total = kept + broken;
      const rate = total > 0 ? Math.round((kept / total) * 100) : null;

      return {
        date,
        displayDate: format(parseISO(date), 'MMM d'),
        kept,
        broken,
        rate,
      };
    });
  }, [logs]);

  const maxValue = Math.max(...chartData.map((d) => (d.kept + d.broken) || 1));

  if (isLoading) {
    return (
      <div className="glass-card p-6">
        <div className="h-4 bg-muted rounded w-32 mb-6" />
        <div className="h-40 bg-muted/20 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-6">
        Last 14 Days
      </h3>

      <div className="relative h-40">
        {/* Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="border-b border-border/30" />
          ))}
        </div>

        {/* Bars */}
        <div className="relative h-full flex items-end gap-1">
          {chartData.map((day, i) => {
            const total = day.kept + day.broken;
            const height = total > 0 ? (total / maxValue) * 100 : 0;
            const keptHeight = day.kept > 0 ? (day.kept / total) * 100 : 0;

            return (
              <div
                key={day.date}
                className="flex-1 flex flex-col items-center group"
              >
                <div
                  className="w-full relative transition-all duration-300"
                  style={{ height: `${height}%`, minHeight: total > 0 ? '4px' : '0' }}
                >
                  {total > 0 && (
                    <>
                      {/* Broken portion */}
                      <div
                        className="absolute bottom-0 left-0 right-0 bg-destructive/60"
                        style={{ height: `${100 - keptHeight}%` }}
                      />
                      {/* Kept portion */}
                      <div
                        className="absolute top-0 left-0 right-0 bg-success"
                        style={{ height: `${keptHeight}%` }}
                      />
                    </>
                  )}
                </div>

                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  <div className="bg-popover border border-border px-2 py-1 text-xs whitespace-nowrap">
                    <p className="font-mono">{day.displayDate}</p>
                    {total > 0 ? (
                      <>
                        <p className="text-success">Kept: {day.kept}</p>
                        <p className="text-destructive">Broken: {day.broken}</p>
                      </>
                    ) : (
                      <p className="text-muted-foreground">No data</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between mt-2 text-xs text-muted-foreground font-mono">
        <span>{chartData[0]?.displayDate}</span>
        <span>{chartData[chartData.length - 1]?.displayDate}</span>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-success" />
          <span className="text-muted-foreground">Kept</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-destructive/60" />
          <span className="text-muted-foreground">Broken</span>
        </div>
      </div>
    </div>
  );
};

export default ProgressGraph;
