import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc, setDoc, query, where, onSnapshot, orderBy, updateDoc, addDoc, Timestamp, increment } from 'firebase/firestore';
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
export const initializeRecaptcha = (containerId: string = 'recaptcha-container'): RecaptchaVerifier => {
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
export const getRecaptchaVerifier = (): RecaptchaVerifier => {
  if (!recaptchaVerifier) {
    return initializeRecaptcha();
  }
  return recaptchaVerifier;
};

// Clear reCAPTCHA verifier
export const clearRecaptchaVerifier = (): void => {
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
export const sendOTP = async (phoneNumber: string, retryCount: number = 0): Promise<ConfirmationResult> => {
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

export const verifyOTP = async (confirmationResult: ConfirmationResult, otp: string): Promise<FirebaseUser> => {
  try {
    const result = await confirmationResult.confirm(otp);
    return result.user;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
};

// Email/Password Authentication Functions
export const signInWithEmail = async (email: string, password: string): Promise<FirebaseUser> => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error('Error signing in with email:', error);
    throw error;
  }
};

export const signUpWithEmail = async (email: string, password: string): Promise<FirebaseUser> => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error('Error signing up with email:', error);
    throw error;
  }
};

// User Profile Management
export const createUserProfile = async (user: FirebaseUser, additionalData: Partial<UserProfile>): Promise<void> => {
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

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
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

export const checkAdminCredentials = async (email: string): Promise<boolean> => {
  const adminsRef = collection(db, 'admins');
  const q = query(adminsRef, where('email', '==', email));
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
};

// Order Management Functions
export const createOrder = async (orderData: Partial<Order>): Promise<string> => {
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
      estimatedReady: Timestamp.now().toDate().getTime() + 25 * 60000,
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
    createdBy: orderData.userId || '',
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

export const getUserOrders = (userId: string, callback: (orders: Order[]) => void): (() => void) => {
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

export const updateOrderStatus = async (userId: string, orderId: string, status: OrderStatus): Promise<void> => {
  try {
    const orderRef = doc(db, `users/${userId}/orders`, orderId);
    await updateDoc(orderRef, {
      status,
      updatedAt: Timestamp.now()
    });
    
    if (status === 'Completed') {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userProfile = userSnap.data() as UserProfile;
        await updateDoc(userRef, {
          totalOrders: userProfile.totalOrders + 1,
          totalSpent: userProfile.totalSpent + (await getOrderTotal(orderId)),
          updatedAt: Timestamp.now()
        });
      }
    }
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

// Profile Management Functions
export const updateUserProfile = async (userId: string, profileData: Partial<UserProfile>): Promise<void> => {
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
export const uploadProfilePicture = async (userId: string, file: File): Promise<string> => {
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

export const deleteProfilePicture = async (userId: string, pictureUrl: string): Promise<void> => {
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
export const getOngoingOrders = (orders: Order[]): Order[] => {
  const ongoingStatuses: OrderStatus[] = ['Placed', 'Confirmed', 'Preparing', 'Ready to Serve', 'Served'];
  return orders.filter(order => ongoingStatuses.includes(order.status));
};

export const getPastOrders = (orders: Order[]): Order[] => {
  const pastStatuses: OrderStatus[] = ['Completed', 'Cancelled'];
  return orders.filter(order => pastStatuses.includes(order.status));
};

export const getOrderStatusColor = (status: OrderStatus): string => {
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
export const createSampleOrders = async (userId: string): Promise<void> => {
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
export const updateUserOrderStats = async (userId: string, totalAmount: number, loyaltyPointsEarned: number): Promise<void> => {
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
export const getOrderTotal = async (orderId: string): Promise<number> => {
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