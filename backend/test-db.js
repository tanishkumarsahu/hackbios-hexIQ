require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Test Supabase connection
async function testConnection() {
  try {
    console.log('🔄 Testing Supabase connection...');
    console.log('URL:', process.env.SUPABASE_URL);
    console.log('Anon Key:', process.env.SUPABASE_ANON_KEY ? 'Present' : 'Missing');
    console.log('Service Role Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Present' : 'Missing');
    
    // Create Supabase client
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    // Test connection with a simple query
    const { data, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('⚠️  Users table does not exist yet. Please run the schema.sql first.');
        console.log('✅ But Supabase connection is working!');
        return true;
      } else {
        console.error('❌ Database error:', error);
        return false;
      }
    }
    
    console.log('✅ Supabase connection successful!');
    console.log('📊 Query result:', data);
    return true;
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    return false;
  }
}

// Run the test
testConnection()
  .then((success) => {
    if (success) {
      console.log('\n🎉 Database connection test completed successfully!');
    } else {
      console.log('\n💥 Database connection test failed!');
    }
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  });
