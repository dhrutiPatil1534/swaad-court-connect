import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff,
  Chrome,
  Facebook,
  Apple
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginType, setLoginType] = useState<'email' | 'phone'>('email');
  const [userType, setUserType] = useState<'customer' | 'restaurant' | 'admin'>('customer');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate login delay
    setTimeout(() => {
      const mockUser = {
        id: '1',
        email: 'user@example.com',
        name: 'John Doe',
        phone: '+91 9876543210',
        type: userType,
        preferences: {
          isVeg: false,
          allergens: [],
          favoriteRestaurants: []
        }
      };
      
      login(mockUser);
      navigate('/');
      setIsLoading(false);
    }, 2000);
  };

  const handleSocialLogin = (provider: string) => {
    setIsLoading(true);
    // Simulate social login
    setTimeout(() => {
      const mockUser = {
        id: '1',
        email: `user@${provider}.com`,
        name: 'John Doe',
        type: userType,
        preferences: {
          isVeg: false,
          allergens: [],
          favoriteRestaurants: []
        }
      };
      
      login(mockUser);
      navigate('/');
      setIsLoading(false);
    }, 1500);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-warm">
        <LoadingSpinner size="lg" text="Signing you in..." type="cooking" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-warm flex items-center justify-center p-4 animate-page-enter">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-food-bounce">
          <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow">
            <span className="text-primary-foreground font-bold text-2xl">S</span>
          </div>
          <h1 className="text-3xl font-heading font-bold">Welcome to Swaadcourt</h1>
          <p className="text-muted-foreground mt-2">Sign in to start your food journey</p>
        </div>

        <Card className="shadow-food border-0 animate-float">
          <CardHeader className="text-center pb-4">
            <CardTitle>Sign In</CardTitle>
          </CardHeader>
          
          <CardContent>
            {/* User Type Selection */}
            <div className="mb-6">
              <Label className="text-sm font-medium mb-3 block">I am a</Label>
              <Tabs value={userType} onValueChange={(value) => setUserType(value as any)} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="customer" className="text-xs">Customer</TabsTrigger>
                  <TabsTrigger value="restaurant" className="text-xs">Restaurant</TabsTrigger>
                  <TabsTrigger value="admin" className="text-xs">Admin</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Login Type Toggle */}
              <div className="flex gap-2 mb-4">
                <Button
                  type="button"
                  variant={loginType === 'email' ? 'food' : 'outline'}
                  size="sm"
                  onClick={() => setLoginType('email')}
                  className="flex-1"
                >
                  <Mail className="h-4 w-4 mr-1" />
                  Email
                </Button>
                <Button
                  type="button"
                  variant={loginType === 'phone' ? 'food' : 'outline'}
                  size="sm"
                  onClick={() => setLoginType('phone')}
                  className="flex-1"
                >
                  <Phone className="h-4 w-4 mr-1" />
                  Phone
                </Button>
              </div>

              {/* Email/Phone Input */}
              <div className="space-y-2">
                <Label htmlFor="login-input">
                  {loginType === 'email' ? 'Email Address' : 'Phone Number'}
                </Label>
                <div className="relative">
                  <Input
                    id="login-input"
                    type={loginType === 'email' ? 'email' : 'tel'}
                    placeholder={loginType === 'email' ? 'Enter your email' : 'Enter your phone number'}
                    className="pl-10 transition-all duration-300 focus:shadow-warm"
                    required
                  />
                  {loginType === 'email' ? (
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className="pl-10 pr-10 transition-all duration-300 focus:shadow-warm"
                    required
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span>Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>

              <Button 
                type="submit" 
                variant="food" 
                size="lg" 
                className="w-full ripple-effect"
                disabled={isLoading}
              >
                Sign In
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant="outline"
                onClick={() => handleSocialLogin('google')}
                className="h-11 transition-all duration-300 hover:shadow-warm"
              >
                <Chrome className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSocialLogin('facebook')}
                className="h-11 transition-all duration-300 hover:shadow-warm"
              >
                <Facebook className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSocialLogin('apple')}
                className="h-11 transition-all duration-300 hover:shadow-warm"
              >
                <Apple className="h-4 w-4" />
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}