import React, { useMemo } from 'react';
import { useAllDailyLogs } from '@/hooks/usePromises';
import { Link } from 'react-router-dom';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isFuture,
  getDay,
} from 'date-fns';

const CalendarPreview: React.FC = () => {
  const { data: logs = [] } = useAllDailyLogs();
  const today = new Date();

  const monthDays = useMemo(() => {
    const start = startOfMonth(today);
    const end = endOfMonth(today);
    const days = eachDayOfInterval({ start, end });

    // Add padding for the first week
    const firstDayOfWeek = getDay(start);
    const paddingBefore = Array(firstDayOfWeek).fill(null);

    return [...paddingBefore, ...days];
  }, []);

  const getLogStatus = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayLogs = logs.filter((log) => log.log_date === dateStr);

    if (dayLogs.length === 0) return null;

    const hasKept = dayLogs.some((l) => l.status === 'kept');
    const hasBroken = dayLogs.some((l) => l.status === 'broken');

    if (hasKept && hasBroken) return 'mixed';
    if (hasKept) return 'kept';
    if (hasBroken) return 'broken';
    return 'pending';
  };

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
          {format(today, 'MMMM yyyy')}
        </h3>
        <Link
          to="/calendar"
          className="text-xs font-mono text-primary hover:text-primary/80 uppercase tracking-widest transition-colors"
        >
          Full Calendar
        </Link>
      </div>

      {/* Week day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day, i) => (
          <div
            key={i}
            className="text-center text-xs font-mono text-muted-foreground py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {monthDays.map((day, i) => {
          if (!day) {
            return <div key={`empty-${i}`} className="aspect-square" />;
          }

          const status = getLogStatus(day);
          const future = isFuture(day);
          const todayDate = isToday(day);

          let dayClass = 'calendar-day';
          if (future) {
            dayClass += ' calendar-day-future';
          } else if (status === 'kept') {
            dayClass += ' calendar-day-kept';
          } else if (status === 'broken') {
            dayClass += ' calendar-day-broken';
          } else if (status === 'mixed') {
            dayClass += ' bg-warning/20 text-warning border border-warning/30';
          } else {
            dayClass += ' calendar-day-pending';
          }

          if (todayDate) {
            dayClass += ' ring-1 ring-primary';
          }

          return (
            <div key={day.toISOString()} className={dayClass}>
              {format(day, 'd')}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 mt-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 bg-success" />
          <span className="text-muted-foreground">Kept</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 bg-destructive" />
          <span className="text-muted-foreground">Broken</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 bg-muted border border-border" />
          <span className="text-muted-foreground">No data</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarPreview;
