import React from 'react';
import { useStats } from '@/hooks/usePromises';

const FutureMessage: React.FC = () => {
  const { data: stats } = useStats();

  const getMessage = () => {
    if (!stats || stats.total === 0) {
      return {
        tone: 'neutral',
        message: "You haven't made any promises yet. The first step is the hardest. Take it.",
        subtext: 'Your future self is waiting.',
      };
    }

    const { score, kept, broken } = stats;

    if (score >= 90) {
      return {
        tone: 'approval',
        message: `${kept} promises kept. You're building something real. Don't let it slip.`,
        subtext: 'Consistency is your edge. Maintain it.',
      };
    }

    if (score >= 70) {
      return {
        tone: 'caution',
        message: `${kept} kept, ${broken} broken. You're capable of better. I know because I am you.`,
        subtext: 'Every broken promise is a debt you owe yourself.',
      };
    }

    if (score >= 50) {
      return {
        tone: 'warning',
        message: `Half your promises are broken. This pattern will define you if you let it.`,
        subtext: 'The gap between who you are and who you could be grows wider.',
      };
    }

    return {
      tone: 'harsh',
      message: `${broken} broken promises. You're failing yourself. Not me. Not anyone else. Yourself.`,
      subtext: 'Change now, or become someone you despise.',
    };
  };

  const { tone, message, subtext } = getMessage();

  const toneStyles = {
    neutral: 'border-l-primary',
    approval: 'border-l-success',
    caution: 'border-l-warning',
    warning: 'border-l-warning',
    harsh: 'border-l-destructive',
  };

  return (
    <div className={`glass-card p-6 border-l-2 ${toneStyles[tone as keyof typeof toneStyles]}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 border border-primary flex items-center justify-center">
          <span className="text-xs font-mono text-primary">FY</span>
        </div>
        <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
          Message from Future You
        </span>
      </div>
      
      <p className="text-lg mb-3 leading-relaxed">
        "{message}"
      </p>
      
      <p className="text-sm text-muted-foreground italic">
        {subtext}
      </p>
    </div>
  );
};

export default FutureMessage;
