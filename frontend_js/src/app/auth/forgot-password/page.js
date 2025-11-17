'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { Button } from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { useAuth } from '../../../contexts/EnhancedAuthContext';
import { Mail, ArrowLeft, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { Logo } from '../../../components/ui/Logo';
import { validateEmail } from '../../../lib/utils';

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const { requestPasswordReset } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setError('');
      
      if (!validateEmail(data.email)) {
        setError('Please enter a valid email address');
        return;
      }

      await requestPasswordReset(data.email);
      
      setEmail(data.email);
      setIsSuccess(true);
    } catch (error) {
      setError(error.userMessage || error.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <Logo size="large" className="justify-center mb-4" />
          </div>

          {/* Success Card */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center space-y-1 pb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-xl">Check Your Email</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-center">
              <div className="space-y-3">
                <p className="text-gray-600">
                  We've sent a password reset link to:
                </p>
                <p className="font-semibold text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                  {email}
                </p>
                <p className="text-sm text-gray-500">
                  Click the link in the email to reset your password. The link will expire in 1 hour.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                <h4 className="font-semibold text-blue-900 mb-2">Next Steps:</h4>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Check your email inbox (and spam folder)</li>
                  <li>Click the password reset link</li>
                  <li>Enter your new password</li>
                  <li>Sign in with your new password</li>
                </ol>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <Link href="/auth/login">
                  <Button className="w-full">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Sign In
                  </Button>
                </Link>
                
                <Button 
                  variant="ghost" 
                  className="w-full text-sm"
                  onClick={() => setIsSuccess(false)}
                >
                  Try Different Email
                </Button>
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
          <p className="text-gray-600">Enter your email to receive a reset link</p>
        </div>

        {/* Forgot Password Form */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl text-center flex items-center justify-center space-x-2">
              <Mail className="h-5 w-5 text-blue-600" />
              <span>Reset Password</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <Input
                label="Email Address"
                type="email"
                placeholder="Enter your email address"
                required
                error={errors.email?.message}
                {...register('email', {
                  required: 'Email is required',
                  validate: (value) => validateEmail(value) || 'Please enter a valid email address'
                })}
              />

              <Button
                type="submit"
                className="w-full"
                size="lg"
                loading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? 'Sending Reset Link...' : 'Send Reset Link'}
              </Button>
            </form>

            <div className="space-y-3 pt-4 border-t">
              <Link href="/auth/login">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Sign In
                </Button>
              </Link>
              
              <div className="text-center text-sm text-gray-500">
                Don't have an account?{' '}
                <Link href="/auth/register" className="text-blue-600 hover:text-blue-800 transition-colors">
                  Sign up here
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>
            Need help?{' '}
            <Link href="/contact" className="text-blue-600 hover:text-blue-800 transition-colors">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
