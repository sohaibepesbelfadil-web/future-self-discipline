import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useActivePromises, useDailyLogs } from '@/hooks/usePromises';
import Navbar from '@/components/Navbar';
import PromiseCard from '@/components/PromiseCard';
import CreatePromiseForm from '@/components/CreatePromiseForm';

const Promises: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: promises = [], isLoading: promisesLoading } = useActivePromises();
  const { data: logs = [] } = useDailyLogs();

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
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">Your Promises</h1>
            <p className="text-muted-foreground">Words become actions. Actions become identity.</p>
          </div>

          <div className="space-y-6">
            <CreatePromiseForm />
            
            {promisesLoading ? (
              <div className="text-center py-12 text-muted-foreground font-mono">Loading promises...</div>
            ) : promises.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <p className="text-muted-foreground">No active promises. Make one above.</p>
              </div>
            ) : (
              promises.map((promise) => (
                <PromiseCard
                  key={promise.id}
                  promise={promise}
                  logs={logs.filter((l) => l.promise_id === promise.id)}
                />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Promises;
