'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { useAuth } from '../../contexts/EnhancedAuthContext';
import { supabase } from '../../lib/supabase';
import {
  Search,
  Filter,
  MoreVertical,
  Shield,
  UserCheck,
  UserX,
  Mail,
  Calendar,
  AlertCircle,
  RefreshCw,
  Loader2,
  CheckCircle,
  XCircle,
  ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { TableSkeleton } from '../ui/Skeleton';
import { NoSearchResults, NoDataYet } from '../ui/EmptyState';

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const { 
    organization, 
    toggleUserVerification: toggleVerificationContext,
    updateUserRole: updateRoleContext,
    toggleUserStatus: toggleStatusContext
  } = useAdmin();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, action: null, userId: null, data: null });
  const loadingRef = useRef(false);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    loadUsers();
    
    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [roleFilter, statusFilter, organization]);

  const loadUsers = useCallback(async () => {
    // Prevent multiple simultaneous loads
    if (loadingRef.current) {
      console.log('Already loading users, skipping...');
      return;
    }

    // Cancel previous request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    loadingRef.current = true;
    setLoading(true);
    setError(null);
    abortControllerRef.current = new AbortController();

    try {
      console.log('Loading users for organization:', organization?.id);

      if (!organization?.id) {
        console.warn('No organization ID available');
        setUsers([]);
        setLoading(false);
        loadingRef.current = false;
        return;
      }

      // Build query
      let query = supabase
        .from('users')
        .select('*');
      
      // Super admins see ALL users, regular admins see only their org
      if (currentUser.role === 'super_admin') {
        console.log('🔓 Super admin: Loading ALL users across all organizations');
      } else {
        console.log('🔒 Regular admin: Loading users for organization:', organization.id);
        query = query.eq('organization_id', organization.id);
      }
      
      query = query.order('created_at', { ascending: false });

      // Apply filters
      if (roleFilter !== 'all') {
        query = query.eq('role', roleFilter);
      }
      if (statusFilter === 'active') {
        query = query.eq('is_active', true);
      } else if (statusFilter === 'inactive') {
        query = query.eq('is_active', false);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error('Error fetching users:', fetchError);
        throw new Error(fetchError.message || 'Failed to load users');
      }

      console.log(`✅ Loaded ${data?.length || 0} users`);
      
      // Calculate profile completion for each user in realtime
      // MUST MATCH utils/profileCompletion.js weighted logic
      const usersWithCompletion = (data || []).map(user => {
        // Weighted sections: Basic 30%, Education 25%, Professional 25%, Social 10%, Additional 10%
        const sections = {
          basic: { weight: 30, count: 0, total: 5 },
          education: { weight: 25, count: 0, total: 3 },
          professional: { weight: 25, count: 0, total: 2 },
          social: { weight: 10, count: 0, total: 3 },
          additional: { weight: 10, count: 0, total: 3 }
        };
        
        // Basic (30%)
        if (user.name?.trim()) sections.basic.count++;
        if (user.email?.trim()) sections.basic.count++;
        if (user.phone?.trim()) sections.basic.count++;
        if (user.location?.trim()) sections.basic.count++;
        if (user.bio?.trim() && user.bio.length >= 50) sections.basic.count++;
        
        // Education (25%)
        if (user.graduation_year) sections.education.count++;
        if (user.degree?.trim()) sections.education.count++;
        if (user.major?.trim()) sections.education.count++;
        
        // Professional (25%)
        if (user.current_title?.trim()) sections.professional.count++;
        if (user.current_company?.trim()) sections.professional.count++;
        
        // Social (10%)
        if (user.linkedin_url?.trim()) sections.social.count++;
        if (user.github_url?.trim()) sections.social.count++;
        if (user.website_url?.trim()) sections.social.count++;
        
        // Additional (10%)
        if (user.avatar_url?.trim()) sections.additional.count++;
        if (Array.isArray(user.skills) && user.skills.length >= 3) sections.additional.count++;
        if (Array.isArray(user.interests) && user.interests.length >= 2) sections.additional.count++;
        
        // Calculate weighted percentage
        let weightedSum = 0;
        let totalWeight = 0;
        Object.values(sections).forEach(section => {
          const sectionPercentage = (section.count / section.total) * 100;
          weightedSum += (sectionPercentage / 100) * section.weight;
          totalWeight += section.weight;
        });
        
        const percentage = Math.round((weightedSum / totalWeight) * 100);
        const isComplete = percentage === 100;
        
        return {
          ...user,
          profile_completion_percentage: percentage,
          profile_completed: isComplete
        };
      });
      
      setUsers(usersWithCompletion);
      setError(null);
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Request aborted');
        return;
      }
      console.error('Error loading users:', err);
      setError(err.message || 'Failed to load users');
      toast.error('Failed to load users', {
        description: err.message || 'Please try again'
      });
      setUsers([]);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [organization, roleFilter, statusFilter]);

  const handleSearch = () => {
    loadUsers();
  };

  const handleRoleChange = async (userId, newRole) => {
    // Validation
    if (!userId || !newRole) {
      toast.error('Invalid parameters');
      return;
    }

    if (currentUser.role !== 'super_admin') {
      toast.error('Permission Denied', {
        description: 'Only super admins can change user roles'
      });
      return;
    }

    if (userId === currentUser.id) {
      toast.error('Cannot change your own role');
      return;
    }

    setConfirmDialog({
      isOpen: true,
      action: 'changeRole',
      userId,
      data: { newRole }
    });
  };

  const confirmRoleChange = async () => {
    const { userId, data } = confirmDialog;
    const { newRole } = data;
    setActionLoading(userId);

    try {
      // Use AdminContext method instead of direct Supabase
      const result = await updateRoleContext(userId, newRole);

      if (result) {
        // Success - reload users to show updated data
        await loadUsers();
      } else {
        // Error already handled by AdminContext
        throw new Error('Role update failed');
      }
    } catch (err) {
      console.error('Error updating role:', err);
      // Error toast already shown by AdminContext, just log it
    } finally {
      setActionLoading(null);
      setConfirmDialog({ isOpen: false, action: null, userId: null, data: null });
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    // Validation
    if (!userId) {
      toast.error('Invalid user ID');
      return;
    }

    if (userId === currentUser.id) {
      toast.error('Cannot change your own status');
      return;
    }

    const newStatus = !currentStatus;
    const action = newStatus ? 'activate' : 'deactivate';
    
    setConfirmDialog({
      isOpen: true,
      action: 'toggleStatus',
      userId,
      data: { newStatus, action }
    });
  };

  const confirmToggleStatus = async () => {
    const { userId, data } = confirmDialog;
    const { newStatus, action } = data;
    setActionLoading(userId);

    try {
      // Use AdminContext method instead of direct Supabase
      const result = await toggleStatusContext(userId, newStatus);

      if (result) {
        // Success - reload users to show updated data
        await loadUsers();
      } else {
        // Error already handled by AdminContext
        throw new Error('Status update failed');
      }
    } catch (err) {
      console.error('Error toggling status:', err);
      // Error toast already shown by AdminContext, just log it
    } finally {
      setActionLoading(null);
      setConfirmDialog({ isOpen: false, action: null, userId: null, data: null });
    }
  };

  const handleToggleVerification = async (userId, currentVerified) => {
    // Validation
    if (!userId) {
      toast.error('Invalid user ID');
      return;
    }

    if (userId === currentUser.id) {
      toast.error('Cannot change your own verification status');
      return;
    }

    // Additional validation: Check if user exists in current list
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) {
      toast.error('User not found');
      return;
    }

    const newVerified = !currentVerified;
    const action = newVerified ? 'verify' : 'unverify';
    
    setConfirmDialog({
      isOpen: true,
      action: 'toggleVerification',
      userId,
      data: { newVerified, action, userName: targetUser.name || targetUser.email }
    });
  };

  const confirmToggleVerification = async () => {
    const { userId, data } = confirmDialog;
    const { newVerified, action } = data;
    setActionLoading(userId);

    try {
      // Use AdminContext method instead of direct Supabase
      const result = await toggleVerificationContext(userId, newVerified);

      if (result) {
        // Success - reload users to show updated data
        try {
          await Promise.race([
            loadUsers(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Reload timeout')), 10000))
          ]);
        } catch (reloadError) {
          console.warn('Failed to reload users:', reloadError);
          // Don't block - user can manually refresh
        }
      } else {
        // Error already handled by AdminContext
        throw new Error('Verification update failed');
      }
    } catch (err) {
      console.error('Error toggling verification:', err);
      // Error toast already shown by AdminContext, just log it
    } finally {
      setActionLoading(null);
      setConfirmDialog({ isOpen: false, action: null, userId: null, data: null });
    }
  };

  const handleConfirm = () => {
    if (confirmDialog.action === 'changeRole') {
      confirmRoleChange();
    } else if (confirmDialog.action === 'toggleStatus') {
      confirmToggleStatus();
    } else if (confirmDialog.action === 'toggleVerification') {
      confirmToggleVerification();
    }
  };

  const getConfirmDialogProps = () => {
    const { action, data } = confirmDialog;
    
    if (action === 'changeRole') {
      return {
        title: 'Change User Role',
        message: `Are you sure you want to change this user's role to ${data?.newRole}?`,
        confirmText: 'Change Role',
        icon: Shield
      };
    } else if (action === 'toggleStatus') {
      return {
        title: `${data?.action === 'activate' ? 'Activate' : 'Deactivate'} User`,
        message: `Are you sure you want to ${data?.action} this user?`,
        confirmText: data?.action === 'activate' ? 'Activate' : 'Deactivate',
        confirmVariant: data?.action === 'deactivate' ? 'danger' : 'default',
        icon: data?.action === 'activate' ? UserCheck : UserX
      };
    } else if (action === 'toggleVerification') {
      return {
        title: `${data?.action === 'verify' ? 'Verify' : 'Unverify'} User`,
        message: `Are you sure you want to ${data?.action} this user?`,
        confirmText: data?.action === 'verify' ? 'Verify' : 'Unverify',
        confirmVariant: data?.action === 'unverify' ? 'warning' : 'default',
        icon: data?.action === 'verify' ? CheckCircle : XCircle
      };
    }
    return {};
  };

  const filteredUsers = users.filter(user => {
    // Search filter
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    let matchesStatus = true;
    if (statusFilter === 'active') {
      matchesStatus = user.is_active === true;
    } else if (statusFilter === 'inactive') {
      matchesStatus = user.is_active === false;
    } else if (statusFilter === 'pending_verification') {
      matchesStatus = user.profile_completed === true && user.is_verified === false;
    } else if (statusFilter === 'verified') {
      matchesStatus = user.is_verified === true;
    }
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <button
            onClick={loadUsers}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">Error Loading Users</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
            <button
              onClick={loadUsers}
              className="text-sm font-medium text-red-600 hover:text-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Role Filter */}
            <div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Roles</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Admin</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending_verification">Pending Verification</option>
                <option value="verified">Verified</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <TableSkeleton rows={8} columns={5} />
      ) : (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="p-8">
            {searchTerm || roleFilter !== 'all' || statusFilter !== 'all' ? (
              <NoSearchResults 
                searchTerm={searchTerm}
                onClear={() => {
                  setSearchTerm('');
                  setRoleFilter('all');
                  setStatusFilter('all');
                }}
              />
            ) : (
              <NoDataYet
                icon={Users}
                title="No users yet"
                description="Users will appear here once they register for your organization. Invite team members to get started."
                actionLabel="Refresh"
                onAction={loadUsers}
              />
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profile
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => {
                  const isAdmin = user.role === 'admin' || user.role === 'super_admin';
                  return (
                  <tr key={user.id} className={`hover:bg-gray-50 ${isAdmin ? 'bg-blue-50/30' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 relative">
                          {user.avatar_url || user.profile_pic ? (
                            <>
                              <img
                                className={`h-10 w-10 rounded-full object-cover ${isAdmin ? 'ring-2 ring-blue-400' : ''}`}
                                src={user.avatar_url || user.profile_pic}
                                alt={user.name}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                              <div className={`hidden h-10 w-10 rounded-full flex items-center justify-center ${
                                isAdmin ? 'bg-blue-500 ring-2 ring-blue-400' : 'bg-blue-100'
                              }`}>
                                <span className={`font-medium ${isAdmin ? 'text-white' : 'text-blue-600'}`}>
                                  {user.name?.charAt(0).toUpperCase() || 'U'}
                                </span>
                              </div>
                              {isAdmin && (
                                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                                  <Shield className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                                </div>
                              )}
                            </>
                          ) : (
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                              isAdmin ? 'bg-blue-500 ring-2 ring-blue-400' : 'bg-blue-100'
                            }`}>
                              <span className={`font-medium ${isAdmin ? 'text-white' : 'text-blue-600'}`}>
                                {user.name?.charAt(0).toUpperCase() || 'U'}
                              </span>
                              {isAdmin && (
                                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white">
                                  <Shield className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${isAdmin ? 'text-blue-900' : 'text-gray-900'}`}>
                              {user.name || 'N/A'}
                            </span>
                            {isAdmin && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                                <Shield className="h-3 w-3 mr-0.5" strokeWidth={2.5} />
                                {user.role === 'super_admin' ? 'Super' : 'Admin'}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {currentUser.role === 'super_admin' ? (
                        <div className="relative inline-block">
                          <select
                            value={user.role || 'user'}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            className="appearance-none text-sm font-medium px-3 py-1.5 pr-8 border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            disabled={user.id === currentUser.id}
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                            <option value="super_admin">Admin</option>
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                        </div>
                      ) : (
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === 'super_admin'
                            ? 'bg-red-100 text-red-800'
                            : user.role === 'admin'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role === 'super_admin' ? 'admin' : (user.role || 'user')}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1 items-center">
                        <span className={`px-2 py-1 inline-flex items-center justify-center text-xs leading-5 font-semibold rounded-full border ${
                          user.is_active
                            ? 'bg-green-100 text-green-800 border-gray-300'
                            : 'bg-red-100 text-red-800 border-gray-300'
                        }`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                        {user.is_verified && (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                            Verified
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1 items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                (user.profile_completion_percentage || 0) === 100 
                                  ? 'bg-green-500' 
                                  : (user.profile_completion_percentage || 0) >= 50 
                                  ? 'bg-yellow-500' 
                                  : 'bg-red-500'
                              }`}
                              style={{ width: `${user.profile_completion_percentage || 0}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium text-gray-600">
                            {user.profile_completion_percentage || 0}%
                          </span>
                        </div>
                        {user.profile_completed && (
                          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Complete
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(user.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleStatus(user.id, user.is_active)}
                          disabled={user.id === currentUser.id || actionLoading === user.id}
                          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                            user.is_active
                              ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                              : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                          } disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1`}
                        >
                          {actionLoading === user.id ? (
                            <>
                              <Loader2 className="h-3 w-3 animate-spin" />
                              <span>Processing...</span>
                            </>
                          ) : (
                            <>
                              {user.is_active ? <UserX className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}
                              <span>{user.is_active ? 'Deactivate' : 'Activate'}</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleToggleVerification(user.id, user.is_verified)}
                          disabled={user.id === currentUser.id || actionLoading === user.id || (!user.profile_completed && !user.is_verified)}
                          title={!user.profile_completed && !user.is_verified ? 'Profile must be completed first' : ''}
                          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                            user.is_verified
                              ? 'bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200'
                              : user.profile_completed
                              ? 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
                              : 'bg-gray-50 text-gray-400 border border-gray-200 cursor-not-allowed'
                          } disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1`}
                        >
                          {actionLoading === user.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <>
                              {user.is_verified ? <XCircle className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
                              <span>{user.is_verified ? 'Unverify' : user.profile_completed ? 'Verify' : 'Incomplete'}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      )}

      {/* Summary */}
      {!loading && (
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, action: null, userId: null, data: null })}
        onConfirm={handleConfirm}
        {...getConfirmDialogProps()}
      />
    </div>
  );
}
