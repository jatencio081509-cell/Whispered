import { createClient } from '@supabase/supabase-js';

let supabaseAdmin: ReturnType<typeof createClient> | null = null;

if (process.env.EXPO_PUBLIC_SUPABASE_URL && process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
  supabaseAdmin = createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL,
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

export async function syncUserToSupabase(
  userId: string,
  firstName?: string | null,
  username?: string | null,
  imageUrl?: string | null,
  partnerCode?: string | null,
  partnerName?: string | null
) {
  if (!supabaseAdmin) {
    console.warn('Supabase admin client not initialized');
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .upsert(
        {
          id: userId,
          first_name: firstName,
          username: username,
          avatar_url: imageUrl,
          partner_code: partnerCode,
          partner_name: partnerName,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

    if (error) {
      console.error('Error syncing user to Supabase:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error in syncUserToSupabase:', err);
    return { success: false, error: err };
  }
}

// Wrapper for existing calls
export async function syncAllData(
  userId: string,
  firstName?: string | null,
  username?: string | null,
  imageUrl?: string | null,
  partnerCode?: string | null,
  partnerName?: string | null
) {
  return syncUserToSupabase(userId, firstName, username, imageUrl, partnerCode, partnerName);
}
