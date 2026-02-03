import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, ScrollText, Shield, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface LegalDocumentsProps {
  onAccept: () => void;
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

## 6. Data Retention

We retain your data for as long as your account is active or as needed to provide services. You can request deletion at any time.

## 7. Contact Us

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

## 4. Content Ownership

- You retain ownership of content you create
- You grant us a license to display your public content
- Community posts may be visible to other users

## 5. Discipline System

- Your discipline score reflects your commitment to promises
- Broken promises are permanently recorded
- Scores and streaks are calculated automatically

## 6. Community Guidelines

- Be respectful to other users
- Share genuine progress updates
- Do not spam or post misleading content

## 7. Account Termination

We reserve the right to suspend or terminate accounts that violate these terms.

## 8. Limitation of Liability

Future You is provided "as is" without warranties. We are not liable for any damages arising from your use of the service.

## 9. Changes to Terms

We may update these terms at any time. Continued use constitutes acceptance of changes.

## 10. Contact

For questions about these Terms, please use the in-app support feature.
`;

const LegalDocuments: React.FC<LegalDocumentsProps> = ({ onAccept, isLoading }) => {
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyRead, setPrivacyRead] = useState(false);
  const [termsRead, setTermsRead] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<'privacy' | 'terms' | null>(null);
  
  const privacyScrollRef = useRef<HTMLDivElement>(null);
  const termsScrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (type: 'privacy' | 'terms') => (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const isAtBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 50;
    if (isAtBottom) {
      if (type === 'privacy') setPrivacyRead(true);
      if (type === 'terms') setTermsRead(true);
    }
  };

  const canProceed = privacyAccepted && termsAccepted;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-lg mx-auto"
    >
      <div className="mb-8 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center"
        >
          <Shield className="w-8 h-8 text-primary" />
        </motion.div>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
          Legal Agreement
        </h2>
        <p className="text-muted-foreground text-sm">
          Please review and accept our terms before continuing
        </p>
      </div>

      <div className="space-y-4 mb-8">
        {/* Privacy Policy Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className={`glass-card p-5 transition-all ${
            privacyAccepted ? 'border-primary/50' : ''
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <ScrollText className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Privacy Policy</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Learn how we collect, use, and protect your data
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setViewingDocument('privacy')}
                  className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                >
                  Read Privacy Policy
                  <ChevronRight className="w-3 h-3" />
                </motion.button>
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <motion.div
                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${
                  privacyAccepted
                    ? 'bg-primary border-primary'
                    : 'border-muted-foreground'
                }`}
                whileTap={{ scale: 0.9 }}
              >
                <AnimatePresence>
                  {privacyAccepted && (
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
                checked={privacyAccepted}
                onChange={(e) => setPrivacyAccepted(e.target.checked)}
              />
            </label>
          </div>
        </motion.div>

        {/* Terms Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className={`glass-card p-5 transition-all ${
            termsAccepted ? 'border-primary/50' : ''
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <ScrollText className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Terms & Conditions</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Understand the rules and guidelines of our platform
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setViewingDocument('terms')}
                  className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                >
                  Read Terms & Conditions
                  <ChevronRight className="w-3 h-3" />
                </motion.button>
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <motion.div
                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${
                  termsAccepted
                    ? 'bg-primary border-primary'
                    : 'border-muted-foreground'
                }`}
                whileTap={{ scale: 0.9 }}
              >
                <AnimatePresence>
                  {termsAccepted && (
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
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
              />
            </label>
          </div>
        </motion.div>
      </div>

      <motion.button
        onClick={onAccept}
        disabled={!canProceed || isLoading}
        className="btn-harsh w-full group flex items-center justify-center gap-2"
        whileHover={canProceed ? { scale: 1.02 } : {}}
        whileTap={canProceed ? { scale: 0.98 } : {}}
      >
        {isLoading ? 'Processing...' : 'I Accept & Continue'}
        <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </motion.button>

      <p className="text-xs text-muted-foreground text-center mt-4">
        By accepting, you agree to our Privacy Policy and Terms & Conditions
      </p>

      {/* Document Modal */}
      <Dialog open={viewingDocument !== null} onOpenChange={() => setViewingDocument(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center justify-between">
              {viewingDocument === 'privacy' ? 'Privacy Policy' : 'Terms & Conditions'}
            </DialogTitle>
          </DialogHeader>
          <div
            ref={viewingDocument === 'privacy' ? privacyScrollRef : termsScrollRef}
            onScroll={handleScroll(viewingDocument || 'privacy')}
            className="p-6 pt-4 overflow-y-auto max-h-[60vh] prose prose-invert prose-sm"
          >
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {viewingDocument === 'privacy' ? privacyPolicyContent : termsContent}
            </div>
          </div>
          <div className="p-6 pt-0 border-t border-border">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (viewingDocument === 'privacy') {
                  setPrivacyAccepted(true);
                  setPrivacyRead(true);
                } else {
                  setTermsAccepted(true);
                  setTermsRead(true);
                }
                setViewingDocument(null);
              }}
              className="btn-harsh w-full"
            >
              I've Read & Accept
            </motion.button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default LegalDocuments;
