/**
 * Vendor Dashboard Diagnostics
 * 
 * This utility helps diagnose issues with the vendor dashboard
 * Run this in the browser console to check the setup
 */

import { getFirestore, collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export async function runVendorDiagnostics() {
  console.log('🔍 Starting Vendor Dashboard Diagnostics...\n');
  
  const auth = getAuth();
  const db = getFirestore();
  const user = auth.currentUser;
  
  // Check 1: User Authentication
  console.log('1️⃣ Checking User Authentication...');
  if (!user) {
    console.error('❌ No user logged in');
    return;
  }
  console.log('✅ User logged in:', user.uid);
  console.log('   Email:', user.email);
  
  // Check 2: User Profile
  console.log('\n2️⃣ Checking User Profile...');
  try {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      console.error('❌ User profile not found in Firestore');
      return;
    }
    
    const userData = userSnap.data();
    console.log('✅ User profile found');
    console.log('   Role:', userData.role);
    console.log('   Business Name:', userData.businessName);
    console.log('   Restaurant ID:', userData.restaurantId || 'NOT SET');
    
    if (userData.role !== 'vendor') {
      console.error('❌ User is not a vendor. Role:', userData.role);
      return;
    }
    
    if (!userData.restaurantId) {
      console.warn('⚠️  No restaurantId linked to vendor');
      console.log('   The system will try to auto-link a restaurant on first load');
    }
    
    // Check 3: Restaurant Data
    if (userData.restaurantId) {
      console.log('\n3️⃣ Checking Restaurant Data...');
      const restaurantRef = doc(db, 'restaurants', userData.restaurantId);
      const restaurantSnap = await getDoc(restaurantRef);
      
      if (!restaurantSnap.exists()) {
        console.error('❌ Restaurant not found:', userData.restaurantId);
      } else {
        const restaurantData = restaurantSnap.data();
        console.log('✅ Restaurant found');
        console.log('   Name:', restaurantData.name);
        console.log('   Rating:', restaurantData.rating);
        console.log('   Is Open:', restaurantData.isOpen);
      }
      
      // Check 4: Orders
      console.log('\n4️⃣ Checking Orders...');
      const ordersQuery = query(
        collection(db, 'orders'),
        where('restaurantId', '==', userData.restaurantId)
      );
      
      const ordersSnapshot = await getDocs(ordersQuery);
      console.log('✅ Orders found:', ordersSnapshot.docs.length);
      
      if (ordersSnapshot.docs.length === 0) {
        console.warn('⚠️  No orders found for this restaurant');
        console.log('   Create test orders with restaurantId:', userData.restaurantId);
      } else {
        // Show order breakdown
        const orders = ordersSnapshot.docs.map(doc => doc.data());
        const statusCounts: Record<string, number> = {};
        
        orders.forEach(order => {
          const status = order.status || 'unknown';
          statusCounts[status] = (statusCounts[status] || 0) + 1;
        });
        
        console.log('   Order Status Breakdown:');
        Object.entries(statusCounts).forEach(([status, count]) => {
          console.log(`   - ${status}: ${count}`);
        });
        
        // Show sample order
        const sampleOrder = orders[0];
        console.log('\n   Sample Order:');
        console.log('   - ID:', ordersSnapshot.docs[0].id);
        console.log('   - Status:', sampleOrder.status);
        console.log('   - Total:', sampleOrder.pricing?.totalAmount || sampleOrder.totalAmount);
        console.log('   - Customer:', sampleOrder.userDetails?.name || 'Unknown');
        console.log('   - Created:', sampleOrder.createdAt?.toDate?.() || sampleOrder.createdAt);
      }
    }
    
    // Check 5: Available Restaurants (if no restaurant linked)
    if (!userData.restaurantId) {
      console.log('\n3️⃣ Checking Available Restaurants...');
      const availableQuery = query(
        collection(db, 'restaurants'),
        where('vendorId', '==', null)
      );
      
      const availableSnapshot = await getDocs(availableQuery);
      console.log('✅ Available restaurants:', availableSnapshot.docs.length);
      
      if (availableSnapshot.docs.length === 0) {
        console.error('❌ No available restaurants to link');
        console.log('   You need to create a restaurant in Firestore first');
      } else {
        console.log('   Available restaurants:');
        availableSnapshot.docs.forEach(doc => {
          const data = doc.data();
          console.log(`   - ${doc.id}: ${data.name}`);
        });
      }
    }
    
    // Summary
    console.log('\n📊 Diagnostic Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('User UID:', user.uid);
    console.log('User Role:', userData.role);
    console.log('Business Name:', userData.businessName);
    console.log('Restaurant ID:', userData.restaurantId || 'NOT SET');
    
    if (userData.restaurantId) {
      const ordersQuery = query(
        collection(db, 'orders'),
        where('restaurantId', '==', userData.restaurantId)
      );
      const ordersSnapshot = await getDocs(ordersQuery);
      console.log('Total Orders:', ordersSnapshot.docs.length);
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (userData.restaurantId) {
      console.log('\n✅ Setup looks good! Dashboard should work.');
    } else {
      console.log('\n⚠️  Restaurant not linked. Dashboard will try to auto-link on load.');
    }
    
  } catch (error) {
    console.error('❌ Error during diagnostics:', error);
  }
}

// Helper function to create a test order
export async function createTestOrder(restaurantId: string, userId: string = 'test-customer') {
  const db = getFirestore();
  
  try {
    const testOrder = {
      restaurantId: restaurantId,
      userId: userId,
      userDetails: {
        name: 'Test Customer',
        phone: '+1234567890',
        email: 'test@example.com'
      },
      items: [
        {
          id: 'item-1',
          name: 'Test Item 1',
          quantity: 2,
          price: 100
        },
        {
          id: 'item-2',
          name: 'Test Item 2',
          quantity: 1,
          price: 150
        }
      ],
      pricing: {
        subtotal: 350,
        tax: 35,
        deliveryFee: 0,
        totalAmount: 385
      },
      status: 'pending',
      paymentStatus: 'completed',
      orderType: 'dine-in',
      tableNumber: '5',
      specialInstructions: 'Test order - please ignore',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const docRef = await getDocs(collection(db, 'orders'));
    console.log('✅ Test order created successfully');
    console.log('   Order ID:', docRef.docs[0]?.id);
    
    return docRef.docs[0]?.id;
  } catch (error) {
    console.error('❌ Error creating test order:', error);
    throw error;
  }
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).runVendorDiagnostics = runVendorDiagnostics;
  (window as any).createTestOrder = createTestOrder;
  
  console.log('🔧 Vendor Diagnostics loaded!');
  console.log('   Run: runVendorDiagnostics()');
  console.log('   Create test order: createTestOrder("your-restaurant-id")');
}