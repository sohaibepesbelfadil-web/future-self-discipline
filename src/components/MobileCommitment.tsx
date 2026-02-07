import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronLeft, Shield, Flame } from 'lucide-react';

interface MobileCommitmentProps {
  onComplete: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

const commitments = [
  { key: 'discomfort', text: 'I accept discomfort as part of growth', emoji: '💪' },
  { key: 'responsibility', text: 'I take full responsibility for my actions', emoji: '🎯' },
  { key: 'honesty', text: 'I will be honest with myself', emoji: '🪞' },
  { key: 'consequences', text: 'I accept that my failures will be recorded', emoji: '📝' },
];

const MobileCommitment: React.FC<MobileCommitmentProps> = ({ onComplete, onBack, isLoading }) => {
  const [acceptances, setAcceptances] = useState<Record<string, boolean>>({
    discomfort: false,
    responsibility: false,
    honesty: false,
    consequences: false,
  });

  const allAccepted = Object.values(acceptances).every(Boolean);
  const acceptedCount = Object.values(acceptances).filter(Boolean).length;

  const handleToggle = (key: string) => {
    setAcceptances(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-background flex flex-col"
    >
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[300px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-[300px] h-[300px] bg-destructive/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="pt-safe px-5 py-6 relative z-10">
        <motion.button
          onClick={onBack}
          className="mb-4 flex items-center gap-1 text-muted-foreground text-sm active:text-foreground"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </motion.button>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-16 h-16 mb-4 rounded-2xl bg-destructive/10 flex items-center justify-center"
        >
          <Flame className="w-8 h-8 text-destructive" />
        </motion.div>
        
        <motion.h1
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-3xl font-bold tracking-tight mb-2"
        >
          Your Commitment
        </motion.h1>
        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="text-muted-foreground"
        >
          Accept full accountability for your journey
        </motion.p>
      </div>

      {/* Progress */}
      <div className="px-5 mb-4 relative z-10">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-mono text-primary">{acceptedCount}/{commitments.length}</span>
        </div>
        <div className="h-1 bg-border rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${(acceptedCount / commitments.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Commitments */}
      <div className="flex-1 px-5 py-2 relative z-10">
        <div className="space-y-3">
          {commitments.map((commitment, index) => {
            const isAccepted = acceptances[commitment.key];
            return (
              <motion.button
                key={commitment.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.08 }}
                onClick={() => handleToggle(commitment.key)}
                className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center gap-4 active:scale-[0.98] ${
                  isAccepted
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-card/50'
                }`}
              >
                {/* Emoji */}
                <span className="text-2xl">{commitment.emoji}</span>

                {/* Text */}
                <span className="flex-1 font-medium text-sm leading-snug">
                  {commitment.text}
                </span>

                {/* Checkbox */}
                <motion.div
                  className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${
                    isAccepted
                      ? 'bg-primary border-primary'
                      : 'border-muted-foreground/50'
                  }`}
                >
                  <AnimatePresence>
                    {isAccepted && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.button>
            );
          })}
        </div>

        {/* Warning message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 p-4 rounded-xl bg-destructive/5 border border-destructive/20"
        >
          <p className="text-xs text-muted-foreground text-center">
            ⚠️ This app tracks your discipline honestly. 
            <span className="block mt-1 text-foreground/80">
              Broken promises are permanently recorded.
            </span>
          </p>
        </motion.div>
      </div>

      {/* Continue button */}
      <div className="sticky bottom-0 bg-background/90 backdrop-blur-xl border-t border-border/50 px-5 py-4 pb-safe z-50">
        <motion.button
          onClick={onComplete}
          disabled={!allAccepted || isLoading}
          whileTap={allAccepted ? { scale: 0.98 } : {}}
          className={`w-full py-4 rounded-xl font-medium uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2 ${
            allAccepted
              ? 'bg-primary text-primary-foreground active:bg-primary/90'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          }`}
          style={{ boxShadow: allAccepted ? 'var(--shadow-md)' : 'none' }}
        >
          {isLoading ? 'Processing...' : 'Enter The App'}
          <Shield className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default MobileCommitment;
