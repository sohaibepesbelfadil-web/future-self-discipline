import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, Target, Flame, Clock, Brain } from 'lucide-react';

interface QCMQuestion {
  id: string;
  question: string;
  icon: React.ElementType;
  options: { id: string; label: string; description?: string }[];
  multiSelect?: boolean;
}

interface QCMOnboardingProps {
  onComplete: (responses: Record<string, string[]>) => void;
  onBack: () => void;
  isLoading?: boolean;
}

const questions: QCMQuestion[] = [
  {
    id: 'struggle',
    question: 'What is your biggest struggle?',
    icon: Flame,
    options: [
      { id: 'discipline', label: 'Lack of discipline', description: 'Difficulty sticking to commitments' },
      { id: 'organization', label: 'Poor organization', description: 'Trouble planning and structuring time' },
      { id: 'procrastination', label: 'Procrastination', description: 'Constantly delaying important tasks' },
      { id: 'motivation', label: 'Low motivation', description: 'Struggling to find drive and purpose' },
    ],
  },
  {
    id: 'improve',
    question: 'What do you want to improve?',
    icon: Target,
    multiSelect: true,
    options: [
      { id: 'productivity', label: 'Productivity', description: 'Get more done in less time' },
      { id: 'focus', label: 'Focus', description: 'Eliminate distractions and stay on task' },
      { id: 'consistency', label: 'Consistency', description: 'Build sustainable daily habits' },
      { id: 'balance', label: 'Life balance', description: 'Better manage work and personal life' },
    ],
  },
  {
    id: 'commitment',
    question: 'How much time can you commit daily?',
    icon: Clock,
    options: [
      { id: '15min', label: '15 minutes', description: 'Quick daily check-ins' },
      { id: '30min', label: '30 minutes', description: 'Focused planning sessions' },
      { id: '1hour', label: '1 hour', description: 'Deep work and reflection' },
      { id: 'more', label: '1+ hours', description: 'Full commitment mode' },
    ],
  },
  {
    id: 'experience',
    question: 'Have you tried self-improvement apps before?',
    icon: Brain,
    options: [
      { id: 'never', label: 'Never', description: 'This is my first attempt' },
      { id: 'tried_failed', label: 'Yes, but failed', description: 'Nothing stuck for me' },
      { id: 'some_success', label: 'Some success', description: 'Made progress but lost momentum' },
      { id: 'experienced', label: 'Very experienced', description: 'Looking for something different' },
    ],
  },
];

const QCMOnboarding: React.FC<QCMOnboardingProps> = ({ onComplete, onBack, isLoading }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Record<string, string[]>>({});

  const question = questions[currentQuestion];
  const currentAnswers = responses[question.id] || [];
  const hasAnswer = currentAnswers.length > 0;
  const isLastQuestion = currentQuestion === questions.length - 1;

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
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0,
    }),
  };

  const Icon = question.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-lg mx-auto"
    >
      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {questions.map((_, index) => (
          <motion.div
            key={index}
            className={`h-1 flex-1 rounded-full transition-colors ${
              index <= currentQuestion ? 'bg-primary' : 'bg-border'
            }`}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: index * 0.1 }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait" custom={currentQuestion}>
        <motion.div
          key={currentQuestion}
          custom={currentQuestion}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Question Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center"
            >
              <Icon className="w-7 h-7 text-primary" />
            </motion.div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
              {question.question}
            </h2>
            {question.multiSelect && (
              <p className="text-sm text-muted-foreground">
                Select all that apply
              </p>
            )}
          </div>

          {/* Options */}
          <div className="space-y-3 mb-8">
            {question.options.map((option, index) => {
              const isSelected = currentAnswers.includes(option.id);
              return (
                <motion.button
                  key={option.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.08 }}
                  onClick={() => handleSelect(option.id)}
                  className={`w-full p-4 rounded-xl border text-left transition-all flex items-start gap-4 ${
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-muted-foreground bg-card/50'
                  }`}
                >
                  <motion.div
                    className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-primary border-primary'
                        : 'border-muted-foreground'
                    }`}
                    whileTap={{ scale: 0.9 }}
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
                  <div className="flex-1">
                    <span className="font-medium">{option.label}</span>
                    {option.description && (
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {option.description}
                      </p>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex gap-3">
        <motion.button
          onClick={handlePrev}
          className="btn-outline-harsh flex items-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </motion.button>
        <motion.button
          onClick={handleNext}
          disabled={!hasAnswer || isLoading}
          className="btn-harsh flex-1 group flex items-center justify-center gap-2"
          whileHover={hasAnswer ? { scale: 1.02 } : {}}
          whileTap={hasAnswer ? { scale: 0.98 } : {}}
        >
          {isLoading ? 'Processing...' : isLastQuestion ? 'Continue' : 'Next'}
          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </motion.button>
      </div>

      {/* Question counter */}
      <div className="text-center mt-6">
        <span className="text-xs font-mono text-muted-foreground">
          Question {currentQuestion + 1} of {questions.length}
        </span>
      </div>
    </motion.div>
  );
};

export default QCMOnboarding;
