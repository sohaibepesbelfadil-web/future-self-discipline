import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask, Task } from '@/hooks/useTasks';
import ResponsiveNavbar from '@/components/ResponsiveNavbar';
import BottomNavbar from '@/components/BottomNavbar';
import { StaggerContainer, StaggerItem, PremiumCard } from '@/components/PageTransition';
import { TaskCalendar } from '@/components/TaskCalendar';
import TaskDialog from '@/components/TaskDialog';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ListTodo, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const Tasks: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: tasks = [], isLoading: tasksLoading } = useTasks();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<'day' | 'week' | 'month'>('week');
  const [showList, setShowList] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultTaskDate, setDefaultTaskDate] = useState(new Date());

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-muted-foreground font-mono">
          Loading...
        </motion.div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (profile && !profile.onboarding_completed) return <Navigate to="/onboarding" replace />;

  const handleAddTask = (date: Date) => {
    setEditingTask(null);
    setDefaultTaskDate(date);
    setDialogOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setDialogOpen(true);
  };

  const handleSaveTask = async (data: {
    title: string;
    description?: string;
    task_date: string;
    start_time: string;
    end_time: string;
    color: string;
  }) => {
    if (editingTask) {
      await updateTask.mutateAsync({ id: editingTask.id, ...data });
    } else {
      await createTask.mutateAsync(data);
    }
    setDialogOpen(false);
    setEditingTask(null);
  };

  const handleDeleteTask = async (id: string) => {
    await deleteTask.mutateAsync(id);
    setDialogOpen(false);
    setEditingTask(null);
  };

  // Group tasks by date for list view
  const tasksByDate = tasks.reduce((acc, task) => {
    if (!acc[task.task_date]) acc[task.task_date] = [];
    acc[task.task_date].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  const sortedDates = Object.keys(tasksByDate).sort();

  return (
    <div className="min-h-screen bg-background">
      <ResponsiveNavbar />
      <main className="pt-16 md:pt-20 pb-24 md:pb-12 px-4 md:px-6">
        <StaggerContainer className="max-w-6xl mx-auto">
          <StaggerItem>
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <h1 className="text-xl md:text-2xl font-bold">Tasks</h1>
              <div className="flex rounded-xl border border-border/50 p-1">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowList(false)}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    !showList ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <CalendarIcon className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowList(true)}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    showList ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <ListTodo className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </StaggerItem>

          <AnimatePresence mode="wait">
            {showList ? (
              <motion.div
                key="list"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <StaggerItem>
                  {tasksLoading ? (
                    <PremiumCard className="p-8 text-center">
                      <div className="text-muted-foreground">Loading tasks...</div>
                    </PremiumCard>
                  ) : tasks.length === 0 ? (
                    <PremiumCard className="p-8 md:p-12 text-center">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted/50 flex items-center justify-center">
                          <ListTodo className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">No tasks yet</h3>
                        <p className="text-muted-foreground text-sm">
                          Switch to calendar view to add your first task.
                        </p>
                      </motion.div>
                    </PremiumCard>
                  ) : (
                    <div className="space-y-4">
                      {sortedDates.map((dateStr) => (
                        <PremiumCard key={dateStr} className="p-4">
                          <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                            {format(new Date(dateStr + 'T00:00:00'), 'EEEE, MMMM d')}
                          </h3>
                          <div className="space-y-2">
                            {tasksByDate[dateStr]
                              .sort((a, b) => a.start_time.localeCompare(b.start_time))
                              .map((task) => (
                                <motion.div
                                  key={task.id}
                                  whileHover={{ scale: 1.01 }}
                                  whileTap={{ scale: 0.99 }}
                                  onClick={() => handleEditTask(task)}
                                  className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors hover:bg-muted/50"
                                  style={{ borderLeft: `4px solid ${task.color}` }}
                                >
                                  <div className="flex-1">
                                    <div className="font-medium">{task.title}</div>
                                    {task.description && (
                                      <div className="text-sm text-muted-foreground line-clamp-1">
                                        {task.description}
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-xs text-muted-foreground font-mono">
                                    {task.start_time.slice(0, 5)} - {task.end_time.slice(0, 5)}
                                  </div>
                                </motion.div>
                              ))}
                          </div>
                        </PremiumCard>
                      ))}
                    </div>
                  )}
                </StaggerItem>
              </motion.div>
            ) : (
              <motion.div
                key="calendar"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <StaggerItem>
                  <TaskCalendar
                    tasks={tasks}
                    selectedDate={selectedDate}
                    onDateSelect={setSelectedDate}
                    onTaskClick={handleEditTask}
                    onAddTask={handleAddTask}
                    view={view}
                    onViewChange={setView}
                  />
                </StaggerItem>
              </motion.div>
            )}
          </AnimatePresence>
        </StaggerContainer>
      </main>
      <BottomNavbar />

      <TaskDialog
        isOpen={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingTask(null);
        }}
        task={editingTask}
        defaultDate={defaultTaskDate}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        isLoading={createTask.isPending || updateTask.isPending}
      />
    </div>
  );
};

export default Tasks;
