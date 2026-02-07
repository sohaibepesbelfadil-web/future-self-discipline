import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Target, Users, Zap } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileWelcome from '@/components/MobileWelcome';

const Index = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const features = [
    {
      icon: Shield,
      title: 'Accountability',
      description: 'Track promises you make to yourself'
    },
    {
      icon: Target,
      title: 'Discipline',
      description: 'Build lasting habits through consistency'
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Connect with others on the same path'
    }
  ];

  // Mobile-specific welcome flow
  if (isMobile) {
    return <MobileWelcome onComplete={() => navigate('/auth')} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      {/* Background gradient effect */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/3 rounded-full blur-3xl" />
      </div>

      {/* Hero Section */}
      <motion.main 
        className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center max-w-3xl mx-auto">
          {/* Logo/Brand */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-card/80 border border-border/50 rounded-full backdrop-blur-sm">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                Psychological Accountability
              </span>
            </div>
          </motion.div>

          {/* Main Title */}
          <motion.h1 
            className="text-5xl sm:text-6xl md:text-8xl font-bold tracking-tight mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
              FUTURE
            </span>
            <br />
            <span className="bg-gradient-to-b from-primary to-primary/70 bg-clip-text text-transparent">
              YOU
            </span>
          </motion.h1>

          {/* Divider */}
          <motion.div 
            className="w-24 h-px bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mb-8"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          />

          {/* Tagline */}
          <motion.p 
            className="text-lg md:text-xl text-muted-foreground mb-12 leading-relaxed max-w-xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            A psychological accountability system. No games. No rewards. 
            <span className="block mt-2 text-foreground/80">Just you and your word.</span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <motion.button 
              onClick={() => navigate('/auth')} 
              className="btn-harsh group flex items-center gap-2 w-full sm:w-auto justify-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Get Started
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </motion.button>
            <motion.button 
              onClick={() => navigate('/auth')} 
              className="btn-outline-harsh w-full sm:w-auto"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Log In
            </motion.button>
          </motion.div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 max-w-2xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="glass-card p-6 text-center group hover:border-primary/30 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-sm mb-1">{feature.title}</h3>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.main>

      {/* Footer */}
      <motion.footer 
        className="p-6 text-center relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
          Discipline is the bridge between goals and accomplishment
        </p>
      </motion.footer>
    </div>
  );
};

export default Index;
