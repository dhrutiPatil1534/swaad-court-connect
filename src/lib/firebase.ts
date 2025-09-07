import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  updateDoc, 
  addDoc, 
  deleteDoc,
  writeBatch,
  Timestamp, 
  increment 
} from 'firebase/firestore';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Initialize App Check for phone authentication (if reCAPTCHA site key is provided)
// Temporarily disabled to prevent throttling issues
/*
if (import.meta.env.VITE_RECAPTCHA_SITE_KEY) {
  try {
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(import.meta.env.VITE_RECAPTCHA_SITE_KEY),
      isTokenAutoRefreshEnabled: true
    });
    console.log('App Check initialized successfully');
  } catch (error) {
    console.warn('App Check initialization failed:', error);
  }
}
*/

export { db, auth, storage };

// User Role Types
export type UserRole = 'customer' | 'vendor' | 'admin';

export interface CustomizationOption {
  id: string;
  name: string;
  price: number;
  isVeg: boolean;
  description?: string;
}

export interface MenuItemCustomization {
  id: string;
  name: string;
  required: boolean;
  maxSelections?: number;
  options: CustomizationOption[];
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isVeg: boolean;
  spiceLevel?: number;
  preparationTime?: string;
  isPopular?: boolean;
  isRecommended?: boolean;
  rating: number;
  customizations?: MenuItemCustomization[];
  allergens?: string[];
  nutritionInfo?: NutritionInfo;
}

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  image: string;
  coverImage: string;
  rating: number;
  totalRatings: number;
  deliveryTime: string;
  distance: string;
  cuisine: string[];
  tags: string[];
  isVeg: boolean;
  discount?: string;
  isPopular?: boolean;
  openingHours: {
    open: string;
    close: string;
  };
  address: string;
  phone: string;
}

// Phone Authentication Types
export interface PhoneAuthResult {
  verificationId: string;
  confirmationResult: ConfirmationResult;
}

// Order Status Types
export type OrderStatus = 'Placed' | 'Confirmed' | 'Preparing' | 'Ready to Serve' | 'Served' | 'Completed' | 'Cancelled';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;          // price per unit used by UI
  totalPrice?: number;        // computed line total
  image?: string;
  category?: string;
  customizations?: string[];
}

export interface Order {
  id: string;
  userId: string;
  restaurantId: string;
  restaurantName: string;
  restaurantImage?: string;
  items: OrderItem[];
  // pricing summary kept nested but UI also reads root totalAmount
  pricing: {
    subtotal: number;
    taxes: number;
    deliveryFee: number;
    discount: number;
    totalAmount: number;
  };
  totalAmount: number; // convenience mirror of pricing.totalAmount
  status: OrderStatus;
  statusHistory?: Array<{ status: OrderStatus; timestamp: string | Date | Timestamp; note?: string }>;
  dineIn?: { tableNumber?: string; seatingArea?: string; guestCount?: number };
  timing?: {
    orderPlaced?: string | Date | Timestamp;
    estimatedReady?: string | Date | Timestamp | null;
    actualReady?: string | Date | Timestamp | null;
    servedAt?: string | Date | Timestamp | null;
    completedAt?: string | Date | Timestamp | null;
  };
  payment?: {
    method: string;
    status: 'Pending' | 'Completed' | 'Refunded' | 'Failed';
    transactionId?: string | null;
    paidAt?: string | Date | Timestamp | null;
  };
  tableNumber?: string; // convenience mirror of dineIn.tableNumber
  createdAt: Date | string | Timestamp;
  updatedAt: Date | string | Timestamp;
  notes?: string;
  source?: string;
  orderNumber?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'vendor' | 'admin';
  profilePicture?: string;
  
  // Personal preferences and stats
  favoriteRestaurants: string[]; // Array of restaurant IDs
  favoriteCuisines: string[]; // e.g., ["Italian", "Indian", "Chinese"]
  dietaryRestrictions: string[]; // e.g., ["Vegetarian", "Vegan", "Gluten-Free"]
  spicePreference: 'mild' | 'medium' | 'hot' | 'extra-hot';
  
  // Social and gamification features
  totalOrders: number;
  totalSpent: number;
  memberSince: Date;
  loyaltyPoints: number;
  achievements: string[]; // e.g., ["First Order", "Big Spender", "Regular Customer"]
  reviewsCount: number;
  averageRating: number; // Rating given by restaurants for customer behavior
  
  // Preferences and settings
  notificationPreferences: {
    orderUpdates: boolean;
    promotions: boolean;
    newRestaurants: boolean;
  };
  defaultPaymentMethod?: string;
  emergencyContact?: {
    name: string;
    phone: string;
  };
  
  // Account metadata
  accountStatus: 'active' | 'pending' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
}

// Global reCAPTCHA verifier instance
let recaptchaVerifier: RecaptchaVerifier | null = null;

// Initialize RecaptchaVerifier for phone auth with better error handling
export function initializeRecaptcha(containerId: string = 'recaptcha-container'): RecaptchaVerifier {
  // Clear existing verifier if it exists
  if (recaptchaVerifier) {
    try {
      recaptchaVerifier.clear();
    } catch (error) {
      console.log('Error clearing existing reCAPTCHA:', error);
    }
    recaptchaVerifier = null;
  }

  // Ensure container exists
  let container = document.getElementById(containerId);
  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    container.style.display = 'none';
    document.body.appendChild(container);
  }

  try {
    recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: (response: any) => {
        console.log('reCAPTCHA solved:', response);
      },
      'expired-callback': () => {
        console.log('reCAPTCHA expired');
        // Reinitialize on expiry
        if (recaptchaVerifier) {
          recaptchaVerifier.clear();
          recaptchaVerifier = null;
        }
      },
      'error-callback': (error: any) => {
        console.error('reCAPTCHA error:', error);
      }
    });

    return recaptchaVerifier;
  } catch (error) {
    console.error('Error initializing reCAPTCHA:', error);
    throw new Error('Failed to initialize reCAPTCHA. Please refresh the page and try again.');
  }
};

// Get or create reCAPTCHA verifier
export function getRecaptchaVerifier(): RecaptchaVerifier {
  if (!recaptchaVerifier) {
    return initializeRecaptcha();
  }
  return recaptchaVerifier;
};

