/**
 * One-time migration utility to update profile_completed flag
 * for existing users who already have complete profiles
 */

import { supabase } from './supabase';
import { isProfileComplete, calculateCompletionPercentage } from './profileCompletionService';

/**
 * Migrate a single user's profile completion status
 */
export async function migrateUserProfileCompletion(userId) {
  console.log('🔄 [migrate] Starting migration for user:', userId);
  
  try {
    // Fetch user data
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (fetchError) {
      console.error('❌ [migrate] Error fetching user:', fetchError);
      throw fetchError;
    }

    if (!user) {
      throw new Error('User not found');
    }

    console.log('👤 [migrate] User data:', user);

    // Calculate completion
    const percentage = calculateCompletionPercentage(user);
    const isComplete = isProfileComplete(user);

    console.log('📊 [migrate] Calculated:', { percentage, isComplete });

    // Update database
    const { data: updated, error: updateError } = await supabase
      .from('users')
      .update({
        profile_completion_percentage: percentage,
        profile_completed: isComplete,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('❌ [migrate] Error updating:', updateError);
      throw updateError;
    }

    console.log('✅ [migrate] Migration complete:', updated);

    return {
      success: true,
      percentage,
      isComplete,
      data: updated
    };

  } catch (error) {
    console.error('💥 [migrate] Migration failed:', error);
    throw error;
  }
}

/**
 * Migrate ALL users (admin function)
 */
export async function migrateAllUsersProfileCompletion() {
  console.log('🔄 [migrateAll] Starting bulk migration...');
  
  try {
    // Fetch all users
    const { data: users, error: fetchError } = await supabase
      .from('users')
      .select('*');

    if (fetchError) {
      console.error('❌ [migrateAll] Error fetching users:', fetchError);
      throw fetchError;
    }

    console.log(`📊 [migrateAll] Found ${users.length} users to migrate`);

    const results = {
      total: users.length,
      completed: 0,
      incomplete: 0,
      errors: []
    };

    // Process each user
    for (const user of users) {
      try {
        const percentage = calculateCompletionPercentage(user);
        const isComplete = isProfileComplete(user);

        await supabase
          .from('users')
          .update({
            profile_completion_percentage: percentage,
            profile_completed: isComplete,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (isComplete) {
          results.completed++;
        } else {
          results.incomplete++;
        }

        console.log(`✅ [migrateAll] Migrated ${user.email}: ${percentage}% (${isComplete ? 'complete' : 'incomplete'})`);

      } catch (error) {
        console.error(`❌ [migrateAll] Failed for ${user.email}:`, error);
        results.errors.push({ userId: user.id, error: error.message });
      }
    }

    console.log('🎉 [migrateAll] Migration complete:', results);

    return {
      success: true,
      results
    };

  } catch (error) {
    console.error('💥 [migrateAll] Bulk migration failed:', error);
    throw error;
  }
}

export default {
  migrateUserProfileCompletion,
  migrateAllUsersProfileCompletion
};
