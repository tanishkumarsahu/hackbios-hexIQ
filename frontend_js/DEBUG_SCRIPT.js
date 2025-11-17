// 🔍 OAUTH DEBUG SCRIPT - Run this in browser console
// Copy and paste this entire script into your browser console on the login page

console.log('🔍 Starting OAuth Debug Analysis...');

// 1. Environment Check
console.log('=== ENVIRONMENT CHECK ===');
console.log('Current URL:', window.location.href);
console.log('Protocol:', window.location.protocol);
console.log('Hostname:', window.location.hostname);
console.log('Port:', window.location.port);
console.log('Pathname:', window.location.pathname);

// Check if using localhost
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
console.log('Using localhost:', isLocalhost ? '✅ YES' : '❌ NO - This may cause OAuth issues');

if (!isLocalhost) {
  console.error('⚠️  ISSUE: Not using localhost. Google OAuth may fail.');
  console.log('💡 SOLUTION: Use http://localhost:3001 instead of IP address');
}

// 2. URL Parameters Check (if on callback page)
if (window.location.pathname.includes('/auth/callback')) {
  console.log('=== CALLBACK PAGE ANALYSIS ===');
  const urlParams = new URLSearchParams(window.location.search);
  const allParams = Object.fromEntries(urlParams.entries());
  
  console.log('URL Parameters:', allParams);
  
  // Check for OAuth code
  const code = urlParams.get('code');
  if (code) {
    console.log('✅ OAuth code found:', code.substring(0, 10) + '...');
  } else {
    console.error('❌ No OAuth code found in URL');
    console.log('💡 This means Google didn\'t redirect back with auth code');
  }
  
  // Check for errors
  const error = urlParams.get('error');
  if (error) {
    console.error('❌ OAuth error:', error);
    console.error('Error description:', urlParams.get('error_description'));
  }
}

// 3. Environment Variables Check
console.log('=== ENVIRONMENT VARIABLES ===');
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ SET' : '❌ MISSING');
console.log('Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ SET' : '❌ MISSING');

if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.log('Supabase URL value:', process.env.NEXT_PUBLIC_SUPABASE_URL);
} else {
  console.error('⚠️  ISSUE: NEXT_PUBLIC_SUPABASE_URL not found');
}

// 4. Local Storage Check
console.log('=== LOCAL STORAGE CHECK ===');
const authKeys = Object.keys(localStorage).filter(key => key.includes('auth') || key.includes('supabase'));
console.log('Auth-related localStorage keys:', authKeys);

authKeys.forEach(key => {
  const value = localStorage.getItem(key);
  console.log(`${key}:`, value ? 'HAS_VALUE' : 'EMPTY');
});

// 5. Network Check
console.log('=== NETWORK CHECK ===');
console.log('Online status:', navigator.onLine ? '✅ ONLINE' : '❌ OFFLINE');

// 6. Supabase Client Check (if available)
if (typeof window.supabase !== 'undefined') {
  console.log('=== SUPABASE CLIENT CHECK ===');
  console.log('Supabase client available:', '✅ YES');
  
  // Test session
  window.supabase.auth.getSession().then(({ data, error }) => {
    if (error) {
      console.error('Supabase session error:', error);
    } else {
      console.log('Current session:', data.session ? '✅ AUTHENTICATED' : '❌ NOT AUTHENTICATED');
      if (data.session) {
        console.log('User email:', data.session.user?.email);
        console.log('Session expires:', new Date(data.session.expires_at * 1000));
      }
    }
  });
} else {
  console.log('Supabase client:', '❌ NOT AVAILABLE');
}

// 7. Google OAuth Configuration Check
console.log('=== GOOGLE OAUTH CONFIGURATION ===');
console.log('Expected redirect URLs in Google Console:');
console.log('1. https://vxuvfignecxtqsvhihzn.supabase.co/auth/v1/callback (REQUIRED)');
console.log('2. Remove any localhost URLs from Google Console');

// 8. Common Issues & Solutions
console.log('=== COMMON ISSUES & SOLUTIONS ===');
console.log('');
console.log('❌ "No authentication code received"');
console.log('   → Check Google Cloud Console redirect URLs');
console.log('   → Ensure only Supabase callback URL is configured');
console.log('');
console.log('❌ "HTTPS required" error');
console.log('   → Use http://localhost:3001 (not IP address)');
console.log('');
console.log('❌ "Invalid redirect URI"');
console.log('   → Verify Google OAuth client configuration');
console.log('');
console.log('❌ "Popup blocked"');
console.log('   → Allow popups for localhost in browser');

// 9. Quick Test Function
window.testOAuth = function() {
  console.log('🧪 Testing OAuth configuration...');
  
  // Test redirect URL construction
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  const port = window.location.port;
  const redirectUrl = `${protocol}//${hostname}${port ? `:${port}` : ''}/auth/callback`;
  
  console.log('Constructed redirect URL:', redirectUrl);
  console.log('Should be using Supabase callback instead:', 'https://vxuvfignecxtqsvhihzn.supabase.co/auth/v1/callback');
  
  return {
    currentUrl: window.location.href,
    redirectUrl,
    isLocalhost,
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    recommendations: [
      isLocalhost ? '✅ Using localhost' : '❌ Switch to localhost',
      process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Supabase URL set' : '❌ Set Supabase URL'
    ]
  };
};

console.log('');
console.log('🎯 Debug complete! Run testOAuth() for quick test.');
console.log('📋 Summary of findings above ⬆️');
console.log('');

// Auto-run test
const testResult = window.testOAuth();
console.log('Test result:', testResult);
