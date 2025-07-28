import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Search, 
  ShoppingCart, 
  User, 
  Menu,
  Sun,
  Moon,
  Leaf,
  Beef
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

export function Header({ onMenuClick, showMenuButton = false }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const { getTotalItems } = useCart();
  const location = useLocation();
  const totalItems = getTotalItems();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            {showMenuButton && (
              <Button 
                variant="ghost" 
                size="icon-sm"
                onClick={onMenuClick}
                className="md:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">S</span>
              </div>
              <span className="font-heading font-bold text-xl bg-gradient-primary bg-clip-text text-transparent">
                Swaadcourt
              </span>
            </Link>
          </div>

          {/* Center Section - Navigation (hidden on mobile) */}
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              to="/" 
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                isActive('/') ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              Home
            </Link>
            <Link 
              to="/restaurants" 
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                isActive('/restaurants') ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              Restaurants
            </Link>
            <Link 
              to="/orders" 
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                isActive('/orders') ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              Orders
            </Link>
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={toggleTheme}
              className="animate-food-pulse"
            >
              {theme === 'light' ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </Button>

            {/* Search */}
            <Button
              variant="ghost"
              size="icon-sm"
              asChild
            >
              <Link to="/search">
                <Search className="h-4 w-4" />
              </Link>
            </Button>

            {/* Cart */}
            <Button
              variant="ghost"
              size="icon-sm"
              className="relative"
              asChild
            >
              <Link to="/cart">
                <ShoppingCart className="h-4 w-4" />
                {totalItems > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs animate-cart-bounce"
                  >
                    {totalItems > 9 ? '9+' : totalItems}
                  </Badge>
                )}
              </Link>
            </Button>

            {/* User Menu */}
            {isAuthenticated ? (
              <Button
                variant="ghost"
                size="icon-sm"
                asChild
              >
                <Link to="/profile">
                  {user?.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name}
                      className="h-6 w-6 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </Link>
              </Button>
            ) : (
              <Button variant="food" size="sm" asChild>
                <Link to="/login">Login</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}