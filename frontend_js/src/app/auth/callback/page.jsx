'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/EnhancedAuthContext';
import { AlertCircle, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import { Button } from '../../../components/ui/Button';
import { toast } from 'sonner';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { } = useAuth(); // Auth state is handled automatically by onAuthStateChange
  
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleAuth = async () => {
      try {
        setStatus('processing');
        
        // Check for hash fragment (Supabase v2 implicit flow)
        const hash = window.location.hash;
        const hashParams = new URLSearchParams(hash.substring(1)); // Remove # and parse
        
        const error = searchParams.get('error') || hashParams.get('error');
        const errorDescription = searchParams.get('error_description') || hashParams.get('error_description');
        const code = searchParams.get('code');
        const accessToken = hashParams.get('access_token');
        
        console.log('[Callback] Processing auth callback:', {
          hasCode: !!code,
          hasAccessToken: !!accessToken,
          hasError: !!error
        });
        
        // Get the stored redirect path or default to dashboard
        const redirectPath = sessionStorage.getItem('auth_redirect_path') || '/dashboard';
        
        if (error) {
          console.error('OAuth error:', error);
          
          // User-friendly error messages
          let userMessage = 'Sign-in was cancelled or failed. Please try again.';
          
          if (error === 'access_denied') {
            userMessage = 'Sign-in was cancelled. Please try again if you want to continue.';
          } else if (errorDescription?.includes('disabled')) {
            userMessage = 'Your account has been disabled. Please contact support for assistance.';
          }
          
          setError({
            type: 'oauth_error',
            userMessage
          });
          setStatus('error');
          return;
        }

        // If we have an access token in hash, Supabase should auto-process it
        if (accessToken) {
          console.log('✅ Access token found in hash, waiting for Supabase to process...');
          // Wait for Supabase to process the hash fragment
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // Check if we already have a session (Supabase v2 processed OAuth)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('[Callback] Session check error:', sessionError);
          // Don't fail here - continue to check for code
        }
        
        if (session) {
          console.log('✅ [Callback] Session already exists:', session.user?.email);
          
          // Show success toast
          toast.success('Welcome!', {
            description: `Successfully signed in with Google as ${session.user?.email}`,
          });
          
          // Clear the stored redirect path
          sessionStorage.removeItem('auth_redirect_path');
          
          setStatus('success');
          
          console.log('Redirecting to:', redirectPath);
          
          // Redirect after showing success message
          setTimeout(() => {
            router.push(redirectPath);
          }, 1500);
          
          return;
        }

        if (code) {
          console.log('Processing OAuth code:', code.substring(0, 10) + '...');
          
          // Exchange the code for a session
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (exchangeError) {
            console.error('Error exchanging code for session:', exchangeError);
            
            // Check for specific error types
            let userMessage = 'Failed to complete sign-in. Please try again.';
            
            if (exchangeError.message?.includes('disabled')) {
              userMessage = 'Your account has been disabled. Please contact support.';
            } else if (exchangeError.message?.includes('expired')) {
              userMessage = 'Sign-in link expired. Please try signing in again.';
            }
            
            setError({
              type: 'session_error',
              userMessage
            });
            setStatus('error');
            return;
          }

          console.log('OAuth exchange successful:', data?.session?.user?.email);

          if (data?.session?.user) {
            // Wait a moment for the session to be fully established
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Auth context will be updated automatically by onAuthStateChange
            
            // Clear the stored redirect path
            sessionStorage.removeItem('auth_redirect_path');
            
            setStatus('success');
            
            console.log('Redirecting to:', redirectPath);
            
            // Redirect after showing success message
            setTimeout(() => {
              router.push(redirectPath);
            }, 1500);
            
            return;
          } else {
            console.error('No user in session data');
            setError({
              type: 'no_user_error',
              userMessage: 'Sign-in completed but user data is missing. Please try again.'
            });
            setStatus('error');
            return;
          }
        }

        // If no code, access token, or session - this might be a direct navigation
        // or page refresh after successful auth
        console.warn('[Callback] No auth params found - checking if user is already authenticated');
        
        // Give Supabase a moment to process any pending auth
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Final session check
        const { data: { session: finalSession } } = await supabase.auth.getSession();
        
        if (finalSession) {
          console.log('✅ [Callback] Found existing session, redirecting to dashboard');
          setStatus('success');
          setTimeout(() => {
            router.push('/dashboard');
          }, 500);
          return;
        }
        
        // No session found - redirect to login
        console.log('[Callback] No session found, redirecting to login');
        setError({
          type: 'no_auth_data',
          userMessage: 'Sign-in session not found. Please try signing in again.'
        });
        setStatus('error');
        
        // Auto-redirect to login after 2 seconds
        setTimeout(() => {
          router.push('/auth/login');
        }, 2000);
        
      } catch (err) {
        console.error('[Callback] Unexpected error:', err);
        
        // Generic error message for users
        let userMessage = 'An unexpected error occurred. Please try again.';
        
        // Check for specific error patterns
        if (err.message?.includes('network') || err.message?.includes('fetch')) {
          userMessage = 'Network error. Please check your connection and try again.';
        } else if (err.message?.includes('timeout')) {
          userMessage = 'Request timed out. Please try again.';
        } else if (err.message?.includes('disabled')) {
          userMessage = 'Your account has been disabled. Please contact support.';
        }
        
        setError({
          type: 'callback_error',
          userMessage
        });
        setStatus('error');
        
        // Auto-redirect to login after 3 seconds on error
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      }
    };

    // Only run once when component mounts
    let mounted = true;
    
    const timer = setTimeout(() => {
      if (mounted) {
        handleAuth();
      }
    }, 100);
    
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [searchParams, router]);

  const handleRetry = () => {
    router.push('/auth/login');
  };

  if (status === 'processing') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 relative animate-pulse mx-auto mb-4">
            <Image src="/favicon.png" alt="Loading..." fill className="object-contain" priority />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Completing sign-in...</h2>
          <p className="text-gray-500 text-sm">Please wait while we finish setting up your account.</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 relative mx-auto mb-6">
            <Image 
              src="/logo_shrinked.png" 
              alt="AlumNode" 
              fill 
              className="object-contain animate-spin" 
              style={{ animationDuration: '2s' }}
              priority 
            />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome to AlumNode!</h2>
          <p className="text-gray-600 mb-4">You have been successfully signed in. Redirecting...</p>
          <div className="w-48 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
            <div 
              className="h-2 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 rounded-full transition-all duration-[1500ms] ease-linear"
              style={{ 
                width: '100%',
                animation: 'progressBar 1.5s ease-out forwards'
              }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl p-8">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Sign-in Failed</h2>
            <p className="text-gray-600 mb-6">
              {error?.userMessage || 'Something went wrong during sign-in.'}
            </p>
            
            <Button onClick={handleRetry} className="w-full">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 relative animate-pulse mx-auto mb-4">
            <Image src="/favicon.png" alt="Loading..." fill className="object-contain" priority />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading...</h2>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
