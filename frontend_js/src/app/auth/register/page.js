'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Button } from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { PasswordStrength } from '../../../components/ui/PasswordStrength';
import { useAuth } from '../../../contexts/EnhancedAuthContext';
import { Eye, EyeOff, Users, UserPlus, GraduationCap, Sparkles, UserRoundPlus } from 'lucide-react';
import { validateEmail, validatePassword } from '../../../lib/utils';
import { RobustGoogleSignInButton } from '../../../components/auth/RobustGoogleSignInButton';
import { Logo } from '../../../components/ui/Logo';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { register: registerUser } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const password = watch('password');

  // Clear error when user starts typing
  const watchedFields = watch();
  React.useEffect(() => {
    if (error) {
      setError('');
    }
    if (passwordError) {
      setPasswordError('');
    }
  }, [watchedFields.email, watchedFields.password, watchedFields.name]);

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setError('');
      setPasswordError('');
      
      // Validate form data
      if (!validateEmail(data.email)) {
        setError('Please enter a valid email address');
        return;
      }
      
      // Validate password complexity
      const hasLowercase = /[a-z]/.test(data.password);
      const hasUppercase = /[A-Z]/.test(data.password);
      const hasNumber = /[0-9]/.test(data.password);
      const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(data.password);
      const isLongEnough = data.password.length >= 6;

      if (!hasLowercase || !hasUppercase || !hasNumber || !hasSymbol || !isLongEnough) {
        setPasswordError('Password requirements not met');
        return;
      }

      if (data.password !== data.confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      const userData = {
        email: data.email,
        password: data.password,
        name: data.name,
        graduation_year: parseInt(data.graduation_year),
        degree: data.degree,
        major: data.major || undefined,
      };

      const result = await registerUser(userData);
      
      // Handle different result scenarios
      if (result.success && !result.requiresEmailConfirmation) {
        // User is immediately authenticated
        router.push('/dashboard');
      } else if (result.success && result.requiresEmailConfirmation) {
        // Store email for verification page (if email confirmation was enabled)
        localStorage.setItem('pendingVerificationEmail', data.email);
        router.push(`/auth/verify-email?email=${encodeURIComponent(data.email)}`);
      } else if (!result.success) {
        // Handle specific errors and show them in the form
        if (result.error === 'ACCOUNT_EXISTS') {
          if (result.provider === 'google') {
            setError('Account exists with Google. Please use "Sign in with Google" instead.');
          } else if (result.provider === 'email') {
            setError('Account already exists. Please sign in instead.');
          } else {
            setError('Account already exists. You can sign in with email or Google.');
          }
        } else if (result.message && result.message.toLowerCase().includes('password')) {
          // Set password error to make label red
          setPasswordError('Password requirements not met');
          return;
        } else {
          setError(result.message || 'Registration failed. Please try again.');
        }
        return;
      }
    } catch (error) {
      // Only handle unexpected errors here
      console.error('Registration failed:', error);
      // Don't show generic error for password issues
      if (error?.message && error.message.toLowerCase().includes('password')) {
        setPasswordError('Password requirements not met');
        return;
      }
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <Logo size="large" className="justify-center mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join Your Network</h1>
          <p className="text-gray-500 text-sm">Create your account to get started</p>
        </div>

        {/* Registration Form */}
        <Card className="shadow-sm border border-gray-200 bg-white">
          <CardHeader className="space-y-1 pb-6 pt-8">
            <CardTitle className="text-2xl font-semibold text-center flex items-center justify-center gap-2.5">
              <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                <UserRoundPlus className="h-5 w-5 text-blue-600" />
              </div>
              <span>Create Account</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 px-8 pb-8">
            {/* Google Sign-In Button */}
            <RobustGoogleSignInButton 
              onSuccess={() => {
                console.log('Google sign-up successful, redirecting...');
                // Callback handler will manage the redirect
              }}
              onError={(error) => {
                console.error('Google sign-up error:', error);
                setError(error.userMessage || 'Google sign-up failed');
              }}
            />

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white text-gray-400 uppercase tracking-wider">Or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {error && (
                <div className="p-3.5 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
                  {error}
                </div>
              )}

              <Input
                label="Full Name"
                type="text"
                placeholder="Enter your full name"
                required
                error={errors.name?.message}
                {...register('name', {
                  required: 'Full name is required',
                  minLength: { value: 2, message: 'Name must be at least 2 characters' }
                })}
              />

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

              <div className="space-y-2 relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  required
                  error={passwordError || errors.password?.message}
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

              {/* Password Strength Indicator */}
              {password && (
                <PasswordStrength password={password} showRequirements={true} />
              )}

              <Input
                label="Confirm Password"
                type="password"
                placeholder="Confirm your password"
                required
                error={errors.confirmPassword?.message}
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) => value === password || 'Passwords do not match'
                })}
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium leading-none">
                    Graduation Year <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors mt-2"
                    {...register('graduation_year', { required: 'Graduation year is required' })}
                  >
                    <option value="">Select year</option>
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                  {errors.graduation_year && (
                    <p className="text-sm text-red-500 mt-1">{errors.graduation_year.message}</p>
                  )}
                </div>

                <Input
                  label="Degree"
                  type="text"
                  placeholder="e.g., Bachelor's"
                  required
                  error={errors.degree?.message}
                  {...register('degree', {
                    required: 'Degree is required',
                    minLength: { value: 2, message: 'Degree must be at least 2 characters' }
                  })}
                />
              </div>

              <Input
                label="Major (Optional)"
                type="text"
                placeholder="e.g., Computer Science"
                error={errors.major?.message}
                {...register('major')}
              />

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm hover:shadow transition-all mt-6"
                size="lg"
                loading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            <div className="text-center mt-6 pt-6 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Already have an account?{' '}
                <Link href="/auth/login" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                  Sign In
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-gray-400">
          <p>
            By creating an account, you agree to our{' '}
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
  );
}
