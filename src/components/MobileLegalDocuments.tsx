import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, ChevronLeft, ScrollText, Shield, X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

interface MobileLegalDocumentsProps {
  onAccept: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

const privacyPolicyContent = `
# Privacy Policy

**Last Updated: February 2026**

## 1. Information We Collect

We collect information you provide directly to us, including:
- Account information (email, username, profile details)
- Usage data (promises, tasks, notes, community posts)
- Profile information (name, age, gender, avatar)

## 2. How We Use Your Information

We use the information we collect to:
- Provide, maintain, and improve our services
- Track your discipline journey and progress
- Enable community features and connections
- Send you technical notices and support messages

## 3. Information Sharing

We do not sell your personal information. We may share information:
- With your consent
- To comply with legal obligations
- To protect our rights and safety

## 4. Data Security

We implement appropriate security measures to protect your personal information against unauthorized access, alteration, or destruction.

## 5. Your Rights

You have the right to:
- Access your personal data
- Request deletion of your account
- Update your information
- Control your privacy settings

## 6. Contact Us

For questions about this Privacy Policy, please use the in-app support feature.
`;

const termsContent = `
# Terms & Conditions

**Last Updated: February 2026**

## 1. Acceptance of Terms

By accessing and using Future You, you agree to be bound by these Terms and Conditions.

## 2. User Accounts

- You must be at least 13 years old to use this service
- You are responsible for maintaining account security
- You must provide accurate information during registration

## 3. User Conduct

You agree not to:
- Violate any laws or regulations
- Post harmful, offensive, or inappropriate content
- Impersonate others or misrepresent your identity
- Attempt to manipulate the discipline scoring system

## 4. Discipline System

- Your discipline score reflects your commitment to promises
- Broken promises are permanently recorded
- Scores and streaks are calculated automatically

## 5. Account Termination

We reserve the right to suspend or terminate accounts that violate these terms.

## 6. Limitation of Liability

Future You is provided "as is" without warranties. We are not liable for any damages arising from your use of the service.

## 7. Contact

For questions about these Terms, please use the in-app support feature.
`;

const MobileLegalDocuments: React.FC<MobileLegalDocumentsProps> = ({ onAccept, onBack, isLoading }) => {
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<'privacy' | 'terms' | null>(null);

  const canProceed = privacyAccepted && termsAccepted;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-background flex flex-col"
    >
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[300px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="pt-safe px-5 py-6 relative z-10">
        <motion.button
          onClick={onBack}
          className="mb-4 flex items-center gap-1 text-muted-foreground text-sm active:text-foreground"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </motion.button>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-16 h-16 mb-4 rounded-2xl bg-primary/10 flex items-center justify-center"
        >
          <Shield className="w-8 h-8 text-primary" />
        </motion.div>
        
        <motion.h1
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-3xl font-bold tracking-tight mb-2"
        >
          Legal Agreement
        </motion.h1>
        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="text-muted-foreground"
        >
          Review and accept to continue
        </motion.p>
      </div>

      {/* Documents */}
      <div className="flex-1 px-5 py-4 relative z-10">
        <div className="space-y-4">
          {/* Privacy Policy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`glass-card p-4 transition-all ${
              privacyAccepted ? 'border-primary/50' : ''
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <ScrollText className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold">Privacy Policy</h3>
                <p className="text-xs text-muted-foreground mt-0.5">How we handle your data</p>
              </div>
              <button
                onClick={() => setViewingDocument('privacy')}
                className="text-xs text-primary font-medium active:underline"
              >
                Read
              </button>
            </div>
            <button
              onClick={() => setPrivacyAccepted(!privacyAccepted)}
              className="flex items-center gap-3 w-full mt-4 pt-3 border-t border-border/50"
            >
              <motion.div
                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${
                  privacyAccepted ? 'bg-primary border-primary' : 'border-muted-foreground/50'
                }`}
              >
                <AnimatePresence>
                  {privacyAccepted && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
              <span className="text-sm">I accept the Privacy Policy</span>
            </button>
          </motion.div>

          {/* Terms */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className={`glass-card p-4 transition-all ${
              termsAccepted ? 'border-primary/50' : ''
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <ScrollText className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold">Terms & Conditions</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Rules and guidelines</p>
              </div>
              <button
                onClick={() => setViewingDocument('terms')}
                className="text-xs text-primary font-medium active:underline"
              >
                Read
              </button>
            </div>
            <button
              onClick={() => setTermsAccepted(!termsAccepted)}
              className="flex items-center gap-3 w-full mt-4 pt-3 border-t border-border/50"
            >
              <motion.div
                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${
                  termsAccepted ? 'bg-primary border-primary' : 'border-muted-foreground/50'
                }`}
              >
                <AnimatePresence>
                  {termsAccepted && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
              <span className="text-sm">I accept the Terms & Conditions</span>
            </button>
          </motion.div>
        </div>
      </div>

      {/* Continue button */}
      <div className="sticky bottom-0 bg-background/90 backdrop-blur-xl border-t border-border/50 px-5 py-4 pb-safe z-50">
        <motion.button
          onClick={onAccept}
          disabled={!canProceed || isLoading}
          whileTap={canProceed ? { scale: 0.98 } : {}}
          className="w-full btn-harsh group flex items-center justify-center gap-2 py-4"
        >
          {isLoading ? 'Processing...' : 'I Accept & Continue'}
          <ChevronRight className="w-5 h-5 transition-transform group-active:translate-x-1" />
        </motion.button>
      </div>

      {/* Document Sheet */}
      <Sheet open={viewingDocument !== null} onOpenChange={() => setViewingDocument(null)}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl p-0">
          <SheetHeader className="p-5 pb-0 border-b border-border/50">
            <SheetTitle className="text-left">
              {viewingDocument === 'privacy' ? 'Privacy Policy' : 'Terms & Conditions'}
            </SheetTitle>
          </SheetHeader>
          <div className="p-5 overflow-y-auto h-[calc(85vh-140px)]">
            <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {viewingDocument === 'privacy' ? privacyPolicyContent : termsContent}
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-5 pb-safe bg-background/95 backdrop-blur border-t border-border/50">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (viewingDocument === 'privacy') {
                  setPrivacyAccepted(true);
                } else {
                  setTermsAccepted(true);
                }
                setViewingDocument(null);
              }}
              className="w-full btn-harsh"
            >
              I've Read & Accept
            </motion.button>
          </div>
        </SheetContent>
      </Sheet>
    </motion.div>
  );
};

export default MobileLegalDocuments;
