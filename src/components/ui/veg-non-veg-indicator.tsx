import React from 'react';
import { cn } from '@/lib/utils';
import { Leaf, Beef } from 'lucide-react';

interface VegNonVegIndicatorProps {
  isVeg: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function VegNonVegIndicator({ isVeg, size = 'md', className }: VegNonVegIndicatorProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 p-0.5',
    md: 'w-6 h-6 p-1',
    lg: 'w-8 h-8 p-1.5',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <div
      className={cn(
        'rounded-sm flex items-center justify-center',
        isVeg ? 'bg-green-100 dark:bg-green-950' : 'bg-red-100 dark:bg-red-950',
        sizeClasses[size],
        className
      )}
    >
      {isVeg ? (
        <Leaf className={cn('text-green-600 dark:text-green-400', iconSizes[size])} />
      ) : (
        <Beef className={cn('text-red-600 dark:text-red-400', iconSizes[size])} />
      )}
    </div>
  );
}