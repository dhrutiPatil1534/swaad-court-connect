{{ ... }}
import { useAuth } from '@/context/auth-context';
import { createVendorCredentials } from '@/lib/firebase';
{{ ... }}
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isCreatingCredentials, setIsCreatingCredentials] = useState(false);

  const handleCreateVendorCredentials = async () => {
    setIsCreatingCredentials(true);
    try {
      const result = await createVendorCredentials();
      
      console.log('✅ VENDOR CREDENTIAL CREATION RESULTS:');
      console.log('='.repeat(50));
      
      if (result.results.length > 0) {
        console.log('🎉 SUCCESSFULLY CREATED VENDOR CREDENTIALS:');
        result.results.forEach((cred, index) => {
          console.log(`${index + 1}. ${cred.businessName}`);
          console.log(`   📧 Email: ${cred.email}`);
          console.log(`   🔐 Password: ${cred.password}`);
          console.log(`   🆔 User ID: ${cred.uid}`);
          console.log(`   🏪 Restaurant ID: ${cred.restaurantId}`);
          console.log('   ' + '-'.repeat(40));
        });
        
        alert(`✅ Created ${result.results.length} vendor credentials! Check console for details.`);
      }
      
      if (result.errors.length > 0) {
        console.log('❌ ERRORS ENCOUNTERED:');
        result.errors.forEach((error, index) => {
          console.log(`${index + 1}. ${error.businessName}`);
          console.log(`   📧 ${error.email}`);
          console.log(`   ❌ Error: ${error.error}`);
        });
        
        alert(`⚠️ Some credentials already exist. Check console for details.`);
      }
    } catch (error) {
      console.error('💥 Failed to create vendor credentials:', error);
      alert('❌ Failed to create vendor credentials. Check console for details.');
    } finally {
      setIsCreatingCredentials(false);
    }
  };
{{ ... }}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.name || 'Admin'}</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleCreateVendorCredentials}
              disabled={isCreatingCredentials}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isCreatingCredentials ? 'Creating...' : '🏪 Create Vendor Credentials'}
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export Data
            </Button>
          </div>
        </div>
{{ ... }}
