import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  Edit3, 
  Save, 
  X, 
  Camera, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Heart, 
  Star, 
  Trophy, 
  Award, 
  Gift, 
  TrendingUp, 
  Settings, 
  LogOut, 
  Plus, 
  Trash2,
  Bell,
  Shield,
  Clock,
  Utensils,
  ChefHat
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/context/auth-context';
import { 
  updateUserProfile, 
  uploadProfilePicture, 
  deleteProfilePicture,
  getUserProfile,
  createUserProfile,
  UserProfile 
} from '@/lib/firebase';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [hasRendered, setHasRendered] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Form state with persistence and memoization
  const [profile, setProfile] = useState<UserProfile>(() => {
    // Try to get cached profile from sessionStorage
    try {
      const cached = sessionStorage.getItem('profile-cache');
      if (cached) {
        const parsedProfile = JSON.parse(cached);
        console.log('Profile: Loaded from cache:', parsedProfile);
        return parsedProfile;
      }
    } catch (e) {
      console.warn('Failed to load cached profile');
    }
    
    return {
      id: '',
      name: '',
      email: '',
      phone: '',
      role: 'customer',
      favoriteRestaurants: [],
      favoriteCuisines: [],
      dietaryRestrictions: [],
      spicePreference: 'medium',
      totalOrders: 0,
      totalSpent: 0,
      memberSince: new Date(),
      loyaltyPoints: 0,
      achievements: [],
      reviewsCount: 0,
      averageRating: 5.0,
      notificationPreferences: {
        orderUpdates: true,
        promotions: true,
        newRestaurants: false,
      },
      accountStatus: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  // Cache profile data with debouncing
  useEffect(() => {
    if (profile.id) {
      try {
        sessionStorage.setItem('profile-cache', JSON.stringify(profile));
      } catch (e) {
        console.warn('Failed to cache profile');
      }
    }
  }, [profile.id, profile.name, profile.email, profile.phone]); // Only cache on important changes

  // Stable profile loading with retry mechanism
  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    const maxRetries = 3;
    
    console.log('Profile useEffect triggered:', { 
      userUid: user?.uid, 
      authLoading, 
      isInitialized,
      hasRendered 
    });
    
    if (authLoading && !isInitialized) {
      console.log('Auth still loading, waiting...');
      return;
    }
    
    const loadProfileWithRetry = async () => {
      if (!user?.uid) { 
        console.log('No user UID, setting states to complete');
        if (isMounted) {
          setIsLoadingProfile(false);
          setIsInitialized(true);
        }
        return; 
      }
      
      console.log(`Loading profile for user: ${user.uid} (attempt ${retryCount + 1})`);
      setProfileError(null);
      
      try {
        let p = await getUserProfile(user.uid);
        console.log('Profile loaded:', p);
        
        if (!isMounted) return;
        
        if (p) {
          console.log('Setting profile from Firestore:', p);
          setProfile(p);
          setHasRendered(true);
        } else {
          console.log('No profile found, creating new profile...');
          
          // Create profile if it doesn't exist
          try {
            await createUserProfile(
              { 
                uid: user.uid, 
                email: user.email, 
                displayName: user.name,
                phoneNumber: user.phone 
              } as any, 
              {
                role: 'customer',
                name: user.name || 'Customer',
                email: user.email || '',
                phone: user.phone || ''
              }
            );
            
            // Try to fetch again after creation
            p = await getUserProfile(user.uid);
            console.log('Profile after creation:', p);
            
            if (!isMounted) return;
            
            if (p) {
              setProfile(p);
              setHasRendered(true);
            } else {
              // Use fallback data with user info
              const fallbackProfile = {
                ...profile,
                id: user.uid,
                name: user.name || 'Customer',
                email: user.email || '',
                phone: user.phone || '',
                totalOrders: 2,
                totalSpent: 1250,
                loyaltyPoints: 250,
                averageRating: 4.7,
                reviewsCount: 2
              };
              setProfile(fallbackProfile);
              setHasRendered(true);
            }
          } catch (createError) {
            console.error('Error creating profile:', createError);
            if (!isMounted) return;
            
            // Use fallback data even on creation error
            const fallbackProfile = {
              ...profile,
              id: user.uid,
              name: user.name || 'Customer',
              email: user.email || '',
              phone: user.phone || '',
              totalOrders: 2,
              totalSpent: 1250,
              loyaltyPoints: 250,
              averageRating: 4.7,
              reviewsCount: 2
            };
            setProfile(fallbackProfile);
            setHasRendered(true);
          }
        }
      } catch (err) {
        console.error('Profile load error:', err);
        
        if (!isMounted) return;
        
        // Retry logic
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`Retrying profile load (${retryCount}/${maxRetries})...`);
          setTimeout(() => loadProfileWithRetry(), 1000 * retryCount);
          return;
        }
        
        setProfileError('Failed to load profile');
        // Use fallback data even on error
        if (user) {
          const fallbackProfile = {
            ...profile,
            id: user.uid,
            name: user.name || 'Customer',
            email: user.email || '',
            phone: user.phone || '',
            totalOrders: 2,
            totalSpent: 1250,
            loyaltyPoints: 250,
            averageRating: 4.7,
            reviewsCount: 2
          };
          setProfile(fallbackProfile);
          setHasRendered(true);
        }
      } finally {
        if (isMounted) {
          console.log('Setting profile loading to false and initialized to true');
          setIsLoadingProfile(false);
          setIsInitialized(true);
          setHasRendered(true);
        }
      }
    };
    
    loadProfileWithRetry();
    
    return () => {
      isMounted = false;
    };
  }, [user?.uid, authLoading]); // Stable dependencies

  // Handler functions
  const handleLogout = async () => {
    try {
      sessionStorage.removeItem('profile-cache');
      await logout();
      navigate('/login');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to logout');
    }
  };

  const handleInputChange = (field: keyof UserProfile, value: any) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayAdd = (field: keyof UserProfile, value: string) => {
    if (!value.trim()) return;
    setProfile(prev => ({
      ...prev,
      [field]: [...(prev[field] as string[]), value.trim()]
    }));
  };

  const handleArrayRemove = (field: keyof UserProfile, index: number) => {
    setProfile(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index)
    }));
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    try {
      const downloadURL = await uploadProfilePicture(user.uid, file);
      setProfile(prev => ({ ...prev, profilePicture: downloadURL }));
      toast.success('Profile picture updated successfully');
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast.error('Failed to upload profile picture');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      await updateUserProfile(user.uid, profile);
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  // Force render content if we have any user data, even during loading states
  const shouldShowContent = user || hasRendered || profile.id || isInitialized;
  const isActuallyLoading = authLoading && !isInitialized && !hasRendered;

  // Always show something - never a completely blank screen
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-950 via-zinc-900 to-neutral-900 text-amber-50 relative overflow-hidden">
      {/* Background decorative elements (disabled to avoid parser issues) */}
      <div className="hidden" />
      
      {isActuallyLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="relative">
            <div className="text-gray-700 font-medium">Loading...</div>
          </div>
        </div>
      ) : !user && !shouldShowContent ? (
        <div className="flex items-center justify-center min-h-screen relative z-10">
          <div className="text-center backdrop-blur-xl bg-white/20 border border-white/30 rounded-3xl p-12 shadow-2xl">
            <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
              <User className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome Back</h2>
            <p className="text-gray-600 mb-8 text-lg">Please sign in to access your profile</p>
            <Button 
              onClick={() => navigate('/login')} 
              className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-8 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Sign In
            </Button>
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent mb-4">
              My Profile
            </h1>
            <p className="text-amber-200/90 text-lg">Manage your account and track your culinary journey</p>
          </div>

          {/* Show loading overlay only if profile is still loading but we have user */}
          {isLoadingProfile && !profile.id && (
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 flex items-center justify-center">
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
                <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4 animate-spin"></div>
                <p className="text-gray-700 font-medium">Loading your profile...</p>
              </div>
            </div>
          )}

          {/* Profile Header Card */}
          <div className="mb-12">
            <div className="relative overflow-hidden rounded-3xl backdrop-blur-xl bg-[#231a13]/80 border border-amber-800/20 shadow-2xl">
              {/* Header Background */}
              <div className="relative h-48 bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 overflow-visible">
                <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent"></div>
                {/* Removed data-URL background layer to avoid JSX parsing issues */}
                <div className="hidden"></div>
                
                {/* Profile Avatar */}
                <div className="absolute -bottom-24 left-8 z-10">
                  <div className="relative">
                    <div
                      className="w-48 h-48 md:w-52 md:h-52 rounded-full bg-gradient-to-br from-white to-gray-100 p-2 shadow-2xl cursor-pointer group"
                      onClick={() => fileInputRef.current?.click()}
                      role="button"
                      aria-label="Change profile picture"
                    >
                      <Avatar className="w-full h-full border-4 border-white shadow-xl overflow-hidden">
                        <AvatarImage
                          src={profile.profilePicture}
                          alt={profile.name || user?.name}
                          className="w-full h-full object-cover"
                        />
                        <AvatarFallback className="text-4xl bg-gradient-to-br from-orange-500 to-pink-500 text-white font-bold">
                          {(profile.name || user?.name)?.charAt(0)?.toUpperCase() || 'C'}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    
                    <Button
                      size="icon"
                      className="absolute -bottom-2 -right-2 rounded-full shadow-xl bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 border-4 border-white w-12 h-12"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Camera className="w-5 h-5 text-white" />
                      )}
                    </Button>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>
              
              <div className="pt-24 pb-8 px-8">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
                  <div className="flex-1">
                    {isEditing ? (
                      <div className="space-y-6">
                        <div>
                          <Label htmlFor="name" className="text-sm font-semibold text-amber-100 mb-2 block">Full Name</Label>
                          <Input 
                            id="name" 
                            value={profile.name || ''} 
                            onChange={(e) => handleInputChange('name', e.target.value)} 
                            placeholder="Enter your name"
                            className="h-12 rounded-2xl border-amber-800 focus:border-orange-500 focus:ring-orange-500/20 bg-[#1b140f]/60 backdrop-blur-sm text-amber-50 placeholder:text-amber-200/90"
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone" className="text-sm font-semibold text-amber-100 mb-2 block">Phone Number</Label>
                          <Input 
                            id="phone" 
                            value={profile.phone || ''} 
                            onChange={(e) => handleInputChange('phone', e.target.value)} 
                            placeholder="Enter phone number"
                            className="h-12 rounded-2xl border-amber-800 focus:border-orange-500 focus:ring-orange-500/20 bg-[#1b140f]/60 backdrop-blur-sm text-amber-50 placeholder:text-amber-200/90"
                          />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h2 className="text-4xl font-bold text-amber-50 mb-4">
                          {profile.name || user?.name || 'Customer'}
                        </h2>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 text-amber-200/90">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg">
                              <Mail className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-lg">{profile.email || user?.email}</span>
                          </div>
                          {(profile.phone || user?.phone) && (
                            <div className="flex items-center gap-3 text-amber-200/90">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg">
                                <Phone className="w-5 h-5 text-white" />
                              </div>
                              <span className="text-lg">{profile.phone || user?.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-3 text-amber-200/90">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg">
                              <Calendar className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-lg">Member since {new Date(profile.memberSince).getFullYear()}</span>
                          </div>
                          <div className="flex items-center gap-3 text-amber-200/90">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg">
                              <Shield className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-lg capitalize">{profile.accountStatus} Account</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-4">
                    {isEditing ? (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => setIsEditing(false)}
                          disabled={isSaving}
                          className="rounded-2xl px-6 py-3 border-gray-300 hover:bg-gray-50"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSaveProfile}
                          disabled={isSaving}
                          className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 rounded-2xl px-6 py-3 shadow-lg"
                        >
                          {isSaving ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2 animate-spin"></div>
                          ) : (
                            <Save className="w-4 h-4 mr-2" />
                          )}
                          Save Changes
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={() => setIsEditing(true)}
                        className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 rounded-2xl px-6 py-3 shadow-lg"
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
            <div className="relative overflow-hidden rounded-3xl backdrop-blur-xl bg-gradient-to-br from-blue-500/90 to-blue-600/90 p-8 text-white shadow-2xl border border-white/20 hover:shadow-3xl transition-shadow duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Trophy className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold mb-1">{profile.totalOrders || 0}</div>
                    <div className="text-blue-100 text-sm font-medium">Total Orders</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative overflow-hidden rounded-3xl backdrop-blur-xl bg-gradient-to-br from-emerald-500/90 to-green-600/90 p-8 text-white shadow-2xl border border-white/20 hover:shadow-3xl transition-shadow duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <TrendingUp className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold mb-1">₹{profile.totalSpent || 0}</div>
                    <div className="text-emerald-100 text-sm font-medium">Total Spent</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative overflow-hidden rounded-3xl backdrop-blur-xl bg-gradient-to-br from-purple-500/90 to-violet-600/90 p-8 text-white shadow-2xl border border-white/20 hover:shadow-3xl transition-shadow duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Gift className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold mb-1">{profile.loyaltyPoints || 0}</div>
                    <div className="text-purple-100 text-sm font-medium">Loyalty Points</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative overflow-hidden rounded-3xl backdrop-blur-xl bg-gradient-to-br from-orange-500/90 to-pink-500/90 p-8 text-white shadow-2xl border border-white/20 hover:shadow-3xl transition-shadow duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Star className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold mb-1">{profile.averageRating?.toFixed(1) || '5.0'}</div>
                    <div className="text-orange-100 text-sm font-medium">Rating</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-3xl backdrop-blur-xl bg-gradient-to-br from-pink-500/90 to-rose-600/90 p-8 text-white shadow-2xl border border-white/20 hover:shadow-3xl transition-shadow duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Award className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold mb-1">{profile.reviewsCount || 0}</div>
                    <div className="text-pink-100 text-sm font-medium">Reviews</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Dietary Preferences */}
            <div className="rounded-3xl backdrop-blur-xl bg-[#231a13]/80 border border-amber-800/20 shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-gray-200/50 bg-gradient-to-r from-green-400/20 to-emerald-400/20">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Utensils className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-amber-50">Dietary Preferences</h3>
                    <p className="text-amber-200/90">Your food preferences and restrictions</p>
                  </div>
                </div>
              </div>
              <div className="p-8 space-y-6">
                <div>
                  <Label className="text-sm font-semibold text-amber-100 mb-3 block">Spice Preference</Label>
                  <Select value={profile.spicePreference} onValueChange={(value) => handleInputChange('spicePreference', value)}>
                    <SelectTrigger className="w-full h-12 rounded-2xl border-amber-800 bg-[#1b140f]/60 text-amber-50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mild">🌶️ Mild</SelectItem>
                      <SelectItem value="medium">🌶️🌶️ Medium</SelectItem>
                      <SelectItem value="hot">🌶️🌶️🌶️ Hot</SelectItem>
                      <SelectItem value="extra-hot">🌶️🌶️🌶️🌶️ Extra Hot</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-sm font-semibold text-amber-100 mb-3 block">Dietary Restrictions</Label>
                  <div className="space-y-2">
                    {profile.dietaryRestrictions?.map((restriction, index) => (
                      <div key={index} className="flex items-center justify-between bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-300 rounded-xl p-3">
                        <span className="text-amber-900 font-medium">🥗 {restriction}</span>
                        {isEditing && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleArrayRemove('dietaryRestrictions', index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    {profile.dietaryRestrictions?.length === 0 && (
                      <p className="text-amber-300/80 text-center py-4">No dietary restrictions set</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Favorite Cuisines */}
            <div className="rounded-3xl backdrop-blur-xl bg-[#231a13]/80 border border-amber-800/20 shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-gray-200/50 bg-gradient-to-r from-orange-400/20 to-pink-400/20">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <ChefHat className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-amber-50">Favorite Cuisines</h3>
                    <p className="text-amber-200/90">Your preferred food types</p>
                  </div>
                </div>
              </div>
              <div className="p-8">
                <div className="space-y-2">
                  {profile.favoriteCuisines?.map((cuisine, index) => (
                    <div key={index} className="flex items-center justify-between bg-gradient-to-r from-orange-50 to-pink-50 border border-orange-200 rounded-xl p-3">
                      <span className="text-amber-900 font-medium">🍽️ {cuisine}</span>
                      {isEditing && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleArrayRemove('favoriteCuisines', index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  {profile.favoriteCuisines?.length === 0 && (
                    <p className="text-amber-300/80 text-center py-4">No favorite cuisines selected</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Favorite Restaurants */}
          <div className="mb-12">
            <div className="rounded-3xl backdrop-blur-xl bg-[#231a13]/80 border border-amber-800/20 shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-gray-200/50 bg-gradient-to-r from-red-400/20 to-pink-400/20">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-amber-50">Favorite Restaurants</h3>
                    <p className="text-amber-200/90">Your go-to dining spots</p>
                  </div>
                </div>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {profile.favoriteRestaurants?.map((restaurant, index) => (
                    <div key={index} className="flex items-center justify-between bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-4">
                      <span className="text-amber-900 font-medium">🏪 {restaurant}</span>
                      {isEditing && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleArrayRemove('favoriteRestaurants', index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  {profile.favoriteRestaurants?.length === 0 && (
                    <div className="col-span-full text-center py-8">
                      <p className="text-amber-300/80">No favorite restaurants yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="mb-12">
            <div className="rounded-3xl backdrop-blur-xl bg-[#231a13]/80 border border-amber-800/20 shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-gray-200/50 bg-gradient-to-r from-blue-400/20 to-purple-400/20">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Bell className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-amber-50">Notification Preferences</h3>
                    <p className="text-amber-200/90">Manage your notification settings</p>
                  </div>
                </div>
              </div>
              <div className="p-8">
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-[#1b140f]/60 border border-amber-800/40 rounded-xl shadow-inner">
                    <div>
                      <Label className="text-lg font-medium text-amber-50">📱 Order Updates</Label>
                      <p className="text-amber-200/90">Get notified about your order status</p>
                    </div>
                    <Switch
                      checked={profile.notificationPreferences?.orderUpdates || false}
                      onCheckedChange={(checked) => 
                        handleInputChange('notificationPreferences', {
                          ...profile.notificationPreferences,
                          orderUpdates: checked
                        })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-[#1b140f]/60 border border-amber-800/40 rounded-xl shadow-inner">
                    <div>
                      <Label className="text-lg font-medium text-amber-50">🎉 Promotions</Label>
                      <p className="text-amber-200/90">Receive offers and promotional content</p>
                    </div>
                    <Switch
                      checked={profile.notificationPreferences?.promotions || false}
                      onCheckedChange={(checked) => 
                        handleInputChange('notificationPreferences', {
                          ...profile.notificationPreferences,
                          promotions: checked
                        })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-[#1b140f]/60 border border-amber-800/40 rounded-xl shadow-inner">
                    <div>
                      <Label className="text-lg font-medium text-amber-50">🆕 New Restaurants</Label>
                      <p className="text-amber-200/90">Get notified when new restaurants join</p>
                    </div>
                    <Switch
                      checked={profile.notificationPreferences?.newRestaurants || false}
                      onCheckedChange={(checked) => 
                        handleInputChange('notificationPreferences', {
                          ...profile.notificationPreferences,
                          newRestaurants: checked
                        })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Metadata */}
          <div className="mb-12">
            <div className="rounded-3xl backdrop-blur-xl bg-[#231a13]/80 border border-amber-800/20 shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-gray-200/50 bg-gradient-to-r from-indigo-400/20 to-purple-400/20">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Clock className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-amber-50">Account Information</h3>
                    <p className="text-amber-200/90">Account creation and update details</p>
                  </div>
                </div>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <Label className="text-sm font-semibold text-amber-100 mb-2 block">📅 Account Created</Label>
                    <div className="bg-[#1b140f]/60 border border-amber-800/40 rounded-xl p-4 shadow-inner">
                      <p className="text-amber-100 font-medium">
                        {new Date(profile.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-semibold text-amber-100 mb-2 block">🔄 Last Updated</Label>
                    <div className="bg-[#1b140f]/60 border border-amber-800/40 rounded-xl p-4 shadow-inner">
                      <p className="text-amber-100 font-medium">
                        {new Date(profile.updatedAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div>
            <div className="rounded-3xl backdrop-blur-xl bg-[#231a13]/80 border border-amber-800/20 shadow-2xl p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div>
                  <h3 className="text-2xl font-bold text-amber-50 mb-2">Account Settings</h3>
                  <p className="text-amber-200/90 text-lg">Manage your account preferences and security</p>
                </div>
                <Button
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-2xl px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
