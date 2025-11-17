'use client';

import { useState } from 'react';
import { useAuth } from '../../contexts/EnhancedAuthContext';
import { signInWithGoogle } from '../../services/supabaseAuth';
import { Button } from '../ui/Button';
import { Icons } from '../icons';
import { AlertCircle } from 'lucide-react';
import Image from 'next/image';

export function EnhancedGoogleSignInButton({ 
  onSuccess, 
  onError, 
  disabled = false,
  className = "",
  size = "default"
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { AUTH_ERRORS } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Check if we're in a secure context (HTTPS or localhost)
      if (typeof window !== 'undefined' && 
          window.location.protocol !== 'https:' && 
          !window.location.hostname.includes('localhost') &&
          !window.location.hostname.includes('127.0.0.1')) {
        throw new Error('Google Sign-In requires HTTPS or localhost');
      }

      const result = await signInWithGoogle();
      
      if (result.success) {
        onSuccess?.(result);
      } else {
        throw new Error('Google Sign-In failed');
      }
    } catch (error) {
      console.error('Google Sign-In error:', error);
      
      let userFriendlyMessage = 'Failed to sign in with Google. Please try again.';
      
      // Handle specific error types
      if (error.type === AUTH_ERRORS.NETWORK_ERROR) {
        userFriendlyMessage = 'Network error. Please check your connection and try again.';
      } else if (error.type === AUTH_ERRORS.OAUTH_ERROR) {
        userFriendlyMessage = 'Google authentication failed. Please try again.';
      } else if (error.message?.includes('popup')) {
        userFriendlyMessage = 'Sign-in popup was blocked. Please allow popups and try again.';
      } else if (error.message?.includes('HTTPS')) {
        userFriendlyMessage = 'Google Sign-In requires a secure connection.';
      }
      
      const enhancedError = {
        ...error,
        userMessage: userFriendlyMessage,
        timestamp: new Date().toISOString()
      };
      
      setError(enhancedError);
      onError?.(enhancedError);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <div className="w-full">
      <Button
        variant="outline"
        type="button"
        className={`w-full flex items-center justify-center gap-2 transition-all duration-200 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${className}`}
        onClick={handleGoogleSignIn}
        disabled={disabled || isLoading}
        size={size}
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 relative animate-pulse">
              <Image src="/favicon.png" alt="Loading..." width={16} height={16} className="object-contain" />
            </div>
            Signing in...
          </>
        ) : (
          <>
            <Icons.google className="h-4 w-4" />
            Continue with Google
          </>
        )}
      </Button>
      
      {error && (
        <div className="mt-2 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-red-700">{error.userMessage}</p>
            {process.env.NODE_ENV === 'development' && (
              <p className="text-xs text-red-600 mt-1 font-mono">
                Debug: {error.message}
              </p>
            )}
            <button
              onClick={clearError}
              className="text-xs text-red-600 hover:text-red-800 underline mt-1"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Alternative compact version
export function CompactGoogleSignInButton({ onSuccess, onError, disabled = false }) {
  return (
    <EnhancedGoogleSignInButton
      onSuccess={onSuccess}
      onError={onError}
      disabled={disabled}
      size="sm"
      className="text-sm"
    />
  );
}

// Icon-only version for space-constrained areas
export function GoogleSignInIconButton({ onSuccess, onError, disabled = false }) {
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithGoogle } = useAuth();

  const handleClick = async () => {
    try {
      setIsLoading(true);
      const result = await signInWithGoogle();
      if (result.success) {
        onSuccess?.(result);
      }
    } catch (error) {
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isLoading}
      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      title="Sign in with Google"
    >
      {isLoading ? (
        <div className="w-5 h-5 relative animate-pulse">
          <Image src="/favicon.png" alt="Loading..." width={20} height={20} className="object-contain" />
        </div>
      ) : (
        <Icons.google className="h-5 w-5" />
      )}
    </button>
  );
}
