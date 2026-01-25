import React, { useState, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useAllDailyLogs } from '@/hooks/usePromises';
import Navbar from '@/components/Navbar';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, getDay, isFuture, isToday } from 'date-fns';

const Calendar: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: logs = [] } = useAllDailyLogs();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });
    const firstDayOfWeek = getDay(start);
    const paddingBefore = Array(firstDayOfWeek).fill(null);
    return [...paddingBefore, ...days];
  }, [currentMonth]);

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

  if (authLoading || profileLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><div className="text-muted-foreground font-mono">Loading...</div></div>;
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (profile && !profile.onboarding_completed) return <Navigate to="/onboarding" replace />;

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold">{format(currentMonth, 'MMMM yyyy')}</h1>
            <div className="flex gap-2">
              <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="btn-outline-harsh px-4 py-2">Prev</button>
              <button onClick={() => setCurrentMonth(new Date())} className="btn-outline-harsh px-4 py-2">Today</button>
              <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="btn-outline-harsh px-4 py-2">Next</button>
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="grid grid-cols-7 gap-2 mb-4">
              {weekDays.map((day) => (<div key={day} className="text-center text-xs font-mono text-muted-foreground py-2">{day}</div>))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {monthDays.map((day, i) => {
                if (!day) return <div key={`empty-${i}`} className="aspect-square" />;
                const status = getLogStatus(day);
                const future = isFuture(day);
                const todayDate = isToday(day);
                let dayClass = 'aspect-square flex flex-col items-center justify-center p-2 text-sm transition-colors';
                if (future) dayClass += ' text-muted-foreground/50';
                else if (status === 'kept') dayClass += ' bg-success/20 text-success border border-success/30';
                else if (status === 'broken') dayClass += ' bg-destructive/20 text-destructive border border-destructive/30';
                else if (status === 'mixed') dayClass += ' bg-warning/20 text-warning border border-warning/30';
                else dayClass += ' bg-muted text-muted-foreground border border-border';
                if (todayDate) dayClass += ' ring-2 ring-primary';
                return (<div key={day.toISOString()} className={dayClass}><span className="font-medium">{format(day, 'd')}</span></div>);
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Calendar;