// Clear reCAPTCHA verifier
export function clearRecaptchaVerifier(): void {
  if (recaptchaVerifier) {
    try {
      recaptchaVerifier.clear();
    } catch (error) {
      console.log('Error clearing reCAPTCHA:', error);
    }
    recaptchaVerifier = null;
  }
};

// Phone Authentication Functions with improved error handling
export async function sendOTP(phoneNumber: string, retryCount: number = 0): Promise<ConfirmationResult> {
  const maxRetries = 2;
  
  try {
    // Get or initialize reCAPTCHA verifier
    const verifier = getRecaptchaVerifier();
    
    // Ensure phone number is in correct format
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
    
    console.log('Sending OTP to:', formattedPhone);
    const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, verifier);
    
    return confirmationResult;
  } catch (error: any) {
    console.error('Error sending OTP (attempt ' + (retryCount + 1) + '):', error);
    
    // Handle Firebase configuration errors
    if (error.code === 'auth/invalid-app-credential') {
      throw new Error('Phone authentication is not properly configured. Please contact support or use email login instead.');
    }
    
    if (error.code === 'auth/app-not-authorized') {
      throw new Error('This app is not authorized for phone authentication. Please contact support.');
    }
    
    if (error.code === 'auth/project-not-found') {
      throw new Error('Firebase project configuration error. Please contact support.');
    }
    
    // Handle specific reCAPTCHA errors
    if (error.message?.includes('reCAPTCHA') || error.code === 'auth/captcha-check-failed') {
      if (retryCount < maxRetries) {
        console.log('Retrying with fresh reCAPTCHA...');
        clearRecaptchaVerifier();
        // Wait a bit before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
        return sendOTP(phoneNumber, retryCount + 1);
      } else {
        throw new Error('reCAPTCHA verification failed. Please refresh the page and try again.');
      }
    }
    
    // Handle other Firebase errors
    if (error.code === 'auth/invalid-phone-number') {
      throw new Error('Invalid phone number format. Please enter a valid phone number.');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Too many requests. Please try again later.');
    } else if (error.code === 'auth/quota-exceeded') {
      throw new Error('SMS quota exceeded. Please try again later.');
    }
    
    throw error;
  }
};

export async function verifyOTP(confirmationResult: ConfirmationResult, otp: string): Promise<FirebaseUser> {
  try {
    const result = await confirmationResult.confirm(otp);
    return result.user;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
};

// Email/Password Authentication Functions
export async function signInWithEmail(email: string, password: string): Promise<FirebaseUser> {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error('Error signing in with email:', error);
    throw error;
  }
};

export async function signUpWithEmail(email: string, password: string): Promise<FirebaseUser> {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error('Error signing up with email:', error);
    throw error;
  }
};

// User Profile Management
export async function createUserProfile(user: FirebaseUser, additionalData: Partial<UserProfile>): Promise<void> {
  const userRef = doc(db, 'users', user.uid);
  const userProfile: UserProfile = {
    id: user.uid,
    name: user.displayName || additionalData.name || '',
    email: user.email || '',
    phone: user.phoneNumber || additionalData.phone || '',
    role: additionalData.role || 'customer',
    profilePicture: additionalData.profilePicture,
    
    // Initialize personal preferences
    favoriteRestaurants: additionalData.favoriteRestaurants || [],
    favoriteCuisines: additionalData.favoriteCuisines || [],
    dietaryRestrictions: additionalData.dietaryRestrictions || [],
    spicePreference: additionalData.spicePreference || 'medium',
    
    // Initialize gamification features
    totalOrders: additionalData.totalOrders || 0,
    totalSpent: additionalData.totalSpent || 0,
    memberSince: additionalData.memberSince || new Date(),
    loyaltyPoints: additionalData.loyaltyPoints || 0,
    achievements: additionalData.achievements || ['Welcome Bonus'], // Give first achievement
    reviewsCount: additionalData.reviewsCount || 0,
    averageRating: additionalData.averageRating || 5.0,
    
    // Default notification preferences
    notificationPreferences: additionalData.notificationPreferences || {
      orderUpdates: true,
      promotions: true,
      newRestaurants: false,
    },
    defaultPaymentMethod: additionalData.defaultPaymentMethod,
    emergencyContact: additionalData.emergencyContact,
    
    // Account metadata
    accountStatus: additionalData.role === 'vendor' ? 'pending' : 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await setDoc(userRef, userProfile);
  console.log(`User profile created for ${user.uid}:`, userProfile);
};

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    console.log('getUserProfile: Fetching profile for UID:', uid);
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const data = userSnap.data();
      console.log('getUserProfile: Profile found:', data);
      return data as UserProfile;
    } else {
      console.log('getUserProfile: No profile document found for UID:', uid);
      return null;
    }
  } catch (error) {
    console.error('getUserProfile: Error fetching profile:', error);
    return null;
  }
};

export async function checkAdminCredentials(email: string): Promise<boolean> {
  const adminsRef = collection(db, 'admins');
  const q = query(adminsRef, where('email', '==', email));
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
};

// Admin Authentication Functions
export async function createAdminAccount() {
  try {
    // Create admin user in Firebase Auth
    const adminCredential = await createUserWithEmailAndPassword(
      auth, 
      'admin@swaadcourtconnect.com', 
      'Admin@123456'
    );
    
    // Update admin profile
    await updateProfile(adminCredential.user, {
      displayName: 'Platform Administrator'
    });

    // Create admin document in SEPARATE admins collection (NOT users collection)
    await setDoc(doc(db, 'admins', adminCredential.user.uid), {
      email: 'admin@swaadcourtconnect.com',
      name: 'Platform Administrator',
      role: 'admin',
      permissions: ['all'],
      createdAt: Timestamp.now(),
      isActive: true,
      uid: adminCredential.user.uid
    });

    console.log('Admin account created successfully in admins collection');
    return adminCredential.user;
  } catch (error) {
    console.error('Error creating admin account:', error);
    throw error;
  }
};

