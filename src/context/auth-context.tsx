import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  onAuthStateChanged, 
  signOut, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult,
  User 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface UserData {
  uid: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  addresses?: {
    id: string;
    title: string;
    address: string;
    isDefault: boolean;
  }[];
  role: string;
}

interface AuthContextType {
  user: UserData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<User>;
  signUpWithEmail: (email: string, password: string) => Promise<User>;
  sendOTP: (phoneNumber: string, recaptchaVerifier: RecaptchaVerifier) => Promise<ConfirmationResult>;
  verifyOTP: (confirmationResult: ConfirmationResult, otp: string) => Promise<User>;
  createUserProfile: (firebaseUser: User, data: Omit<UserData, 'uid'>) => Promise<UserData>;
  getUserProfile: (uid: string) => Promise<UserData | null>;
  checkAdminCredentials: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const getUserProfile = async (uid: string) => {
    try {
      console.log('AuthContext: Getting user profile for UID:', uid);
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserData;
        console.log('AuthContext: Profile found:', userData);
        return userData;
      } else {
        console.log('AuthContext: No profile document found for UID:', uid);
        return null;
      }
    } catch (error) {
      console.error('AuthContext: Error fetching user profile:', error);
      return null;
    }
  };

  const createUserProfile = async (firebaseUser: User, data: Omit<UserData, 'uid'>) => {
    try {
      // Filter out undefined values to prevent Firestore errors
      const profileData = Object.fromEntries(
        Object.entries({
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || data.name || 'Customer',
          email: firebaseUser.email || data.email || '',
          phone: firebaseUser.phoneNumber || data.phone || '',
          role: data.role || 'customer',
          addresses: data.addresses || [],
          createdAt: new Date(),
          updatedAt: new Date(),
        }).filter(([_, value]) => value !== undefined)
      );
      
      console.log('AuthContext: Creating profile with data:', profileData);
      await setDoc(doc(db, 'users', firebaseUser.uid), profileData);
      console.log('AuthContext: Profile created successfully');
      return profileData as UserData;
    } catch (error) {
      console.error('AuthContext: Error creating user profile:', error);
      throw error;
    }
  };

  // Email/Password Authentication
  const signInWithEmail = async (email: string, password: string): Promise<User> => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error) {
      console.error('Error signing in with email:', error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string): Promise<User> => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error) {
      console.error('Error signing up with email:', error);
      throw error;
    }
  };

  // Phone Authentication
  const sendOTP = async (phoneNumber: string, recaptchaVerifier: RecaptchaVerifier): Promise<ConfirmationResult> => {
    try {
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      return confirmationResult;
    } catch (error) {
      console.error('Error sending OTP:', error);
      throw error;
    }
  };

  const verifyOTP = async (confirmationResult: ConfirmationResult, otp: string): Promise<User> => {
    try {
      const result = await confirmationResult.confirm(otp);
      return result.user;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
  };

  // Admin check
  const checkAdminCredentials = async (email: string): Promise<boolean> => {
    try {
      const adminDoc = await getDoc(doc(db, 'admin', email));
      return adminDoc.exists();
    } catch (error) {
      console.error('Error checking admin credentials:', error);
      return false;
    }
  };

  useEffect(() => {
    console.log('AuthContext: Setting up auth state listener');
    
    const handleAuthStateChange = async (firebaseUser: User | null) => {
      console.log('AuthContext: Auth state changed, firebaseUser:', firebaseUser?.uid || 'null');
      
      // Don't set loading if we're already initialized and just switching users
      if (!isInitialized) {
        setIsLoading(true);
      }
      
      try {
        if (firebaseUser) {
          console.log('AuthContext: Fetching profile for user:', firebaseUser.uid);
          
          // Check if user is admin first
          const isAdmin = await checkAdminCredentials(firebaseUser.email || '');
          
          if (isAdmin) {
            // For admin users, get profile from admin collection
            console.log('AuthContext: User is admin, fetching from admin collection');
            const adminDoc = await getDoc(doc(db, 'admin', firebaseUser.email || ''));
            if (adminDoc.exists()) {
              const adminData = adminDoc.data();
              const adminProfile = {
                uid: firebaseUser.uid,
                email: firebaseUser.email || '',
                name: adminData.name || 'Admin',
                role: 'admin',
                addresses: []
              };
              console.log('AuthContext: Setting admin profile:', adminProfile);
              setUser(adminProfile);
              return;
            }
          }
          
          // For regular users, get profile from users collection
          let userProfile = await getUserProfile(firebaseUser.uid);
          
          if (!userProfile) {
            console.log('AuthContext: Auto-creating Firestore profile for auth user:', firebaseUser.uid);
            userProfile = await createUserProfile(firebaseUser, {
              role: 'customer',
              name: firebaseUser.displayName || 'Customer',
              email: firebaseUser.email || '',
              addresses: []
            });
          }
          
          console.log('AuthContext: Setting user profile:', userProfile);
          setUser(userProfile);
        } else {
          console.log('AuthContext: No firebase user, clearing user state');
          setUser(null);
        }
      } catch (error) {
        console.error('AuthContext: Error in auth state change handler:', error);
        // On error, don't clear existing user state unless we're logging out
        if (!firebaseUser) {
          setUser(null);
        }
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
        console.log('AuthContext: Auth state change complete');
      }
    };

    // Set up the auth listener
    unsubscribeRef.current = onAuthStateChanged(auth, handleAuthStateChange);

    // Cleanup function
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, []); // Empty dependency array - only run once

  const logout = async () => {
    try {
      console.log('AuthContext: Logging out user');
      await signOut(auth);
      setUser(null);
      setIsInitialized(false);
    } catch (error) {
      console.error('AuthContext: Error signing out:', error);
    }
  };

  const contextValue = {
    user,
    isAuthenticated: !!user,
    isLoading,
    logout,
    signInWithEmail,
    signUpWithEmail,
    sendOTP,
    verifyOTP,
    createUserProfile,
    getUserProfile,
    checkAdminCredentials,
  };

  console.log('AuthContext: Providing context:', { 
    hasUser: !!user, 
    isLoading, 
    isAuthenticated: !!user,
    isInitialized 
  });

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}