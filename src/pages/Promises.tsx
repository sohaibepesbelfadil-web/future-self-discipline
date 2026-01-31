import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useActivePromises, useDailyLogs } from '@/hooks/usePromises';
import ResponsiveNavbar from '@/components/ResponsiveNavbar';
import BottomNavbar from '@/components/BottomNavbar';
import PromiseCard from '@/components/PromiseCard';
import CreatePromiseForm from '@/components/CreatePromiseForm';
import { StaggerContainer, StaggerItem } from '@/components/PageTransition';
import { motion } from 'framer-motion';

const Promises: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: promises = [], isLoading: promisesLoading } = useActivePromises();
  const { data: logs = [] } = useDailyLogs();

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-muted-foreground font-mono"
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (profile && !profile.onboarding_completed) return <Navigate to="/onboarding" replace />;

  return (
    <div className="min-h-screen bg-background">
      <ResponsiveNavbar />
      <main className="pt-16 md:pt-20 pb-24 md:pb-12 px-4 md:px-6">
        <StaggerContainer className="max-w-4xl mx-auto">
          <StaggerItem>
            <div className="mb-6 md:mb-8">
              <h1 className="text-xl md:text-2xl font-bold mb-2">Your Promises</h1>
              <p className="text-sm md:text-base text-muted-foreground">
                Words become actions. Actions become identity.
              </p>
            </div>
          </StaggerItem>

          <div className="space-y-6">
            <StaggerItem>
              <CreatePromiseForm />
            </StaggerItem>
            
            {promisesLoading ? (
              <StaggerItem>
                <div className="text-center py-12 text-muted-foreground font-mono">
                  Loading promises...
                </div>
              </StaggerItem>
            ) : promises.length === 0 ? (
              <StaggerItem>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="premium-card p-12 text-center"
                >
                  <p className="text-muted-foreground">No active promises. Make one above.</p>
                </motion.div>
              </StaggerItem>
            ) : (
              promises.map((promise) => (
                <StaggerItem key={promise.id}>
                  <PromiseCard
                    promise={promise}
                    logs={logs.filter((l) => l.promise_id === promise.id)}
                  />
                </StaggerItem>
              ))
            )}
          </div>
        </StaggerContainer>
      </main>
      <BottomNavbar />
    </div>
  );
};

export default Promises;
