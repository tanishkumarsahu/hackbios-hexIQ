'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/EnhancedAuthContext';
import { AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import Image from 'next/image';
import { Button } from '../../../components/ui/Button';

export default function EnhancedAuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { AUTH_ERRORS } = useAuth();
  
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const maxRetries = 3;
  const retryDelay = 2000; // 2 seconds

  const handleAuthCallback = async (attempt = 1) => {
    try {
      setStatus('processing');
      setError(null);
      
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');
      const code = searchParams.get('code');
      const next = searchParams.get('next') || '/dashboard';

      // Handle OAuth errors
      if (error) {
        let userMessage = 'Authentication failed. Please try again.';
        
        switch (error) {
          case 'access_denied':
            userMessage = 'Access was denied. Please try signing in again.';
            break;
          case 'server_error':
            userMessage = 'Server error occurred. Please try again later.';
            break;
          case 'temporarily_unavailable':
            userMessage = 'Service is temporarily unavailable. Please try again later.';
            break;
          case 'invalid_request':
            userMessage = 'Invalid authentication request. Please try again.';
            break;
          default:
            userMessage = errorDescription || 'Authentication failed. Please try again.';
        }
        
        throw new Error(userMessage);
      }

      // Handle successful OAuth callback
      if (code) {
        // Exchange code for session
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        
        if (exchangeError) {
          throw exchangeError;
        }

        if (data?.session?.user) {
          // Verify the session is properly established
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            throw sessionError;
          }

          if (session) {
            // Auth context will be updated automatically by onAuthStateChange
            
            setStatus('success');
            
            // Redirect after a brief success message
            setTimeout(() => {
              router.push(next);
            }, 1500);
            
            return;
          }
        }
      }

      // If we get here, something went wrong
      throw new Error('Authentication session could not be established');
      
    } catch (error) {
      console.error(`Auth callback error (attempt ${attempt}):`, error);
      
      // Determine if we should retry
      const shouldRetry = attempt < maxRetries && (
        error.message?.includes('network') ||
        error.message?.includes('timeout') ||
        error.code === 'network_error' ||
        error.code === 'server_error'
      );

      if (shouldRetry) {
        setRetryCount(attempt);
        setTimeout(() => {
          handleAuthCallback(attempt + 1);
        }, retryDelay * attempt); // Exponential backoff
      } else {
        // Final error state
        let userMessage = 'Authentication failed. Please try signing in again.';
        let errorType = 'OAUTH_ERROR';
        
        if (error.code === 'invalid_grant') {
          userMessage = 'Authentication code has expired. Please try signing in again.';
          errorType = 'EXPIRED_CODE';
        } else if (error.code === 'network_error') {
          userMessage = 'Network error occurred. Please check your connection and try again.';
          errorType = 'NETWORK_ERROR';
        } else if (error.message?.includes('session')) {
          userMessage = 'Session could not be established. Please try signing in again.';
          errorType = 'SESSION_ERROR';
        }
        
        setError({
          type: errorType,
          message: error.message,
          userMessage,
          code: error.code,
          attempt,
          timestamp: new Date().toISOString()
        });
        
        setStatus('error');
      }
    }
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    setRetryCount(0);
    
    try {
      await handleAuthCallback(1);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleGoToLogin = () => {
    router.push('/auth/login');
  };

  useEffect(() => {
    // Small delay to ensure URL parameters are available
    const timer = setTimeout(() => {
      handleAuthCallback(1);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const renderContent = () => {
    switch (status) {
      case 'processing':
        return (
          <div className="text-center">
            <div className="w-16 h-16 relative animate-pulse mx-auto mb-4">
              <Image src="/favicon.png" alt="Loading..." fill className="object-contain" priority />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Signing you in...
            </h2>
            <p className="text-gray-500 text-sm mb-4">
              Please wait while we complete your authentication.
            </p>
            {retryCount > 0 && (
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <RefreshCw className="h-4 w-4" />
                <span>Retry attempt {retryCount} of {maxRetries}</span>
              </div>
            )}
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Welcome to Alumni Connect!
            </h2>
            <p className="text-gray-600 mb-4">
              You have been successfully signed in. Redirecting to your dashboard...
            </p>
            <div className="animate-pulse">
              <div className="h-2 bg-blue-200 rounded-full">
                <div className="h-2 bg-blue-600 rounded-full animate-pulse" style={{ width: '70%' }}></div>
              </div>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Authentication Failed
            </h2>
            <p className="text-gray-600 mb-6">
              {error?.userMessage || 'Something went wrong during sign in.'}
            </p>
            
            {process.env.NODE_ENV === 'development' && error && (
              <div className="mb-6 p-3 bg-gray-100 rounded-lg text-left">
                <p className="text-xs text-gray-600 font-mono">
                  <strong>Debug Info:</strong><br />
                  Type: {error.type}<br />
                  Code: {error.code}<br />
                  Message: {error.message}<br />
                  Attempt: {error.attempt}
                </p>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={handleRetry}
                disabled={isRetrying}
                className="flex items-center gap-2"
              >
                {isRetrying ? (
                  <>
                    <div className="w-4 h-4 relative animate-pulse">
                      <Image src="/favicon.png" alt="Loading..." width={16} height={16} className="object-contain" />
                    </div>
                    Retrying...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Try Again
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={handleGoToLogin}
                disabled={isRetrying}
              >
                Back to Sign In
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl p-8 border-0">
          {renderContent()}
        </div>
        
        {/* Additional help text */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>
            Having trouble? {' '}
            <button 
              onClick={handleGoToLogin}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Try signing in again
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
