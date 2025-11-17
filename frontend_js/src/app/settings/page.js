'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/EnhancedAuthContext';
import { AuthGuard } from '../../components/auth/AuthGuard';
import { Navigation } from '../../components/layout/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { 
  Settings, 
  User, 
  Bell, 
  Lock, 
  Mail,
  Shield,
  Eye,
  EyeOff,
  Save,
  Trash2,
  LogOut
} from 'lucide-react';

function SettingsContent() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Profile settings
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: ''
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    connectionRequests: true,
    newMessages: true,
    jobAlerts: true,
    eventReminders: true
  });

  // Password change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Enable scroll
  useEffect(() => {
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  // Load user data
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: profileData.name,
          phone: profileData.phone,
          bio: profileData.bio
        })
        .eq('id', user.id);

      if (error) throw error;
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;
      
      toast.success('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationToggle = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    toast.success('Notification preferences updated');
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'privacy', label: 'Privacy', icon: Shield }
  ];

  return (
    <Navigation>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account preferences and settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          activeTab === tab.id
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        {tab.label}
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                      <Input
                        value={profileData.name}
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <Input
                        value={profileData.email}
                        disabled
                        className="bg-gray-50"
                      />
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <Input
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        placeholder="Your phone number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                      <textarea
                        value={profileData.bio}
                        onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Tell us about yourself"
                      />
                    </div>
                    <Button type="submit" disabled={loading}>
                      <Save className="h-4 w-4 mr-2" />
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive email updates' },
                    { key: 'connectionRequests', label: 'Connection Requests', desc: 'Get notified of new connection requests' },
                    { key: 'newMessages', label: 'New Messages', desc: 'Get notified of new messages' },
                    { key: 'jobAlerts', label: 'Job Alerts', desc: 'Receive notifications about new job postings' },
                    { key: 'eventReminders', label: 'Event Reminders', desc: 'Get reminders for upcoming events' }
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between py-3 border-b last:border-0">
                      <div>
                        <p className="font-medium text-gray-900">{item.label}</p>
                        <p className="text-sm text-gray-500">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => handleNotificationToggle(item.key)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          notifications[item.key] ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            notifications[item.key] ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                        <div className="relative">
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                            placeholder="Enter new password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                        <Input
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                          placeholder="Confirm new password"
                        />
                      </div>
                      <Button type="submit" disabled={loading}>
                        <Lock className="h-4 w-4 mr-2" />
                        {loading ? 'Changing...' : 'Change Password'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Logout Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>Account Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">Sign Out</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Sign out of your account on this device
                        </p>
                        <Button 
                          onClick={handleLogout}
                          disabled={isLoggingOut}
                          variant="outline"
                          className="w-full sm:w-auto border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                        >
                          <LogOut className={`h-4 w-4 mr-2 ${isLoggingOut ? 'animate-spin' : ''}`} />
                          {isLoggingOut ? 'Logging out...' : 'Logout'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <Card>
                <CardHeader>
                  <CardTitle>Privacy Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Profile Visibility</h3>
                    <p className="text-sm text-gray-600 mb-4">Control who can see your profile information</p>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option>Everyone</option>
                      <option>Connections Only</option>
                      <option>Private</option>
                    </select>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Data & Privacy</h3>
                    <p className="text-sm text-gray-600 mb-4">Manage your data and privacy preferences</p>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        Download My Data
                      </Button>
                      <Button variant="outline" className="w-full justify-start text-red-600 border-red-300 hover:bg-red-50">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Navigation>
  );
}

export default function SettingsPage() {
  return (
    <AuthGuard requireAuth={true} redirectTo="/auth/login">
      <SettingsContent />
    </AuthGuard>
  );
}
