// src/components/ui/Card.tsx

import React, { HTMLAttributes } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
  key?: React.Key;
  hover?: boolean;
  glass?: boolean;
}

export const Card = ({ className, hover, glass, ...props }: CardProps) => {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border-color bg-bg-card p-6 transition-all',
        hover && 'hover:border-border-light hover:bg-bg-card-hover hover:shadow-glow-lg hover:-translate-y-1',
        glass && 'bg-bg-card/80 backdrop-blur-md',
        className
      )}
      {...props}
    />
  );
};
