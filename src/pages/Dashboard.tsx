import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import Navbar from '@/components/Navbar';
import FutureMessage from '@/components/FutureMessage';
import StatsSection from '@/components/StatsSection';
import ProgressGraph from '@/components/ProgressGraph';
import CalendarPreview from '@/components/CalendarPreview';

const Dashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground font-mono">Loading...</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (profile && !profile.onboarding_completed) return <Navigate to="/onboarding" replace />;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-12 px-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <FutureMessage />
          <StatsSection />
          <div className="grid md:grid-cols-2 gap-6">
            <ProgressGraph />
            <CalendarPreview />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
