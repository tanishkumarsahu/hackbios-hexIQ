const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase configuration. Please check your environment variables.');
}

// Create Supabase client for server-side operations (with service role key)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Create Supabase client for client-side operations (with anon key)
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Database connection test
const testConnection = async () => {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = table doesn't exist
      throw error;
    }
    
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    if (error.message && error.message.includes('count(*)')) {
      console.log('✅ Supabase connection successful (table may not exist yet)');
      return true;
    }
    console.error('❌ Supabase connection failed:', error.message);
    return false;
  }
};

module.exports = {
  supabaseAdmin,
  supabaseClient,
  testConnection
};