export async function verifyAdminAccess(userId: string): Promise<boolean> {
  try {
    const adminDoc = await getDoc(doc(db, 'admins', userId));
    return adminDoc.exists() && adminDoc.data()?.isActive === true;
  } catch (error) {
    console.error('Error verifying admin access:', error);
    return false;
  }
};

export async function getAdminProfile(userId: string) {
  try {
    const adminDoc = await getDoc(doc(db, 'admins', userId));
    if (adminDoc.exists()) {
      return { id: adminDoc.id, ...adminDoc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting admin profile:', error);
    return null;
  }
};

export async function loginAsAdmin(email: string, password: string) {
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const isAdmin = await verifyAdminAccess(credential.user.uid);
    
    if (!isAdmin) {
      throw new Error('Access denied. Admin privileges required.');
    }
    
    // Get admin profile from admins collection
    const adminProfile = await getAdminProfile(credential.user.uid);
    
    return {
      ...credential.user,
      role: 'admin',
      adminProfile
    };
  } catch (error) {
    console.error('Admin login error:', error);
    throw error;
  }
};

// Order Management Functions
export async function createOrder(orderData: Partial<Order>): Promise<string> {
  const orderId = `order_${Date.now()}`;
  const orderNumber = `SC${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}`;
  
  const order: Order = {
    id: orderId,
    orderNumber,
    status: 'Placed',
    statusHistory: [{
      status: 'Placed',
      timestamp: Timestamp.now(),
      note: 'Order received'
    }],
    timing: {
      orderPlaced: Timestamp.now(),
      estimatedReady: Timestamp.fromMillis(Timestamp.now().toMillis() + 25 * 60000),
      actualReady: null,
      servedAt: null,
      completedAt: null
    },
    payment: {
      method: 'Cash',
      status: 'Pending',
      transactionId: null,
      paidAt: null
    },
    pricing: {
      subtotal: 0,
      taxes: 0,
      deliveryFee: 0,
      discount: 0,
      totalAmount: 0
    },
    dineIn: {
      tableNumber: '1',
      seatingArea: 'Main Hall',
      guestCount: 1
    },
    items: [],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    source: 'mobile_app',
    userId: '',
    restaurantId: '',
    restaurantName: '',
    ...orderData
  };

  // Create in main orders collection
  await setDoc(doc(db, 'orders', orderId), order);
  
  // Create in user's subcollection for faster queries
  if (orderData.userId) {
    const userOrderRef = doc(db, `users/${orderData.userId}/orders`, orderId);
    await setDoc(userOrderRef, {
      orderId,
      orderNumber,
      restaurantId: orderData.restaurantId,
      restaurantName: orderData.restaurantName,
      restaurantImage: orderData.restaurantImage,
      totalAmount: orderData.pricing?.totalAmount || 0,
      status: 'Placed',
      tableNumber: orderData.dineIn?.tableNumber,
      itemsCount: orderData.items?.length || 0,
      itemsSummary: orderData.items?.slice(0, 2).map(item => 
        `${item.name}${item.quantity > 1 ? ` x${item.quantity}` : ''}`
      ).join(', ') || '',
      createdAt: Timestamp.now(),
      estimatedReady: order.timing.estimatedReady
    });
    
    // Update user stats immediately when order is placed
    const loyaltyPointsEarned = Math.floor((orderData.pricing?.totalAmount || 0) * 0.1); // 10% of order value
    await updateUserOrderStats(orderData.userId, orderData.pricing?.totalAmount || 0, loyaltyPointsEarned);
  }
  
  console.log(`Order created: ${orderId} for user: ${orderData.userId}`);
  return orderId;
};

export function getUserOrders(userId: string, callback: (orders: Order[]) => void): (() => void) {
  console.log('getUserOrders: Starting order fetch for user:', userId);
  
  // Fetch from global orders collection filtered by userId (no orderBy to avoid composite index requirement)
  const ordersRef = collection(db, 'orders');
  const q = query(
    ordersRef, 
    where('userId', '==', userId)
  );
  
  return onSnapshot(q, (snapshot) => {
    console.log('getUserOrders: Firestore snapshot received, docs count:', snapshot.docs.length);
    
    if (snapshot.empty) {
      console.log('getUserOrders: No documents found for user:', userId);
      callback([]);
      return;
    }
    
    const orders: Order[] = snapshot.docs.map((doc, index) => {
      const data = doc.data();
      console.log(`getUserOrders: Processing doc ${index + 1}/${snapshot.docs.length}:`, doc.id, data);
      
      const processedOrder = {
        id: doc.id,
        ...data,
        // Handle date conversion properly
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : 
                   typeof data.createdAt === 'string' ? new Date(data.createdAt) : new Date(),
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : 
                   typeof data.updatedAt === 'string' ? new Date(data.updatedAt) : new Date(),
        // Handle nested objects
        timing: data.timing || {
          orderPlaced: new Date().toISOString(),
          estimatedReady: new Date().toISOString()
        },
        pricing: data.pricing || {
          subtotal: data.pricing?.subtotal || data.totalAmount || 0,
          taxes: data.pricing?.taxes || 0,
          deliveryFee: data.pricing?.deliveryFee || 0,
          discount: data.pricing?.discount || 0,
          totalAmount: data.pricing?.totalAmount || data.totalAmount || 0
        },
        dineIn: data.dineIn || {
          tableNumber: data.dineIn?.tableNumber || data.tableNumber || '1',
          seatingArea: data.dineIn?.seatingArea || 'Main Hall',
          guestCount: data.dineIn?.guestCount || 1
        },
        // Ensure required fields exist
        orderNumber: data.orderNumber || `SC${Date.now()}`,
        statusHistory: data.statusHistory || [{
          status: data.status || 'Placed',
          timestamp: new Date().toISOString(),
          note: 'Order received'
        }],
        payment: data.payment || {
          method: 'Cash',
          status: 'Pending'
        },
        // Ensure totalAmount is available at root level for UI compatibility
        totalAmount: data.pricing?.totalAmount || data.totalAmount || 0,
        // Ensure tableNumber is available at root level for UI compatibility  
        tableNumber: data.dineIn?.tableNumber || data.tableNumber || '1',
        // Ensure items array exists
        items: data.items || [],
        // Ensure required string fields
        userId: data.userId || userId,
        restaurantId: data.restaurantId || '',
        restaurantName: data.restaurantName || 'Unknown Restaurant',
        status: data.status || 'Placed'
      } as Order;
      
      return processedOrder;
    })
    // Sort by createdAt desc client-side
    .sort((a, b) => (b.createdAt?.getTime?.() || 0) - (a.createdAt?.getTime?.() || 0));
    
    console.log(`getUserOrders: Final processed orders (${orders.length}):`, orders);
    callback(orders);
  }, (error) => {
    console.error('getUserOrders: Error fetching user orders:', error);
    callback([]);
  });
};

// Profile Management Functions
export async function updateUserProfile(userId: string, profileData: Partial<UserProfile>): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...profileData,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Profile Picture Management
export async function uploadProfilePicture(userId: string, file: File): Promise<string> {
  try {
    const fileExtension = file.name.split('.').pop();
    const fileName = `profile_${userId}.${fileExtension}`;
    const storageRef = ref(storage, `profile-pictures/${fileName}`);
    
    // Upload file
    await uploadBytes(storageRef, file);
    
    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);
    
    // Update user profile with new picture URL
    await updateUserProfile(userId, { profilePicture: downloadURL });
    
    // Update Firebase Auth profile
    const user = auth.currentUser;
    if (user) {
      await updateProfile(user, { photoURL: downloadURL });
    }
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    throw error;
  }
};

