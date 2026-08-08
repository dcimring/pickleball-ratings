import 'server-only';
import { createClient } from '@supabase/supabase-js';

// This client uses the Service Role Key and MUST ONLY be used in Server Actions/Server Components.
// It bypasses RLS and provides administrative access. The 'server-only' import makes any
// accidental client-side import fail the build.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    'Missing Supabase admin environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.'
  );
}

export const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);
