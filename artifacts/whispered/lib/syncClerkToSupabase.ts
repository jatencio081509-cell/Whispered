import { createClient } from '@supabase/supabase-js';

// This client uses the SERVICE ROLE KEY - only use on the server side
// Never expose this key on the client
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function syncUserToSupabase(
  userId: string,
  firstName?: string | null,
  username?: string | null,
  imageUrl?: string | null
) {
  console.log('syncUserToSupabase called with:', { userId, firstName, username, imageUrl });

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
        {
          onConflict: 'id',
        }
      );

    if (error) {
      console.error('Error syncing user to Supabase:', error);
      return { success: false, error };
    }

    console.log('User synced to Supabase successfully');
    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error in syncUserToSupabase:', err);
    return { success: false, error: err };
  }
}
