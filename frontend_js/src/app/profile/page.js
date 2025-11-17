'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/EnhancedAuthContext';
import { AuthGuard } from '../../components/auth/AuthGuard';
import { Navigation } from '../../components/layout/Navigation';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import AvatarUpload from '../../components/profile/AvatarUpload';
import { calculateProfileCompletion } from '../../utils/profileCompletion';
import { toast } from 'sonner';
import { migrateUserProfileCompletion } from '../../lib/migrateProfileCompletion';
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
  Clock,
  Sparkles,
  Linkedin,
  Github,
  Globe,
  TrendingUp,
  Star,
  Plus,
  Camera
} from 'lucide-react';

function ProfilePageContent() {
  const { user, updateProfile, isInitialized } = useAuth();
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
    website_url: '',
    avatar_url: '',
    skills: [],
    interests: []
  });

  // Temporary input states for skills and interests
  const [skillInput, setSkillInput] = useState('');
  const [interestInput, setInterestInput] = useState('');

  // Initialize form data from user
  useEffect(() => {
    if (user) {
      console.log('📥 [Profile] Loading user data:', {
        name: user.name,
        phone: user.phone,
        bio: user.bio,
        profile_completed: user.profile_completed,
        profile_completion_percentage: user.profile_completion_percentage
      });
      
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
        website_url: user.website_url || '',
        avatar_url: user.avatar_url || '',
        skills: user.skills || [],
        interests: user.interests || [],
        // ✅ CRITICAL: Include completion fields from database
        profile_completed: user.profile_completed || false,
        profile_completion_percentage: user.profile_completion_percentage || 0
      });
    }
  }, [user]);

  // Calculate completion - ALWAYS calculate from current form data
  const completionData = useMemo(() => {
    console.log('📊 [Profile] Calculating completion from form data');
    return calculateProfileCompletion(formData);
  }, [formData]);

  const { overallPercentage, sections, nextSteps } = completionData;

  // Show loading state while auth is initializing
  // ✅ Early return AFTER all hooks
  if (!isInitialized || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Handle input changes
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Add skill
  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  // Remove skill
  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  // Add interest
  const addInterest = () => {
    if (interestInput.trim() && !formData.interests.includes(interestInput.trim())) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, interestInput.trim()]
      }));
      setInterestInput('');
    }
  };

  // Remove interest
  const removeInterest = (interestToRemove) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(interest => interest !== interestToRemove)
    }));
  };

  // Save profile - ROBUST with detailed error handling
  const handleSave = async () => {
    console.log(' [Profile] Save button clicked');
    console.log(' [Profile] Form data to save:', formData);
    
    try {
      setLoading(true);
      
      // Validate before sending
      if (!formData.name || formData.name.trim() === '') {
        toast.error('Name is required', {
          description: 'Please enter your full name.',
          duration: 4000
        });
        setLoading(false);
        return;
      }
      
      console.log(' [Profile] Calling updateProfile...');
      const result = await updateProfile(formData);
      console.log(' [Profile] updateProfile returned:', result);
      
      if (result && result.success) {
        console.log('🎉 [Profile] Update successful!');
        
        // ROBUST COMPLETION STATUS CHECKING
        const updatedUser = result.data;
        const wasComplete = user.profile_completed === true;
        const isNowComplete = updatedUser.profile_completed === true;
        
        console.log('📊 [Profile] Completion status:', {
          before: { completed: wasComplete },
          after: { completed: isNowComplete, percentage: updatedUser.profile_completion_percentage }
        });
        
        // CASE 1: Profile just became COMPLETE (incomplete → complete)
        if (!wasComplete && isNowComplete) {
          toast.success('🎉 Profile Complete!', {
            description: 'You can now connect with alumni and appear in the directory.',
            duration: 6000,
            important: true
          });
        }
        // CASE 2: Profile became INCOMPLETE (complete → incomplete)
        else if (wasComplete && !isNowComplete) {
          toast.warning('Profile Incomplete', {
            description: 'Complete all required fields to appear in the directory and connect with alumni.',
            duration: 6000,
            important: true
          });
        }
        // CASE 3: Profile still COMPLETE (complete → complete)
        else if (wasComplete && isNowComplete) {
          toast.success('Profile updated successfully!', {
            description: 'Your profile is complete and visible in the directory.',
            duration: 4000
          });
        }
        // CASE 4: Profile still INCOMPLETE (incomplete → incomplete)
        else {
          toast.info('Profile updated', {
            description: `${updatedUser.profile_completion_percentage || 0}% complete. Add required fields to unlock all features.`,
            duration: 5000
          });
        }
        
        setIsEditing(false);
      } else {
        console.error(' [Profile] Update returned but not successful:', result);
        toast.error('Update failed', {
          description: 'The update did not complete successfully.',
          duration: 5000
        });
      }
    } catch (error) {
      console.error(' [Profile] Save error:', error);
      console.error(' [Profile] Error type:', error.constructor?.name);
      console.error(' [Profile] Error message:', error.message);
      console.error(' [Profile] Error stack:', error.stack);
      
      // Show detailed error to user
      toast.error('Failed to save profile', {
        description: error.message || 'An unexpected error occurred. Please check the console for details.',
        duration: 6000,
        important: true
      });
    } finally {
      console.log(' [Profile] Save operation complete, setting loading to false');
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
        website_url: user.website_url || '',
        avatar_url: user.avatar_url || '',
        skills: user.skills || [],
        interests: user.interests || []
      });
    }
    setSkillInput('');
    setInterestInput('');
    setIsEditing(false);
  };

  // Sync profile completion status (for existing complete profiles)
  const handleSyncCompletion = async () => {
    try {
      setLoading(true);
      console.log('🔄 Syncing profile completion status...');
      
      const result = await migrateUserProfileCompletion(user.id);
      
      if (result.success) {
        if (result.isComplete) {
          toast.success('🎉 Profile Verified as Complete!', {
            description: 'You can now connect with alumni and appear in the directory.',
            duration: 6000,
            important: true
          });
          
          // Refresh page to update user state
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else {
          toast.info('Profile Status Updated', {
            description: `Your profile is ${result.percentage}% complete.`,
            duration: 4000
          });
        }
      }
    } catch (error) {
      console.error('Failed to sync completion:', error);
      toast.error('Sync Failed', {
        description: 'Could not update profile status. Please try again.',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Navigation>
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Profile</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1 hidden sm:block">Manage your alumni profile information</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              {!isEditing ? (
                <Button 
                  onClick={() => setIsEditing(true)} 
                  className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2 text-sm sm:text-base px-3 sm:px-4 py-2"
                >
                  <Edit3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Edit Profile</span>
                  <span className="sm:hidden">Edit</span>
                </Button>
              ) : (
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button 
                    onClick={handleSave} 
                    disabled={loading}
                    className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base px-3 sm:px-4 py-2 flex-1 sm:flex-initial"
                  >
                    <Save className="h-4 w-4" />
                    <span className="hidden sm:inline">{loading ? 'Saving...' : 'Save Changes'}</span>
                    <span className="sm:hidden">{loading ? 'Saving...' : 'Save'}</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleCancel}
                    className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base px-3 sm:px-4 py-2"
                  >
                    <X className="h-4 w-4" />
                    <span className="hidden sm:inline">Cancel</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-8">
          
          {/* Left Sidebar - Progress Tracker (Desktop) */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24">
              <Card className="border-2 border-indigo-100 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 p-5 border-b">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-sm ${
                      overallPercentage === 100 ? 'bg-green-100' : 'bg-orange-100'
                    }`}>
                      {overallPercentage === 100 ? (
                        <CheckCircle2 className="h-7 w-7 text-green-600" />
                      ) : (
                        <Sparkles className="h-7 w-7 text-orange-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-gray-900">
                        {overallPercentage === 100 ? '🎉 Complete!' : '👋 Welcome!'}
                      </h3>
                      <p className="text-sm text-gray-600 mt-0.5">
                        {overallPercentage === 100 
                          ? 'Your profile is fully optimized' 
                          : 'Complete your profile to connect'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-center py-2">
                    <div className="text-5xl font-extrabold text-indigo-600 mb-1">{overallPercentage}%</div>
                    <p className="text-sm font-medium text-gray-600">Complete</p>
                  </div>
                </CardHeader>

                <CardContent className="p-5">
                  {/* Section Progress */}
                  <div className="space-y-4 mb-5">
                    <h4 className="text-base font-bold text-gray-900">Profile Sections</h4>
                    {Object.entries(sections).map(([key, section]) => (
                      <div key={key} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-700">{section.label}</span>
                          <span className={`text-sm font-bold ${
                            section.isComplete ? 'text-green-600' : 'text-gray-500'
                          }`}>
                            {section.percentage}%
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                          <div 
                            className={`h-full transition-all duration-500 ${
                              section.isComplete ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-indigo-500 to-indigo-600'
                            }`}
                            style={{ width: `${section.percentage}%` }}
                          />
                        </div>
                        {!section.isComplete && section.missingFields.length > 0 && (
                          <p className="text-xs font-medium text-red-600 mt-1">
                            Missing: {section.missingFields.slice(0, 2).map(f => f.label).join(', ')}
                            {section.missingFields.length > 2 && ` +${section.missingFields.length - 2}`}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Next Steps */}
                  {overallPercentage < 100 && nextSteps.length > 0 && (
                    <div className="p-4 bg-orange-50 rounded-lg border-2 border-orange-200 shadow-sm">
                      <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-orange-600" />
                        Next Steps
                      </h4>
                      <div className="space-y-3">
                        {nextSteps.slice(0, 3).map((step, index) => (
                          <div key={index} className="flex items-start gap-2.5">
                            <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                              <span className="text-xs font-bold text-white">{index + 1}</span>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{step.action}</p>
                              {step.fields && (
                                <p className="text-xs text-gray-600 mt-1">
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
          <div className="lg:col-span-3 space-y-6">
            
            {/* Verification Status Banners */}
            
            {/* Verified Banner - Show if verified */}
            {user.is_verified && user.profile_completed && (
              <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-gray-900 mb-1">
                        Profile Verified ✓
                      </h3>
                      <p className="text-sm text-gray-700">
                        Your profile is verified and visible in the alumni directory. You can connect with other alumni!
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pending Verification Banner - Show if complete but not verified */}
            {!user.is_verified && user.profile_completed && (
              <Card className="border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                        <Clock className="h-6 w-6 text-yellow-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-gray-900 mb-1">
                        Pending Verification ⏳
                      </h3>
                      <p className="text-sm text-gray-700">
                        Your profile is complete and awaiting admin verification. You'll appear in the alumni directory once verified.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Incomplete Profile Banner - Show if not complete */}
            {!user.profile_completed && overallPercentage < 100 && (
              <Card className="border-2 border-red-200 bg-gradient-to-r from-red-50 to-rose-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                        <AlertCircle className="h-6 w-6 text-red-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-gray-900 mb-1">
                        Complete Your Profile ({overallPercentage}%)
                      </h3>
                      <p className="text-sm text-gray-700">
                        Complete your profile to get verified and appear in the alumni directory.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Sync Banner - Show if profile is 100% but not marked complete in DB */}
            {overallPercentage === 100 && !user.profile_completed && (
              <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-gray-900 mb-1">
                        Profile Complete! 🎉
                      </h3>
                      <p className="text-sm text-gray-700 mb-3">
                        Your profile is 100% complete! Click below to verify your completion status and unlock all features.
                      </p>
                      <Button
                        onClick={handleSyncCompletion}
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700 text-white text-sm"
                      >
                        {loading ? 'Verifying...' : 'Verify & Unlock Features'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Mobile Progress Card - Compact Version at Top */}
            <div className="lg:hidden">
              <Card className="border-2 border-indigo-100 bg-gradient-to-r from-indigo-50 to-blue-50 shadow-sm">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        overallPercentage === 100 ? 'bg-green-100' : 'bg-orange-100'
                      }`}>
                        {overallPercentage === 100 ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <Sparkles className="h-5 w-5 text-orange-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-xs font-semibold text-gray-900">
                          {overallPercentage === 100 ? '🎉 Complete!' : '👋 Welcome!'}
                        </h3>
                        <p className="text-xs text-gray-600">
                          {overallPercentage === 100 
                            ? 'Profile optimized' 
                            : 'Complete to connect'}
                        </p>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-indigo-600">{overallPercentage}%</div>
                      <p className="text-xs text-gray-500">Done</p>
                    </div>
                  </div>
                  
                  {/* Compact Section Progress for Mobile */}
                  <div className="space-y-1.5">
                    {Object.entries(sections).map(([key, section]) => (
                      <div key={key} className="flex items-center justify-between text-xs">
                        <span className="font-medium text-gray-700 text-xs">{section.label}</span>
                        <div className="flex items-center gap-1.5">
                          <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-500 ${
                                section.isComplete ? 'bg-green-500' : 'bg-indigo-500'
                              }`}
                              style={{ width: `${section.percentage}%` }}
                            />
                          </div>
                          <span className={`font-bold text-xs w-7 text-right ${
                            section.isComplete ? 'text-green-600' : 'text-gray-500'
                          }`}>
                            {section.percentage}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Next Step Hint for Mobile */}
                  {overallPercentage < 100 && nextSteps.length > 0 && (
                    <div className="mt-2.5 p-2 bg-orange-100 rounded-lg border border-orange-200">
                      <div className="flex items-start gap-1.5">
                        <TrendingUp className="h-3.5 w-3.5 text-orange-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-900 truncate">Next: {nextSteps[0].action}</p>
                          {nextSteps[0].fields && (
                            <p className="text-xs text-gray-600 mt-0.5 truncate">
                              {nextSteps[0].fields.slice(0, 2).map(f => f.label).join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Profile Picture */}
            <Card className="shadow-md lg:!mt-0">
              <CardHeader className="border-b bg-gray-50 p-5">
                <div className="flex items-center gap-3">
                  <Camera className="h-6 w-6 text-indigo-600" />
                  <div>
                    <CardTitle className="text-lg font-bold">Profile Picture</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">Upload your profile photo</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <AvatarUpload
                  currentAvatar={formData.avatar_url}
                  userId={user?.id}
                  userName={formData.name}
                  onUploadSuccess={(url) => handleChange('avatar_url', url)}
                />
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card className="shadow-md">
              <CardHeader className="border-b bg-gray-50 p-5">
                <div className="flex items-center gap-3">
                  <User className="h-6 w-6 text-indigo-600" />
                  <div>
                    <CardTitle className="text-lg font-bold">Basic Information</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">Your personal details and contact information</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
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
            <Card className="shadow-md">
              <CardHeader className="border-b bg-gray-50 p-5">
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-6 w-6 text-indigo-600" />
                  <div>
                    <CardTitle className="text-lg font-bold">Education</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">Your academic background and qualifications</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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
            <Card className="shadow-md">
              <CardHeader className="border-b bg-gray-50 p-5">
                <div className="flex items-center gap-3">
                  <Briefcase className="h-6 w-6 text-indigo-600" />
                  <div>
                    <CardTitle className="text-lg font-bold">Professional Information</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">Your current work and career details</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
            <Card className="shadow-md">
              <CardHeader className="border-b bg-gray-50 p-5">
                <div className="flex items-center gap-3">
                  <Globe className="h-6 w-6 text-indigo-600" />
                  <div>
                    <CardTitle className="text-lg font-bold">Social Links</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">Connect your professional and social profiles</p>
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

            {/* Additional Info - Skills & Interests */}
            <Card className="shadow-md">
              <CardHeader className="border-b bg-gray-50 p-5">
                <div className="flex items-center gap-3">
                  <Star className="h-6 w-6 text-indigo-600" />
                  <div>
                    <CardTitle className="text-lg font-bold">Additional Information</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">Showcase your skills and interests</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Skills */}
                <div>
                  <label className="block text-base font-bold text-gray-700 mb-3">
                    Skills
                  </label>
                  {isEditing && (
                    <div className="flex gap-2 mb-3">
                      <Input
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                        placeholder="Add a skill (e.g., JavaScript, Leadership)"
                        className="flex-1"
                      />
                      <Button
                        onClick={addSkill}
                        type="button"
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.length > 0 ? (
                      formData.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
                        >
                          {skill}
                          {isEditing && (
                            <button
                              onClick={() => removeSkill(skill)}
                              className="hover:text-indigo-900"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 italic">No skills added yet</p>
                    )}
                  </div>
                </div>

                {/* Interests */}
                <div>
                  <label className="block text-base font-bold text-gray-700 mb-3">
                    Interests
                  </label>
                  {isEditing && (
                    <div className="flex gap-2 mb-3">
                      <Input
                        value={interestInput}
                        onChange={(e) => setInterestInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                        placeholder="Add an interest (e.g., Photography, Hiking)"
                        className="flex-1"
                      />
                      <Button
                        onClick={addInterest}
                        type="button"
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {formData.interests.length > 0 ? (
                      formData.interests.map((interest, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                        >
                          {interest}
                          {isEditing && (
                            <button
                              onClick={() => removeInterest(interest)}
                              className="hover:text-purple-900"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 italic">No interests added yet</p>
                    )}
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
