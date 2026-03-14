// src/components/ui/Badge.tsx

import React, { HTMLAttributes } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode;
  className?: string;
  key?: React.Key;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
}

export const Badge = ({ className, variant = 'neutral', ...props }: BadgeProps) => {
  const variants = {
    success: 'bg-accent-green/10 text-accent-green border-accent-green/20',
    warning: 'bg-accent-amber/10 text-accent-amber border-accent-amber/20',
    error: 'bg-accent-red/10 text-accent-red border-accent-red/20',
    info: 'bg-accent-blue/10 text-accent-blue border-accent-blue/20',
    neutral: 'bg-white/5 text-text-muted border-white/10',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
        variants[variant],
        className
      )}
      {...props}
    />
  );
};
