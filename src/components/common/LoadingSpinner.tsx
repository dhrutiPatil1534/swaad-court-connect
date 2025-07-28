import React from 'react';
import { cn } from '@/lib/utils';
import pizzaLoading from '@/assets/pizza-loading.jpg';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
  type?: 'pizza' | 'cooking' | 'steam' | 'simple';
}

export function LoadingSpinner({ 
  size = 'md', 
  text = 'Loading...', 
  className,
  type = 'cooking'
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  if (type === 'pizza') {
    return (
      <div className={cn('flex flex-col items-center gap-4', className)}>
        <div className={cn('relative', sizeClasses[size])}>
          <img 
            src={pizzaLoading} 
            alt="Loading" 
            className="w-full h-full object-cover rounded-full animate-cooking"
          />
        </div>
        {text && (
          <p className="text-sm text-muted-foreground animate-food-pulse font-medium">
            {text}
          </p>
        )}
      </div>
    );
  }

  if (type === 'steam') {
    return (
      <div className={cn('flex flex-col items-center gap-4', className)}>
        <div className="relative">
          <div className={cn(
            'rounded-full bg-gradient-primary animate-food-pulse',
            sizeClasses[size]
          )} />
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
            <div className="w-1 h-8 bg-accent/60 rounded-full animate-steam-rise" />
            <div className="w-1 h-6 bg-accent/40 rounded-full animate-steam-rise animation-delay-300 ml-1" />
            <div className="w-1 h-4 bg-accent/20 rounded-full animate-steam-rise animation-delay-600 ml-2" />
          </div>
        </div>
        {text && (
          <p className="text-sm text-muted-foreground font-medium">
            {text}
          </p>
        )}
      </div>
    );
  }

  if (type === 'cooking') {
    return (
      <div className={cn('flex flex-col items-center gap-4', className)}>
        <div className={cn(
          'rounded-full bg-gradient-food animate-cooking relative overflow-hidden',
          sizeClasses[size]
        )}>
          <div className="absolute inset-2 rounded-full bg-background/20 animate-food-pulse" />
        </div>
        {text && (
          <p className="text-sm text-muted-foreground animate-shimmer bg-gradient-to-r from-transparent via-foreground to-transparent bg-clip-text font-medium">
            {text}
          </p>
        )}
      </div>
    );
  }

  // Simple spinner
  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      <div className={cn(
        'rounded-full border-4 border-muted border-t-primary animate-spin',
        sizeClasses[size]
      )} />
      {text && (
        <p className="text-sm text-muted-foreground font-medium">
          {text}
        </p>
      )}
    </div>
  );
}