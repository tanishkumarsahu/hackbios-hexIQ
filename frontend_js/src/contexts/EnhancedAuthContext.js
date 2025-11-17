'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import { authLogger } from '../lib/logger';
import { updateProfileCompletionStatus, isProfileComplete } from '../lib/profileCompletionService';
import { toast } from 'sonner';
import { authAPI } from '../lib/api';

const AuthContext = createContext(undefined);

// Auth error types
export const AUTH_ERRORS = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  WEAK_PASSWORD: 'WEAK_PASSWORD',
  INVALID_EMAIL: 'INVALID_EMAIL',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  OAUTH_ERROR: 'OAUTH_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  RATE_LIMITED: 'RATE_LIMITED',
  ACCOUNT_DISABLED: 'ACCOUNT_DISABLED',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED'
};

// Auth states
export const AUTH_STATES = {
  LOADING: 'LOADING',
  AUTHENTICATED: 'AUTHENTICATED',
  UNAUTHENTICATED: 'UNAUTHENTICATED',
  ERROR: 'ERROR'
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authState, setAuthState] = useState(AUTH_STATES.LOADING);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();
  
  // Prevent duplicate disabled account notifications
  const disabledAccountHandled = React.useRef(false);

  // Enhanced error handler
  const handleAuthError = useCallback((error, context = 'auth') => {
    console.error(`Auth error in ${context}:`, error);
    
    let userMessage = 'An unexpected error occurred. Please try again.';
    let errorType = AUTH_ERRORS.UNKNOWN;

    if (error?.message) {
      const message = error.message.toLowerCase();
      
      // Supabase specific error handling
      if (message.includes('invalid login credentials') || message.includes('invalid email or password')) {
        userMessage = 'Invalid email or password. Please check your credentials and try again.';
        errorType = AUTH_ERRORS.INVALID_CREDENTIALS;
      } else if (message.includes('email not confirmed')) {
        userMessage = 'Please check your email and click the confirmation link before signing in.';
        errorType = AUTH_ERRORS.EMAIL_NOT_CONFIRMED;
      } else if (message.includes('user not found')) {
        userMessage = 'No account found with this email address.';
        errorType = AUTH_ERRORS.USER_NOT_FOUND;
      } else if (message.includes('user already registered')) {
        userMessage = 'An account with this email already exists. Try signing in instead.';
        errorType = AUTH_ERRORS.USER_EXISTS;
      } else if (message.includes('password should be at least')) {
        userMessage = 'Password must be at least 6 characters long.';
        errorType = AUTH_ERRORS.WEAK_PASSWORD;
      } else if (message.includes('password should contain at least one character')) {
        userMessage = 'Password must include: lowercase letter, uppercase letter, number, and special character (!@#$%^&*).';
        errorType = AUTH_ERRORS.WEAK_PASSWORD;
      } else if (message.includes('signup is disabled')) {
        userMessage = 'New registrations are currently disabled. Please contact support.';
        errorType = AUTH_ERRORS.SIGNUP_DISABLED;
      } else if (message.includes('invalid email')) {
        userMessage = 'Please enter a valid email address.';
        errorType = AUTH_ERRORS.INVALID_EMAIL;
      } else if (message.includes('network') || message.includes('fetch')) {
        userMessage = 'Network error. Please check your connection and try again.';
        errorType = AUTH_ERRORS.NETWORK_ERROR;
      } else if (message.includes('rate limit') || message.includes('too many requests')) {
        userMessage = 'Too many attempts. Please wait a moment before trying again.';
        errorType = AUTH_ERRORS.RATE_LIMITED;
      } else if (message.includes('session not found') || message.includes('jwt expired')) {
        userMessage = 'Your session has expired. Please sign in again.';
        errorType = AUTH_ERRORS.SESSION_EXPIRED;
      }
    }

    const authError = {
      type: errorType,
      message: error?.message || 'Unknown error',
      userMessage,
      context,
      timestamp: new Date().toISOString()
    };

    // Only show toast for unexpected errors, not handled ones
    if (!error?.message?.includes('User already registered') && 
        !error?.message?.includes('Invalid login credentials')) {
      toast.error('Authentication Error', {
        description: userMessage,
      });
    }

    setError(authError);
    return authError;
  }, []);

  // Enhanced provider detection (v2 compatible)
  const checkUserProvider = useCallback(async (email) => {
    try {
      // Method 1: Try to sign in with a dummy password to check if user exists
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: 'dummy-test-password-12345-very-unlikely'
      });

      if (signInError) {
        if (signInError.message?.includes('Invalid login credentials')) {
          // User exists - now try to determine provider type
          try {
            // Try password reset to determine if it's an email user
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
              redirectTo: `${window.location.origin}/auth/reset-password`
            });

            if (!resetError) {
              // Password reset email sent successfully = email provider
              console.log('Provider detection: email (reset successful)');
              return { exists: true, provider: 'email' };
            } else if (resetError.message?.includes('cannot reset password') || 
                       resetError.message?.includes('social') ||
                       resetError.message?.includes('oauth')) {
              // Cannot reset password = social provider (Google)
              console.log('Provider detection: google (cannot reset)');
              return { exists: true, provider: 'google' };
            } else {
              // Other reset error, but user exists - assume email
              console.log('Provider detection: email (fallback)');
              return { exists: true, provider: 'email' };
            }
          } catch (resetError) {
            // Reset API call failed, likely Google user or API issue
            console.log('Provider detection: google (reset failed)');
            return { exists: true, provider: 'google' };
          }
        } else if (signInError.message?.includes('Email not confirmed')) {
          // User exists with email but not confirmed
          console.log('Provider detection: email (not confirmed)');
          return { exists: true, provider: 'email' };
        } else if (signInError.message?.includes('User not found')) {
          // User doesn't exist
          console.log('Provider detection: user not found');
          return { exists: false, provider: null };
        } else if (signInError.message?.includes('signup is disabled')) {
          // User exists but signup disabled
          console.log('Provider detection: email (signup disabled)');
          return { exists: true, provider: 'email' };
        }
      }

      // If no error from sign in (shouldn't happen with dummy password)
      console.log('Provider detection: unknown (no error)');
      return { exists: true, provider: 'unknown' };
    } catch (error) {
      console.error('Provider detection error:', error);
      return { exists: true, provider: 'unknown' };
    }
  }, []);

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
    if (authState === AUTH_STATES.ERROR) {
      setAuthState(user ? AUTH_STATES.AUTHENTICATED : AUTH_STATES.UNAUTHENTICATED);
    }
  }, [authState, user]);

  // Session management
  const clearSession = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    setUser(null);
    setAuthState(AUTH_STATES.UNAUTHENTICATED);
  }, []);

  // Check authentication status and set up listeners
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setAuthState(AUTH_STATES.LOADING);
        
        // Step 1: Get current session with extended timeout and better error handling
        let sessionResult;
        try {
          sessionResult = await Promise.race([
            supabase.auth.getSession(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Session timeout')), 30000) // Increased to 30s
            )
          ]);
        } catch (timeoutError) {
          // If session fetch times out, try one more time without timeout
          console.warn('Session fetch timed out, retrying without timeout...');
          try {
            sessionResult = await supabase.auth.getSession();
          } catch (retryError) {
            console.error('Session fetch failed on retry:', retryError);
            // If retry also fails, assume no session
            setAuthState(AUTH_STATES.UNAUTHENTICATED);
            setIsInitialized(true);
            return;
          }
        }
        
        const { data: { session } } = sessionResult;
        
        if (session?.user) {
          // Step 2: Wait for auth to be fully established
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Step 3: Fetch FULL user data with robust handling
          let dbUserData = null;
          try {
            console.log('🔍 [initializeAuth] Fetching full user profile from database...');
            const userResult = await Promise.race([
              supabase
                .from('users')
                .select('*')  // ✅ FETCH ALL FIELDS
                .eq('id', session.user.id)
                .maybeSingle(),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('User data fetch timeout')), 5000)
              )
            ]);
            
            if (!userResult.error && userResult.data) {
              dbUserData = userResult.data;
              console.log('✅ [initializeAuth] Full user data loaded:', dbUserData);
              console.log('📊 [initializeAuth] Key fields check:', {
                phone: dbUserData.phone,
                bio: dbUserData.bio,
                graduation_year: dbUserData.graduation_year,
                profile_completed: dbUserData.profile_completed,
                profile_completion_percentage: dbUserData.profile_completion_percentage
              });
            } else if (userResult.error) {
              console.error('❌ [initializeAuth] Error fetching user data:', userResult.error);
            } else {
              console.warn('⚠️ [initializeAuth] No user data returned from database');
            }
          } catch (error) {
            console.error('⚠️ [initializeAuth] User data fetch failed:', error.message);
          }
          
          // Convert Supabase user to our user format with ALL profile fields
          const userData = {
            id: session.user.id,
            email: session.user.email,
            name: dbUserData?.name || session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email,
            avatar_url: dbUserData?.avatar_url || session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture,
            provider: session.user.app_metadata?.provider || 'email',
            role: dbUserData?.role || 'user',
            // ✅ LOAD ALL PROFILE FIELDS FROM DATABASE
            phone: dbUserData?.phone || null,
            location: dbUserData?.location || null,
            bio: dbUserData?.bio || null,
            current_title: dbUserData?.current_title || null,
            current_company: dbUserData?.current_company || null,
            graduation_year: dbUserData?.graduation_year || null,
            degree: dbUserData?.degree || null,
            major: dbUserData?.major || null,
            linkedin_url: dbUserData?.linkedin_url || null,
            github_url: dbUserData?.github_url || null,
            website_url: dbUserData?.website_url || null,
            skills: dbUserData?.skills || [],
            interests: dbUserData?.interests || [],
            is_verified: dbUserData?.is_verified || false,
            is_active: dbUserData?.is_active === true,
            created_at: dbUserData?.created_at || null,
            updated_at: dbUserData?.updated_at || null,
            // ✅ CRITICAL: Include completion fields
            profile_completed: dbUserData?.profile_completed || false,
            profile_completion_percentage: dbUserData?.profile_completion_percentage || 0
          };
          
          console.log('✅ [initializeAuth] User object created with all fields:', userData);
          
          // CRITICAL: Check if user is disabled
          if (userData.is_active === false) {
            console.log('❌ [initializeAuth] User account is disabled, logging out');
            
            // Set flag FIRST to prevent any race conditions
            const shouldShowToast = !disabledAccountHandled.current;
            disabledAccountHandled.current = true;
            
            // Clean logout
            await supabase.auth.signOut();
            setUser(null);
            setAuthState(AUTH_STATES.UNAUTHENTICATED);
            setIsInitialized(true);
            
            // Only show toast once per session
            if (shouldShowToast) {
              toast.error('Account Disabled', {
                description: 'Your account has been disabled. Please contact support for assistance.',
                duration: 6000
              });
            }
            
            // Redirect to login after brief delay
            setTimeout(() => {
              router.push('/auth/login?error=disabled');
            }, 1000);
            
            return;
          }
          
          // Reset flag if user is active
          disabledAccountHandled.current = false;
          
          // If user has Google avatar but no DB avatar, save it to database (non-blocking)
          if (userData.provider === 'google' && !dbUserData?.avatar_url && userData.avatar_url) {
            // Don't await this - it's not critical for auth initialization
            supabase
              .from('users')
              .update({ avatar_url: userData.avatar_url })
              .eq('id', userData.id)
              .then(() => console.log('✅ Google avatar synced to database'))
              .catch(error => console.error('Failed to sync Google avatar:', error));
          }
          
          // Force new object reference to trigger re-renders
          setUser({ ...userData });
          setAuthState(AUTH_STATES.AUTHENTICATED);
        } else {
          setAuthState(AUTH_STATES.UNAUTHENTICATED);
        }
      } catch (error) {
        handleAuthError(error, 'initializeAuth');
        setAuthState(AUTH_STATES.UNAUTHENTICATED);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();

    // Set up auth state change listener (v2 API)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('🔥 [SIGNED_IN] Event fired for:', session.user.email);
          
          // Fetch user from database with ROBUST error handling
          let dbUser = null;
          try {
            console.log('🔍 [SIGNED_IN] Fetching user from database...');
            
            const { data, error } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle();
            
            console.log('📊 [SIGNED_IN] Database response:', { 
              hasData: !!data, 
              hasError: !!error,
              errorMessage: error?.message 
            });
            
            if (error) {
              console.error('❌ [SIGNED_IN] Database error:', error);
              // Don't create new user on error - user might exist
              return;
            }
            
            if (data) {
              dbUser = data;
              console.log('✅ [SIGNED_IN] User found in database:', {
                id: data.id,
                email: data.email,
                name: data.name,
                hasAllFields: !!(data.phone && data.bio && data.graduation_year)
              });
            } else {
              // User truly doesn't exist - create them
              console.log('⚠️ [SIGNED_IN] User not found, creating new user...');
              
              const newUser = {
                id: session.user.id,
                email: session.user.email,
                name: session.user.user_metadata?.full_name || 
                      session.user.user_metadata?.name || 
                      session.user.email.split('@')[0],
                avatar_url: session.user.user_metadata?.avatar_url || 
                           session.user.user_metadata?.picture,
                is_active: true,  // New users are active by default
                role: 'user'      // Default role
              };
              
              const { data: created, error: createError } = await supabase
                .from('users')
                .insert([newUser])
                .select()
                .single();
              
              if (!createError && created) {
                dbUser = created;
                console.log('✅ [SIGNED_IN] New user created:', newUser.email);
              } else {
                console.error('❌ [SIGNED_IN] Failed to create user:', createError);
                return;
              }
            }
          } catch (error) {
            console.error('💥 [SIGNED_IN] Exception:', error.message);
            return;
          }
          
          // Load ALL profile fields from database
          const userData = {
            id: session.user.id,
            email: session.user.email,
            name: dbUser?.name || session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email,
            avatar_url: dbUser?.avatar_url || session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture,
            provider: session.user.app_metadata?.provider || 'email',
            role: dbUser?.role || 'user',
            // Load all profile fields from database
            phone: dbUser?.phone || null,
            location: dbUser?.location || null,
            bio: dbUser?.bio || null,
            current_title: dbUser?.current_title || null,
            current_company: dbUser?.current_company || null,
            graduation_year: dbUser?.graduation_year || null,
            degree: dbUser?.degree || null,
            major: dbUser?.major || null,
            linkedin_url: dbUser?.linkedin_url || null,
            github_url: dbUser?.github_url || null,
            website_url: dbUser?.website_url || null,
            skills: dbUser?.skills || [],
            interests: dbUser?.interests || [],
            is_verified: dbUser?.is_verified || false,
            is_active: dbUser?.is_active === true,
            created_at: dbUser?.created_at || null,
            updated_at: dbUser?.updated_at || null,
            // ✅ CRITICAL: Include completion fields
            profile_completed: dbUser?.profile_completed || false,
            profile_completion_percentage: dbUser?.profile_completion_percentage || 0
          }
          
          console.log('📦 [SIGNED_IN] Final userData object:', {
            id: userData.id,
            email: userData.email,
            name: userData.name,
            phone: userData.phone,
            bio: userData.bio,
            graduation_year: userData.graduation_year,
            degree: userData.degree,
            profile_completed: userData.profile_completed,
            profile_completion_percentage: userData.profile_completion_percentage,
            is_active: userData.is_active
          });
          
          // CRITICAL: Check if user is disabled
          if (userData.is_active === false) {
            console.log('❌ [SIGNED_IN] User account is disabled, logging out');
            
            // Set flag FIRST to prevent any race conditions
            const shouldShowToast = !disabledAccountHandled.current;
            disabledAccountHandled.current = true;
            
            // Clean logout
            await supabase.auth.signOut();
            setUser(null);
            setAuthState(AUTH_STATES.UNAUTHENTICATED);
            
            // Only show toast once per session
            if (shouldShowToast) {
              toast.error('Account Disabled', {
                description: 'Your account has been disabled. Please contact support for assistance.',
                duration: 6000
              });
            }
            
            // Redirect to login
            setTimeout(() => {
              router.push('/auth/login?error=disabled');
            }, 1000);
            
            return;
          }
          
          // Reset flag if user is active
          disabledAccountHandled.current = false;
          
          // Force new object reference to trigger re-renders
          setUser({ ...userData });
          setAuthState(AUTH_STATES.AUTHENTICATED);
          console.log('✅ [SIGNED_IN] User state updated successfully');
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setAuthState(AUTH_STATES.UNAUTHENTICATED);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          // Fetch FULL user data from database on token refresh
          let dbUser = null;
          try {
            const { data, error } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle();
            
            if (!error && data) {
              dbUser = data;
            }
          } catch (error) {
            console.log('User data fetch skipped:', error.message);
          }
          
          // Load ALL profile fields from database
          const userData = {
            id: session.user.id,
            email: session.user.email,
            name: dbUser?.name || session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email,
            avatar_url: dbUser?.avatar_url || session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture,
            provider: session.user.app_metadata?.provider || 'email',
            role: dbUser?.role || 'user',
            // Load all profile fields from database
            phone: dbUser?.phone || null,
            location: dbUser?.location || null,
            bio: dbUser?.bio || null,
            current_title: dbUser?.current_title || null,
            current_company: dbUser?.current_company || null,
            graduation_year: dbUser?.graduation_year || null,
            degree: dbUser?.degree || null,
            major: dbUser?.major || null,
            linkedin_url: dbUser?.linkedin_url || null,
            github_url: dbUser?.github_url || null,
            website_url: dbUser?.website_url || null,
            skills: dbUser?.skills || [],
            interests: dbUser?.interests || [],
            is_verified: dbUser?.is_verified || false,
            is_active: dbUser?.is_active === true,
            created_at: dbUser?.created_at || null,
            updated_at: dbUser?.updated_at || null,
            // ✅ CRITICAL: Include completion fields
            profile_completed: dbUser?.profile_completed || false,
            profile_completion_percentage: dbUser?.profile_completion_percentage || 0
          };
          
          // CRITICAL: Check if user is disabled during token refresh
          if (userData.is_active === false) {
            console.log('❌ [TOKEN_REFRESHED] User account is disabled, logging out');
            
            // Set flag FIRST to prevent any race conditions
            const shouldShowToast = !disabledAccountHandled.current;
            disabledAccountHandled.current = true;
            
            // Clean logout
            await supabase.auth.signOut();
            setUser(null);
            setAuthState(AUTH_STATES.UNAUTHENTICATED);
            
            // Only show toast once per session
            if (shouldShowToast) {
              toast.error('Account Disabled', {
                description: 'Your account has been disabled. Please contact support for assistance.',
                duration: 6000
              });
            }
            
            // Redirect to login
            setTimeout(() => {
              router.push('/auth/login?error=disabled');
            }, 1000);
            
            return;
          }
          
          // Reset flag if user is active
          disabledAccountHandled.current = false;
          
          // Force new object reference to trigger re-renders
          setUser({ ...userData });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [handleAuthError]);

  // Supabase email login
  const login = useCallback(async (emailOrCredentials, password) => {
    try {
      setAuthState(AUTH_STATES.LOADING);
      clearError();

      // Handle both calling formats: login(email, password) and login({email, password})
      const credentials = typeof emailOrCredentials === 'string' 
        ? { email: emailOrCredentials, password: password }
        : emailOrCredentials;


      // Validate credentials
      if (!credentials.email || !credentials.password) {
        console.error('Login validation failed:', credentials);
        toast.error('Missing Information', {
          description: 'Please provide both email and password.',
        });
        setAuthState(AUTH_STATES.UNAUTHENTICATED);
        return { 
          success: false, 
          error: 'MISSING_CREDENTIALS',
          message: 'Missing email or password'
        };
      }

      // Use Supabase auth for email login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        // Handle login errors with toast
        if (error.message?.includes('Invalid login credentials')) {
          // For invalid credentials, show a generic helpful message
          // Don't try to detect provider since user might have both email and Google
          toast.error('Invalid Credentials', {
            description: 'The email or password is incorrect. You can also try "Sign in with Google" if you registered with Google.',
          });
          
          setAuthState(AUTH_STATES.UNAUTHENTICATED);
          return { 
            success: false, 
            error: 'INVALID_CREDENTIALS',
            message: 'Invalid credentials'
          };
        }
        throw error;
      }

      if (data.session && data.user) {
        // CRITICAL: Fetch user role AND is_active from database BEFORE setting user
        let userRole = 'user'; // default
        let isActive = true;
        try {
          const { data: dbUser, error: dbError } = await supabase
            .from('users')
            .select('role, organization_id, is_active')
            .eq('id', data.user.id)
            .single();
          
          if (!dbError && dbUser) {
            userRole = dbUser.role || 'user';
            isActive = dbUser.is_active === true;
            
            // CRITICAL: Check if user is disabled
            if (isActive === false) {
              console.log('❌ [Login] User account is disabled');
              
              // Set flag FIRST
              const shouldShowToast = !disabledAccountHandled.current;
              disabledAccountHandled.current = true;
              
              // Clean logout
              await supabase.auth.signOut();
              
              setAuthState(AUTH_STATES.UNAUTHENTICATED);
              
              // Show error toast only once
              if (shouldShowToast) {
                toast.error('Account Disabled', {
                  description: 'Your account has been disabled. Please contact support for assistance.',
                  duration: 6000
                });
              }
              
              return { 
                success: false, 
                error: 'ACCOUNT_DISABLED',
                message: 'Account is disabled'
              };
            }
            
            // Reset flag if user is active
            disabledAccountHandled.current = false;
          }
        } catch (err) {
          console.error('Error fetching user role:', err);
        }
        
        // Set user with role included
        const userData = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || data.user.email,
          avatar_url: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture,
          provider: data.user.app_metadata?.provider || 'email',
          role: userRole // INCLUDE ROLE
        };
        
        setUser(userData);
        setAuthState(AUTH_STATES.AUTHENTICATED);
        
        // Only show toast if not silent (for admin login)
        if (!credentials.silent) {
          toast.success('Welcome Back!', {
            description: 'You have successfully signed in to your account.',
          });
        }
        
        return { success: true, user: userData };
      }

      // If we get here, something unexpected happened
      toast.error('Login Failed', {
        description: 'Login completed but no session was created. Please try again.',
      });
      setAuthState(AUTH_STATES.UNAUTHENTICATED);
      return { 
        success: false, 
        error: 'NO_SESSION',
        message: 'No session created'
      };
    } catch (error) {
      console.error('Login error:', error);
      
      // Only show toast for unexpected errors (not already handled ones)
      if (!error.message?.includes('Invalid login credentials')) {
        toast.error('Login Error', {
          description: 'An unexpected error occurred during login. Please try again.',
        });
      }
      
      setAuthState(AUTH_STATES.UNAUTHENTICATED);
      return { 
        success: false, 
        error: 'LOGIN_ERROR',
        message: error.message || 'Login failed'
      };
    }
  }, [handleAuthError, clearError]);

  // Supabase email registration
  const register = useCallback(async (userData) => {
    try {
      setAuthState(AUTH_STATES.LOADING);
      clearError();

      // Check if user is already authenticated
      if (authState === AUTH_STATES.AUTHENTICATED) {
        console.warn('User is already authenticated');
        return { success: true, user };
      }

      // Validate password requirements BEFORE calling Supabase
      const password = userData.password;
      const hasLowercase = /[a-z]/.test(password);
      const hasUppercase = /[A-Z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password);
      const isLongEnough = password.length >= 6;

      if (!hasLowercase || !hasUppercase || !hasNumber || !hasSymbol || !isLongEnough) {
        setAuthState(AUTH_STATES.UNAUTHENTICATED);
        return {
          success: false,
          error: 'WEAK_PASSWORD',
          message: 'Password must include: lowercase letter, uppercase letter, number, and special character (!@#$%^&*).'
        };
      }

      // Use Supabase auth for email registration (v2 API)
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            full_name: userData.name,
            graduation_year: userData.graduation_year,
            degree: userData.degree,
            major: userData.major,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        // Handle specific Supabase errors with better messages
        if (error.message?.includes('User already registered')) {
          // Check what provider the existing user uses
          const providerInfo = await checkUserProvider(userData.email);
          
          if (providerInfo.exists) {
            if (providerInfo.provider === 'google') {
              toast.error('Account Exists with Google', {
                description: 'This email is already registered with Google Sign-In. Please use the "Sign in with Google" button instead.',
              });
            } else if (providerInfo.provider === 'email') {
              toast.error('Account Exists with Email', {
                description: 'This email is already registered. Please use the "Sign In" page with your email and password.',
              });
            } else {
              toast.error('Account Already Exists', {
                description: 'An account with this email already exists. Please try signing in instead.',
              });
            }
          } else {
            toast.error('Account Already Exists', {
              description: 'An account with this email already exists. Please try signing in instead.',
            });
          }
          
          setAuthState(AUTH_STATES.UNAUTHENTICATED);
          return { 
            success: false, 
            error: 'ACCOUNT_EXISTS',
            message: 'Account already exists',
            provider: providerInfo.provider
          };
        }
        throw error;
      }

      // Check if email confirmation is required
      if (data.user && !data.session) {
        // Email confirmation required
        setAuthState(AUTH_STATES.UNAUTHENTICATED);
        return { 
          success: true, 
          requiresEmailConfirmation: true,
          email: userData.email,
          message: 'Please check your email and click the confirmation link to complete registration.'
        };
      }

      // If session exists, user is immediately authenticated
      if (data.session && data.user) {
        // 🚀 FIRST USER BOOTSTRAP: Check if this is the first user
        try {
          const { data: existingSuperAdmins, error: checkError } = await supabase
            .from('users')
            .select('id')
            .eq('role', 'super_admin')
            .limit(1);
          
          if (!checkError && (!existingSuperAdmins || existingSuperAdmins.length === 0)) {
            // This is the first user - make them super admin
            console.log('🎉 First user detected - assigning super_admin role');
            
            const { error: updateError } = await supabase
              .from('users')
              .update({ role: 'super_admin' })
              .eq('id', data.user.id);
            
            if (!updateError) {
              console.log('✅ First user promoted to super_admin');
              
              // Update local user object with role
              const updatedUser = { ...data.user, role: 'super_admin' };
              setUser(updatedUser);
              setAuthState(AUTH_STATES.AUTHENTICATED);
              
              toast.success('Welcome, Super Admin!', {
                description: 'You are the first user and have been assigned Super Admin privileges. You can now manage the platform.',
              });
              
              return { success: true, user: updatedUser, isFirstUser: true };
            }
          }
        } catch (bootstrapError) {
          console.error('First user bootstrap error:', bootstrapError);
          // Continue with normal flow if bootstrap fails
        }
        
        setUser(data.user);
        setAuthState(AUTH_STATES.AUTHENTICATED);
        toast.success('Account Created Successfully!', {
          description: 'Welcome to AlumNode. Your account has been created and you are now signed in.',
        });
        return { success: true, user: data.user };
      }

      return { success: true, requiresEmailConfirmation: true };
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle password errors gracefully
      if (error?.message?.toLowerCase().includes('password')) {
        setAuthState(AUTH_STATES.UNAUTHENTICATED);
        return {
          success: false,
          error: 'WEAK_PASSWORD',
          message: 'Password must include: lowercase letter, uppercase letter, number, and special character (!@#$%^&*).'
        };
      }
      
      const authError = handleAuthError(error, 'register');
      setAuthState(AUTH_STATES.UNAUTHENTICATED);
      
      // Return error object instead of throwing
      return {
        success: false,
        error: authError.type,
        message: authError.userMessage
      };
    }
  }, [handleAuthError, clearError, authState, user]);

  // Google OAuth login
  const signInWithGoogle = useCallback(async () => {
    try {
      setAuthState(AUTH_STATES.LOADING);
      clearError();

      // Use Supabase OAuth for Google sign-in with v2 API
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        },
      });

      if (error) {
        toast.error('Google Sign-In Failed', {
          description: error.message || 'Failed to initiate Google sign-in. Please try again.',
        });
        throw error;
      }

      // Note: The user won't be immediately authenticated here due to the redirect
      // The actual authentication will be handled by the callback and onAuthStateChange
      return { success: true, data };
    } catch (error) {
      const authError = handleAuthError(error, 'signInWithGoogle');
      setAuthState(AUTH_STATES.UNAUTHENTICATED);
      throw authError;
    }
  }, [handleAuthError, clearError]);

  // Update user profile - PRODUCTION READY with robust error handling
  const updateProfile = useCallback(async (profileData) => {
    console.log('🔄 [updateProfile] Starting profile update...');
    console.log('📦 [updateProfile] Profile data received:', profileData);
    console.log('👤 [updateProfile] Current user:', { id: user?.id, email: user?.email });
    
    try {
      setError(null);
      
      // VALIDATION 1: Check user exists
      if (!user?.id) {
        console.error('❌ [updateProfile] No user ID found!');
        throw new Error('You must be logged in to update your profile');
      }

      // VALIDATION 2: Check required fields
      if (!profileData.name || profileData.name.trim() === '') {
        throw new Error('Name is required');
      }
      if (!profileData.email || profileData.email.trim() === '') {
        throw new Error('Email is required');
      }

      // VALIDATION 3: Sanitize and prepare data
      const updateData = {
        name: profileData.name?.trim() || null,
        phone: profileData.phone?.trim() || null,
        location: profileData.location?.trim() || null,
        bio: profileData.bio?.trim() || null,
        current_title: profileData.current_title?.trim() || null,
        current_company: profileData.current_company?.trim() || null,
        graduation_year: profileData.graduation_year ? parseInt(profileData.graduation_year) : null,
        degree: profileData.degree?.trim() || null,
        major: profileData.major?.trim() || null,
        linkedin_url: profileData.linkedin_url?.trim() || null,
        github_url: profileData.github_url?.trim() || null,
        website_url: profileData.website_url?.trim() || null,
        avatar_url: profileData.avatar_url?.trim() || null,
        skills: Array.isArray(profileData.skills) ? profileData.skills : [],
        interests: Array.isArray(profileData.interests) ? profileData.interests : [],
        updated_at: new Date().toISOString()
      };

      console.log('📝 [updateProfile] Sanitized update data:', updateData);
      console.log('🔍 [updateProfile] Updating user with ID:', user.id);

      // STEP 1: Update users table in database with TIMEOUT
      console.log('💾 [updateProfile] Attempting database update...');
      
      // Create timeout promise (10 seconds)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Database update timeout - RLS may be blocking the query. Please disable RLS or create proper policies.')), 10000);
      });
      
      // Race between update and timeout
      const updatePromise = supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .single();
      
      const { data: dbData, error: dbError } = await Promise.race([updatePromise, timeoutPromise]);
      
      // DETAILED ERROR HANDLING
      if (dbError) {
        console.error('❌ [updateProfile] Database error:', dbError);
        console.error('❌ [updateProfile] Error code:', dbError.code);
        console.error('❌ [updateProfile] Error message:', dbError.message);
        console.error('❌ [updateProfile] Error details:', dbError.details);
        console.error('❌ [updateProfile] Error hint:', dbError.hint);
        
        // Handle specific error types
        if (dbError.code === 'PGRST116') {
          throw new Error('Profile not found. Please try logging out and back in.');
        } else if (dbError.code === '42501') {
          throw new Error('Permission denied. RLS policies may be blocking this update. Please contact support.');
        } else if (dbError.code === '23505') {
          throw new Error('This email is already in use by another account.');
        } else if (dbError.message?.includes('permission denied')) {
          throw new Error('You do not have permission to update this profile. RLS may be enabled.');
        } else if (dbError.message?.includes('violates')) {
          throw new Error('Invalid data format. Please check all fields.');
        } else {
          throw new Error(`Database error: ${dbError.message || 'Unknown error'}`);
        }
      }

      // VALIDATION 4: Check if update returned data
      if (!dbData) {
        console.error('❌ [updateProfile] No data returned from database!');
        throw new Error('Update failed - no data returned. The user may not exist.');
      }

      console.log('✅ [updateProfile] Database update successful!');
      console.log('📊 [updateProfile] Updated data:', dbData);

      // STEP 2: Verify data was actually written to database
      console.log('🔍 [updateProfile] Verifying database write...');
      const { data: verifyData, error: verifyError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (verifyError) {
        console.error('⚠️ [updateProfile] Verification failed:', verifyError);
      } else {
        console.log('✅ [updateProfile] Verification successful - data in DB:', verifyData);
      }

      // STEP 3: Update auth metadata (non-critical)
      console.log('🔐 [updateProfile] Updating auth metadata...');
      try {
        const { error: authError } = await supabase.auth.updateUser({
          data: {
            full_name: updateData.name,
            avatar_url: updateData.avatar_url
          }
        });
        
        if (authError) {
          console.warn('⚠️ [updateProfile] Auth metadata update failed (non-critical):', authError);
        } else {
          console.log('✅ [updateProfile] Auth metadata updated');
        }
      } catch (authError) {
        console.warn('⚠️ [updateProfile] Auth metadata update exception (non-critical):', authError);
      }

      // STEP 4: Update profile completion status (non-blocking)
      console.log('📊 [updateProfile] Calculating profile completion...');
      try {
        const completionResult = await updateProfileCompletionStatus(user.id, verifyData || dbData);
        console.log('✅ [updateProfile] Completion status updated:', completionResult);
      } catch (completionError) {
        console.warn('⚠️ [updateProfile] Completion status update failed (non-critical, continuing):', completionError);
        // Don't block the update - calculate locally with weighted sections
        const userData = verifyData || dbData;
        const sections = {
          basic: { weight: 30, count: 0, total: 5 },
          education: { weight: 25, count: 0, total: 3 },
          professional: { weight: 25, count: 0, total: 2 },
          social: { weight: 10, count: 0, total: 3 },
          additional: { weight: 10, count: 0, total: 3 }
        };
        
        // Basic
        if (userData.name?.trim()) sections.basic.count++;
        if (userData.email?.trim()) sections.basic.count++;
        if (userData.phone?.trim()) sections.basic.count++;
        if (userData.location?.trim()) sections.basic.count++;
        if (userData.bio?.trim() && userData.bio.length >= 50) sections.basic.count++;
        
        // Education
        if (userData.graduation_year) sections.education.count++;
        if (userData.degree?.trim()) sections.education.count++;
        if (userData.major?.trim()) sections.education.count++;
        
        // Professional
        if (userData.current_title?.trim()) sections.professional.count++;
        if (userData.current_company?.trim()) sections.professional.count++;
        
        // Social
        if (userData.linkedin_url?.trim()) sections.social.count++;
        if (userData.github_url?.trim()) sections.social.count++;
        if (userData.website_url?.trim()) sections.social.count++;
        
        // Additional
        if (userData.avatar_url?.trim()) sections.additional.count++;
        if (Array.isArray(userData.skills) && userData.skills.length >= 3) sections.additional.count++;
        if (Array.isArray(userData.interests) && userData.interests.length >= 2) sections.additional.count++;
        
        // Calculate weighted percentage
        let weightedSum = 0;
        let totalWeight = 0;
        Object.values(sections).forEach(section => {
          const sectionPercentage = (section.count / section.total) * 100;
          weightedSum += (sectionPercentage / 100) * section.weight;
          totalWeight += section.weight;
        });
        
        const percentage = Math.round((weightedSum / totalWeight) * 100);
        userData.profile_completion_percentage = percentage;
        userData.profile_completed = percentage === 100;
      }
      
      // STEP 5: Update local user state with VERIFIED database data
      console.log('🔄 [updateProfile] Updating local state...');
      const finalUserData = verifyData || dbData;
      setUser(prevUser => {
        const newUser = {
          ...prevUser,
          ...finalUserData,
          // Ensure arrays are preserved
          skills: finalUserData.skills || [],
          interests: finalUserData.interests || [],
          // CRITICAL: Ensure completion fields are included
          profile_completed: finalUserData.profile_completed || false,
          profile_completion_percentage: finalUserData.profile_completion_percentage || 0
        };
        console.log('✅ [updateProfile] Local state updated:', newUser);
        return newUser;
      });

      console.log('🎉 [updateProfile] Profile update complete!');
      console.log('📊 [updateProfile] Final completion status:', {
        completed: finalUserData.profile_completed,
        percentage: finalUserData.profile_completion_percentage
      });
      
      // Return VERIFIED data (includes completion fields)
      return { success: true, data: finalUserData };
      
    } catch (error) {
      console.error('💥 [updateProfile] FATAL ERROR:', error);
      console.error('💥 [updateProfile] Error type:', error.constructor.name);
      console.error('💥 [updateProfile] Error message:', error.message);
      console.error('💥 [updateProfile] Error stack:', error.stack);
      
      // Set error in context
      setError(error.message || 'Failed to update profile');
      
      // Re-throw with user-friendly message
      const userMessage = error.message || 'An unexpected error occurred while updating your profile';
      throw new Error(userMessage);
    }
  }, [user?.id, setError]);

  // Password reset request
  const requestPasswordReset = useCallback(async (email) => {
    try {
      setError(null);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      
      if (error) throw error;
      
      return { 
        success: true, 
        message: 'Password reset email sent. Please check your inbox.' 
      };
    } catch (error) {
      console.error('Password reset request error:', error);
      const authError = handleAuthError(error, 'requestPasswordReset');
      throw authError;
    }
  }, [handleAuthError]);

  // Password reset (with token)
  const resetPassword = useCallback(async (newPassword) => {
    try {
      setError(null);
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      return { 
        success: true, 
        message: 'Password updated successfully.' 
      };
    } catch (error) {
      console.error('Password reset error:', error);
      const authError = handleAuthError(error, 'resetPassword');
      throw authError;
    }
  }, [handleAuthError]);

  // Logout - Production Ready with Complete State Clearing and Hard Redirect
  const logout = useCallback(async () => {
    console.log('🚪 [Logout] Starting logout process...');
    authLogger.logoutEvent('STARTED', { timestamp: new Date().toISOString() });
    
    try {
      // Set logout flag FIRST to prevent AuthGuard from blocking
      sessionStorage.setItem('isLoggingOut', 'true');
      console.log('✅ [Logout] Logout flag set');
      
      // Clear React state IMMEDIATELY (prevents UI from showing stale data)
      setUser(null);
      setAuthState(AUTH_STATES.UNAUTHENTICATED);
      console.log('✅ [Logout] React state cleared');
      
      // Clear ALL storage IMMEDIATELY
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.removeItem('supabase.auth.token');
      console.log('✅ [Logout] Storage cleared');
      
      // Clear cookies
      document.cookie.split(";").forEach((c) => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      
      authLogger.logoutEvent('STORAGE_CLEARED', { status: 'success' });
      
      // Show toast BEFORE logout (so user sees it)
      toast.success('Logging out...', {
        description: 'Signing you out of your account.',
        duration: 2000,
        important: true
      });
      console.log('✅ [Logout] Toast shown');
      
      // Logout from Supabase (don't wait too long)
      try {
        await Promise.race([
          supabase.auth.signOut({ scope: 'global' }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000))
        ]);
        console.log('✅ [Logout] Supabase logout successful');
        authLogger.logoutEvent('SUPABASE_LOGOUT', { status: 'success' });
      } catch (error) {
        console.warn('⚠️ [Logout] Supabase logout failed or timed out:', error.message);
        authLogger.warn('Supabase logout failed', error);
      }
      
      // Logout from API in background (non-blocking)
      authAPI.logout().catch(e => {
        console.warn('⚠️ [Logout] API logout failed:', e);
        authLogger.warn('API logout failed', e);
      });
      
      // Wait briefly for toast visibility
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // HARD REDIRECT (most reliable method)
      console.log('🔄 [Logout] Redirecting to home page...');
      authLogger.logoutEvent('REDIRECTING', { destination: '/', method: 'hard' });
      
      // Use window.location for guaranteed redirect
      window.location.href = '/';
      
    } catch (error) {
      // Even if logout fails, FORCE everything to clear
      console.error('❌ [Logout] Error during logout:', error);
      authLogger.error('Logout error', error);
      
      // Force clear everything
      localStorage.clear();
      sessionStorage.clear();
      
      setUser(null);
      setAuthState(AUTH_STATES.UNAUTHENTICATED);
      
      // Force redirect anyway
      console.log('🔄 [Logout] Force redirecting after error...');
      window.location.href = '/';
    }
  }, []);

  // Refresh user data from database
  const refreshUser = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const { data: dbUser } = await supabase
        .from('users')
        .select('avatar_url, name')
        .eq('id', user.id)
        .single();
      
      if (dbUser) {
        setUser(prev => ({
          ...prev,
          avatar_url: dbUser.avatar_url,
          name: dbUser.name || prev.name
        }));
        console.log('✅ User data refreshed');
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  }, [user?.id]);

  const value = {
    user,
    authState,
    error,
    isLoading: authState === AUTH_STATES.LOADING,
    isAuthenticated: authState === AUTH_STATES.AUTHENTICATED,
    isInitialized,
    login,
    register,
    signInWithGoogle,
    updateProfile,
    requestPasswordReset,
    resetPassword,
    logout,
    refreshUser,
    clearError,
    AUTH_ERRORS,
    AUTH_STATES
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
