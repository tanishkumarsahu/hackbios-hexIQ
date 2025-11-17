// OAuth Debug Utility - Pinpoints exact issues in Google Sign-In flow

export class OAuthDebugger {
  constructor() {
    this.logs = [];
    this.errors = [];
    this.startTime = Date.now();
  }

  log(message, data = null) {
    const timestamp = Date.now() - this.startTime;
    const logEntry = {
      timestamp,
      message,
      data,
      time: new Date().toISOString()
    };
    this.logs.push(logEntry);
    console.log(`[OAuth Debug ${timestamp}ms]`, message, data || '');
  }

  error(message, error = null) {
    const timestamp = Date.now() - this.startTime;
    const errorEntry = {
      timestamp,
      message,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : null,
      time: new Date().toISOString()
    };
    this.errors.push(errorEntry);
    console.error(`[OAuth Error ${timestamp}ms]`, message, error || '');
  }

  // Check environment configuration
  checkEnvironment() {
    this.log('=== ENVIRONMENT CHECK ===');
    
    const env = {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING',
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
      nodeEnv: process.env.NODE_ENV,
      currentUrl: typeof window !== 'undefined' ? window.location.href : 'SERVER_SIDE'
    };

    this.log('Environment Variables', env);

    // Validate Supabase URL
    if (!env.supabaseUrl) {
      this.error('NEXT_PUBLIC_SUPABASE_URL is missing');
      return false;
    }

    if (!env.supabaseUrl.includes('supabase.co')) {
      this.error('Invalid Supabase URL format', { url: env.supabaseUrl });
      return false;
    }

    // Validate current URL
    if (typeof window !== 'undefined') {
      const currentUrl = window.location;
      this.log('Current URL Details', {
        protocol: currentUrl.protocol,
        hostname: currentUrl.hostname,
        port: currentUrl.port,
        pathname: currentUrl.pathname,
        search: currentUrl.search,
        hash: currentUrl.hash
      });

      // Check if using localhost vs IP
      if (currentUrl.hostname !== 'localhost' && currentUrl.hostname !== '127.0.0.1') {
        this.error('Not using localhost - this may cause OAuth issues', {
          hostname: currentUrl.hostname,
          recommendation: 'Use http://localhost:3001 instead'
        });
      }
    }

    return true;
  }

  // Check Supabase client configuration
  async checkSupabaseClient(supabase) {
    this.log('=== SUPABASE CLIENT CHECK ===');
    
    try {
      // Test basic connection
      const { data, error } = await supabase.auth.getSession();
      this.log('Supabase connection test', { 
        hasSession: !!data?.session,
        error: error?.message 
      });

      // Check auth configuration
      const authConfig = supabase.auth._config;
      this.log('Supabase Auth Config', {
        url: authConfig?.url,
        autoRefreshToken: authConfig?.autoRefreshToken,
        persistSession: authConfig?.persistSession,
        detectSessionInUrl: authConfig?.detectSessionInUrl
      });

      return true;
    } catch (error) {
      this.error('Supabase client check failed', error);
      return false;
    }
  }

  // Check OAuth URL construction
  checkOAuthUrl(redirectUrl) {
    this.log('=== OAUTH URL CHECK ===');
    
    try {
      const url = new URL(redirectUrl);
      this.log('OAuth Redirect URL Analysis', {
        full: redirectUrl,
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port,
        pathname: url.pathname,
        isLocalhost: url.hostname === 'localhost' || url.hostname === '127.0.0.1',
        isHttps: url.protocol === 'https:',
        expectedSupabaseCallback: redirectUrl.includes('supabase.co/auth/v1/callback'),
        expectedAppCallback: redirectUrl.includes('/auth/callback')
      });

      // Validate redirect URL format
      if (!redirectUrl.includes('/auth/callback')) {
        this.error('Redirect URL missing /auth/callback path', { redirectUrl });
        return false;
      }

      // Check if using Supabase callback vs direct callback
      if (redirectUrl.includes('supabase.co/auth/v1/callback')) {
        this.log('Using Supabase OAuth callback (CORRECT)');
      } else {
        this.error('Using direct app callback (INCORRECT)', {
          current: redirectUrl,
          shouldBe: 'https://vxuvfignecxtqsvhihzn.supabase.co/auth/v1/callback'
        });
      }

      return true;
    } catch (error) {
      this.error('Invalid redirect URL format', error);
      return false;
    }
  }

