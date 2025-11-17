'use client';

import { useState } from 'react';
import { signInWithGoogle } from '../../services/supabaseAuth';
import { Button } from '../ui/Button';
import { Icons } from '../icons';
import { AlertCircle, Shield, ExternalLink } from 'lucide-react';
import Image from 'next/image';

export function RobustGoogleSignInButton({ 
  onSuccess, 
  onError, 
  disabled = false,
  className = "",
  size = "default"
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Check browser compatibility
      if (typeof window === 'undefined') {
        throw new Error('Google Sign-In is not available in this environment');
      }

      // For localhost, we need to handle the HTTPS requirement differently
      const isLocalhost = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1';
      
      if (!isLocalhost && window.location.protocol !== 'https:') {
        throw new Error('Google Sign-In requires HTTPS in production');
      }

      console.log('Initiating Google Sign-In...');
      const result = await signInWithGoogle();
      
      if (result.success) {
        console.log('Google Sign-In initiated successfully');
        onSuccess?.(result);
      } else {
        throw new Error(result.error || 'Google Sign-In failed');
      }
    } catch (error) {
      console.error('Google Sign-In error:', error);
      
      let userFriendlyMessage = 'Failed to sign in with Google. Please try again.';
      let errorType = 'unknown';
      
      // Handle specific error types
      if (error.message?.includes('HTTPS')) {
        errorType = 'https_required';
        userFriendlyMessage = 'Google Sign-In requires a secure connection. Please use HTTPS.';
      } else if (error.message?.includes('popup')) {
        errorType = 'popup_blocked';
        userFriendlyMessage = 'Sign-in popup was blocked. Please allow popups and try again.';
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorType = 'network_error';
        userFriendlyMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message?.includes('unauthorized') || error.message?.includes('invalid_client')) {
        errorType = 'config_error';
        userFriendlyMessage = 'Google Sign-In is not properly configured. Please contact support.';
      } else if (error.message?.includes('cancelled') || error.message?.includes('closed')) {
        errorType = 'user_cancelled';
        userFriendlyMessage = 'Sign-in was cancelled. Please try again if you want to continue.';
      }
      
      const enhancedError = {
        type: errorType,
        message: error.message,
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

  const renderErrorHelp = () => {
    if (!error) return null;

    switch (error.type) {
      case 'https_required':
        return (
          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
            <div className="flex items-center gap-1 text-blue-700 mb-1">
              <Shield className="h-3 w-3" />
              <span className="font-medium">Security Notice</span>
            </div>
            <p className="text-blue-600">
              For security, Google requires HTTPS. In development, use localhost instead of your IP address.
            </p>
          </div>
        );
      case 'popup_blocked':
        return (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
            <div className="flex items-center gap-1 text-yellow-700 mb-1">
              <ExternalLink className="h-3 w-3" />
              <span className="font-medium">Popup Blocked</span>
            </div>
            <p className="text-yellow-600">
              Please allow popups for this site and try again.
            </p>
          </div>
        );
      case 'config_error':
        return (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs">
            <div className="flex items-center gap-1 text-red-700 mb-1">
              <AlertCircle className="h-3 w-3" />
              <span className="font-medium">Configuration Error</span>
            </div>
            <p className="text-red-600">
              Google OAuth is not properly configured. Please check your settings.
            </p>
          </div>
        );
      default:
        return null;
    }
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
      
      {renderErrorHelp()}
    </div>
  );
}
