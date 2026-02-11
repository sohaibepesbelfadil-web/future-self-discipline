import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Clock, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Task } from '@/hooks/useTasks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { TASK_COLORS } from '@/components/TaskCalendar';
import { cn } from '@/lib/utils';

interface TaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
  defaultDate?: Date;
  onSave: (data: {
    title: string;
    description?: string;
    task_date: string;
    start_time: string;
    end_time: string;
    color: string;
  }) => void;
  onDelete?: (id: string) => void;
  isLoading?: boolean;
}

const TaskDialog: React.FC<TaskDialogProps> = ({
  isOpen,
  onClose,
  task,
  defaultDate = new Date(),
  onSave,
  onDelete,
  isLoading,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [taskDate, setTaskDate] = useState(format(defaultDate, 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [color, setColor] = useState(TASK_COLORS[0]);
  const [errors, setErrors] = useState<{ title?: string; time?: string }>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setTaskDate(task.task_date);
      setStartTime(task.start_time.slice(0, 5));
      setEndTime(task.end_time.slice(0, 5));
      setColor(task.color);
    } else {
      setTitle('');
      setDescription('');
      setTaskDate(format(defaultDate, 'yyyy-MM-dd'));
      setStartTime('09:00');
      setEndTime('10:00');
      setColor(TASK_COLORS[0]);
    }
    setErrors({});
    setShowDeleteConfirm(false);
  }, [task, defaultDate, isOpen]);

  // Prevent background scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // ESC key to close
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  const validate = (): boolean => {
    const newErrors: { title?: string; time?: string } = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (startTime >= endTime) newErrors.time = 'End time must be after start time';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      task_date: taskDate,
      start_time: startTime + ':00',
      end_time: endTime + ':00',
      color,
    });
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (task && onDelete) {
      onDelete(task.id);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md max-h-[90vh] overflow-y-auto z-[101] bg-card border border-border rounded-2xl shadow-2xl"
          >
            {/* Header */}
            <div className="sticky top-0 bg-card/95 backdrop-blur-sm flex items-center justify-between p-4 border-b border-border z-10">
              <h2 className="text-lg font-semibold">
                {task ? 'Edit Task' : 'New Task'}
              </h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>
            
            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Title */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Title</label>
                <Input
                  placeholder="Task title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={cn("bg-background/50", errors.title && "border-destructive")}
                  autoFocus
                />
                {errors.title && (
                  <p className="text-xs text-destructive mt-1">{errors.title}</p>
                )}
              </div>
              
              {/* Description */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Description</label>
                <Textarea
                  placeholder="Add details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-background/50 min-h-[80px] resize-none"
                />
              </div>
              
              {/* Date */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Date</label>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                  <Input
                    type="date"
                    value={taskDate}
                    onChange={(e) => setTaskDate(e.target.value)}
                    className="bg-background/50 flex-1"
                  />
                </div>
              </div>
              
              {/* Time */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Time</label>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="bg-background/50 flex-1"
                  />
                  <span className="text-muted-foreground text-sm">→</span>
                  <Input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="bg-background/50 flex-1"
                  />
                </div>
                {errors.time && (
                  <p className="text-xs text-destructive mt-1">{errors.time}</p>
                )}
              </div>
              
              {/* Color picker */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {TASK_COLORS.map((c) => (
                    <motion.button
                      key={c}
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setColor(c)}
                      className={cn(
                        "w-8 h-8 rounded-full transition-all",
                        color === c && "ring-2 ring-offset-2 ring-offset-card"
                      )}
                      style={{ backgroundColor: c, ...(color === c ? { '--tw-ring-color': c } as React.CSSProperties : {}) }}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="sticky bottom-0 bg-card/95 backdrop-blur-sm border-t border-border p-4">
              {/* Delete confirmation */}
              <AnimatePresence>
                {showDeleteConfirm && task && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-3 p-3 bg-destructive/10 border border-destructive/20 rounded-xl overflow-hidden"
                  >
                    <p className="text-sm text-destructive font-medium mb-2">Delete this task?</p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={handleConfirmDelete}
                        className="flex-1"
                      >
                        Delete
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center justify-between">
                {task && onDelete && !showDeleteConfirm ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDeleteClick}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                ) : (
                  <div />
                )}
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={onClose} size="sm">
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} disabled={isLoading} size="sm" className="min-w-[100px]">
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : task ? 'Save' : 'Create'}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TaskDialog;
