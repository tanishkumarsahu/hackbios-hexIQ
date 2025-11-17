'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/EnhancedAuthContext';
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import { Users, Calendar, MessageSquare, TrendingUp, ArrowRight, Star, Sparkles, Zap, GraduationCap } from "lucide-react";
import Link from "next/link";
import { Logo } from '../components/ui/Logo';

export default function Home() {
  const { isAuthenticated, authState, AUTH_STATES, user } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Force re-render on mount and auth changes
  useEffect(() => {
    setMounted(true);
  }, []);

  // Force re-render when auth state changes
  useEffect(() => {
    console.log('🔄 Homepage: Auth state changed', { authState, isAuthenticated, user: !!user });
  }, [authState, isAuthenticated, user]);

  // No auto-redirect - just show different nav buttons
  
  // Debug logging
  console.log('Homepage auth state:', { authState, isAuthenticated, user: !!user, mounted });

  // Show loading while checking auth
  if (authState === AUTH_STATES.LOADING) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Logo size="default" />
          </div>
          <nav className="hidden lg:flex space-x-6 xl:space-x-8">
            <a href="#features" className="text-gray-600 hover:text-blue-600 transition-all duration-200 font-medium hover:scale-105">Features</a>
            <a href="#about" className="text-gray-600 hover:text-blue-600 transition-all duration-200 font-medium hover:scale-105">About</a>
            <a href="#contact" className="text-gray-600 hover:text-blue-600 transition-all duration-200 font-medium hover:scale-105">Contact</a>
          </nav>
          <div className="flex gap-1.5 sm:gap-2 md:gap-3">
            {authState === AUTH_STATES.AUTHENTICATED && isAuthenticated && user ? (
              // Show Dashboard button when logged in
              <Link href="/dashboard">
                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-200 text-xs sm:text-sm px-2.5 sm:px-3 md:px-4 h-8 sm:h-9 md:h-10">
                  Dashboard
                </Button>
              </Link>
            ) : (
              // Show Sign In/Join buttons when not logged in
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm" className="hover:bg-blue-50 text-xs sm:text-sm px-2 sm:px-3 md:px-4 h-8 sm:h-9 md:h-10">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm" icon={<Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-200 text-xs sm:text-sm px-2.5 sm:px-3 md:px-4 h-8 sm:h-9 md:h-10">
                    <span className="hidden xs:inline sm:inline">Get Started</span>
                    <span className="xs:hidden sm:hidden">Join</span>
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 px-4 overflow-hidden">
        {/* Geometric Background Pattern */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
          
          {/* SolutionX Team Name Background */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none">
            <div className="text-[4.5rem] md:text-[15rem] lg:text-[20rem] font-black text-gray-900/[0.08] tracking-tighter whitespace-nowrap">
              hexIQ
            </div>
          </div>
          
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full">
            <svg className="w-full h-full opacity-[0.1]" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
        </div>

        <div className="container mx-auto text-center max-w-6xl relative z-10">
          <div className="mb-12" data-aos="fade-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full text-blue-700 text-sm font-semibold mb-8 hover:bg-blue-100 transition-all duration-300 hover:scale-105">
              <Zap className="h-4 w-4" />
              <span>Proffesional Newtorking System</span>
            </div>
            
            {/* Main Heading */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold mb-6 leading-[1.1] tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900">
                Connect with Your
              </span>
              <br />
              <span className="relative inline-block mt-2">
                <span className="relative z-10 text-blue-600">Alumni Network</span>
                <div className="absolute -bottom-2 left-0 right-0 h-4 bg-blue-200/30 -rotate-1"></div>
              </span>
            </h1>
            
            {/* Subheading */}
            <p className="text-lg md:text-xl lg:text-2xl text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto font-light">
              Build meaningful connections, discover career opportunities, and strengthen your professional network with AI-powered insights.
            </p>
          </div>
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center" data-aos="fade-up" data-aos-delay="200">
            <Link href="/auth/register">
              <Button 
                size="xl" 
                className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 w-full sm:w-auto group"
              >
                <span>Join Your Network</span>
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="xl" 
              className="text-lg px-8 py-6 rounded-xl border-2 border-gray-300 hover:border-blue-600 hover:bg-blue-50 w-full sm:w-auto transition-all duration-300"
            >
              Watch Demo
            </Button>
          </div>
          
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 bg-gray-50 relative">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16" data-aos="fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-100 rounded-full text-purple-700 text-sm font-semibold mb-6">
              <Sparkles className="h-4 w-4" />
              <span>Powered by Advanced AI</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need to
              <span className="text-blue-600"> Succeed</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to help you build meaningful connections and advance your career.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="group border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 bg-white" data-aos="fade-up" data-aos-delay="100">
              <CardHeader>
                <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-5 group-hover:bg-blue-100 transition-colors duration-300">
                  <Users className="h-7 w-7 text-blue-600" />
                </div>
                <CardTitle className="text-xl font-bold mb-2 text-gray-900">Smart Matching</CardTitle>
                <CardDescription className="text-gray-600 leading-relaxed">
                  Advanced AI algorithms analyze your profile, interests, and career goals to connect you with the most relevant alumni in your network.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all duration-300 bg-white" data-aos="fade-up" data-aos-delay="200">
              <CardHeader>
                <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center mb-5 group-hover:bg-green-100 transition-colors duration-300">
                  <Calendar className="h-7 w-7 text-green-600" />
                </div>
                <CardTitle className="text-xl font-bold mb-2 text-gray-900">Event Discovery</CardTitle>
                <CardDescription className="text-gray-600 leading-relaxed">
                  Discover networking events, workshops, and reunions perfectly tailored to your professional interests and career stage.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300 bg-white" data-aos="fade-up" data-aos-delay="300">
              <CardHeader>
                <div className="w-14 h-14 bg-purple-50 rounded-xl flex items-center justify-center mb-5 group-hover:bg-purple-100 transition-colors duration-300">
                  <MessageSquare className="h-7 w-7 text-purple-600" />
                </div>
                <CardTitle className="text-xl font-bold mb-2 text-gray-900">Intelligent Messaging</CardTitle>
                <CardDescription className="text-gray-600 leading-relaxed">
                  AI-powered conversation starters and networking tips help you break the ice and build meaningful professional relationships.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group border border-gray-200 hover:border-orange-300 hover:shadow-lg transition-all duration-300 bg-white" data-aos="fade-up" data-aos-delay="400">
              <CardHeader>
                <div className="w-14 h-14 bg-orange-50 rounded-xl flex items-center justify-center mb-5 group-hover:bg-orange-100 transition-colors duration-300">
                  <TrendingUp className="h-7 w-7 text-orange-600" />
                </div>
                <CardTitle className="text-xl font-bold mb-2 text-gray-900">Career Insights</CardTitle>
                <CardDescription className="text-gray-600 leading-relaxed">
                  Access real-time career trends, salary insights, and industry analysis powered by your extensive alumni network data.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group border border-gray-200 hover:border-pink-300 hover:shadow-lg transition-all duration-300 bg-white" data-aos="fade-up" data-aos-delay="500">
              <CardHeader>
                <div className="w-14 h-14 bg-pink-50 rounded-xl flex items-center justify-center mb-5 group-hover:bg-pink-100 transition-colors duration-300">
                  <Star className="h-7 w-7 text-pink-600" />
                </div>
                <CardTitle className="text-xl font-bold mb-2 text-gray-900">Mentorship Matching</CardTitle>
                <CardDescription className="text-gray-600 leading-relaxed">
                  Find perfect mentors and mentees through sophisticated compatibility analysis and shared professional interests.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group border border-gray-200 hover:border-teal-300 hover:shadow-lg transition-all duration-300 bg-white" data-aos="fade-up" data-aos-delay="600">
              <CardHeader>
                <div className="w-14 h-14 bg-teal-50 rounded-xl flex items-center justify-center mb-5 group-hover:bg-teal-100 transition-colors duration-300">
                  <GraduationCap className="h-7 w-7 text-teal-600" />
                </div>
                <CardTitle className="text-xl font-bold mb-2 text-gray-900">Community Building</CardTitle>
                <CardDescription className="text-gray-600 leading-relaxed">
                  Join vibrant interest-based communities and participate in meaningful discussions that advance your career.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-blue-600 relative overflow-hidden">
        {/* Subtle Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px'}}></div>
        </div>
        
        <div className="container mx-auto text-center max-w-4xl relative z-10" data-aos="zoom-in">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Ready to Transform Your Network?
          </h2>
          <p className="text-lg md:text-xl text-blue-100 mb-10 leading-relaxed max-w-2xl mx-auto">
            Join thousands of alumni building meaningful connections and advancing their careers.
          </p>
          <Link href="/auth/register">
            <Button 
              size="xl" 
              className="bg-white text-blue-600 hover:bg-gray-50 text-lg px-10 py-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group"
            >
              <span>Start Connecting Today</span>
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-4 gap-12">
            <div data-aos="fade-up">
              <Logo size="default" />
              <p className="text-gray-400 leading-relaxed">
                Building stronger alumni networks through cutting-edge AI-powered connections and intelligent networking solutions.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-6">Platform</h3>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors hover:translate-x-1 transform duration-200">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors hover:translate-x-1 transform duration-200">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors hover:translate-x-1 transform duration-200">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors hover:translate-x-1 transform duration-200">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-6">Support</h3>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors hover:translate-x-1 transform duration-200">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors hover:translate-x-1 transform duration-200">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors hover:translate-x-1 transform duration-200">Status</a></li>
                <li><a href="#" className="hover:text-white transition-colors hover:translate-x-1 transform duration-200">Community</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-6">Company</h3>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors hover:translate-x-1 transform duration-200">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors hover:translate-x-1 transform duration-200">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors hover:translate-x-1 transform duration-200">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors hover:translate-x-1 transform duration-200">Press</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 AlumNode. All rights reserved. Built with ❤️ for alumni everywhere.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
