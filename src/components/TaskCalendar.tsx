import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, startOfWeek, addDays, isSameDay, parseISO, addWeeks, subWeeks, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Task } from '@/hooks/useTasks';
import { PremiumCard } from '@/components/PageTransition';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TaskCalendarProps {
  tasks: Task[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onTaskClick: (task: Task) => void;
  onAddTask: (date: Date) => void;
  view: 'day' | 'week' | 'month';
  onViewChange: (view: 'day' | 'week' | 'month') => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);

const TASK_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
];

const TaskCalendar: React.FC<TaskCalendarProps> = ({
  tasks,
  selectedDate,
  onDateSelect,
  onTaskClick,
  onAddTask,
  view,
  onViewChange,
}) => {
  const navigateBack = () => {
    if (view === 'day') {
      onDateSelect(addDays(selectedDate, -1));
    } else if (view === 'week') {
      onDateSelect(subWeeks(selectedDate, 1));
    } else {
      onDateSelect(subMonths(selectedDate, 1));
    }
  };

  const navigateForward = () => {
    if (view === 'day') {
      onDateSelect(addDays(selectedDate, 1));
    } else if (view === 'week') {
      onDateSelect(addWeeks(selectedDate, 1));
    } else {
      onDateSelect(addMonths(selectedDate, 1));
    }
  };

  const weekDays = useMemo(() => {
    const start = startOfWeek(selectedDate);
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [selectedDate]);

  const monthDays = useMemo(() => {
    const start = startOfMonth(selectedDate);
    const end = endOfMonth(selectedDate);
    const days = eachDayOfInterval({ start, end });
    const firstDayOfWeek = getDay(start);
    const paddingBefore = Array(firstDayOfWeek).fill(null);
    return [...paddingBefore, ...days];
  }, [selectedDate]);

  const getTasksForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return tasks.filter(t => t.task_date === dateStr);
  };

  const getTaskPosition = (task: Task) => {
    const [startHour, startMin] = task.start_time.split(':').map(Number);
    const [endHour, endMin] = task.end_time.split(':').map(Number);
    const top = (startHour + startMin / 60) * 60;
    const height = ((endHour + endMin / 60) - (startHour + startMin / 60)) * 60;
    return { top, height: Math.max(height, 30) };
  };

  const renderDayView = () => {
    const dayTasks = getTasksForDate(selectedDate);
    
    return (
      <div className="flex flex-col h-[600px] md:h-[700px]">
        <div className="flex-1 overflow-y-auto relative">
          <div className="relative" style={{ height: 24 * 60 }}>
            {/* Hour grid */}
            {HOURS.map(hour => (
              <div
                key={hour}
                className="absolute left-0 right-0 border-t border-border/30"
                style={{ top: hour * 60 }}
              >
                <span className="text-xs text-muted-foreground font-mono absolute -top-2 left-2">
                  {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                </span>
              </div>
            ))}
            
            {/* Tasks */}
            <div className="absolute left-14 right-2 top-0">
              <AnimatePresence>
                {dayTasks.map(task => {
                  const { top, height } = getTaskPosition(task);
                  return (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      onClick={() => onTaskClick(task)}
                      className="absolute left-0 right-0 cursor-pointer"
                      style={{ top, height }}
                    >
                      <div
                        className="h-full rounded-lg px-2 py-1 text-white text-xs font-medium overflow-hidden border-l-4"
                        style={{ 
                          backgroundColor: `${task.color}20`,
                          borderLeftColor: task.color,
                          color: task.color 
                        }}
                      >
                        <div className="font-semibold truncate">{task.title}</div>
                        <div className="text-[10px] opacity-80">
                          {task.start_time.slice(0, 5)} - {task.end_time.slice(0, 5)}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    return (
      <div className="grid grid-cols-7 gap-1 md:gap-2">
        {weekDays.map((day, i) => {
          const dayTasks = getTasksForDate(day);
          const isToday = isSameDay(day, new Date());
          const isSelected = isSameDay(day, selectedDate);
          
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => onDateSelect(day)}
              className={cn(
                "min-h-[120px] md:min-h-[150px] p-2 rounded-xl border border-border/30 cursor-pointer transition-all",
                isToday && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                isSelected && "bg-primary/10 border-primary/50"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={cn(
                  "text-xs font-medium",
                  isToday ? "text-primary" : "text-muted-foreground"
                )}>
                  {format(day, 'EEE')}
                </span>
                <span className={cn(
                  "text-sm font-bold",
                  isToday && "text-primary"
                )}>
                  {format(day, 'd')}
                </span>
              </div>
              <div className="space-y-1">
                {dayTasks.slice(0, 3).map(task => (
                  <div
                    key={task.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onTaskClick(task);
                    }}
                    className="text-[10px] md:text-xs p-1 rounded truncate"
                    style={{ 
                      backgroundColor: `${task.color}20`,
                      color: task.color 
                    }}
                  >
                    {task.title}
                  </div>
                ))}
                {dayTasks.length > 3 && (
                  <div className="text-[10px] text-muted-foreground">
                    +{dayTasks.length - 3} more
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  const renderMonthView = () => {
    const weekDayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return (
      <div>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDayHeaders.map(day => (
            <div key={day} className="text-center text-xs font-mono text-muted-foreground py-2">
              {day.slice(0, 1)}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {monthDays.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} className="aspect-square" />;
            
            const dayTasks = getTasksForDate(day);
            const isToday = isSameDay(day, new Date());
            const isSelected = isSameDay(day, selectedDate);
            
            return (
              <motion.div
                key={day.toISOString()}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.01 }}
                onClick={() => onDateSelect(day)}
                className={cn(
                  "aspect-square p-1 rounded-lg border border-transparent cursor-pointer transition-all flex flex-col items-center",
                  isToday && "ring-2 ring-primary ring-offset-1 ring-offset-background",
                  isSelected && "bg-primary/10 border-primary/50",
                  dayTasks.length > 0 && "bg-muted/30"
                )}
              >
                <span className={cn(
                  "text-xs md:text-sm font-medium",
                  isToday && "text-primary"
                )}>
                  {format(day, 'd')}
                </span>
                {dayTasks.length > 0 && (
                  <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                    {dayTasks.slice(0, 3).map(task => (
                      <div
                        key={task.id}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: task.color }}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <PremiumCard className="p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={navigateBack}
            className="p-2 rounded-xl border border-border/50 hover:border-primary/50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </motion.button>
          <AnimatePresence mode="wait">
            <motion.h2
              key={selectedDate.toISOString() + view}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-lg font-bold min-w-[200px] text-center"
            >
              {view === 'day' && format(selectedDate, 'EEEE, MMMM d')}
              {view === 'week' && `${format(weekDays[0], 'MMM d')} - ${format(weekDays[6], 'MMM d, yyyy')}`}
              {view === 'month' && format(selectedDate, 'MMMM yyyy')}
            </motion.h2>
          </AnimatePresence>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={navigateForward}
            className="p-2 rounded-xl border border-border/50 hover:border-primary/50 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-border/50 p-1">
            {(['day', 'week', 'month'] as const).map(v => (
              <motion.button
                key={v}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onViewChange(v)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors capitalize",
                  view === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {v}
              </motion.button>
            ))}
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button size="sm" onClick={() => onAddTask(selectedDate)} className="gap-1">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Task</span>
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Calendar content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          {view === 'day' && renderDayView()}
          {view === 'week' && renderWeekView()}
          {view === 'month' && renderMonthView()}
        </motion.div>
      </AnimatePresence>
    </PremiumCard>
  );
};

export { TaskCalendar, TASK_COLORS };
