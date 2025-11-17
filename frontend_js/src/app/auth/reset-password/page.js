'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Button } from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { useAuth } from '../../../contexts/EnhancedAuthContext';
import { Eye, EyeOff, Lock, Users, CheckCircle, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { Logo } from '../../../components/ui/Logo';
import { validatePassword } from '../../../lib/utils';

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isValidToken, setIsValidToken] = useState(false);
  const { resetPassword } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const password = watch('password');

  useEffect(() => {
    // Check if we have a valid reset token in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token');
    
    if (accessToken && refreshToken) {
      setIsValidToken(true);
    } else {
      setError('Invalid or expired reset link. Please request a new password reset.');
    }
  }, []);

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setError('');
      
      if (!validatePassword(data.password)) {
        setError('Password must be at least 6 characters long');
        return;
      }

      if (data.password !== data.confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      await resetPassword(data.password);
      setIsSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/auth/login');
      }, 3001);
    } catch (error) {
      setError(error.userMessage || error.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValidToken && !error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 relative animate-pulse mx-auto mb-4">
            <Image src="/favicon.png" alt="Loading..." fill className="object-contain" priority />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Validating reset link...</h2>
          <p className="text-gray-500 text-sm">Please wait while we verify your request.</p>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center space-y-1 pb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-xl">Password Reset Successful!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-center">
              <p className="text-gray-600">
                Your password has been successfully updated. You can now sign in with your new password.
              </p>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  Redirecting to sign in page in 3 seconds...
                </p>
              </div>

              <Link href="/auth/login">
                <Button className="w-full">
                  Sign In Now
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center space-y-1 pb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-xl">Invalid Reset Link</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-center">
              <p className="text-gray-600">
                {error || 'This password reset link is invalid or has expired.'}
              </p>
              
              <div className="space-y-3">
                <Link href="/auth/forgot-password">
                  <Button className="w-full">
                    Request New Reset Link
                  </Button>
                </Link>
                
                <Link href="/auth/login">
                  <Button variant="outline" className="w-full">
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Logo size="large" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset Your Password</h1>
          <p className="text-gray-600">Enter your new password below</p>
        </div>

        {/* Reset Password Form */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl text-center flex items-center justify-center space-x-2">
              <Lock className="h-5 w-5 text-blue-600" />
              <span>New Password</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div className="relative">
                <Input
                  label="New Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your new password"
                  required
                  error={errors.password?.message}
                  {...register('password', {
                    required: 'Password is required',
                    validate: (value) => validatePassword(value) || 'Password must be at least 6 characters'
                  })}
                />
                <button
                  type="button"
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <div className="relative">
                <Input
                  label="Confirm New Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your new password"
                  required
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value) => value === password || 'Passwords do not match'
                  })}
                />
                <button
                  type="button"
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Password Requirements */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">Password Requirements:</h4>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• At least 6 characters long</li>
                  <li>• Mix of uppercase and lowercase letters (recommended)</li>
                  <li>• Include numbers and symbols (recommended)</li>
                </ul>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                loading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? 'Updating Password...' : 'Update Password'}
              </Button>
            </form>

            <div className="text-center pt-4 border-t">
              <Link href="/auth/login" className="text-sm text-blue-600 hover:text-blue-800 transition-colors">
                Back to Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
