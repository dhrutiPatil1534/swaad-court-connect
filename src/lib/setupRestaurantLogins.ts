import { createLoginCredentialsForRestaurants, getRestaurantLoginCredentials } from './firebase';

// Function to create login credentials for all existing restaurants
export async function setupRestaurantLogins() {
  console.log('🏪 Creating login credentials for existing restaurants...\n');
  
  try {
    const result = await createLoginCredentialsForRestaurants();
    
    console.log('✅ Restaurant Login Creation Results:\n');
    console.log('='.repeat(70));
    
    if (result.createdCredentials.length > 0) {
      console.log('🎉 SUCCESSFULLY CREATED LOGIN CREDENTIALS:\n');
      
      result.createdCredentials.forEach((cred, index) => {
        console.log(`${index + 1}. ${cred.restaurantName}`);
        console.log(`   👤 Owner: ${cred.ownerName}`);
        console.log(`   📧 Email: ${cred.email}`);
        console.log(`   🔐 Password: ${cred.password}`);
        console.log(`   🆔 Restaurant ID: ${cred.restaurantId}`);
        console.log(`   🍽️ Cuisine: ${Array.isArray(cred.cuisine) ? cred.cuisine.join(', ') : cred.cuisine}`);
        console.log('   ' + '-'.repeat(50));
      });
      
      console.log('\n📋 QUICK REFERENCE - RESTAURANT LOGIN CREDENTIALS:');
      console.log('='.repeat(70));
      result.createdCredentials.forEach((cred, index) => {
        console.log(`${index + 1}. ${cred.restaurantName}`);
        console.log(`   📧 ${cred.email}`);
        console.log(`   🔐 ${cred.password}`);
        console.log('');
      });
    }
    
    if (result.errors.length > 0) {
      console.log('❌ ERRORS ENCOUNTERED:\n');
      result.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.restaurantName}`);
        console.log(`   📧 ${error.email}`);
        console.log(`   ❌ Error: ${error.error}`);
        console.log('');
      });
    }
    
    console.log('='.repeat(70));
    console.log(`📊 SUMMARY:`);
    console.log(`   🏪 Total Restaurants Found: ${result.totalRestaurants}`);
    console.log(`   ✅ Login Credentials Created: ${result.createdCredentials.length}`);
    console.log(`   ❌ Failed: ${result.errors.length}`);
    console.log('='.repeat(70));
    
    return result;
    
  } catch (error) {
    console.error('💥 Failed to create restaurant login credentials:', error);
    throw error;
  }
}

// Function to display existing restaurant credentials
export async function displayExistingCredentials() {
  console.log('🔍 Fetching existing restaurant login credentials...\n');
  
  try {
    const credentials = await getRestaurantLoginCredentials();
    
    if (credentials.length === 0) {
      console.log('❌ No restaurant login credentials found.');
      console.log('💡 Run setupRestaurantLogins() first to create credentials.');
      return;
    }
    
    console.log('🏪 EXISTING RESTAURANT LOGIN CREDENTIALS');
    console.log('='.repeat(70));
    
    credentials.forEach((cred, index) => {
      console.log(`${index + 1}. ${cred.restaurantName}`);
      console.log(`   👤 Owner: ${cred.ownerName}`);
      console.log(`   📧 Email: ${cred.email}`);
      console.log(`   🍽️ Cuisine: ${cred.cuisine}`);
      console.log(`   ⭐ Rating: ${cred.rating}`);
      console.log(`   📊 Status: ${cred.status}`);
      console.log('   ' + '-'.repeat(50));
    });
    
    console.log('\n💡 USAGE INSTRUCTIONS:');
    console.log('1. Go to your login page');
    console.log('2. Select "Vendor" tab');
    console.log('3. Use any restaurant email with the generated password');
    console.log('4. Access vendor dashboard to manage restaurant orders');
    console.log('='.repeat(70));
    
    return credentials;
    
  } catch (error) {
    console.error('💥 Failed to fetch existing credentials:', error);
    throw error;
  }
}

// Quick function to run both setup and display
export async function setupAndDisplayRestaurantLogins() {
  try {
    // First, create login credentials for existing restaurants
    const setupResult = await setupRestaurantLogins();
    
    // Then display all existing credentials
    console.log('\n🔄 Fetching updated credentials list...\n');
    await displayExistingCredentials();
    
    return setupResult;
  } catch (error) {
    console.error('Error in setup and display process:', error);
    throw error;
  }
}
