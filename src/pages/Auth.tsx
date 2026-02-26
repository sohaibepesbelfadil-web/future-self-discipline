import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { z } from 'zod';
import { ArrowLeft, Eye, EyeOff, Mail, Lock, CheckCircle2, AlertCircle, Loader2, Shield } from 'lucide-react';

const emailSchema = z.string().trim().email('Please enter a valid email address').max(255);
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters').max(128);

type AuthMode = 'login' | 'signup' | 'forgot';

const Auth: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);

  const formRef = useRef<HTMLFormElement>(null);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !loginSuccess) {
      navigate('/dashboard');
    }
  }, [user, navigate, loginSuccess]);

  // Brute-force lockout check
  const isLockedOut = useCallback(() => {
    if (lockoutUntil && Date.now() < lockoutUntil) {
      const seconds = Math.ceil((lockoutUntil - Date.now()) / 1000);
      setError(`Too many attempts. Try again in ${seconds}s`);
      return true;
    }
    if (lockoutUntil && Date.now() >= lockoutUntil) {
      setLockoutUntil(null);
      setAttempts(0);
    }
    return false;
  }, [lockoutUntil]);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      setError(emailResult.error.errors[0].message);
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth`,
      });
      if (error) {
        setError(error.message);
      } else {
        setSuccess('Reset link sent! Check your inbox.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (isLockedOut()) return;

    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      setError(emailResult.error.errors[0].message);
      return;
    }

    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      setError(passwordResult.error.errors[0].message);
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await signIn(email.trim(), password);
        if (error) {
          const newAttempts = attempts + 1;
          setAttempts(newAttempts);
          if (newAttempts >= 5) {
            setLockoutUntil(Date.now() + 30000);
            setError('Too many failed attempts. Please wait 30 seconds.');
          } else if (error.message.includes('Invalid login credentials')) {
            setError('Incorrect email or password');
          } else {
            setError('Sign in failed. Please try again.');
          }
        } else {
          setAttempts(0);
          setLoginSuccess(true);
          // Brief success animation before redirect
          setTimeout(() => navigate('/dashboard'), 800);
        }
      } else {
        const { error } = await signUp(email.trim(), password);
        if (error) {
          if (error.message.includes('already registered')) {
            setError('This email is already registered. Try signing in.');
          } else {
            setError('Could not create account. Please try again.');
          }
        } else {
          setLoginSuccess(true);
          setTimeout(() => navigate('/dashboard'), 800);
        }
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setError('');
    setSuccess('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  // Success overlay
  if (loginSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', damping: 15 }}
            className="w-20 h-20 rounded-full bg-success/20 border border-success/30 flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle2 className="w-10 h-10 text-success" />
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg font-medium text-foreground"
          >
            Welcome back
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4"
          >
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground mx-auto" />
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col items-center justify-center px-5 py-8 pt-safe pb-safe">
      {/* Ambient glow background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/[0.03] blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent/[0.05] blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mb-10 text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 flex items-center justify-center mx-auto mb-5 shadow-lg">
            <Shield className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1.5">FUTURE YOU</h1>
          <p className="text-sm text-muted-foreground">
            {mode === 'login' && 'Welcome back'}
            {mode === 'signup' && 'Create your account'}
            {mode === 'forgot' && 'Reset your password'}
          </p>
        </motion.div>

        {/* Glass Card */}
        <motion.div
          layout
          transition={{ layout: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } }}
          className="relative rounded-3xl border border-border/30 bg-card/60 backdrop-blur-2xl overflow-hidden"
          style={{
            boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        >
          {/* Top shine */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

          <div className="p-6">
            <AnimatePresence mode="wait">
              {mode === 'forgot' ? (
                <motion.form
                  key="forgot"
                  ref={formRef}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  onSubmit={handleForgotPassword}
                  className="space-y-5"
                >
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors active:scale-95"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>

                  <InputField
                    label="Email"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    placeholder="your@email.com"
                    icon={<Mail className="w-4 h-4" />}
                    autoFocus
                  />

                  <MessageBox type="error" message={error} />
                  <MessageBox type="success" message={success} />

                  <SubmitButton loading={loading} label="Send Reset Link" />
                </motion.form>
              ) : (
                <motion.form
                  key="auth"
                  ref={formRef}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.25 }}
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >
                  <InputField
                    label="Email"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    placeholder="your@email.com"
                    icon={<Mail className="w-4 h-4" />}
                    autoFocus
                  />

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Password
                      </label>
                      {mode === 'login' && (
                        <button
                          type="button"
                          onClick={() => switchMode('forgot')}
                          className="text-xs text-primary hover:text-primary/80 transition-colors"
                        >
                          Forgot?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-muted/30 border border-border/40 rounded-2xl pl-10 pr-11 py-3.5 text-foreground text-[16px] placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/60 focus:bg-muted/40 transition-all duration-200"
                        placeholder="••••••••"
                        required
                        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-0.5 active:scale-90"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {mode === 'signup' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2 block">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                            <Lock className="w-4 h-4" />
                          </div>
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-muted/30 border border-border/40 rounded-2xl pl-10 pr-11 py-3.5 text-foreground text-[16px] placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/60 focus:bg-muted/40 transition-all duration-200"
                            placeholder="••••••••"
                            required
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-0.5 active:scale-90"
                            tabIndex={-1}
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Remember me toggle */}
                  {mode === 'login' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2.5"
                    >
                      <button
                        type="button"
                        role="switch"
                        aria-checked={rememberMe}
                        onClick={() => setRememberMe(!rememberMe)}
                        className={`relative w-10 h-[22px] rounded-full transition-colors duration-200 ${
                          rememberMe ? 'bg-primary' : 'bg-muted'
                        }`}
                      >
                        <motion.div
                          className="absolute top-[2px] w-[18px] h-[18px] rounded-full bg-foreground shadow-sm"
                          animate={{ left: rememberMe ? 20 : 2 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      </button>
                      <span className="text-xs text-muted-foreground">Remember me</span>
                    </motion.div>
                  )}

                  <MessageBox type="error" message={error} />
                  <MessageBox type="success" message={success} />

                  <SubmitButton
                    loading={loading}
                    label={mode === 'login' ? 'Sign In' : 'Create Account'}
                  />
                </motion.form>
              )}
            </AnimatePresence>

            {/* Mode switch */}
            <div className="mt-6 text-center">
              <button
                onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors active:scale-95"
              >
                {mode === 'login' || mode === 'forgot'
                  ? "Don't have an account? "
                  : 'Already have an account? '}
                <span className="text-primary font-medium">
                  {mode === 'login' || mode === 'forgot' ? 'Sign up' : 'Sign in'}
                </span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Back to home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center"
        >
          <button
            onClick={() => navigate('/')}
            className="text-xs text-muted-foreground hover:text-primary transition-colors active:scale-95"
          >
            ← Back to Home
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

/* ─── Sub-components ─── */

const InputField: React.FC<{
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  icon: React.ReactNode;
  autoFocus?: boolean;
}> = ({ label, type, value, onChange, placeholder, icon, autoFocus }) => (
  <div>
    <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2 block">
      {label}
    </label>
    <div className="relative">
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
        {icon}
      </div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-muted/30 border border-border/40 rounded-2xl pl-10 pr-4 py-3.5 text-foreground text-[16px] placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/60 focus:bg-muted/40 transition-all duration-200"
        placeholder={placeholder}
        required
        autoFocus={autoFocus}
        autoComplete={type === 'email' ? 'email' : undefined}
      />
    </div>
  </div>
);

const MessageBox: React.FC<{ type: 'error' | 'success'; message: string }> = ({ type, message }) => (
  <AnimatePresence mode="wait">
    {message && (
      <motion.div
        initial={{ opacity: 0, y: -8, height: 0 }}
        animate={{ opacity: 1, y: 0, height: 'auto' }}
        exit={{ opacity: 0, y: -8, height: 0 }}
        transition={{ duration: 0.2 }}
        className={`flex items-start gap-2.5 p-3.5 rounded-2xl border text-sm ${
          type === 'error'
            ? 'border-destructive/30 bg-destructive/10 text-destructive'
            : 'border-success/30 bg-success/10 text-success'
        }`}
      >
        {type === 'error' ? (
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
        ) : (
          <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
        )}
        <span>{message}</span>
      </motion.div>
    )}
  </AnimatePresence>
);

const SubmitButton: React.FC<{ loading: boolean; label: string }> = ({ loading, label }) => (
  <motion.button
    type="submit"
    disabled={loading}
    whileTap={{ scale: 0.97 }}
    className="w-full relative overflow-hidden rounded-2xl bg-primary text-primary-foreground font-medium py-3.5 text-sm transition-all duration-200 hover:brightness-110 active:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
  >
    <AnimatePresence mode="wait">
      {loading ? (
        <motion.span
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex items-center justify-center gap-2"
        >
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Please wait…</span>
        </motion.span>
      ) : (
        <motion.span
          key="label"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {label}
        </motion.span>
      )}
    </AnimatePresence>
  </motion.button>
);

export default Auth;
