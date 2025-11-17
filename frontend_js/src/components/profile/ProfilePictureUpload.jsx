'use client';

import React, { useState, useRef } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/EnhancedAuthContext';
import { toast } from 'sonner';

export function ProfilePictureUpload({ currentAvatarUrl, onAvatarUpdate, isEditing }) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentAvatarUrl);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (event) => {
    try {
      setUploading(true);
      
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Invalid File', {
          description: 'Please select an image file (JPG, PNG, GIF, etc.)',
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File Too Large', {
          description: 'Please select an image smaller than 5MB',
        });
        return;
      }

      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      // Update preview immediately
      setPreviewUrl(publicUrl);

      // Call the callback to update parent component
      if (onAvatarUpdate) {
        await onAvatarUpdate(publicUrl);
      }

      toast.success('Profile Picture Updated', {
        description: 'Your profile picture has been successfully updated!',
      });

    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Upload Failed', {
        description: error.message || 'Failed to upload profile picture. Please try again.',
      });
    } finally {
      setUploading(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      setUploading(true);
      
      // Remove from preview
      setPreviewUrl(null);
      
      // Call the callback to update parent component
      if (onAvatarUpdate) {
        await onAvatarUpdate(null);
      }

      toast.success('Profile Picture Removed', {
        description: 'Your profile picture has been removed.',
      });

    } catch (error) {
      console.error('Error removing avatar:', error);
      toast.error('Remove Failed', {
        description: 'Failed to remove profile picture. Please try again.',
      });
    } finally {
      setUploading(false);
    }
  };

  const getInitials = () => {
    if (!user?.name) return 'U';
    return user.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="relative mx-auto w-24 h-24 mb-4">
      {/* Avatar Display */}
      <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
        {previewUrl ? (
          <img 
            src={previewUrl} 
            alt="Profile" 
            className="w-full h-full object-cover"
            onError={() => setPreviewUrl(null)}
          />
        ) : (
          <span className="text-white text-2xl font-bold">
            {getInitials()}
          </span>
        )}
      </div>

      {/* Upload/Edit Controls */}
      {isEditing && (
        <div className="absolute bottom-0 right-0 flex gap-1">
          {/* Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            title="Upload new photo"
          >
            {uploading ? (
              <div className="w-4 h-4 relative animate-pulse">
                <Image src="/favicon.png" alt="Loading..." width={16} height={16} className="object-contain" />
              </div>
            ) : (
              <Camera className="h-4 w-4" />
            )}
          </button>

          {/* Remove Button (only show if there's an avatar) */}
          {previewUrl && (
            <button
              onClick={handleRemoveAvatar}
              disabled={uploading}
              className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              title="Remove photo"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload Instructions */}
      {isEditing && !uploading && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
          <p className="text-xs text-gray-500 text-center">
            Click camera to upload
          </p>
        </div>
      )}
    </div>
  );
}