export async function deleteProfilePicture(userId: string, pictureUrl: string): Promise<void> {
  try {
    // Delete from storage
    const storageRef = ref(storage, pictureUrl);
    await deleteObject(storageRef);
    
    // Update user profile
    await updateUserProfile(userId, { profilePicture: '' });
    
    // Update Firebase Auth profile
    const user = auth.currentUser;
    if (user) {
      await updateProfile(user, { photoURL: '' });
    }
  } catch (error) {
    console.error('Error deleting profile picture:', error);
    throw error;
  }
};

// Utility functions for orders
export function getOngoingOrders(orders: Order[]): Order[] {
  const ongoingStatuses: OrderStatus[] = ['Placed', 'Confirmed', 'Preparing', 'Ready to Serve', 'Served'];
  return orders.filter(order => ongoingStatuses.includes(order.status));
};

export function getPastOrders(orders: Order[]): Order[] {
  const pastStatuses: OrderStatus[] = ['Completed', 'Cancelled'];
  return orders.filter(order => pastStatuses.includes(order.status));
};

export function getOrderStatusColor(status: OrderStatus): string {
  const statusColors: Record<OrderStatus, string> = {
    'Placed': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'Confirmed': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'Preparing': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'Ready to Serve': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    'Served': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    'Completed': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    'Cancelled': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  };
  
  return statusColors[status] || 'bg-gray-100 text-gray-800';
};

// Sample data creation for testing
export async function createSampleOrders(userId: string): Promise<void> {
  const sampleOrders = [
    {
      userId,
      restaurantId: 'rest1',
      restaurantName: 'Spice Garden',
      items: [
        { id: '1', name: 'Butter Chicken', quantity: 1, unitPrice: 280 },
        { id: '2', name: 'Garlic Naan', quantity: 2, unitPrice: 60 },
        { id: '3', name: 'Basmati Rice', quantity: 1, unitPrice: 120 }
      ],
      totalAmount: 520,
      status: 'Preparing' as OrderStatus,
      tableNumber: '12',
      notes: 'Medium spice level please'
    },
    {
      userId,
      restaurantId: 'rest2',
      restaurantName: 'Pizza Corner',
      items: [
        { id: '4', name: 'Margherita Pizza', quantity: 1, unitPrice: 350 },
        { id: '5', name: 'Garlic Bread', quantity: 1, unitPrice: 120 }
      ],
      totalAmount: 470,
      status: 'Ready to Serve' as OrderStatus,
      tableNumber: '8'
    },
    {
      userId,
      restaurantId: 'rest3',
      restaurantName: 'Cafe Delight',
      items: [
        { id: '6', name: 'Cappuccino', quantity: 2, unitPrice: 150 },
        { id: '7', name: 'Chocolate Croissant', quantity: 1, unitPrice: 180 }
      ],
      totalAmount: 480,
      status: 'Completed' as OrderStatus,
      tableNumber: '5'
    },
    {
      userId,
      restaurantId: 'rest4',
      restaurantName: 'Burger Hub',
      items: [
        { id: '8', name: 'Classic Burger', quantity: 1, unitPrice: 220 },
        { id: '9', name: 'French Fries', quantity: 1, unitPrice: 100 },
        { id: '10', name: 'Coke', quantity: 1, unitPrice: 60 }
      ],
      totalAmount: 380,
      status: 'Cancelled' as OrderStatus,
      tableNumber: '15',
      notes: 'Order cancelled due to unavailability'
    }
  ];

  try {
    for (const orderData of sampleOrders) {
      await createOrder(orderData);
    }
    console.log('Sample orders created successfully');
  } catch (error) {
    console.error('Error creating sample orders:', error);
  }
};

export async function fetchRestaurants(): Promise<Restaurant[]> {
  const restaurantsRef = collection(db, 'restaurants');
  const snapshot = await getDocs(restaurantsRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Restaurant));
}

export async function fetchRestaurantMenu(restaurantId: string): Promise<MenuItem[]> {
  const menuRef = collection(db, `restaurants/${restaurantId}/menu`);
  const snapshot = await getDocs(menuRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MenuItem));
}

export async function fetchRestaurant(restaurantId: string): Promise<Restaurant | null> {
  const restaurantRef = doc(db, 'restaurants', restaurantId);
  const snapshot = await getDoc(restaurantRef);
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } as Restaurant : null;
}

// Helper function to update user order stats
export async function updateUserOrderStats(userId: string, totalAmount: number, loyaltyPointsEarned: number): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      totalOrders: increment(1),
      totalSpent: increment(totalAmount),
      loyaltyPoints: increment(loyaltyPointsEarned),
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating user order stats:', error);
    throw error;
  }
}

