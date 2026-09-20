import { createClient } from '@supabase/supabase-js';

// Retrieve credentials from modern SUPABASE_* or VITE_SUPABASE_* environment variables
const supabaseUrl: string =
  (import.meta.env.SUPABASE_URL as string) ||
  (import.meta.env.VITE_SUPABASE_URL as string) ||
  '';

const supabasePublishableKey: string =
  (import.meta.env.SUPABASE_PUBLISHABLE_KEY as string) ||
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string) ||
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
  '';

export const getSupabaseConfig = () => ({
  supabaseUrl,
  supabasePublishableKey,
});

// Validate if user has provided real Supabase project credentials
export const isSupabaseConfigured = (): boolean => {
  return (
    Boolean(supabaseUrl) &&
    Boolean(supabasePublishableKey) &&
    supabaseUrl.includes('supabase.co') &&
    !supabaseUrl.includes('placeholder') &&
    !supabaseUrl.includes('your-project')
  );
};

// Browser-safe Supabase client using public publishable key ONLY
// Privileged/service_role keys are strictly disallowed in client-side code.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabasePublishableKey || 'placeholder-publishable-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
