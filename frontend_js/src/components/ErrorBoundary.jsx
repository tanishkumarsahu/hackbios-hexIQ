'use client';

import React from 'react';
import { AlertCircle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import { Button } from './ui/Button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log to error reporting service in production
    console.error('Error caught by boundary:', error, errorInfo);
    
    this.setState(prevState => ({
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    // Log to analytics/monitoring service
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: error.toString(),
        fatal: false
      });
    }
  }

  handleRefresh = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  handleGoBack = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.history.back();
  };

  render() {
    if (this.state.hasError) {
      // If error keeps happening, show more drastic recovery options
      const isRecurring = this.state.errorCount > 2;

      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8 text-center border border-red-100">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              {isRecurring ? 'Persistent Error Detected' : 'Oops! Something went wrong'}
            </h2>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              {isRecurring 
                ? 'We\'re having trouble recovering. Please try going back to the homepage or contact support.'
                : 'Don\'t worry, this happens sometimes. Try refreshing the page or going back.'}
            </p>

            {/* Development error details */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg text-left border border-gray-200">
                <p className="text-xs font-semibold text-gray-700 mb-2">Debug Info:</p>
                <p className="text-xs text-gray-600 font-mono break-all mb-2">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <details className="text-xs text-gray-500 mt-2">
                    <summary className="cursor-pointer hover:text-gray-700">Stack trace</summary>
                    <pre className="mt-2 text-xs overflow-auto max-h-32">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col gap-3">
              <Button
                onClick={this.handleRefresh}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Page
              </Button>
              
              <div className="flex gap-3">
                <Button
                  onClick={this.handleGoBack}
                  variant="outline"
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back
                </Button>
                
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="flex-1"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Button>
              </div>
            </div>

            {/* Error count indicator */}
            {this.state.errorCount > 1 && (
              <p className="mt-4 text-xs text-gray-500">
                Error occurred {this.state.errorCount} times
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
