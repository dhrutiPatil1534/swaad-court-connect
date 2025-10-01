// Debug script to view all vendor information
// Run this in your browser console on the admin panel page

async function showAllVendors() {
  try {
    console.log('🔍 Fetching all vendors...');
    
    // This assumes you have Firebase initialized in your app
    const { collection, query, where, getDocs, getFirestore } = window.firebase?.firestore || {};
    
    if (!getFirestore) {
      console.error('❌ Firebase not available. Make sure you\'re on the admin panel page.');
      return;
    }
    
    const db = getFirestore();
    const vendorsQuery = query(
      collection(db, 'users'),
      where('role', '==', 'vendor')
    );
    
    const snapshot = await getDocs(vendorsQuery);
    const vendors = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      vendors.push({
        id: doc.id,
        email: data.email,
        name: data.name || data.displayName,
        status: data.status,
        createdAt: data.createdAt?.toDate?.() || 'Unknown',
        phone: data.phone,
        businessName: data.businessName
      });
    });
    
    console.log(`📊 Found ${vendors.length} vendors:`);
    console.table(vendors);
    
    // Also show just emails for easy copy-paste
    console.log('\n📧 Vendor Emails (for password reset):');
    vendors.forEach((vendor, index) => {
      console.log(`${index + 1}. ${vendor.email} - ${vendor.name || 'No name'} (${vendor.status || 'unknown status'})`);
    });
    
    return vendors;
    
  } catch (error) {
    console.error('❌ Error fetching vendors:', error);
    console.log('💡 Make sure you\'re logged in as admin and Firebase is loaded.');
  }
}

// Auto-run the function
showAllVendors();

console.log(`
🚀 VENDOR DEBUG SCRIPT LOADED
================================

To run again, type: showAllVendors()

To help a vendor reset password:
1. Copy their email from the list above
2. Go to Admin Panel > Password Reset
3. Enter their email and select "Vendor"
4. Click "Send Reset Email"

⚠️  SECURITY NOTE: 
Passwords are encrypted by Firebase - you cannot see them.
This is GOOD for security! Use password reset instead.
`);