// Helper function to get order total
export async function getOrderTotal(orderId: string): Promise<number> {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);
    if (orderSnap.exists()) {
      return orderSnap.data().pricing.totalAmount;
    } else {
      throw new Error('Order not found');
    }
  } catch (error) {
    console.error('Error getting order total:', error);
    throw error;
  }
}

// Vendor/Restaurant Management Functions

// Get vendor/restaurant profile
export async function getVendorProfile(vendorId: string): Promise<any> {
  try {
    const vendorRef = doc(db, 'vendors', vendorId);
    const vendorSnap = await getDoc(vendorRef);
    
    if (vendorSnap.exists()) {
      return { id: vendorSnap.id, ...vendorSnap.data() };
    } else {
      throw new Error('Vendor profile not found');
    }
  } catch (error) {
    console.error('Error fetching vendor profile:', error);
    throw error;
  }
}

// Update vendor/restaurant profile
export async function updateVendorProfile(vendorId: string, profileData: any): Promise<void> {
  try {
    const vendorRef = doc(db, 'vendors', vendorId);
    await updateDoc(vendorRef, {
      ...profileData,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating vendor profile:', error);
    throw error;
  }
}

// Get vendor orders with real-time updates
export function getVendorOrdersRealtime(vendorId: string, callback: (orders: any[]) => void): () => void {
  const ordersRef = collection(db, 'orders');
  const q = query(
    ordersRef,
    where('restaurantId', '==', vendorId),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(orders);
  });
}

// Update order status for vendors
export async function updateOrderStatus(orderId: string, status: string, vendorId: string): Promise<void> {
  try {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      status: status,
      updatedAt: Timestamp.now(),
      [`statusHistory.${status}`]: Timestamp.now()
    });

    // Create notification for customer
    const orderSnap = await getDoc(orderRef);
    if (orderSnap.exists()) {
      const orderData = orderSnap.data();
      
      // Create notification for customer
      await addDoc(collection(db, 'notifications'), {
        userId: orderData.userId,
        type: 'order_status_update',
        title: 'Order Status Updated',
        message: `Your order #${orderId.slice(-6)} is now ${status}`,
        orderId: orderId,
        isRead: false,
        createdAt: Timestamp.now()
      });
    }
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
}

