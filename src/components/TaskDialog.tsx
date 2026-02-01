import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Clock, Calendar as CalendarIcon } from 'lucide-react';
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
  }, [task, defaultDate, isOpen]);

  const validate = (): boolean => {
    const newErrors: { title?: string; time?: string } = {};
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (startTime >= endTime) {
      newErrors.time = 'End time must be after start time';
    }
    
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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />
          
          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-md z-50"
          >
            <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="text-lg font-semibold">
                  {task ? 'Edit Task' : 'New Task'}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {/* Content */}
              <div className="p-4 space-y-4">
                {/* Title */}
                <div>
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
                <Textarea
                  placeholder="Description (optional)..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-background/50 min-h-[80px]"
                />
                
                {/* Date */}
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={taskDate}
                    onChange={(e) => setTaskDate(e.target.value)}
                    className="bg-background/50 flex-1"
                  />
                </div>
                
                {/* Time */}
                <div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <Input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="bg-background/50 flex-1"
                    />
                    <span className="text-muted-foreground">to</span>
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
                  <label className="text-xs text-muted-foreground mb-2 block">Color</label>
                  <div className="flex gap-2">
                    {TASK_COLORS.map((c) => (
                      <motion.button
                        key={c}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setColor(c)}
                        className={cn(
                          "w-8 h-8 rounded-full transition-all",
                          color === c && "ring-2 ring-offset-2 ring-offset-background"
                        )}
                        style={{ backgroundColor: c, outlineColor: color === c ? c : undefined }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Footer */}
              <div className="flex items-center justify-between p-4 border-t border-border bg-muted/30">
                {task && onDelete ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(task.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                ) : (
                  <div />
                )}
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} disabled={isLoading}>
                    {task ? 'Save Changes' : 'Create Task'}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default TaskDialog;
