import React from 'react';
import { Leaf, Beef } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VegNonVegToggleProps {
  isVeg: boolean;
  onToggle: (isVeg: boolean) => void;
  className?: string;
}

export function VegNonVegToggle({ isVeg, onToggle, className }: VegNonVegToggleProps) {
  return (
    <div className={cn("flex items-center gap-2 p-1 bg-muted rounded-lg", className)}>
      <Button
        variant={isVeg ? "success" : "ghost"}
        size="sm"
        onClick={() => onToggle(true)}
        className={cn(
          "flex items-center gap-1 transition-all duration-300",
          isVeg && "shadow-lg animate-food-bounce"
        )}
      >
        <Leaf className="h-4 w-4" />
        <span className="text-xs font-medium">Veg</span>
      </Button>
      
      <Button
        variant={!isVeg ? "destructive" : "ghost"}
        size="sm"
        onClick={() => onToggle(false)}
        className={cn(
          "flex items-center gap-1 transition-all duration-300",
          !isVeg && "shadow-lg animate-food-bounce"
        )}
      >
        <Beef className="h-4 w-4" />
        <span className="text-xs font-medium">Non-Veg</span>
      </Button>
    </div>
  );
}

interface VegNonVegIndicatorProps {
  isVeg: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function VegNonVegIndicator({ isVeg, size = 'md', className }: VegNonVegIndicatorProps) {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <div 
      className={cn(
        "flex items-center justify-center rounded border-2 animate-food-pulse",
        isVeg 
          ? "border-veg bg-veg/10 text-veg" 
          : "border-non-veg bg-non-veg/10 text-non-veg",
        sizeClasses[size],
        className
      )}
    >
      {isVeg ? (
        <div className="w-1.5 h-1.5 bg-veg rounded-full" />
      ) : (
        <div className="w-1.5 h-1.5 bg-non-veg rounded-full" />
      )}
    </div>
  );
}