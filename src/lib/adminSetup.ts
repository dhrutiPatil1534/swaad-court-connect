import { createAdminAccount } from './firebase';

export const initializeAdminAccount = async () => {
  try {
    console.log('Creating admin account...');
    const adminUser = await createAdminAccount();
    console.log('Admin account created successfully:', adminUser.email);
    return adminUser;
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('Admin account already exists');
      return null;
    }
    console.error('Failed to create admin account:', error);
    throw error;
  }
};

// Call this function once to set up the admin account
// You can run this in the browser console or create a temporary component
export const setupAdmin = () => {
  initializeAdminAccount()
    .then(() => {
      console.log('✅ Admin setup completed');
      console.log('📧 Email: admin@swaadcourtconnect.com');
      console.log('🔑 Password: Admin@123456');
    })
    .catch((error) => {
      console.error('❌ Admin setup failed:', error);
    });
};
