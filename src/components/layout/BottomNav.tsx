import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Search, 
  ShoppingCart, 
  User,
  Clock
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const location = useLocation();
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/restaurants', icon: Search, label: 'Restaurants' },
    { path: '/cart', icon: ShoppingCart, label: 'Cart', badge: totalItems },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map(({ path, icon: Icon, label, badge }) => (
          <Link
            key={path}
            to={path}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-300",
              isActive(path) 
                ? "text-primary bg-primary/10 animate-food-bounce" 
                : "text-muted-foreground hover:text-primary hover:bg-primary/5"
            )}
          >
            <div className="relative">
              <Icon className="h-5 w-5" />
              {badge && badge > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-4 w-4 flex items-center justify-center p-0 text-xs animate-cart-bounce"
                >
                  {badge > 9 ? '9+' : badge}
                </Badge>
              )}
            </div>
            <span className="text-xs font-medium">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}