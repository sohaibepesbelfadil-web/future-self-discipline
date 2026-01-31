import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock } from 'lucide-react';

interface AnimatedToggleProps {
  isActive: boolean;
  onToggle: () => void;
  disabled?: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const AnimatedToggle: React.FC<AnimatedToggleProps> = ({
  isActive,
  onToggle,
  disabled = false,
  activeLabel = 'On',
  inactiveLabel = 'Off',
  size = 'md',
}) => {
  const sizes = {
    sm: { track: 'w-10 h-5', thumb: 'w-4 h-4', translate: 20 },
    md: { track: 'w-12 h-6', thumb: 'w-5 h-5', translate: 24 },
    lg: { track: 'w-14 h-7', thumb: 'w-6 h-6', translate: 28 },
  };

  const currentSize = sizes[size];

  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`relative ${currentSize.track} rounded-full transition-colors duration-300 ${
        isActive ? 'bg-primary' : 'bg-muted'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <motion.div
        animate={{ x: isActive ? currentSize.translate : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={`absolute top-0.5 ${currentSize.thumb} rounded-full bg-foreground shadow-md`}
      />
    </button>
  );
};

// Privacy toggle with icons
interface PrivacyToggleProps {
  isPublic: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export const PrivacyToggle: React.FC<PrivacyToggleProps> = ({
  isPublic,
  onToggle,
  disabled = false,
}) => {
  return (
    <motion.button
      onClick={onToggle}
      disabled={disabled}
      whileTap={{ scale: 0.95 }}
      className={`relative flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-300 ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${
        isPublic
          ? 'bg-success/10 border-success/30 hover:bg-success/20'
          : 'bg-muted border-border hover:bg-muted/80'
      }`}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={isPublic ? 'public' : 'private'}
          initial={{ scale: 0.5, opacity: 0, rotate: -90 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          exit={{ scale: 0.5, opacity: 0, rotate: 90 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
        >
          {isPublic ? (
            <Unlock className="w-5 h-5 text-success" />
          ) : (
            <Lock className="w-5 h-5 text-muted-foreground" />
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex flex-col items-start">
        <span className={`text-sm font-medium ${isPublic ? 'text-success' : 'text-foreground'}`}>
          {isPublic ? 'Public Profile' : 'Private Profile'}
        </span>
        <span className="text-xs text-muted-foreground">
          {isPublic ? 'Visible to everyone' : 'Only you can see'}
        </span>
      </div>

      {/* Toggle indicator */}
      <div className={`ml-auto w-12 h-6 rounded-full p-0.5 transition-colors ${
        isPublic ? 'bg-success' : 'bg-border'
      }`}>
        <motion.div
          animate={{ x: isPublic ? 24 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="w-5 h-5 rounded-full bg-foreground shadow-md"
        />
      </div>
    </motion.button>
  );
};

export default AnimatedToggle;
