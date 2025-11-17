'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, AUTH_STATES } from '../../../contexts/EnhancedAuthContext';
import { supabase } from '../../../lib/supabase';
import { Button } from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Shield, Lock, Mail, AlertCircle, Loader2, ShieldCheck, Crown, Settings, LayoutDashboard } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, user, authState } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already logged in as admin
  useEffect(() => {
    if (authState === AUTH_STATES.AUTHENTICATED && user) {
      if (user.role === 'admin' || user.role === 'super_admin') {
        router.push('/admin/dashboard');
      } else {
        // User is logged in but not an admin
        setError('Access denied. This portal is for administrators only.');
      }
    }
  }, [user, authState, router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Pass silent flag to prevent auth context from showing toast
      const result = await login({ email, password, silent: true });

      if (result.success && result.user) {
        console.log('Login successful, user role:', result.user.role);
        
        // Check if user has admin role (role is now included in result.user)
        if (result.user.role === 'admin' || result.user.role === 'super_admin') {
          // Show admin-specific toast
          toast.success('Welcome back, Admin!');
          // Delay to ensure auth state is fully updated
          setTimeout(() => {
            router.push('/admin/dashboard');
            setLoading(false);
          }, 300);
        } else {
          // Not an admin - show error
          setError('Access denied. You do not have administrator privileges.');
          setLoading(false);
        }
      } else {
        setError(result.message || 'Invalid email or password');
        setLoading(false);
      }
    } catch (err) {
      console.error('Admin login error:', err);
      setError('An error occurred during login. Please try again.');
      setLoading(false);
    }
  };

  if (authState === AUTH_STATES.LOADING) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          {/* Unique Hexagonal Badge Design */}
          <div className="relative inline-flex items-center justify-center mb-6">
            {/* Animated rotating rings */}
            <div className="absolute w-24 h-24">
              <div className="absolute inset-0 border-2 border-blue-400 rounded-full opacity-20 animate-ping"></div>
              <div className="absolute inset-2 border-2 border-blue-500 rounded-full opacity-30" style={{ animation: 'spin 8s linear infinite reverse' }}></div>
            </div>
            
            {/* Hexagon container */}
            <div className="relative w-20 h-20" style={{ 
              clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
              background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #2563eb 100%)',
              boxShadow: '0 10px 40px rgba(59, 130, 246, 0.5), inset 0 1px 0 rgba(255,255,255,0.2)'
            }}>
              {/* Inner hexagon glow */}
              <div className="absolute inset-1" style={{ 
                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.5) 0%, rgba(37, 99, 235, 0.5) 100%)',
                animation: 'pulse 2s ease-in-out infinite'
              }}></div>
              
              {/* Icon composition */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  {/* Main shield */}
                  <ShieldCheck className="h-9 w-9 text-white drop-shadow-2xl" strokeWidth={2.5} />
                  
                  {/* Orbiting crown */}
                  <div className="absolute -top-2 -right-2" style={{ animation: 'orbit 3s linear infinite' }}>
                    <Crown className="h-5 w-5 text-yellow-300 drop-shadow-lg" strokeWidth={3} />
                  </div>
                  
                  {/* Sparkle effects */}
                  <div className="absolute -top-1 -left-1 w-2 h-2 bg-white rounded-full opacity-80" style={{ animation: 'twinkle 1.5s ease-in-out infinite' }}></div>
                  <div className="absolute -bottom-1 -right-1 w-1.5 h-1.5 bg-yellow-200 rounded-full opacity-60" style={{ animation: 'twinkle 1.5s ease-in-out infinite 0.5s' }}></div>
                </div>
              </div>
            </div>
            
            {/* Floating particles */}
            <div className="absolute w-32 h-32 pointer-events-none">
              <div className="absolute top-0 left-1/4 w-1 h-1 bg-blue-400 rounded-full" style={{ animation: 'float 3s ease-in-out infinite' }}></div>
              <div className="absolute top-1/4 right-0 w-1.5 h-1.5 bg-blue-500 rounded-full" style={{ animation: 'float 4s ease-in-out infinite 0.5s' }}></div>
              <div className="absolute bottom-1/4 left-0 w-1 h-1 bg-blue-600 rounded-full" style={{ animation: 'float 3.5s ease-in-out infinite 1s' }}></div>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-blue-600 to-blue-800">
            Admin Portal
          </h1>
          <div className="mb-2 px-4 py-2 bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 rounded-lg border border-blue-300 inline-block">
            <p className="text-base font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800">
              Shri Shankaracharya Technical Campus
            </p>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Sign in to access the administration dashboard
          </p>
        </div>

        {/* Custom CSS animations */}
        <style jsx>{`
          @keyframes orbit {
            0% { transform: rotate(0deg) translateX(12px) rotate(0deg); }
            100% { transform: rotate(360deg) translateX(12px) rotate(-360deg); }
          }
          
          @keyframes twinkle {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.5); }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.3; }
            50% { transform: translateY(-20px) translateX(10px); opacity: 0.8; }
          }
        `}</style>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">Access Denied</p>
                  <p className="text-sm text-red-600 mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Email Input */}
            <div>
              <Input
                label="Admin Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@sstc.ac.in"
                required
                icon={Mail}
                disabled={loading}
              />
            </div>

            {/* Password Input */}
            <div>
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                icon={Lock}
                disabled={loading}
              />
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={loading || !email || !password}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Signing in...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Sign in as Admin
                </>
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              Not an administrator?{' '}
              <button
                onClick={() => router.push('/auth/login')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Go to User Login
              </button>
            </p>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            🔒 This is a secure admin portal. All activities are logged and monitored.
          </p>
        </div>
      </div>
    </div>
  );
}
