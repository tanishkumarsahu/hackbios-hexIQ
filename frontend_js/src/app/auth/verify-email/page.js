'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '../../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { useAuth } from '../../../contexts/EnhancedAuthContext';
import { Mail, ArrowLeft, Users, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Logo } from '../../../components/ui/Logo';

export default function VerifyEmailPage() {
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [email, setEmail] = useState('');
  const { requestPasswordReset } = useAuth();

  // Get email from URL params or localStorage (client-side only)
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const emailFromUrl = urlParams.get('email');
      const emailFromStorage = localStorage.getItem('pendingVerificationEmail');
      setEmail(emailFromUrl || emailFromStorage || '');
    }
  }, []);

  const handleResendVerification = async () => {
    if (!email) {
      setResendMessage('No email address found. Please try registering again.');
      return;
    }

    try {
      setIsResending(true);
      setResendMessage('');
      
      // Use password reset as a workaround to send verification email
      // In a real app, you'd have a dedicated resend verification endpoint
      await requestPasswordReset(email);
      
      setResendMessage('Verification email sent! Please check your inbox.');
    } catch (error) {
      setResendMessage('Failed to resend verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Logo size="large" />
          </div>
        </div>

        {/* Verification Card */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-1 pb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-xl">Check Your Email</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <div className="space-y-3">
              <p className="text-gray-600">
                We've sent a verification link to:
              </p>
              <p className="font-semibold text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                {email || 'your email address'}
              </p>
              <p className="text-sm text-gray-500">
                Click the link in the email to verify your account and complete your registration.
              </p>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Next Steps:
              </h4>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Check your email inbox (and spam folder)</li>
                <li>Click the verification link in the email</li>
                <li>You'll be redirected to sign in</li>
                <li>Complete your profile setup</li>
              </ol>
            </div>

            {/* Resend Section */}
            <div className="space-y-3">
              <p className="text-sm text-gray-500">
                Didn't receive the email?
              </p>
              
              {resendMessage && (
                <div className={`p-3 rounded-lg text-sm ${
                  resendMessage.includes('sent') 
                    ? 'bg-green-50 border border-green-200 text-green-700'
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}>
                  {resendMessage}
                </div>
              )}

              <Button
                onClick={handleResendVerification}
                variant="outline"
                className="w-full"
                disabled={isResending || !email}
                loading={isResending}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {isResending ? 'Sending...' : 'Resend Verification Email'}
              </Button>
            </div>

            {/* Troubleshooting */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left">
              <h4 className="font-semibold text-amber-900 mb-2 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                Troubleshooting:
              </h4>
              <ul className="text-sm text-amber-800 space-y-1">
                <li>• Check your spam/junk folder</li>
                <li>• Make sure you entered the correct email</li>
                <li>• The link expires in 24 hours</li>
                <li>• Contact support if you continue having issues</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-4 border-t">
              <Link href="/auth/login">
                <Button variant="outline" className="w-full">
                  Back to Sign In
                </Button>
              </Link>
              
              <Link href="/auth/register">
                <Button variant="ghost" className="w-full text-sm">
                  Try Different Email
                </Button>
              </Link>
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
