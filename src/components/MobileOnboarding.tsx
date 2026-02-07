import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCompleteOnboarding, useUpdateProfile, useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import MobileWelcome from './MobileWelcome';
import MobileQCM from './MobileQCM';
import MobileLegalDocuments from './MobileLegalDocuments';
import MobileProfileSetup from './MobileProfileSetup';
import MobileCommitment from './MobileCommitment';

type OnboardingStep = 'welcome' | 'legal' | 'qcm' | 'profile' | 'commitment';

const MobileOnboarding: React.FC = () => {
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const completeOnboarding = useCompleteOnboarding();
  const updateProfile = useUpdateProfile();

  // Redirect if already completed onboarding
  if (!authLoading && !profileLoading) {
    if (!user) return <Navigate to="/auth" replace />;
    if (profile?.onboarding_completed) return <Navigate to="/dashboard" replace />;
  }

  const handleWelcomeComplete = () => {
    setStep('legal');
  };

  const handleLegalAccept = async () => {
    try {
      await updateProfile.mutateAsync({
        terms_accepted_at: new Date().toISOString(),
        privacy_accepted_at: new Date().toISOString(),
      } as any);
      setStep('qcm');
    } catch (error) {
      console.error('Failed to save legal acceptance:', error);
      setStep('qcm');
    }
  };

  const handleQCMComplete = async (responses: Record<string, string[]>) => {
    try {
      await updateProfile.mutateAsync({
        qcm_responses: responses,
      } as any);
      setStep('profile');
    } catch (error) {
      console.error('Failed to save QCM responses:', error);
      setStep('profile');
    }
  };

  const handleProfileComplete = async (profileData: { username: string; real_name: string; gender: string; age: number; avatar_url?: string }) => {
    try {
      await updateProfile.mutateAsync(profileData);
      setStep('commitment');
    } catch (error: any) {
      console.error('Failed to save profile:', error);
    }
  };

  const handleCommitmentComplete = async () => {
    try {
      await completeOnboarding.mutateAsync();
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    }
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-muted-foreground font-mono text-sm"
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  const renderStep = () => {
    switch (step) {
      case 'welcome':
        return <MobileWelcome key="welcome" onComplete={handleWelcomeComplete} />;
      case 'legal':
        return (
          <MobileLegalDocuments
            key="legal"
            onAccept={handleLegalAccept}
            onBack={() => setStep('welcome')}
            isLoading={updateProfile.isPending}
          />
        );
      case 'qcm':
        return (
          <MobileQCM
            key="qcm"
            onComplete={handleQCMComplete}
            onBack={() => setStep('legal')}
            isLoading={updateProfile.isPending}
          />
        );
      case 'profile':
        return (
          <MobileProfileSetup
            key="profile"
            onComplete={handleProfileComplete}
            onBack={() => setStep('qcm')}
            isLoading={updateProfile.isPending}
          />
        );
      case 'commitment':
        return (
          <MobileCommitment
            key="commitment"
            onComplete={handleCommitmentComplete}
            onBack={() => setStep('profile')}
            isLoading={completeOnboarding.isPending}
          />
        );
      default:
        return null;
    }
  };

  return (
    <AnimatePresence mode="wait">
      {renderStep()}
    </AnimatePresence>
  );
};

export default MobileOnboarding;
