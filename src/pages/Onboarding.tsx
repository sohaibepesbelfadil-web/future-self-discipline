import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCompleteOnboarding, useUpdateProfile } from '@/hooks/useProfile';
import { Shield, Target, Users, Check, ChevronRight, ChevronLeft } from 'lucide-react';
import ProfileSetupForm from '@/components/ProfileSetupForm';

const Onboarding: React.FC = () => {
  const [step, setStep] = useState(0);
  const [acceptances, setAcceptances] = useState({
    discomfort: false,
    responsibility: false,
    honesty: false,
    consequences: false,
  });
  const navigate = useNavigate();
  const completeOnboarding = useCompleteOnboarding();
  const updateProfile = useUpdateProfile();

  const allAccepted = Object.values(acceptances).every(Boolean);

  const handleProfileComplete = async (profileData: { username: string; real_name: string; gender: string; age: number; avatar_url?: string }) => {
    try {
      await updateProfile.mutateAsync(profileData);
      setStep(3);
    } catch (error: any) {
      console.error('Failed to save profile:', error);
    }
  };

  const handleComplete = async () => {
    try {
      await completeOnboarding.mutateAsync();
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  const features = [
    {
      icon: Shield,
      title: 'Build Discipline',
      description: 'Make promises to yourself and keep them. Every action you take today shapes who you become tomorrow.'
    },
    {
      icon: Target,
      title: 'Track Progress',
      description: 'Your discipline score reflects your commitment. No fake rewards—just honest accountability.'
    },
    {
      icon: Users,
      title: 'Community Support',
      description: 'Connect with others on the same journey. Share your progress and stay motivated.'
    }
  ];

  const screens = [
    // Screen 0: Feature Tour
    <motion.div key="features" className="max-w-lg mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
          Welcome to Future You
        </h2>
        <p className="text-muted-foreground">
          A system designed for those who are serious about change.
        </p>
      </motion.div>

      <div className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + index * 0.15 }}
            className="glass-card p-5 text-left flex items-start gap-4"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <feature.icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.button
        onClick={() => setStep(1)}
        className="btn-harsh group flex items-center gap-2 mx-auto"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        Continue
        <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </motion.button>
    </motion.div>,

    // Screen 1: The Rules
    <motion.div key="rules" className="max-w-lg mx-auto">
      <div className="mb-8 text-center">
        <span className="text-xs font-mono text-primary tracking-widest uppercase mb-2 block">
          The Rules
        </span>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
          How This Works
        </h2>
      </div>

      <div className="space-y-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-5 border-l-2 border-l-destructive"
        >
          <h3 className="font-semibold mb-2">Honesty is mandatory</h3>
          <p className="text-sm text-muted-foreground">
            You cannot lie to yourself here. Every promise you make will be tracked.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-5 border-l-2 border-l-warning"
        >
          <h3 className="font-semibold mb-2">No fake motivation</h3>
          <p className="text-sm text-muted-foreground">
            No gamification gimmicks. No badges. Just you and your word.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-5 border-l-2 border-l-primary"
        >
          <h3 className="font-semibold mb-2">Actions have consequences</h3>
          <p className="text-sm text-muted-foreground">
            Break a promise, and it stays broken. The record is permanent.
          </p>
        </motion.div>
      </div>

      <div className="flex gap-3">
        <motion.button
          onClick={() => setStep(0)}
          className="btn-outline-harsh flex items-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </motion.button>
        <motion.button
          onClick={() => setStep(2)}
          className="btn-harsh flex-1 group flex items-center justify-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          I Understand
          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </motion.button>
      </div>
    </motion.div>,

    // Screen 2: Profile Setup
    <motion.div key="profile" className="max-w-lg mx-auto">
      <div className="mb-8 text-center">
        <span className="text-xs font-mono text-primary tracking-widest uppercase mb-2 block">
          Profile Setup
        </span>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
          Create Your Profile
        </h2>
        <p className="text-muted-foreground text-sm">
          This information helps personalize your experience
        </p>
      </div>

      <ProfileSetupForm 
        onComplete={handleProfileComplete}
        onBack={() => setStep(1)}
        isLoading={updateProfile.isPending}
      />
    </motion.div>,

    // Screen 3: Commitment Contract
    <motion.div key="commitment" className="max-w-lg mx-auto">
      <div className="mb-8 text-center">
        <span className="text-xs font-mono text-primary tracking-widest uppercase mb-2 block">
          Final Step
        </span>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
          Your Commitment
        </h2>
      </div>

      <p className="text-muted-foreground mb-6 text-center text-sm">
        By entering this app, you accept full accountability for your actions.
        Check each box to proceed.
      </p>

      <div className="space-y-3 mb-8">
        {[
          { key: 'discomfort', text: 'I accept discomfort as part of growth' },
          { key: 'responsibility', text: 'I accept full responsibility for my actions' },
          { key: 'honesty', text: 'I will be honest with myself, even when it hurts' },
          { key: 'consequences', text: 'I accept that my failures will be recorded' },
        ].map(({ key, text }, index) => (
          <motion.label
            key={key}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index }}
            className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
              acceptances[key as keyof typeof acceptances]
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-muted-foreground'
            }`}
          >
            <motion.div
              className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${
                acceptances[key as keyof typeof acceptances]
                  ? 'bg-primary border-primary'
                  : 'border-muted-foreground'
              }`}
              whileTap={{ scale: 0.9 }}
            >
              <AnimatePresence>
                {acceptances[key as keyof typeof acceptances] && (
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
            <input
              type="checkbox"
              className="sr-only"
              checked={acceptances[key as keyof typeof acceptances]}
              onChange={(e) =>
                setAcceptances((prev) => ({
                  ...prev,
                  [key]: e.target.checked,
                }))
              }
            />
            <span className="text-sm">{text}</span>
          </motion.label>
        ))}
      </div>

      <div className="flex gap-3">
        <motion.button
          onClick={() => setStep(2)}
          className="btn-outline-harsh flex items-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </motion.button>
        <motion.button
          onClick={handleComplete}
          disabled={!allAccepted || completeOnboarding.isPending}
          className="btn-harsh flex-1"
          whileHover={allAccepted ? { scale: 1.02 } : {}}
          whileTap={allAccepted ? { scale: 0.98 } : {}}
        >
          {completeOnboarding.isPending ? 'Processing...' : 'Enter The App'}
        </motion.button>
      </div>
    </motion.div>,
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Background gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Progress indicator */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-border z-50">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${((step + 1) / 4) * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      {/* Progress dots */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex gap-2">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${
              i <= step ? 'bg-primary' : 'bg-border'
            }`}
            initial={false}
            animate={{ scale: i === step ? 1.2 : 1 }}
          />
        ))}
      </div>

      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative z-10">
        <AnimatePresence mode="wait" custom={step}>
          <motion.div
            key={step}
            custom={step}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="w-full"
          >
            {screens[step]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Step counter */}
      <div className="fixed bottom-6 right-6 font-mono text-xs text-muted-foreground z-50">
        {step + 1} / 4
      </div>
    </div>
  );
};

export default Onboarding;
