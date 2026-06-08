import { useUser } from '@clerk/expo';
import { supabase } from './supabase';

export async function syncUserToSupabase(userId: string, firstName?: string | null, username?: string | null, imageUrl?: string | null) {
  console.log('syncUserToSupabase called with:', { userId, firstName, username, imageUrl });
  try {
    // Check if user already exists in Supabase
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    console.log('Existing user check:', { existingUser, fetchError });

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error checking user:', fetchError);
      return;
    }

    // If user doesn't exist, create them
    if (!existingUser) {
      console.log('Creating new user in Supabase...');
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: userId,
          display_name: firstName || username || 'User',
          avatar_url: imageUrl,
        });

      if (insertError) {
        console.error('Error creating user:', insertError);
        return;
      }

      console.log('User synced to Supabase:', userId);
    } else {
      console.log('User already exists in Supabase:', userId);
    }
  } catch (error) {
    console.error('Error syncing user to Supabase:', error);
  }
}

export async function syncCoupleToSupabase(userId: string, coupleId?: string, partnerName?: string, inviteCode?: string) {
  console.log('syncCoupleToSupabase called with:', { userId, coupleId, partnerName, inviteCode });
  try {
    if (!coupleId) {
      console.log('No coupleId found in user metadata');
      return;
    }

    // Check if couple already exists in Supabase
    const { data: existingCouple, error: fetchError } = await supabase
      .from('couples')
      .select('*')
      .eq('id', coupleId)
      .single();

    console.log('Existing couple check:', { existingCouple, fetchError });

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error checking couple:', fetchError);
      return;
    }

    // If couple doesn't exist, create it
    if (!existingCouple) {
      if (!inviteCode) {
        console.error('No inviteCode found in user metadata');
        return;
      }

      console.log('Creating new couple in Supabase...');
      const { error: insertError } = await supabase
        .from('couples')
        .insert({
          id: coupleId,
          user1_id: userId,
          invite_code: inviteCode,
        });

      if (insertError) {
        console.error('Error creating couple:', insertError);
        return;
      }

      console.log('Couple synced to Supabase:', coupleId);
    } else {
      console.log('Couple already exists in Supabase:', coupleId);
    }
  } catch (error) {
    console.error('Error syncing couple to Supabase:', error);
  }
}

export async function syncAllData(userId: string, firstName?: string | null, username?: string | null, imageUrl?: string | null, coupleId?: string, partnerName?: string, inviteCode?: string) {
  console.log('syncAllData called');
  await syncUserToSupabase(userId, firstName, username, imageUrl);
  await syncCoupleToSupabase(userId, coupleId, partnerName, inviteCode);
}
