import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, Target, Flame, Clock, Brain, Zap } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface MobileQCMQuestion {
  id: string;
  question: string;
  icon: React.ElementType;
  options: { id: string; label: string; emoji?: string }[];
  multiSelect?: boolean;
}

interface MobileQCMProps {
  onComplete: (responses: Record<string, string[]>) => void;
  onBack: () => void;
  isLoading?: boolean;
}

const questions: MobileQCMQuestion[] = [
  {
    id: 'main_goal',
    question: 'What is your main goal?',
    icon: Target,
    options: [
      { id: 'productive', label: 'Be more productive', emoji: '⚡' },
      { id: 'discipline', label: 'Build discipline', emoji: '💪' },
      { id: 'consistent', label: 'Stay consistent', emoji: '🔄' },
      { id: 'organize', label: 'Organize my life', emoji: '📋' },
    ],
  },
  {
    id: 'struggle',
    question: 'What do you struggle with most?',
    icon: Flame,
    options: [
      { id: 'procrastination', label: 'Procrastination', emoji: '⏰' },
      { id: 'focus', label: 'Lack of focus', emoji: '🎯' },
      { id: 'planning', label: 'Poor planning', emoji: '📅' },
      { id: 'motivation', label: 'Motivation', emoji: '🔥' },
    ],
  },
  {
    id: 'improve',
    question: 'What do you want to improve?',
    icon: Zap,
    multiSelect: true,
    options: [
      { id: 'productivity', label: 'Productivity', emoji: '📈' },
      { id: 'habits', label: 'Daily habits', emoji: '✅' },
      { id: 'balance', label: 'Life balance', emoji: '⚖️' },
      { id: 'mindset', label: 'Mindset', emoji: '🧠' },
    ],
  },
  {
    id: 'commitment',
    question: 'How much time can you commit daily?',
    icon: Clock,
    options: [
      { id: '15min', label: '15 minutes', emoji: '⏱️' },
      { id: '30min', label: '30 minutes', emoji: '🕐' },
      { id: '1hour', label: '1 hour', emoji: '⏳' },
      { id: 'more', label: '1+ hours', emoji: '🔋' },
    ],
  },
  {
    id: 'experience',
    question: 'Tried self-improvement apps before?',
    icon: Brain,
    options: [
      { id: 'never', label: 'Never tried', emoji: '🆕' },
      { id: 'tried_failed', label: 'Yes, but failed', emoji: '😔' },
      { id: 'some_success', label: 'Some success', emoji: '🌱' },
      { id: 'experienced', label: 'Very experienced', emoji: '🏆' },
    ],
  },
];

const MobileQCM: React.FC<MobileQCMProps> = ({ onComplete, onBack, isLoading }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Record<string, string[]>>({});

  const question = questions[currentQuestion];
  const currentAnswers = responses[question.id] || [];
  const hasAnswer = currentAnswers.length > 0;
  const isLastQuestion = currentQuestion === questions.length - 1;
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleSelect = (optionId: string) => {
    setResponses((prev) => {
      const current = prev[question.id] || [];
      if (question.multiSelect) {
        return {
          ...prev,
          [question.id]: current.includes(optionId)
            ? current.filter((id) => id !== optionId)
            : [...current, optionId],
        };
      }
      return {
        ...prev,
        [question.id]: [optionId],
      };
    });
  };

  const handleNext = () => {
    if (isLastQuestion) {
      onComplete(responses);
    } else {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestion === 0) {
      onBack();
    } else {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const slideVariants = {
    enter: { x: '100%', opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: '-100%', opacity: 0 },
  };

  const Icon = question.icon;

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[300px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Header with progress */}
      <div className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border/50 pt-safe">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-muted-foreground">
              {currentQuestion + 1} / {questions.length}
            </span>
            <span className="text-xs font-mono text-primary">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-1" />
        </div>
      </div>

      {/* Question content */}
      <div className="flex-1 flex flex-col px-5 py-6 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 flex flex-col"
          >
            {/* Icon and Question */}
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center"
              >
                <Icon className="w-7 h-7 text-primary" />
              </motion.div>
              <motion.h2
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="text-2xl font-bold tracking-tight mb-1"
              >
                {question.question}
              </motion.h2>
              {question.multiSelect && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-xs text-muted-foreground"
                >
                  Select all that apply
                </motion.p>
              )}
            </div>

            {/* Options */}
            <div className="space-y-3 flex-1">
              {question.options.map((option, index) => {
                const isSelected = currentAnswers.includes(option.id);
                return (
                  <motion.button
                    key={option.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.06 }}
                    onClick={() => handleSelect(option.id)}
                    className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center gap-4 active:scale-[0.98] ${
                      isSelected
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-card/50 active:bg-card'
                    }`}
                  >
                    {/* Emoji */}
                    <span className="text-2xl">{option.emoji}</span>
                    
                    {/* Label */}
                    <span className="flex-1 font-medium text-base">{option.label}</span>

                    {/* Checkbox */}
                    <motion.div
                      className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-primary border-primary'
                          : 'border-muted-foreground/50'
                      }`}
                    >
                      <AnimatePresence>
                        {isSelected && (
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
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation buttons */}
      <div className="sticky bottom-0 bg-background/90 backdrop-blur-xl border-t border-border/50 px-5 py-4 pb-safe z-50">
        <div className="flex gap-3">
          <motion.button
            onClick={handlePrev}
            whileTap={{ scale: 0.98 }}
            className="btn-outline-harsh flex items-center justify-center gap-1 py-3 px-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </motion.button>
          <motion.button
            onClick={handleNext}
            disabled={!hasAnswer || isLoading}
            whileTap={hasAnswer ? { scale: 0.98 } : {}}
            className="btn-harsh flex-1 group flex items-center justify-center gap-2 py-3"
          >
            {isLoading ? 'Processing...' : isLastQuestion ? 'Continue' : 'Next'}
            <ChevronRight className="w-4 h-4 transition-transform group-active:translate-x-1" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default MobileQCM;
