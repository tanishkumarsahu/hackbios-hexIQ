'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await authAPI.getProfile();
      if (response.success) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.login({ email, password });
      
      if (response.success) {
        const { user, token } = response.data;
        
        // Store token and user data
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_data', JSON.stringify(user));
        
        setUser(user);
        return { success: true, user };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.register(userData);
      
      if (response.success) {
        const { user, token } = response.data;
        
        // Store token and user data
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_data', JSON.stringify(user));
        
        setUser(user);
        return { success: true, user };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state regardless of API call success
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      setUser(null);
      setError(null);
    }
  };

  const updateProfile = async (updates) => {
    try {
      if (!user) throw new Error('No user logged in');
      
      setLoading(true);
      // This would call the users API to update profile
      // For now, just update local state
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('user_data', JSON.stringify(updatedUser));
      
      return { success: true, user: updatedUser };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Profile update failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    clearError,
    isAuthenticated: !!user,
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
