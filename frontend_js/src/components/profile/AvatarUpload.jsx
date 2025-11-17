'use client';

import { useState } from 'react';
import { Camera, Upload, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import Image from 'next/image';
import { useAuth } from '../../contexts/EnhancedAuthContext';

export default function AvatarUpload({ currentAvatar, userId, userName, onUploadSuccess }) {
  const { refreshUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload to Supabase
    await uploadAvatar(file);
  };

  const uploadAvatar = async (file) => {
    try {
      setUploading(true);

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update user profile
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);

      if (updateError) throw updateError;

      toast.success('Profile picture updated!');
      
      // Refresh user data in auth context
      await refreshUser();
      
      onUploadSuccess(publicUrl);
      setPreview(null);

    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const getInitials = () => {
    if (!userName) return 'U';
    return userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar Display */}
      <div className="relative group">
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-100 shadow-lg">
          {preview || currentAvatar ? (
            <Image
              src={preview || currentAvatar}
              alt="Profile"
              width={128}
              height={128}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold">
              {getInitials()}
            </div>
          )}
        </div>

        {/* Upload Button Overlay */}
        <label
          htmlFor="avatar-upload"
          className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
        >
          {uploading ? (
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          ) : (
            <Camera className="w-8 h-8 text-white" />
          )}
        </label>

        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
        />
      </div>

      {/* Upload Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => document.getElementById('avatar-upload').click()}
        disabled={uploading}
      >
        <Upload className="w-4 h-4 mr-2" />
        {uploading ? 'Uploading...' : 'Change Photo'}
      </Button>

      <p className="text-xs text-gray-500 text-center">
        JPG, PNG or GIF. Max 5MB.
      </p>
    </div>
  );
}
