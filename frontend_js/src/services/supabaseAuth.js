import { supabase } from '../lib/supabase';

export const signInWithGoogle = async () => {
  try {
    // Ensure we're using the correct protocol and host
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port;
    
    // Build the redirect URL
    let redirectUrl;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      redirectUrl = `${protocol}//${hostname}${port ? `:${port}` : ''}/auth/callback`;
    } else {
      redirectUrl = `${window.location.origin}/auth/callback`;
    }
    
    console.log('Google OAuth redirect URL:', redirectUrl);
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error signing in with Google:', error);
    return { success: false, error: error.message };
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error signing out:', error);
    return { success: false, error: error.message };
  }
};

export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return { success: true, user };
  } catch (error) {
    console.error('Error getting current user:', error);
    return { success: false, error: error.message };
  }
};
