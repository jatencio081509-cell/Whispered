import { createClient } from '@supabase/supabase-js';

let supabaseAdmin: ReturnType<typeof createClient> | null = null;

if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
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
  imageUrl?: string | null
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
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

    if (error) {
      console.error('Error syncing user:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, error: err };
  }
}

// Wrapper so existing code that imports syncAllData keeps working
export async function syncAllData(
  userId: string,
  firstName?: string | null,
  username?: string | null,
  imageUrl?: string | null
) {
  return syncUserToSupabase(userId, firstName, username, imageUrl);
}