// Get vendor menu items
export async function getVendorMenuItems(vendorId: string): Promise<any[]> {
  try {
    const menuRef = collection(db, 'vendors', vendorId, 'menuItems');
    const snapshot = await getDocs(menuRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching vendor menu items:', error);
    throw error;
  }
}

// Add menu item
export async function addMenuItem(vendorId: string, menuItem: any): Promise<string> {
  try {
    const menuRef = collection(db, 'vendors', vendorId, 'menuItems');
    const docRef = await addDoc(menuRef, {
      ...menuItem,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding menu item:', error);
    throw error;
  }
}

// Update menu item
export async function updateMenuItem(vendorId: string, itemId: string, updates: any): Promise<void> {
  try {
    const itemRef = doc(db, 'vendors', vendorId, 'menuItems', itemId);
    await updateDoc(itemRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating menu item:', error);
    throw error;
  }
}

// Delete menu item
export async function deleteMenuItem(vendorId: string, itemId: string): Promise<void> {
  try {
    const itemRef = doc(db, 'vendors', vendorId, 'menuItems', itemId);
    await deleteDoc(itemRef);
  } catch (error) {
    console.error('Error deleting menu item:', error);
    throw error;
  }
}

// Get vendor categories
export async function getVendorCategories(vendorId: string): Promise<any[]> {
  try {
    const categoriesRef = collection(db, 'vendors', vendorId, 'categories');
    const snapshot = await getDocs(query(categoriesRef, orderBy('sortOrder')));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching vendor categories:', error);
    throw error;
  }
}

// Add category
export async function addCategory(vendorId: string, category: any): Promise<string> {
  try {
    const categoriesRef = collection(db, 'vendors', vendorId, 'categories');
    const docRef = await addDoc(categoriesRef, {
      ...category,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding category:', error);
    throw error;
  }
}

// Get vendor analytics data
export async function getVendorAnalytics(vendorId: string, dateRange: string): Promise<any> {
  try {
    const now = new Date();
    let startDate: Date;
    
    switch (dateRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      where('restaurantId', '==', vendorId),
      where('createdAt', '>=', Timestamp.fromDate(startDate)),
      where('status', '==', 'completed')
    );
    
    const snapshot = await getDocs(q);
    const orders = snapshot.docs.map(doc => doc.data());
    
    // Calculate analytics
    const totalRevenue = orders.reduce((sum, order) => sum + order.pricing.totalAmount, 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const uniqueCustomers = new Set(orders.map(order => order.userId)).size;
    
    // Group by date for charts
    const dailyData = orders.reduce((acc, order) => {
      const date = order.createdAt.toDate().toDateString();
      if (!acc[date]) {
        acc[date] = { revenue: 0, orders: 0, customers: new Set() };
      }
      acc[date].revenue += order.pricing.totalAmount;
      acc[date].orders += 1;
      acc[date].customers.add(order.userId);
      return acc;
    }, {});

    const salesData = Object.entries(dailyData).map(([date, data]: [string, any]) => ({
      period: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      revenue: data.revenue,
      orders: data.orders,
      customers: data.customers.size
    }));

    return {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      uniqueCustomers,
      salesData
    };
  } catch (error) {
    console.error('Error fetching vendor analytics:', error);
    throw error;
  }
}

// Get vendor transactions
export async function getVendorTransactions(vendorId: string, dateRange: string): Promise<any[]> {
  try {
    const now = new Date();
    let startDate: Date;
    
    switch (dateRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      where('restaurantId', '==', vendorId),
      where('createdAt', '>=', Timestamp.fromDate(startDate)),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        orderId: doc.id,
        customerName: data.userDetails?.name || 'Unknown',
        amount: data.pricing.totalAmount,
        paymentMethod: data.payment?.method || 'unknown',
        status: data.payment?.status || 'pending',
        transactionId: data.payment?.transactionId || '',
        timestamp: data.createdAt.toDate(),
        commission: data.pricing.totalAmount * 0.05, // 5% commission
        netAmount: data.pricing.totalAmount * 0.95,
        description: `Order payment for ${data.items?.length || 0} items`
      };
    });
  } catch (error) {
    console.error('Error fetching vendor transactions:', error);
    throw error;
  }
}

// Create payout request
export async function createPayoutRequest(vendorId: string, amount: number): Promise<string> {
  try {
    const payoutRef = collection(db, 'payoutRequests');
    const docRef = await addDoc(payoutRef, {
      vendorId,
      amount,
      status: 'pending',
      requestDate: Timestamp.now(),
      expectedDate: Timestamp.fromDate(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)), // 3 days
      createdAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating payout request:', error);
    throw error;
  }
}

// Get vendor payout requests
export async function getVendorPayoutRequests(vendorId: string): Promise<any[]> {
  try {
    const payoutRef = collection(db, 'payoutRequests');
    const q = query(
      payoutRef,
      where('vendorId', '==', vendorId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      requestDate: doc.data().requestDate.toDate(),
      expectedDate: doc.data().expectedDate.toDate()
    }));
  } catch (error) {
    console.error('Error fetching payout requests:', error);
    throw error;
  }
}

// Update vendor notification settings
export async function updateVendorNotificationSettings(vendorId: string, settings: any): Promise<void> {
  try {
    const vendorRef = doc(db, 'vendors', vendorId);
    await updateDoc(vendorRef, {
      notificationSettings: settings,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating notification settings:', error);
    throw error;
  }
}

// Toggle restaurant active status
export async function toggleRestaurantStatus(vendorId: string, isActive: boolean): Promise<void> {
  try {
    const vendorRef = doc(db, 'vendors', vendorId);
    await updateDoc(vendorRef, {
      isActive,
      updatedAt: Timestamp.now()
    });

    // Also update in restaurants collection if exists
    const restaurantRef = doc(db, 'restaurants', vendorId);
    const restaurantSnap = await getDoc(restaurantRef);
    if (restaurantSnap.exists()) {
      await updateDoc(restaurantRef, {
        isActive,
        updatedAt: Timestamp.now()
      });
    }
  } catch (error) {
    console.error('Error toggling restaurant status:', error);
    throw error;
  }
}

// Get top selling products for vendor
export async function getTopSellingProducts(vendorId: string, limit: number = 5): Promise<any[]> {
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      where('restaurantId', '==', vendorId),
      where('status', '==', 'completed')
    );
    
    const snapshot = await getDocs(q);
    const productSales: { [key: string]: { name: string; totalSold: number; revenue: number; category: string; isVeg: boolean } } = {};
    
    snapshot.docs.forEach(doc => {
      const order = doc.data();
      order.items?.forEach((item: any) => {
        if (!productSales[item.id]) {
          productSales[item.id] = {
            name: item.name,
            totalSold: 0,
            revenue: 0,
            category: item.category || 'Uncategorized',
            isVeg: item.isVeg || false
          };
        }
        productSales[item.id].totalSold += item.quantity;
        productSales[item.id].revenue += item.price * item.quantity;
      });
    });
    
    return Object.entries(productSales)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching top selling products:', error);
    throw error;
  }
}

// Admin Operations Functions
export async function approveVendor(vendorId: string) {
  try {
    await updateDoc(doc(db, 'users', vendorId), {
      status: 'approved',
      approvedAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    
    // Create notification for vendor
    await addDoc(collection(db, 'notifications'), {
      userId: vendorId,
      title: 'Vendor Application Approved',
      message: 'Congratulations! Your vendor application has been approved. You can now start managing your restaurant.',
      type: 'success',
      read: false,
      createdAt: Timestamp.now()
    });
    
    return true;
  } catch (error) {
    console.error('Error approving vendor:', error);
    throw error;
  }
};

export async function rejectVendor(vendorId: string, reason: string) {
  try {
    await updateDoc(doc(db, 'users', vendorId), {
      status: 'rejected',
      rejectionReason: reason,
      rejectedAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    
    // Create notification for vendor
    await addDoc(collection(db, 'notifications'), {
      userId: vendorId,
      title: 'Vendor Application Rejected',
      message: `Your vendor application has been rejected. Reason: ${reason}`,
      type: 'error',
      read: false,
      createdAt: Timestamp.now()
    });
    
    return true;
  } catch (error) {
    console.error('Error rejecting vendor:', error);
    throw error;
  }
};

export async function suspendUser(userId: string, reason: string, duration?: number) {
  try {
    const suspendUntil = duration ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000) : null;
    
    await updateDoc(doc(db, 'users', userId), {
      status: 'suspended',
      suspensionReason: reason,
      suspendedAt: Timestamp.now(),
      suspendUntil: suspendUntil ? Timestamp.fromDate(suspendUntil) : null,
      updatedAt: Timestamp.now()
    });
    
    // Create notification for user
    await addDoc(collection(db, 'notifications'), {
      userId: userId,
      title: 'Account Suspended',
      message: `Your account has been suspended. Reason: ${reason}${duration ? ` Duration: ${duration} days` : ''}`,
      type: 'warning',
      read: false,
      createdAt: Timestamp.now()
    });
    
    return true;
  } catch (error) {
    console.error('Error suspending user:', error);
    throw error;
  }
};

export async function activateUser(userId: string) {
  try {
    await updateDoc(doc(db, 'users', userId), {
      status: 'active',
      suspensionReason: null,
      suspendedAt: null,
      suspendUntil: null,
      updatedAt: Timestamp.now()
    });
    
    // Create notification for user
    await addDoc(collection(db, 'notifications'), {
      userId: userId,
      title: 'Account Reactivated',
      message: 'Your account has been reactivated. Welcome back!',
      type: 'success',
      read: false,
      createdAt: Timestamp.now()
    });
    
    return true;
  } catch (error) {
    console.error('Error activating user:', error);
    throw error;
  }
};

export async function flagMenuItem(itemId: string, reason: string, adminId: string) {
  try {
    await updateDoc(doc(db, 'menuItems', itemId), {
      flagged: true,
      flagReason: reason,
      flaggedBy: adminId,
      flaggedAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    
    return true;
  } catch (error) {
    console.error('Error flagging menu item:', error);
    throw error;
  }
};

export async function unflagMenuItem(itemId: string) {
  try {
    await updateDoc(doc(db, 'menuItems', itemId), {
      flagged: false,
      flagReason: null,
      flaggedBy: null,
      flaggedAt: null,
      updatedAt: Timestamp.now()
    });
    
    return true;
  } catch (error) {
    console.error('Error unflagging menu item:', error);
    throw error;
  }
};

export async function adminUpdateOrderStatus(orderId: string, status: string, adminId: string) {
  try {
    await updateDoc(doc(db, 'orders', orderId), {
      status: status,
      updatedBy: adminId,
      updatedAt: Timestamp.now()
    });
    
    // Get order details to notify customer
    const orderDoc = await getDoc(doc(db, 'orders', orderId));
    if (orderDoc.exists()) {
      const orderData = orderDoc.data();
      
      // Create notification for customer
      await addDoc(collection(db, 'notifications'), {
        userId: orderData.customerId,
        title: 'Order Status Updated',
        message: `Your order #${orderData.orderNumber} status has been updated to: ${status}`,
        type: 'info',
        read: false,
        createdAt: Timestamp.now()
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

export async function processPayoutRequest(payoutId: string, action: 'approve' | 'reject', adminId: string, notes?: string) {
  try {
    const status = action === 'approve' ? 'approved' : 'rejected';
    
    await updateDoc(doc(db, 'payouts', payoutId), {
      status: status,
      processedBy: adminId,
      processedAt: Timestamp.now(),
      adminNotes: notes || '',
      updatedAt: Timestamp.now()
    });
    
    // Get payout details to notify vendor
    const payoutDoc = await getDoc(doc(db, 'payouts', payoutId));
    if (payoutDoc.exists()) {
      const payoutData = payoutDoc.data();
      
      // Create notification for vendor
      await addDoc(collection(db, 'notifications'), {
        userId: payoutData.vendorId,
        title: `Payout Request ${action === 'approve' ? 'Approved' : 'Rejected'}`,
        message: `Your payout request of ₹${payoutData.amount} has been ${status}.${notes ? ` Notes: ${notes}` : ''}`,
        type: action === 'approve' ? 'success' : 'error',
        read: false,
        createdAt: Timestamp.now()
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error processing payout request:', error);
    throw error;
  }
};

export async function sendBulkNotification(notification: {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  recipients: 'all' | 'customers' | 'vendors';
  scheduledAt?: Date;
}) {
  try {
    // Get recipient user IDs based on type
    let recipientQuery;
    if (notification.recipients === 'customers') {
      recipientQuery = query(collection(db, 'users'), where('role', '==', 'customer'));
    } else if (notification.recipients === 'vendors') {
      recipientQuery = query(collection(db, 'users'), where('role', '==', 'vendor'));
    } else {
      recipientQuery = query(collection(db, 'users'), where('role', 'in', ['customer', 'vendor']));
    }
    
    const recipientSnapshot = await getDocs(recipientQuery);
    const recipients = recipientSnapshot.docs.map(doc => doc.id);
    
    // Create notification document
    const notificationData = {
      title: notification.title,
      message: notification.message,
      type: notification.type,
      recipients: notification.recipients,
      recipientIds: recipients,
      totalRecipients: recipients.length,
      readCount: 0,
      status: notification.scheduledAt ? 'scheduled' : 'sent',
      createdAt: Timestamp.now(),
      sentAt: notification.scheduledAt ? null : Timestamp.now(),
      scheduledAt: notification.scheduledAt ? Timestamp.fromDate(notification.scheduledAt) : null
    };
    
    const notificationRef = await addDoc(collection(db, 'adminNotifications'), notificationData);
    
    // If not scheduled, send immediately
    if (!notification.scheduledAt) {
      // Create individual notifications for each recipient
      const batch = writeBatch(db);
      recipients.forEach(userId => {
        const userNotificationRef = doc(collection(db, 'notifications'));
        batch.set(userNotificationRef, {
          userId: userId,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          read: false,
          createdAt: Timestamp.now(),
          adminNotificationId: notificationRef.id
        });
      });
      
      await batch.commit();
    }
    
    return notificationRef.id;
  } catch (error) {
    console.error('Error sending bulk notification:', error);
    throw error;
  }
};

export async function getAnalyticsData(dateRange: string) {
  try {
    const endDate = new Date();
    let startDate = new Date();
    
    switch (dateRange) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 7);
    }
    
    // Get orders in date range
    const ordersQuery = query(
      collection(db, 'orders'),
      where('createdAt', '>=', Timestamp.fromDate(startDate)),
      where('createdAt', '<=', Timestamp.fromDate(endDate))
    );
    
    const ordersSnapshot = await getDocs(ordersQuery);
    const orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Calculate metrics
    const totalRevenue = orders.reduce((sum, order: any) => sum + (order.totalAmount || 0), 0);
    const totalOrders = orders.length;
    
    // Get user counts
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const totalUsers = users.filter((user: any) => user.role === 'customer').length;
    const totalRestaurants = users.filter((user: any) => user.role === 'vendor' && user.status === 'approved').length;
    
    return {
      totalRevenue,
      totalOrders,
      totalUsers,
      totalRestaurants,
      orders,
      users
    };
  } catch (error) {
    console.error('Error getting analytics data:', error);
    throw error;
  }
};

export async function getAllUsers(role?: string, status?: string) {
  try {
    let userQuery: any = collection(db, 'users');
    const constraints = [];
    
    if (role) {
      constraints.push(where('role', '==', role));
    }
    if (status) {
      constraints.push(where('status', '==', status));
    }
    
    if (constraints.length > 0) {
      userQuery = query(userQuery, ...constraints);
    }
    
    const snapshot = await getDocs(userQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting users:', error);
    throw error;
  }
};

export async function getAllOrders(status?: string) {
  try {
    let orderQuery: any = collection(db, 'orders');
    
    if (status && status !== 'all') {
      orderQuery = query(orderQuery, where('status', '==', status));
    }
    
    const snapshot = await getDocs(orderQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting orders:', error);
    throw error;
  }
};

export async function getAllPayouts(status?: string) {
  try {
    let payoutQuery: any = collection(db, 'payouts');
    
    if (status && status !== 'all') {
      payoutQuery = query(payoutQuery, where('status', '==', status));
    }
    
    const snapshot = await getDocs(payoutQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting payouts:', error);
    throw error;
  }
};

export async function getRestaurants(status?: string) {
  try {
    let restaurantQuery: any = collection(db, 'restaurants');
    
    if (status && status !== 'all') {
      restaurantQuery = query(restaurantQuery, where('status', '==', status));
    }
    
    const snapshot = await getDocs(restaurantQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting restaurants:', error);
    throw error;
  }
};

export async function getMenuItems(restaurantId?: string, flagged?: boolean) {
  try {
    let menuQuery: any = collection(db, 'menuItems');
    const constraints = [];
    
    if (restaurantId) {
      constraints.push(where('restaurantId', '==', restaurantId));
    }
    if (flagged !== undefined) {
      constraints.push(where('flagged', '==', flagged));
    }
    
    if (constraints.length > 0) {
      menuQuery = query(menuQuery, ...constraints);
    }
    
    const snapshot = await getDocs(menuQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting menu items:', error);
    throw error;
  }
};

export async function updatePlatformSettings(settings: any) {
  try {
    await setDoc(doc(db, 'settings', 'platform'), {
      ...settings,
      updatedAt: Timestamp.now()
    });
    
    return true;
  } catch (error) {
    console.error('Error updating platform settings:', error);
    throw error;
  }
};

export async function getPlatformSettings() {
  try {
    const settingsDoc = await getDoc(doc(db, 'settings', 'platform'));
    if (settingsDoc.exists()) {
      return settingsDoc.data();
    }
    return null;
  } catch (error) {
    console.error('Error getting platform settings:', error);
    throw error;
  }
}

// Add missing vendor management functions
export async function getAllVendors(status?: string) {
  try {
    let vendorQuery: any = collection(db, 'users');
    const constraints = [where('role', '==', 'vendor')];
    
    if (status && status !== 'all') {
      constraints.push(where('status', '==', status));
    }
    
    vendorQuery = query(vendorQuery, ...constraints, orderBy('createdAt', 'desc'));
    
    const snapshot = await getDocs(vendorQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting vendors:', error);
    throw error;
  }
}

export async function activateVendor(vendorId: string) {
  try {
    await updateDoc(doc(db, 'users', vendorId), {
      status: 'active',
      suspensionReason: null,
      suspendedAt: null,
      suspendUntil: null,
      updatedAt: Timestamp.now()
    });
    
    // Create notification for vendor
    await addDoc(collection(db, 'notifications'), {
      userId: vendorId,
      title: 'Account Activated',
      message: 'Your vendor account has been activated. You can now start receiving orders!',
      type: 'success',
      read: false,
      createdAt: Timestamp.now()
    });
    
    return true;
  } catch (error) {
    console.error('Error activating vendor:', error);
    throw error;
  }
};

export async function suspendVendor(vendorId: string, reason: string, duration?: number) {
  try {
    const suspendUntil = duration ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000) : null;
    
    await updateDoc(doc(db, 'users', vendorId), {
      status: 'suspended',
      suspensionReason: reason,
      suspendedAt: Timestamp.now(),
      suspendUntil: suspendUntil ? Timestamp.fromDate(suspendUntil) : null,
      updatedAt: Timestamp.now()
    });
    
    // Create notification for vendor
    await addDoc(collection(db, 'notifications'), {
      userId: vendorId,
      title: 'Account Suspended',
      message: `Your vendor account has been suspended. Reason: ${reason}${duration ? ` Duration: ${duration} days` : ''}`,
      type: 'warning',
      read: false,
      createdAt: Timestamp.now()
    });
    
    return true;
  } catch (error) {
    console.error('Error suspending vendor:', error);
    throw error;
  }
}

export async function updateVendorCommission(vendorId: string, commissionRate: number) {
  try {
    await updateDoc(doc(db, 'users', vendorId), {
      commissionRate: commissionRate,
      updatedAt: Timestamp.now()
    });
    
    // Also update in vendors collection if it exists
    const vendorRef = doc(db, 'vendors', vendorId);
    const vendorDoc = await getDoc(vendorRef);
    if (vendorDoc.exists()) {
      await updateDoc(vendorRef, {
        commissionRate: commissionRate,
        updatedAt: Timestamp.now()
      });
    }
    
    // Create notification for vendor
    await addDoc(collection(db, 'notifications'), {
      userId: vendorId,
      title: 'Commission Rate Updated',
      message: `Your commission rate has been updated to ${commissionRate}%.`,
      type: 'info',
      read: false,
      createdAt: Timestamp.now()
    });
    
    return true;
  } catch (error) {
    console.error('Error updating vendor commission:', error);
    throw error;
  }
}

export async function getVendorStats(vendorId: string) {
  try {
    // Get vendor orders
    const ordersQuery = query(
      collection(db, 'orders'),
      where('vendorId', '==', vendorId)
    );
    
    const ordersSnapshot = await getDocs(ordersQuery);
    const orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Calculate stats
    const totalOrders = orders.length;
    const completedOrders = orders.filter((order: any) => order.status === 'completed').length;
    const totalRevenue = orders
      .filter((order: any) => order.status === 'completed')
      .reduce((sum, order: any) => sum + (order.totalAmount || 0), 0);
    
    // Get average rating
    const reviewsQuery = query(
      collection(db, 'reviews'),
      where('vendorId', '==', vendorId)
    );
    const reviewsSnapshot = await getDocs(reviewsQuery);
    const reviews = reviewsSnapshot.docs.map(doc => doc.data());
    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum: number, review: any) => sum + (review.rating || 0), 0) / reviews.length 
      : 0;
    
    // Get menu items count
    const menuItemsQuery = query(
      collection(db, 'menuItems'),
      where('vendorId', '==', vendorId)
    );
    const menuItemsSnapshot = await getDocs(menuItemsQuery);
    const totalMenuItems = menuItemsSnapshot.size;
    
    return {
      totalOrders,
      completedOrders,
      totalRevenue,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: reviews.length,
      totalMenuItems,
      completionRate: totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0
    };
  } catch (error) {
    console.error('Error getting vendor stats:', error);
    throw error;
  }
}