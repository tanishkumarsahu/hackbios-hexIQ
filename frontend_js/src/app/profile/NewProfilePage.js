'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/EnhancedAuthContext';
import { AuthGuard } from '../../components/auth/AuthGuard';
import { Navigation } from '../../components/layout/Navigation';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import { calculateProfileCompletion } from '../../utils/profileCompletion';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  GraduationCap,
  Calendar,
  Edit3,
  Save,
  X,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Linkedin,
  Github,
  Globe,
  TrendingUp
} from 'lucide-react';

function ProfilePageContent() {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form data state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    current_title: '',
    current_company: '',
    graduation_year: '',
    degree: '',
    major: '',
    linkedin_url: '',
    github_url: '',
    website_url: ''
  });

  // Initialize form data from user
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        bio: user.bio || '',
        current_title: user.current_title || '',
        current_company: user.current_company || '',
        graduation_year: user.graduation_year || '',
        degree: user.degree || '',
        major: user.major || '',
        linkedin_url: user.linkedin_url || '',
        github_url: user.github_url || '',
        website_url: user.website_url || ''
      });
    }
  }, [user]);

  // Calculate completion in real-time
  const completionData = useMemo(() => {
    return calculateProfileCompletion(formData);
  }, [formData]);

  const { overallPercentage, sections, nextSteps } = completionData;

  // Handle input changes
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Save profile
  const handleSave = async () => {
    try {
      setLoading(true);
      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        bio: user.bio || '',
        current_title: user.current_title || '',
        current_company: user.current_company || '',
        graduation_year: user.graduation_year || '',
        degree: user.degree || '',
        major: user.major || '',
        linkedin_url: user.linkedin_url || '',
        github_url: user.github_url || '',
        website_url: user.website_url || ''
      });
    }
    setIsEditing(false);
  };

  return (
    <Navigation>
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
              <p className="text-gray-600 mt-1">Manage your alumni profile information</p>
            </div>
            <div className="flex items-center gap-3">
              {!isEditing ? (
                <Button 
                  onClick={() => setIsEditing(true)} 
                  className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2"
                >
                  <Edit3 className="h-4 w-4" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSave} 
                    disabled={loading}
                    className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleCancel}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Sidebar - Progress Tracker */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="sticky top-24">
              <Card className="border-2 border-indigo-100">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 border-b">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      overallPercentage === 100 ? 'bg-green-100' : 'bg-orange-100'
                    }`}>
                      {overallPercentage === 100 ? (
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      ) : (
                        <Sparkles className="h-6 w-6 text-orange-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-900">
                        {overallPercentage === 100 ? '🎉 Complete!' : '👋 Welcome!'}
                      </h3>
                      <p className="text-xs text-gray-600">
                        {overallPercentage === 100 
                          ? 'Your profile is fully optimized' 
                          : 'Complete your profile to connect'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-4xl font-bold text-indigo-600">{overallPercentage}%</div>
                    <p className="text-xs text-gray-500 mt-1">Complete</p>
                  </div>
                </CardHeader>

                <CardContent className="p-4">
                  {/* Section Progress */}
                  <div className="space-y-3 mb-4">
                    <h4 className="text-sm font-semibold text-gray-900">Profile Sections</h4>
                    {Object.entries(sections).map(([key, section]) => (
                      <div key={key} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-700">{section.label}</span>
                          <span className={`text-xs font-bold ${
                            section.isComplete ? 'text-green-600' : 'text-gray-500'
                          }`}>
                            {section.percentage}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 ${
                              section.isComplete ? 'bg-green-500' : 'bg-indigo-500'
                            }`}
                            style={{ width: `${section.percentage}%` }}
                          />
                        </div>
                        {!section.isComplete && section.missingFields.length > 0 && (
                          <p className="text-xs text-red-600">
                            Missing: {section.missingFields.slice(0, 2).map(f => f.label).join(', ')}
                            {section.missingFields.length > 2 && ` +${section.missingFields.length - 2}`}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Next Steps */}
                  {overallPercentage < 100 && nextSteps.length > 0 && (
                    <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
                        <TrendingUp className="h-4 w-4 text-orange-600" />
                        Next Steps
                      </h4>
                      <div className="space-y-2">
                        {nextSteps.slice(0, 3).map((step, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-white">{index + 1}</span>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-900">{step.action}</p>
                              {step.fields && (
                                <p className="text-xs text-gray-600 mt-0.5">
                                  {step.fields.slice(0, 2).map(f => f.label).join(', ')}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Content - Form Sections */}
          <div className="lg:col-span-3 order-1 lg:order-2 space-y-6">
            
            {/* Basic Information */}
            <Card>
              <CardHeader className="border-b bg-gray-50 p-4">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-indigo-600" />
                  <div>
                    <CardTitle className="text-base">Basic Information</CardTitle>
                    <p className="text-xs text-gray-600 mt-0.5">Your personal details and contact information</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      disabled={!isEditing}
                      placeholder="John Doe"
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      disabled={!isEditing}
                      placeholder="john@example.com"
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Phone Number
                    </label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      disabled={!isEditing}
                      placeholder="+1 (555) 123-4567"
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Location
                    </label>
                    <Input
                      value={formData.location}
                      onChange={(e) => handleChange('location', e.target.value)}
                      disabled={!isEditing}
                      placeholder="City, State, Country"
                      className="w-full"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Bio
                    </label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => handleChange('bio', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Tell us about yourself..."
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Education */}
            <Card>
              <CardHeader className="border-b bg-gray-50 p-4">
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-5 w-5 text-indigo-600" />
                  <div>
                    <CardTitle className="text-base">Education</CardTitle>
                    <p className="text-xs text-gray-600 mt-0.5">Your academic background and qualifications</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Degree <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={formData.degree}
                      onChange={(e) => handleChange('degree', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Bachelor's, Master's, etc."
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Major <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={formData.major}
                      onChange={(e) => handleChange('major', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Computer Science"
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Graduation Year <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      value={formData.graduation_year}
                      onChange={(e) => handleChange('graduation_year', e.target.value)}
                      disabled={!isEditing}
                      placeholder="2020"
                      className="w-full"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Professional Information */}
            <Card>
              <CardHeader className="border-b bg-gray-50 p-4">
                <div className="flex items-center gap-3">
                  <Briefcase className="h-5 w-5 text-indigo-600" />
                  <div>
                    <CardTitle className="text-base">Professional Information</CardTitle>
                    <p className="text-xs text-gray-600 mt-0.5">Your current work and career details</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Current Job Title
                    </label>
                    <Input
                      value={formData.current_title}
                      onChange={(e) => handleChange('current_title', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Software Engineer"
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Current Company
                    </label>
                    <Input
                      value={formData.current_company}
                      onChange={(e) => handleChange('current_company', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Company Name"
                      className="w-full"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card>
              <CardHeader className="border-b bg-gray-50 p-4">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-indigo-600" />
                  <div>
                    <CardTitle className="text-base">Social Links</CardTitle>
                    <p className="text-xs text-gray-600 mt-0.5">Connect your professional and social profiles</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Linkedin className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <Input
                      value={formData.linkedin_url}
                      onChange={(e) => handleChange('linkedin_url', e.target.value)}
                      disabled={!isEditing}
                      placeholder="https://linkedin.com/in/yourprofile"
                      className="flex-1"
                    />
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Github className="h-5 w-5 text-gray-900 flex-shrink-0" />
                    <Input
                      value={formData.github_url}
                      onChange={(e) => handleChange('github_url', e.target.value)}
                      disabled={!isEditing}
                      placeholder="https://github.com/yourusername"
                      className="flex-1"
                    />
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <Input
                      value={formData.website_url}
                      onChange={(e) => handleChange('website_url', e.target.value)}
                      disabled={!isEditing}
                      placeholder="https://yourwebsite.com"
                      className="flex-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </Navigation>
  );
}

export default function NewProfilePage() {
  return (
    <AuthGuard requireAuth={true} redirectTo="/auth/login">
      <ProfilePageContent />
    </AuthGuard>
  );
}
