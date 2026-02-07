import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Zap, Shield, Target, Users, Flame, ArrowRight } from 'lucide-react';

interface MobileWelcomeProps {
  onComplete: () => void;
}

const MobileWelcome: React.FC<MobileWelcomeProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      icon: Zap,
      title: 'FUTURE YOU',
      subtitle: 'Psychological Accountability',
      description: 'A system designed for those who are serious about change.',
      gradient: 'from-primary/20 via-primary/5 to-transparent',
    },
    {
      icon: Shield,
      title: 'Build Discipline',
      subtitle: 'Make promises. Keep them.',
      description: 'Every action you take today shapes who you become tomorrow.',
      gradient: 'from-primary/15 via-transparent to-transparent',
    },
    {
      icon: Target,
      title: 'Track Progress',
      subtitle: 'No fake rewards.',
      description: 'Your discipline score reflects your real commitment. Honest accountability only.',
      gradient: 'from-success/10 via-transparent to-transparent',
    },
    {
      icon: Users,
      title: 'Community',
      subtitle: 'Join the journey.',
      description: 'Connect with others on the same path. Share your progress. Stay motivated.',
      gradient: 'from-accent/20 via-transparent to-transparent',
    },
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const slideVariants = {
    enter: { x: '100%', opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: '-100%', opacity: 0 },
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;
  const isLastSlide = currentSlide === slides.length - 1;

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden touch-pan-y">
      {/* Background gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`absolute inset-0 bg-gradient-to-b ${slide.gradient}`}
        />
      </div>

      {/* Skip button */}
      {!isLastSlide && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={handleSkip}
          className="fixed top-safe right-4 pt-4 z-50 text-muted-foreground text-sm font-medium active:text-foreground transition-colors"
        >
          Skip
        </motion.button>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col justify-center px-6 relative z-10 pt-safe">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="text-center"
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="w-20 h-20 mx-auto mb-8 rounded-3xl bg-card/80 border border-border/50 flex items-center justify-center backdrop-blur-sm"
            >
              <Icon className="w-10 h-10 text-primary" />
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="text-4xl font-bold tracking-tight mb-2"
            >
              {slide.title}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-primary font-medium text-lg mb-4"
            >
              {slide.subtitle}
            </motion.p>

            {/* Description */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="text-muted-foreground text-base leading-relaxed max-w-xs mx-auto"
            >
              {slide.description}
            </motion.p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom section */}
      <div className="px-6 pb-safe relative z-10">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentSlide ? 'bg-primary' : 'bg-border'
              }`}
              animate={{ scale: index === currentSlide ? 1.2 : 1 }}
            />
          ))}
        </div>

        {/* CTA Button */}
        <motion.button
          onClick={handleNext}
          whileTap={{ scale: 0.98 }}
          className="w-full btn-harsh group flex items-center justify-center gap-2 py-4 text-base"
        >
          {isLastSlide ? (
            <>
              Get Started
              <ArrowRight className="w-5 h-5 transition-transform group-active:translate-x-1" />
            </>
          ) : (
            <>
              Next
              <ChevronRight className="w-5 h-5 transition-transform group-active:translate-x-1" />
            </>
          )}
        </motion.button>

        {/* Swipe hint */}
        {!isLastSlide && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center text-xs text-muted-foreground mt-4 pb-4"
          >
            Swipe or tap to continue
          </motion.p>
        )}
      </div>
    </div>
  );
};

export default MobileWelcome;
