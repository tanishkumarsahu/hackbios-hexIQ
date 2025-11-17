'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Button } from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { useAuth } from '../../../contexts/EnhancedAuthContext';
import { EnhancedGoogleSignInButton } from '../../../components/auth/EnhancedGoogleSignInButton';
import { 
  Eye, 
  EyeOff, 
  Users, 
  Sparkles, 
  Shield, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw,
  Wifi,
  WifiOff
} from 'lucide-react';
import Image from 'next/image';
import { 
  validateEmail, 
  validatePassword, 
  sanitizeInput,
  createValidator 
} from '../../../lib/validation';

export default function EnhancedLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);
  
  const { login, authState, error: authError, clearError, AUTH_ERRORS, AUTH_STATES } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, touchedFields },
    watch,
    setValue,
    trigger,
    clearErrors
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const watchedEmail = watch('email');
  const watchedPassword = watch('password');

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle URL parameters (error messages, redirects, etc.)
  useEffect(() => {
    const error = searchParams.get('error');
    const message = searchParams.get('message');
    
    if (error) {
      setError({
        type: 'URL_ERROR',
        message: decodeURIComponent(error),
        userMessage: 'Authentication failed. Please try again.'
      });
    }
    
    if (message) {
      // Handle success messages or other notifications
      console.log('Auth message:', decodeURIComponent(message));
    }
  }, [searchParams]);

  // Rate limiting logic
  useEffect(() => {
    if (loginAttempts >= 5) {
      setIsRateLimited(true);
      const timer = setTimeout(() => {
        setIsRateLimited(false);
        setLoginAttempts(0);
      }, 300000); // 5 minutes
      
      return () => clearTimeout(timer);
    }
  }, [loginAttempts]);

  // Real-time email validation
  const validateEmailField = useCallback(
    createValidator((email) => {
      if (!email) return true; // Don't show error for empty field
      return validateEmail(email);
    }),
    []
  );

  useEffect(() => {
    if (touchedFields.email && watchedEmail) {
      validateEmailField(watchedEmail, (isValid) => {
        if (!isValid) {
          trigger('email');
        } else {
          clearErrors('email');
        }
      });
    }
  }, [watchedEmail, touchedFields.email, validateEmailField, trigger, clearErrors]);

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setError(null);
      clearError();
      
      // Check network connectivity
      if (!isOnline) {
        throw new Error('No internet connection. Please check your network and try again.');
      }

      // Check rate limiting
      if (isRateLimited) {
        throw new Error('Too many login attempts. Please wait 5 minutes before trying again.');
      }

      // Sanitize inputs
      const sanitizedData = {
        email: sanitizeInput(data.email, 'email'),
        password: data.password // Don't sanitize password
      };

      // Final validation
      if (!validateEmail(sanitizedData.email)) {
        throw new Error('Please enter a valid email address');
      }

      if (!validatePassword(sanitizedData.password)) {
        throw new Error('Invalid password format');
      }

      const result = await login(sanitizedData.email, sanitizedData.password);
      
      if (result.success) {
        // Handle remember me
        if (rememberMe) {
          localStorage.setItem('remember_user', sanitizedData.email);
        } else {
          localStorage.removeItem('remember_user');
        }

        // Redirect to intended page or dashboard
        const redirectTo = searchParams.get('redirect') || '/dashboard';
        router.push(redirectTo);
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Increment login attempts
      setLoginAttempts(prev => prev + 1);
      
      // Handle different error types
      let userMessage = 'Login failed. Please try again.';
      
      if (error.type === AUTH_ERRORS.INVALID_CREDENTIALS) {
        userMessage = 'Invalid email or password. Please check your credentials and try again.';
      } else if (error.type === AUTH_ERRORS.NETWORK_ERROR) {
        userMessage = 'Network error. Please check your connection and try again.';
      } else if (error.type === AUTH_ERRORS.RATE_LIMITED) {
        userMessage = 'Too many login attempts. Please wait before trying again.';
      } else if (error.type === AUTH_ERRORS.ACCOUNT_DISABLED) {
        userMessage = 'Your account has been disabled. Please contact support.';
      } else if (error.type === AUTH_ERRORS.EMAIL_NOT_VERIFIED) {
        userMessage = 'Please verify your email address before signing in.';
      }
      
      setError({
        ...error,
        userMessage,
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google Sign-In success
  const handleGoogleSuccess = (result) => {
    console.log('Google sign-in successful:', result);
    const redirectTo = searchParams.get('redirect') || '/dashboard';
    router.push(redirectTo);
  };

  // Handle Google Sign-In error
  const handleGoogleError = (error) => {
    console.error('Google sign-in error:', error);
    setError(error);
  };

  // Load remembered email
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('remember_user');
    if (rememberedEmail) {
      setValue('email', rememberedEmail);
      setRememberMe(true);
    }
  }, [setValue]);

  // Clear error when user starts typing
  useEffect(() => {
    if (error && (watchedEmail || watchedPassword)) {
      setError(null);
      clearError();
    }
  }, [watchedEmail, watchedPassword, error, clearError]);

  const isFormDisabled = isLoading || authState === AUTH_STATES.LOADING || isRateLimited;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Network Status Indicator */}
        {!isOnline && (
          <div className="mb-4 p-3 rounded-lg bg-orange-50 border border-orange-200 flex items-center gap-2">
            <WifiOff className="h-4 w-4 text-orange-500" />
            <span className="text-sm text-orange-700">You're offline. Please check your connection.</span>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <Users className="h-7 w-7 text-white" />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Alumni Connect
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your account to continue</p>
        </div>

        {/* Login Form */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl text-center flex items-center justify-center space-x-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <span>Sign In</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Error Display */}
            {(error || authError) && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-red-700">
                    {error?.userMessage || authError?.message || 'An error occurred'}
                  </p>
                  {process.env.NODE_ENV === 'development' && (
                    <p className="text-xs text-red-600 mt-1 font-mono">
                      Debug: {error?.message || authError?.type}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => {
                    setError(null);
                    clearError();
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            )}

            {/* Rate Limiting Warning */}
            {isRateLimited && (
              <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <p className="text-sm text-yellow-700">
                  Too many login attempts. Please wait 5 minutes before trying again.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="Enter your email"
                  disabled={isFormDisabled}
                  error={errors.email?.message}
                  {...register('email', {
                    required: 'Email is required',
                    validate: (value) => validateEmail(value) || 'Please enter a valid email address'
                  })}
                />
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    disabled={isFormDisabled}
                    error={errors.password?.message}
                    {...register('password', {
                      required: 'Password is required',
                      minLength: { value: 6, message: 'Password must be at least 6 characters' }
                    })}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isFormDisabled}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 disabled:opacity-50"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isFormDisabled}
                  />
                  <span className="text-gray-600">Remember me</span>
                </label>
                <Link 
                  href="/auth/forgot-password" 
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                loading={isLoading}
                disabled={isFormDisabled || !isValid}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 relative animate-pulse mr-2">
                      <Image src="/favicon.png" alt="Loading..." width={16} height={16} className="object-contain" />
                    </div>
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/80 text-gray-500">Or continue with</span>
              </div>
            </div>

            <EnhancedGoogleSignInButton
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              disabled={isFormDisabled}
            />

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/80 text-gray-500">New to Alumni Connect?</span>
              </div>
            </div>

            <Link href="/auth/register">
              <Button
                variant="outline"
                className="w-full"
                size="lg"
                icon={<Sparkles className="h-4 w-4" />}
                disabled={isFormDisabled}
              >
                Create Account
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>
            By signing in, you agree to our{' '}
            <Link href="/terms" className="text-blue-600 hover:text-blue-800 transition-colors">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-blue-600 hover:text-blue-800 transition-colors">
              Privacy Policy
            </Link>
          </p>
        </div>

        {/* Debug Info (Development Only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-3 bg-gray-100 rounded-lg text-xs text-gray-600">
            <p>Debug Info:</p>
            <p>Auth State: {authState}</p>
            <p>Login Attempts: {loginAttempts}</p>
            <p>Rate Limited: {isRateLimited ? 'Yes' : 'No'}</p>
            <p>Online: {isOnline ? 'Yes' : 'No'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
