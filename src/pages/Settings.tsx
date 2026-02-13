import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import ResponsiveNavbar from '@/components/ResponsiveNavbar';
import BottomNavbar from '@/components/BottomNavbar';
import { StaggerContainer, StaggerItem, PremiumCard } from '@/components/PageTransition';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Shield,
  Bell,
  Palette,
  LogOut,
  Trash2,
  ChevronRight,
  Eye,
  EyeOff,
  HelpCircle,
  Check,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useIsAdminOrMod } from '@/hooks/useUserRole';

const Settings: React.FC = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdminOrMod, isLoading: roleLoading } = useIsAdminOrMod();
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

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

  const handleToggleVisibility = async () => {
    try {
      await updateProfile.mutateAsync({
        profile_visible: !profile?.profile_visible,
      });
      toast({
        title: 'Profile updated',
        description: `Your profile is now ${!profile?.profile_visible ? 'public' : 'private'}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile visibility',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    
    try {
      // Note: Full account deletion requires backend function
      // For now, we'll sign out and show a message
      toast({
        title: 'Account deletion requested',
        description: 'Please contact support to complete account deletion.',
      });
      await signOut();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process deletion request',
        variant: 'destructive',
      });
    }
  };

  const settingsSections = [
    {
      title: 'Account',
      items: [
        {
          icon: User,
          label: 'Edit Profile',
          description: 'Update your personal information',
          action: () => navigate('/profile'),
        },
      ],
    },
    {
      title: 'Privacy',
      items: [
        {
          icon: profile?.profile_visible ? Eye : EyeOff,
          label: 'Profile Visibility',
          description: profile?.profile_visible ? 'Your profile is public' : 'Your profile is private',
          toggle: true,
          checked: profile?.profile_visible ?? true,
          onToggle: handleToggleVisibility,
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: HelpCircle,
          label: 'Help & Support',
          description: 'Get help or report issues',
          action: () => navigate('/support'),
        },
      ],
    },
    ...(isAdminOrMod ? [{
      title: 'Administration',
      items: [
        {
          icon: Shield,
          label: 'Admin Panel',
          description: 'Manage posts, bans, and moderation',
          action: () => navigate('/admin'),
        },
      ],
    }] : []),
  ];

  return (
    <div className="min-h-screen bg-background">
      <ResponsiveNavbar />
      <main className="pt-16 md:pt-20 pb-24 md:pb-12 px-4 md:px-6">
        <StaggerContainer className="max-w-2xl mx-auto">
          <StaggerItem>
            <h1 className="text-xl md:text-2xl font-bold mb-6 md:mb-8">Settings</h1>
          </StaggerItem>

          {settingsSections.map((section, sectionIndex) => (
            <StaggerItem key={section.title}>
              <div className="mb-6">
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3 block px-1">
                  {section.title}
                </span>
                <PremiumCard className="divide-y divide-border">
                  {section.items.map((item, itemIndex) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: sectionIndex * 0.1 + itemIndex * 0.05 }}
                      className={`flex items-center justify-between p-4 ${
                        item.action ? 'cursor-pointer hover:bg-muted/30 transition-colors' : ''
                      }`}
                      onClick={item.action}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center">
                          <item.icon className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                      {item.toggle ? (
                        <Switch
                          checked={item.checked}
                          onCheckedChange={item.onToggle}
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      )}
                    </motion.div>
                  ))}
                </PremiumCard>
              </div>
            </StaggerItem>
          ))}

          {/* Danger Zone */}
          <StaggerItem>
            <div className="mb-6">
              <span className="text-xs font-mono text-destructive uppercase tracking-widest mb-3 block px-1">
                Danger Zone
              </span>
              <PremiumCard className="divide-y divide-border">
                <motion.button
                  onClick={signOut}
                  className="flex items-center justify-between p-4 w-full text-left hover:bg-muted/30 transition-colors"
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center">
                      <LogOut className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Sign Out</p>
                      <p className="text-xs text-muted-foreground">Sign out of your account</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </motion.button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <motion.button
                      className="flex items-center justify-between p-4 w-full text-left hover:bg-destructive/10 transition-colors"
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                          <Trash2 className="w-5 h-5 text-destructive" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-destructive">Delete Account</p>
                          <p className="text-xs text-muted-foreground">Permanently delete your account and data</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-destructive" />
                    </motion.button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Account</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. All your data, including promises, scores, and connections will be permanently deleted.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                      <label className="text-sm text-muted-foreground mb-2 block">
                        Type <span className="font-mono font-bold text-foreground">DELETE</span> to confirm
                      </label>
                      <input
                        type="text"
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-background border border-border focus:border-destructive focus:outline-none font-mono"
                        placeholder="DELETE"
                      />
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        disabled={deleteConfirmText !== 'DELETE'}
                        onClick={handleDeleteAccount}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete Account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </PremiumCard>
            </div>
          </StaggerItem>
        </StaggerContainer>
      </main>
      <BottomNavbar />
    </div>
  );
};

export default Settings;
