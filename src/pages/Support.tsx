import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import ResponsiveNavbar from '@/components/ResponsiveNavbar';
import BottomNavbar from '@/components/BottomNavbar';
import { StaggerContainer, StaggerItem, PremiumCard } from '@/components/PageTransition';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Bug,
  User,
  CreditCard,
  ThumbsUp,
  Send,
  CheckCircle,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const supportSchema = z.object({
  subject: z.string().trim().min(3, 'Subject must be at least 3 characters').max(100, 'Subject must be less than 100 characters'),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(2000, 'Message must be less than 2000 characters'),
});

const categories = [
  { id: 'bug', label: 'Bug Report', icon: Bug, description: 'Report a technical issue' },
  { id: 'account', label: 'Account Issue', icon: User, description: 'Problems with your account' },
  { id: 'payment', label: 'Payment', icon: CreditCard, description: 'Billing or subscription issues' },
  { id: 'feedback', label: 'Feedback', icon: ThumbsUp, description: 'Suggestions and ideas' },
];

const Support: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { toast } = useToast();
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<{ subject?: string; message?: string }>({});

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-muted-foreground font-mono">
          Loading...
        </motion.div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (profile && !profile.onboarding_completed) return <Navigate to="/onboarding" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = supportSchema.safeParse({ subject, message });
    if (!result.success) {
      const fieldErrors: { subject?: string; message?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === 'subject') fieldErrors.subject = err.message;
        if (err.path[0] === 'message') fieldErrors.message = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    if (!selectedCategory) {
      toast({
        title: 'Please select a category',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('support_tickets').insert({
        user_id: user.id,
        subject: result.data.subject,
        message: result.data.message,
        category: selectedCategory,
      });

      if (error) throw error;

      setIsSuccess(true);
      setSubject('');
      setMessage('');
      setSelectedCategory(null);

      // Reset success state after animation
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit ticket',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <ResponsiveNavbar />
      <main className="pt-16 md:pt-20 pb-24 md:pb-12 px-4 md:px-6">
        <StaggerContainer className="max-w-2xl mx-auto">
          <StaggerItem>
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center"
              >
                <MessageSquare className="w-8 h-8 text-primary" />
              </motion.div>
              <h1 className="text-xl md:text-2xl font-bold mb-2">Help & Support</h1>
              <p className="text-muted-foreground text-sm">
                We're here to help. Tell us what's going on.
              </p>
            </div>
          </StaggerItem>

          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <PremiumCard className="p-8 md:p-12 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    className="w-20 h-20 mx-auto mb-6 rounded-full bg-success/20 flex items-center justify-center"
                  >
                    <CheckCircle className="w-10 h-10 text-success" />
                  </motion.div>
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-xl font-semibold mb-2"
                  >
                    Message Sent!
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-muted-foreground text-sm mb-6"
                  >
                    We've received your message and will get back to you soon.
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Button
                      onClick={() => setIsSuccess(false)}
                      variant="outline"
                      className="gap-2"
                    >
                      Send Another Message
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </motion.div>
                </PremiumCard>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* Category Selection */}
                <StaggerItem>
                  <div className="mb-6">
                    <label className="text-sm font-medium mb-3 block">
                      What can we help you with?
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {categories.map((category, index) => (
                        <motion.button
                          key={category.id}
                          type="button"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => setSelectedCategory(category.id)}
                          className={`p-4 rounded-xl border text-left transition-all ${
                            selectedCategory === category.id
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-muted-foreground bg-card/50'
                          }`}
                        >
                          <category.icon
                            className={`w-5 h-5 mb-2 ${
                              selectedCategory === category.id
                                ? 'text-primary'
                                : 'text-muted-foreground'
                            }`}
                          />
                          <p className="font-medium text-sm">{category.label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {category.description}
                          </p>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </StaggerItem>

                {/* Subject */}
                <StaggerItem>
                  <div className="mb-4">
                    <label className="text-sm font-medium mb-2 block">Subject</label>
                    <Input
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Brief description of your issue"
                      className={`bg-background/50 ${errors.subject ? 'border-destructive' : ''}`}
                    />
                    {errors.subject && (
                      <p className="text-xs text-destructive mt-1">{errors.subject}</p>
                    )}
                  </div>
                </StaggerItem>

                {/* Message */}
                <StaggerItem>
                  <div className="mb-6">
                    <label className="text-sm font-medium mb-2 block">Message</label>
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us more about your issue or feedback..."
                      className={`bg-background/50 min-h-[150px] resize-none ${
                        errors.message ? 'border-destructive' : ''
                      }`}
                    />
                    {errors.message && (
                      <p className="text-xs text-destructive mt-1">{errors.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2 text-right">
                      {message.length}/2000 characters
                    </p>
                  </div>
                </StaggerItem>

                {/* Submit */}
                <StaggerItem>
                  <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                    <Button
                      type="submit"
                      disabled={isSubmitting || !subject || !message || !selectedCategory}
                      className="w-full gap-2"
                    >
                      {isSubmitting ? (
                        'Sending...'
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </motion.div>
                </StaggerItem>
              </motion.form>
            )}
          </AnimatePresence>
        </StaggerContainer>
      </main>
      <BottomNavbar />
    </div>
  );
};

export default Support;
