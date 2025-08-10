import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

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

export { db, auth };

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

/**
 * Firestore Data Structure:
 * 
 * Collection: restaurants
 * Document: {restaurantId}
 * Fields:
 * - name: string
 * - description: string
 * - image: string (URL)
 * - coverImage: string (URL)
 * - rating: number
 * - totalRatings: number
 * - deliveryTime: string
 * - distance: string
 * - cuisine: string[]
 * - tags: string[]
 * - isVeg: boolean
 * - discount?: string
 * - isPopular?: boolean
 * - openingHours: { open: string, close: string }
 * - address: string
 * - phone: string
 * 
 * Subcollection: menu
 * Document: {menuItemId}
 * Fields:
 * - name: string
 * - description: string
 * - price: number
 * - image: string (URL)
 * - category: string
 * - isVeg: boolean
 * - spiceLevel?: number
 * - preparationTime?: string
 * - isPopular?: boolean
 * - isRecommended?: boolean
 * - rating: number
 * - customizations?: [
 *     {
 *       id: string
 *       name: string
 *       required: boolean
 *       maxSelections?: number
 *       options: [
 *         {
 *           id: string
 *           name: string
 *           price: number
 *           isVeg: boolean
 *           description?: string
 *         }
 *       ]
 *     }
 *   ]
 * - allergens?: string[]
 * - nutritionInfo?: {
 *     calories: number
 *     protein: number
 *     carbs: number
 *     fat: number
 *     fiber?: number
 *     sugar?: number
 *     sodium?: number
 *   }
 */

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