  // Monitor OAuth initiation
  async monitorOAuthStart(supabase, provider = 'google') {
    this.log('=== OAUTH INITIATION ===');
    
    try {
      // Check if already authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        this.log('User already authenticated', { 
          userId: session.user?.id,
          email: session.user?.email 
        });
      }

      // Monitor OAuth request
      this.log(`Starting ${provider} OAuth flow`);
      
      // Capture current URL for redirect back
      const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
      this.log('Storing current URL for redirect', { currentUrl });

      return true;
    } catch (error) {
      this.error('OAuth initiation failed', error);
      return false;
    }
  }

  // Parse callback URL parameters
  parseCallbackUrl(url = null) {
    this.log('=== CALLBACK URL PARSING ===');
    
    const targetUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
    this.log('Parsing callback URL', { url: targetUrl });

    try {
      const urlObj = new URL(targetUrl);
      const params = Object.fromEntries(urlObj.searchParams.entries());
      const hash = urlObj.hash;
      
      this.log('URL Parameters', params);
      this.log('URL Hash', hash);

      // Check for OAuth code
      if (params.code) {
        this.log('✅ OAuth code found', { 
          codeLength: params.code.length,
          codePreview: params.code.substring(0, 10) + '...'
        });
      } else {
        this.error('❌ No OAuth code in callback URL', { params });
      }

      // Check for errors
      if (params.error) {
        this.error('OAuth error in callback', {
          error: params.error,
          errorDescription: params.error_description,
          errorUri: params.error_uri
        });
      }

      // Check for state parameter
      if (params.state) {
        this.log('State parameter found', { state: params.state });
      }

      return {
        hasCode: !!params.code,
        hasError: !!params.error,
        code: params.code,
        error: params.error,
        errorDescription: params.error_description,
        state: params.state,
        allParams: params
      };
    } catch (error) {
      this.error('Failed to parse callback URL', error);
      return null;
    }
  }

  // Test session exchange
  async testSessionExchange(supabase, code) {
    this.log('=== SESSION EXCHANGE TEST ===');
    
    if (!code) {
      this.error('No OAuth code provided for exchange');
      return false;
    }

    try {
      this.log('Attempting to exchange code for session', {
        codeLength: code.length,
        codePreview: code.substring(0, 10) + '...'
      });

      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        this.error('Session exchange failed', error);
        return false;
      }

      if (data?.session) {
        this.log('✅ Session exchange successful', {
          userId: data.session.user?.id,
          email: data.session.user?.email,
          expiresAt: data.session.expires_at,
          provider: data.session.user?.app_metadata?.provider
        });
        return true;
      } else {
        this.error('Session exchange returned no session', { data });
        return false;
      }
    } catch (error) {
      this.error('Session exchange threw exception', error);
      return false;
    }
  }

  // Generate comprehensive report
  generateReport() {
    const report = {
      summary: {
        totalLogs: this.logs.length,
        totalErrors: this.errors.length,
        duration: Date.now() - this.startTime,
        timestamp: new Date().toISOString()
      },
      logs: this.logs,
      errors: this.errors,
      recommendations: this.generateRecommendations()
    };

    console.log('=== OAUTH DEBUG REPORT ===');
    console.log(JSON.stringify(report, null, 2));
    
    return report;
  }

  // Generate recommendations based on findings
  generateRecommendations() {
    const recommendations = [];

    // Check for common issues
    if (this.errors.some(e => e.message.includes('HTTPS'))) {
      recommendations.push({
        issue: 'HTTPS Requirement',
        solution: 'Use http://localhost:3001 instead of IP address',
        priority: 'HIGH'
      });
    }

    if (this.errors.some(e => e.message.includes('redirect'))) {
      recommendations.push({
        issue: 'Redirect URL Configuration',
        solution: 'Ensure Google Cloud Console has only Supabase callback URL: https://vxuvfignecxtqsvhihzn.supabase.co/auth/v1/callback',
        priority: 'HIGH'
      });
    }

    if (this.errors.some(e => e.message.includes('code'))) {
      recommendations.push({
        issue: 'OAuth Code Missing',
        solution: 'Check Google OAuth configuration and Supabase settings',
        priority: 'CRITICAL'
      });
    }

    if (this.logs.some(l => l.message.includes('IP address'))) {
      recommendations.push({
        issue: 'Using IP Address',
        solution: 'Switch to localhost for OAuth compatibility',
        priority: 'MEDIUM'
      });
    }

    return recommendations;
  }

  // Export debug data for sharing
  exportDebugData() {
    const debugData = {
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'Unknown',
      logs: this.logs,
      errors: this.errors,
      environment: {
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        nodeEnv: process.env.NODE_ENV
      }
    };

    const dataStr = JSON.stringify(debugData, null, 2);
    
    if (typeof window !== 'undefined') {
      // Create downloadable file
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `oauth-debug-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }

    return debugData;
  }
}

// Global debug instance
export const oauthDebugger = new OAuthDebugger();

// Helper function to run complete OAuth debug
export async function runCompleteOAuthDebug(supabase) {
  const debugInstance = new OAuthDebugger();
  
  console.log('🔍 Starting Complete OAuth Debug...');
  
  // Step 1: Environment check
  debugInstance.checkEnvironment();
  
  // Step 2: Supabase client check
  await debugInstance.checkSupabaseClient(supabase);
  
  // Step 3: Parse current URL if on callback page
  if (typeof window !== 'undefined' && window.location.pathname.includes('/auth/callback')) {
    const callbackData = debugInstance.parseCallbackUrl();
    
    // Step 4: Test session exchange if code is present
    if (callbackData?.code) {
      await debugInstance.testSessionExchange(supabase, callbackData.code);
    }
  }
  
  // Step 5: Generate report
  const report = debugInstance.generateReport();
  
  console.log('🎯 Debug Complete! Check console for detailed report.');
  
  return report;
}
