import React, { useState, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useAllDailyLogs } from '@/hooks/usePromises';
import ResponsiveNavbar from '@/components/ResponsiveNavbar';
import BottomNavbar from '@/components/BottomNavbar';
import { StaggerContainer, StaggerItem, PremiumCard } from '@/components/PageTransition';
import { motion, AnimatePresence } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, getDay, isFuture, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const weekDaysFull = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="min-h-screen bg-background">
      <ResponsiveNavbar />
      <main className="pt-16 md:pt-20 pb-24 md:pb-12 px-4 md:px-6">
        <StaggerContainer className="max-w-4xl mx-auto">
          <StaggerItem>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
              <AnimatePresence mode="wait">
                <motion.h1
                  key={currentMonth.toISOString()}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-xl md:text-2xl font-bold"
                >
                  {format(currentMonth, 'MMMM yyyy')}
                </motion.h1>
              </AnimatePresence>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="p-3 rounded-xl border border-border/50 hover:border-primary/50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCurrentMonth(new Date())}
                  className="px-4 py-2 rounded-xl border border-border/50 text-sm font-medium hover:border-primary/50 transition-colors"
                >
                  Today
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="p-3 rounded-xl border border-border/50 hover:border-primary/50 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </StaggerItem>

          <StaggerItem>
            <PremiumCard className="p-4 md:p-6">
              {/* Mobile week days */}
              <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2 md:mb-4 md:hidden">
                {weekDays.map((day, i) => (
                  <div key={i} className="text-center text-xs font-mono text-muted-foreground py-1">
                    {day}
                  </div>
                ))}
              </div>
              {/* Desktop week days */}
              <div className="hidden md:grid grid-cols-7 gap-2 mb-4">
                {weekDaysFull.map((day) => (
                  <div key={day} className="text-center text-xs font-mono text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentMonth.toISOString()}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-7 gap-1 md:gap-2"
                >
                  {monthDays.map((day, i) => {
                    if (!day) return <div key={`empty-${i}`} className="aspect-square" />;
                    
                    const status = getLogStatus(day);
                    const future = isFuture(day);
                    const todayDate = isToday(day);

                    let statusClasses = '';
                    if (future) {
                      statusClasses = 'text-muted-foreground/50 bg-transparent';
                    } else if (status === 'kept') {
                      statusClasses = 'bg-success/20 text-success border border-success/30';
                    } else if (status === 'broken') {
                      statusClasses = 'bg-destructive/20 text-destructive border border-destructive/30';
                    } else if (status === 'mixed') {
                      statusClasses = 'bg-warning/20 text-warning border border-warning/30';
                    } else {
                      statusClasses = 'bg-muted/50 text-muted-foreground border border-border/30';
                    }

                    return (
                      <motion.div
                        key={day.toISOString()}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: i * 0.01 }}
                        className={`aspect-square flex flex-col items-center justify-center p-1 md:p-2 text-xs md:text-sm transition-all rounded-xl ${statusClasses} ${
                          todayDate ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
                        }`}
                      >
                        <span className="font-medium">{format(day, 'd')}</span>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            </PremiumCard>
          </StaggerItem>

          {/* Legend */}
          <StaggerItem>
            <div className="flex flex-wrap justify-center gap-4 mt-6 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-success/20 border border-success/30" />
                <span className="text-muted-foreground">Kept</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-destructive/20 border border-destructive/30" />
                <span className="text-muted-foreground">Broken</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-warning/20 border border-warning/30" />
                <span className="text-muted-foreground">Mixed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-muted/50 border border-border/30" />
                <span className="text-muted-foreground">No logs</span>
              </div>
            </div>
          </StaggerItem>
        </StaggerContainer>
      </main>
      <BottomNavbar />
    </div>
  );
};

export default Calendar;
