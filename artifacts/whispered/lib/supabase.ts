import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://qkjpphaoakuuxbrmnewy.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFranBwaGFvYWt1dXhicm1uZXd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5MzE4MDQsImV4cCI6MjA5NjUwNzgwNH0.J86jUnOm1w8ssyUdqEMI2ZGWCRMnFEKcHFwDX299VCM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
