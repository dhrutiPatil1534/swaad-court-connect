import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Get vendor information for password reset
 */
export async function getVendorInfoForPasswordReset(email: string) {
  try {
    console.log('getVendorInfoForPasswordReset: Looking up vendor with email:', email);
    
    // Query users collection for vendor with this email
    const usersQuery = query(
      collection(db, 'users'),
      where('email', '==', email),
      where('role', '==', 'vendor')
    );
    
    const usersSnapshot = await getDocs(usersQuery);
    
    if (usersSnapshot.empty) {
      console.log('getVendorInfoForPasswordReset: No vendor found with email:', email);
      return null;
    }
    
    const vendorDoc = usersSnapshot.docs[0];
    const vendorData = vendorDoc.data();
    
    console.log('getVendorInfoForPasswordReset: Found vendor:', vendorData.businessName);
    
    return {
      id: vendorDoc.id,
      email: vendorData.email,
      businessName: vendorData.businessName || vendorData.name,
      phone: vendorData.phone,
      status: vendorData.status || 'active'
    };
  } catch (error) {
    console.error('Error getting vendor info for password reset:', error);
    throw error;
  }
}