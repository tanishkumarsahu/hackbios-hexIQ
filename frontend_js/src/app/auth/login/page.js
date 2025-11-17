'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Button } from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { useAuth } from '../../../contexts/EnhancedAuthContext';
import { Eye, EyeOff, Mail, Lock, Users, Sparkles, LogIn } from 'lucide-react';
import { validateEmail, validatePassword } from '../../../lib/utils';
import { RobustGoogleSignInButton } from '../../../components/auth/RobustGoogleSignInButton';
import { Logo } from '../../../components/ui/Logo';

// Component that uses useSearchParams - must be wrapped in Suspense
function ErrorHandler({ setError }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'disabled') {
      // Clear error from URL to prevent showing again on refresh
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
      
      setError('Your account has been disabled. Please contact support for assistance.');
    }
  }, [searchParams, setError]);

  return null;
}

function LoginPageContent() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setError('');
      
      
      // Validate form data
      if (!data) {
        setError('Form data is missing. Please try again.');
        return;
      }
      
      if (!data.email) {
        setError('Email is required');
        return;
      }
      
      if (!validateEmail(data.email)) {
        setError('Please enter a valid email address');
        return;
      }
      
      if (!data.password) {
        setError('Password is required');
        return;
      }
      
      if (!validatePassword(data.password)) {
        setError('Password must be at least 6 characters');
        return;
      }

      const result = await login(data.email, data.password);
      
      if (result && result.success) {
        router.push('/dashboard');
      } else {
        // Error already handled with toast in auth context
        return;
      }
    } catch (error) {
      // Handle any unexpected errors that weren't caught by auth context
      console.error('Unexpected login error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Error handler wrapped in Suspense */}
      <Suspense fallback={null}>
        <ErrorHandler setError={setError} />
      </Suspense>
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <Logo size="large" className="justify-center mb-6" />
            
            {/* Animated Icon */}
            <div className="relative inline-flex items-center justify-center mb-6">
              <div className="absolute w-20 h-20 bg-blue-400 rounded-full opacity-20 blur-xl animate-pulse"></div>
              <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl shadow-xl flex items-center justify-center transform hover:scale-105 transition-transform">
                <Users className="h-8 w-8 text-white" strokeWidth={2.5} />
              </div>
            </div>

            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600 text-sm">Sign in to connect with your alumni network</p>
          </div>

        {/* Login Form */}
        <Card className="shadow-xl border border-gray-200 bg-white/95 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-6 pt-8">
            <CardTitle className="text-2xl font-semibold text-center">
              Sign In to Your Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 px-8 pb-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {error && (
                <div className="p-3.5 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="Enter your email"
                  required
                  error={errors.email?.message}
                  {...register('email', {
                    required: 'Email is required',
                    validate: (value) => validateEmail(value) || 'Please enter a valid email address'
                  })}
                />
              </div>

              <div className="space-y-2 relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  required
                  error={errors.password?.message}
                  {...register('password', {
                    required: 'Password is required',
                    validate: (value) => validatePassword(value) || 'Password must be at least 6 characters'
                  })}
                />
                <button
                  type="button"
                  className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600 transition-colors z-10"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                  />
                  <label htmlFor="remember-me" className="ml-2.5 block text-sm text-gray-600 cursor-pointer">
                    Remember me
                  </label>
                </div>
                <Link href="/auth/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm hover:shadow transition-all mt-6"
                size="lg"
                loading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white text-gray-400 uppercase tracking-wider">Or continue with</span>
              </div>
            </div>

            <RobustGoogleSignInButton 
              onSuccess={() => {
                console.log('Google sign-in successful, redirecting...');
                // Don't redirect here, let the callback handle it
              }}
              onError={(error) => {
                console.error('Google sign-in error:', error);
                setError(error.userMessage || 'Google sign-in failed');
              }}
            />

            <div className="text-center mt-6 pt-6 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                New to AlumNode?{' '}
                <Link href="/auth/register" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                  Create Account
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Admin Login Link */}
        <div className="text-center mt-6">
          <Link 
            href="/admin/login"
            className="text-sm text-gray-600 hover:text-blue-600 transition-colors inline-flex items-center gap-1"
          >
            <Lock className="h-3 w-3" />
            Administrator Login
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center mt-4 text-xs text-gray-400">
          <p>
            By signing in, you agree to our{' '}
            <Link href="/terms" className="text-gray-500 hover:text-gray-700 underline underline-offset-2 transition-colors">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-gray-500 hover:text-gray-700 underline underline-offset-2 transition-colors">
              Privacy Policy
            </Link>
          </p>
        </div>
        </div>
      </div>
    </>
  );
}

// Main export with Suspense boundary
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
