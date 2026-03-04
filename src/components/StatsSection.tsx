import React from 'react';
import { useStats } from '@/hooks/usePromises';
import { motion } from 'framer-motion';

const StatsSection: React.FC = () => {
  const { data: stats, isLoading } = useStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-card p-5">
            <div className="h-3 shimmer rounded w-16 mb-3" />
            <div className="h-8 shimmer rounded w-12" />
          </div>
        ))}
      </div>
    );
  }

  const { kept = 0, broken = 0, total = 0, score = 0 } = stats || {};

  const statItems = [
    { label: 'Promises Kept', value: kept, color: 'text-success', glow: 'bg-success/10 border-success/20' },
    { label: 'Promises Broken', value: broken, color: 'text-destructive', glow: 'bg-destructive/10 border-destructive/20' },
    { label: 'Total Days', value: total, color: 'text-foreground', glow: 'bg-primary/5 border-primary/15' },
    { 
      label: 'Discipline Score', 
      value: `${score}%`, 
      color: score >= 80 ? 'text-success' : score >= 50 ? 'text-warning' : 'text-destructive',
      glow: score >= 80 ? 'bg-success/10 border-success/20' : score >= 50 ? 'bg-warning/10 border-warning/20' : 'bg-destructive/10 border-destructive/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {statItems.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, type: 'spring', stiffness: 350, damping: 28 }}
          className={`glass-card p-5 border ${stat.glow}`}
        >
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
            {stat.label}
          </p>
          <motion.p
            className={`text-2xl md:text-3xl font-bold font-mono ${stat.color}`}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.05 + 0.1, type: 'spring', stiffness: 400, damping: 20 }}
          >
            {stat.value}
          </motion.p>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsSection;
