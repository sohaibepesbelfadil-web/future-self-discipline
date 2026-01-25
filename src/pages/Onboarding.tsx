import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompleteOnboarding } from '@/hooks/useProfile';

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

  const allAccepted = Object.values(acceptances).every(Boolean);

  const handleComplete = async () => {
    try {
      await completeOnboarding.mutateAsync();
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    }
  };

  const screens = [
    // Screen 1: Welcome
    <div key="welcome" className="slide-up">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
          FUTURE YOU
        </h1>
        <div className="w-16 h-px bg-primary mb-8" />
      </div>
      
      <div className="space-y-8 max-w-lg">
        <p className="text-xl text-muted-foreground leading-relaxed">
          This app records your decisions.
        </p>
        <p className="text-xl text-muted-foreground leading-relaxed">
          Every action you take today builds the person you become tomorrow.
        </p>
        <div className="message-box">
          <p className="font-mono text-sm text-primary">
            Your future self will judge today's choices.
          </p>
        </div>
      </div>

      <button
        onClick={() => setStep(1)}
        className="btn-harsh mt-12"
      >
        Continue
      </button>
    </div>,

    // Screen 2: How It Works
    <div key="how" className="slide-up">
      <div className="mb-12">
        <span className="text-xs font-mono text-muted-foreground tracking-widest uppercase">
          The Rules
        </span>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-2 mb-6">
          HOW THIS WORKS
        </h2>
        <div className="w-16 h-px bg-primary mb-8" />
      </div>

      <div className="space-y-6 max-w-lg">
        <div className="glass-card p-6 border-l-2 border-l-destructive">
          <h3 className="font-semibold mb-2">Honesty is mandatory</h3>
          <p className="text-sm text-muted-foreground">
            You cannot lie to yourself here. Every promise you make will be tracked.
          </p>
        </div>

        <div className="glass-card p-6 border-l-2 border-l-warning">
          <h3 className="font-semibold mb-2">No fake motivation</h3>
          <p className="text-sm text-muted-foreground">
            No streaks. No rewards. No badges. Just you and your word.
          </p>
        </div>

        <div className="glass-card p-6 border-l-2 border-l-primary">
          <h3 className="font-semibold mb-2">Actions have consequences</h3>
          <p className="text-sm text-muted-foreground">
            Break a promise, and it stays broken. The record is permanent.
          </p>
        </div>
      </div>

      <div className="flex gap-4 mt-12">
        <button onClick={() => setStep(0)} className="btn-outline-harsh">
          Back
        </button>
        <button onClick={() => setStep(2)} className="btn-harsh">
          I Understand
        </button>
      </div>
    </div>,

    // Screen 3: Commitment Contract
    <div key="commitment" className="slide-up">
      <div className="mb-12">
        <span className="text-xs font-mono text-muted-foreground tracking-widest uppercase">
          Final Step
        </span>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-2 mb-6">
          YOUR COMMITMENT
        </h2>
        <div className="w-16 h-px bg-primary mb-8" />
      </div>

      <div className="max-w-lg">
        <p className="text-muted-foreground mb-8">
          By entering this app, you accept full accountability for your actions.
          Check each box to proceed.
        </p>

        <div className="space-y-4">
          {[
            { key: 'discomfort', text: 'I accept discomfort as part of growth' },
            { key: 'responsibility', text: 'I accept full responsibility for my actions' },
            { key: 'honesty', text: 'I will be honest with myself, even when it hurts' },
            { key: 'consequences', text: 'I accept that my failures will be recorded' },
          ].map(({ key, text }) => (
            <label
              key={key}
              className={`flex items-center gap-4 p-4 border cursor-pointer transition-all ${
                acceptances[key as keyof typeof acceptances]
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-muted-foreground'
              }`}
            >
              <div
                className={`w-5 h-5 border flex items-center justify-center transition-colors ${
                  acceptances[key as keyof typeof acceptances]
                    ? 'bg-primary border-primary'
                    : 'border-muted-foreground'
                }`}
              >
                {acceptances[key as keyof typeof acceptances] && (
                  <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
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
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-4 mt-12">
        <button onClick={() => setStep(1)} className="btn-outline-harsh">
          Back
        </button>
        <button
          onClick={handleComplete}
          disabled={!allAccepted || completeOnboarding.isPending}
          className="btn-harsh"
        >
          {completeOnboarding.isPending ? 'Processing...' : 'Enter The App'}
        </button>
      </div>
    </div>,
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress indicator */}
      <div className="fixed top-0 left-0 right-0 h-0.5 bg-border">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${((step + 1) / 3) * 100}%` }}
        />
      </div>

      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-2xl">
          {screens[step]}
        </div>
      </div>

      {/* Step counter */}
      <div className="fixed bottom-6 right-6 font-mono text-xs text-muted-foreground">
        {step + 1} / 3
      </div>
    </div>
  );
};

export default Onboarding;
