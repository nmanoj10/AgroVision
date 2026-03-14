// src/components/ui/Input.tsx

import { InputHTMLAttributes, forwardRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="text-sm font-semibold text-text-secondary pl-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full rounded-xl border border-border-color bg-bg-card px-4 py-3 text-text-primary transition-all placeholder:text-text-dim focus:border-accent-green focus:outline-none focus:ring-2 focus:ring-accent-green/20 disabled:opacity-50',
            error && 'border-accent-red focus:border-accent-red focus:ring-accent-red/20',
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-xs font-medium text-accent-red pl-1">{error}</p>
        )}
      </div>
    );
  }
);
