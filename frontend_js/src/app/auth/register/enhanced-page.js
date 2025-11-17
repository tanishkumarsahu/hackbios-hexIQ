'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  UserPlus, 
  GraduationCap, 
  AlertCircle, 
  CheckCircle, 
  Info,
  Shield
} from 'lucide-react';
import Image from 'next/image';
import { 
  validateEmail, 
  validatePassword, 
  validateName,
  validateGraduationYear,
  getPasswordStrength,
  sanitizeInput,
  createValidator,
  validateForm
} from '../../../lib/validation';

export default function EnhancedRegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState(null);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState(null);
  const [formStep, setFormStep] = useState(1);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  const { register: registerUser, authState, error: authError, clearError, AUTH_ERRORS, AUTH_STATES } = useAuth();
  const router = useRouter();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, touchedFields },
    watch,
    setValue,
    trigger,
    clearErrors,
    getValues
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      graduation_year: '',
      degree: '',
      major: ''
    }
  });

  const watchedPassword = watch('password');
  const watchedEmail = watch('email');
  const watchedName = watch('name');

  // Real-time password strength checking
  useEffect(() => {
    if (watchedPassword) {
      const strength = getPasswordStrength(watchedPassword);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(null);
    }
  }, [watchedPassword]);

  // Email availability checking (debounced)
  const checkEmailAvailability = useCallback(
    createValidator(async (email) => {
      if (!validateEmail(email)) return;
      
      setIsCheckingEmail(true);
      try {
        // Simulate API call to check email availability
        // In real implementation, this would call your backend
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock response - in real app, check against your database
        const unavailableEmails = ['test@example.com', 'admin@alumni.com'];
        const isAvailable = !unavailableEmails.includes(email.toLowerCase());
        
        setEmailAvailable(isAvailable);
      } catch (error) {
        console.error('Email check failed:', error);
        setEmailAvailable(null);
      } finally {
        setIsCheckingEmail(false);
      }
    }, 800),
    []
  );

  useEffect(() => {
    if (touchedFields.email && watchedEmail && validateEmail(watchedEmail)) {
      checkEmailAvailability(watchedEmail);
    } else {
      setEmailAvailable(null);
    }
  }, [watchedEmail, touchedFields.email, checkEmailAvailability]);

  // Form validation rules
  const validationRules = {
    name: {
      required: true,
      type: 'name',
      minLength: 2,
      maxLength: 50
    },
    email: {
      required: true,
      type: 'email'
    },
    password: {
      required: true,
      type: 'password'
    },
    confirmPassword: {
      required: true,
      validate: (value) => {
        const password = getValues('password');
        return value === password || 'Passwords do not match';
      }
    },
    graduation_year: {
      required: true,
      type: 'year'
    },
    degree: {
      required: true,
      minLength: 2,
      maxLength: 100
    }
  };

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setError(null);
      clearError();
      
      // Final validation
      const { isValid: formIsValid, errors: validationErrors } = validateForm(data, validationRules);
      
      if (!formIsValid) {
        throw new Error('Please fix the validation errors before submitting');
      }

      // Check if email is available
      if (emailAvailable === false) {
        throw new Error('This email address is already registered');
      }

      // Check terms agreement
      if (!agreedToTerms) {
        throw new Error('Please agree to the Terms of Service and Privacy Policy');
      }

      // Sanitize inputs
      const sanitizedData = {
        name: sanitizeInput(data.name, 'name'),
        email: sanitizeInput(data.email, 'email'),
        password: data.password, // Don't sanitize password
        graduation_year: parseInt(data.graduation_year),
        degree: sanitizeInput(data.degree, 'text'),
        major: data.major ? sanitizeInput(data.major, 'text') : undefined
      };

      const result = await registerUser(sanitizedData);
      
      if (result.success) {
        // Registration successful
        router.push('/dashboard?welcome=true');
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle different error types
      let userMessage = 'Registration failed. Please try again.';
      
      if (error.type === AUTH_ERRORS.EMAIL_ALREADY_EXISTS) {
        userMessage = 'This email address is already registered. Please use a different email or sign in instead.';
      } else if (error.type === AUTH_ERRORS.WEAK_PASSWORD) {
        userMessage = 'Password is too weak. Please choose a stronger password.';
      } else if (error.type === AUTH_ERRORS.VALIDATION_ERROR) {
        userMessage = error.message || 'Please check your input and try again.';
      } else if (error.type === AUTH_ERRORS.NETWORK_ERROR) {
        userMessage = 'Network error. Please check your connection and try again.';
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
    console.log('Google sign-up successful:', result);
    router.push('/dashboard?welcome=true');
  };

  // Handle Google Sign-In error
  const handleGoogleError = (error) => {
    console.error('Google sign-up error:', error);
    setError(error);
  };

  // Multi-step form navigation
  const nextStep = async () => {
    const fieldsToValidate = formStep === 1 
      ? ['name', 'email'] 
      : ['password', 'confirmPassword'];
    
    const isStepValid = await trigger(fieldsToValidate);
    
    if (isStepValid && (formStep === 1 ? emailAvailable !== false : true)) {
      setFormStep(2);
    }
  };

  const prevStep = () => {
    setFormStep(1);
  };

  // Generate graduation years
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 60 }, (_, i) => currentYear - i + 10);

  const isFormDisabled = isLoading || authState === AUTH_STATES.LOADING;

  // Password strength indicator component
  const PasswordStrengthIndicator = ({ strength }) => {
    if (!strength) return null;
    
    const getColor = () => {
      switch (strength.level) {
        case 'Very Weak': return 'bg-red-500';
        case 'Weak': return 'bg-orange-500';
        case 'Fair': return 'bg-yellow-500';
        case 'Good': return 'bg-blue-500';
        case 'Strong': return 'bg-green-500';
        case 'Very Strong': return 'bg-green-600';
        case 'Excellent': return 'bg-green-700';
        default: return 'bg-gray-300';
      }
    };
    
    return (
      <div className="mt-2">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-gray-600">Password strength:</span>
          <span className={`font-medium ${strength.score >= 4 ? 'text-green-600' : 'text-orange-600'}`}>
            {strength.level}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${getColor()}`}
            style={{ width: `${(strength.score / 8) * 100}%` }}
          ></div>
        </div>
        {strength.feedback.length > 0 && (
          <ul className="mt-1 text-xs text-gray-600">
            {strength.feedback.slice(0, 2).map((feedback, index) => (
              <li key={index}>• {feedback}</li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Join Your Network</h1>
          <p className="text-gray-600">Create your account to get started</p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-center space-x-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              formStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              1
            </div>
            <div className={`w-16 h-1 ${formStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              formStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              2
            </div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-600">
            <span>Personal Info</span>
            <span>Academic Info</span>
          </div>
        </div>

        {/* Registration Form */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl text-center flex items-center justify-center space-x-2">
              <UserPlus className="h-5 w-5 text-blue-600" />
              <span>Create Account</span>
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

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Step 1: Personal Information */}
              {formStep === 1 && (
                <>
                  <div className="space-y-4">
                    <Input
                      label="Full Name"
                      type="text"
                      placeholder="Enter your full name"
                      disabled={isFormDisabled}
                      error={errors.name?.message}
                      {...register('name', {
                        required: 'Full name is required',
                        validate: (value) => validateName(value) || 'Please enter a valid name (2-50 characters, letters only)'
                      })}
                    />

                    <div className="space-y-2">
                      <div className="relative">
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
                        {isCheckingEmail && (
                          <div className="absolute right-3 top-9">
                            <div className="w-4 h-4 relative animate-pulse">
                              <Image src="/favicon.png" alt="Loading..." width={16} height={16} className="object-contain" />
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Email availability indicator */}
                      {emailAvailable === true && (
                        <div className="flex items-center gap-1 text-sm text-green-600">
                          <CheckCircle className="h-3 w-3" />
                          Email is available
                        </div>
                      )}
                      {emailAvailable === false && (
                        <div className="flex items-center gap-1 text-sm text-red-600">
                          <AlertCircle className="h-3 w-3" />
                          Email is already registered
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="w-full"
                      size="lg"
                      disabled={isFormDisabled || !watchedName || !watchedEmail || emailAvailable === false || !!errors.name || !!errors.email}
                    >
                      Continue
                    </Button>
                  </div>
                </>
              )}

              {/* Step 2: Password and Academic Information */}
              {formStep === 2 && (
                <>
                  <div className="space-y-4">
                    <div className="relative">
                      <Input
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a strong password"
                        disabled={isFormDisabled}
                        error={errors.password?.message}
                        {...register('password', {
                          required: 'Password is required',
                          validate: (value) => validatePassword(value) || 'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
                        })}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isFormDisabled}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>

                    {/* Password strength indicator */}
                    <PasswordStrengthIndicator strength={passwordStrength} />

                    <div className="relative">
                      <Input
                        label="Confirm Password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your password"
                        disabled={isFormDisabled}
                        error={errors.confirmPassword?.message}
                        {...register('confirmPassword', {
                          required: 'Please confirm your password',
                          validate: (value) => value === watchedPassword || 'Passwords do not match'
                        })}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={isFormDisabled}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium leading-none">
                          Graduation Year <span className="text-red-500">*</span>
                        </label>
                        <select
                          className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors mt-2"
                          disabled={isFormDisabled}
                          {...register('graduation_year', { 
                            required: 'Graduation year is required',
                            validate: (value) => validateGraduationYear(value) || 'Please select a valid graduation year'
                          })}
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
                        disabled={isFormDisabled}
                        error={errors.degree?.message}
                        {...register('degree', {
                          required: 'Degree is required',
                          minLength: { value: 2, message: 'Degree must be at least 2 characters' },
                          maxLength: { value: 100, message: 'Degree must be no more than 100 characters' }
                        })}
                      />
                    </div>

                    <Input
                      label="Major (Optional)"
                      type="text"
                      placeholder="e.g., Computer Science"
                      disabled={isFormDisabled}
                      error={errors.major?.message}
                      {...register('major', {
                        maxLength: { value: 100, message: 'Major must be no more than 100 characters' }
                      })}
                    />

                    {/* Terms and Conditions */}
                    <div className="flex items-start space-x-2">
                      <input
                        type="checkbox"
                        id="terms"
                        className="mt-1 rounded border-gray-300"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        disabled={isFormDisabled}
                      />
                      <label htmlFor="terms" className="text-sm text-gray-600">
                        I agree to the{' '}
                        <Link href="/terms" className="text-blue-600 hover:text-blue-800 transition-colors">
                          Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link href="/privacy" className="text-blue-600 hover:text-blue-800 transition-colors">
                          Privacy Policy
                        </Link>
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      className="flex-1"
                      disabled={isFormDisabled}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      size="lg"
                      loading={isLoading}
                      disabled={isFormDisabled || !isValid || !agreedToTerms}
                      icon={<GraduationCap className="h-4 w-4" />}
                    >
                      {isLoading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                  </div>
                </>
              )}
            </form>

            {/* Google Sign-In Option */}
            {formStep === 1 && (
              <>
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
              </>
            )}

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/80 text-gray-500">Already have an account?</span>
              </div>
            </div>

            <Link href="/auth/login">
              <Button
                variant="outline"
                className="w-full"
                size="lg"
                disabled={isFormDisabled}
              >
                Sign In Instead
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Debug Info (Development Only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-3 bg-gray-100 rounded-lg text-xs text-gray-600">
            <p>Debug Info:</p>
            <p>Form Step: {formStep}</p>
            <p>Auth State: {authState}</p>
            <p>Email Available: {emailAvailable?.toString()}</p>
            <p>Terms Agreed: {agreedToTerms.toString()}</p>
            <p>Form Valid: {isValid.toString()}</p>
          </div>
        )}
      </div>
    </div>
  );
}
