import { createClient } from '@supabase/supabase-js';

// Environment variables or fallback to demo state
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo-spaceshare.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured = () => {
  return (
    import.meta.env.VITE_SUPABASE_URL &&
    import.meta.env.VITE_SUPABASE_URL !== 'https://demo-spaceshare.supabase.co'
  );
};
