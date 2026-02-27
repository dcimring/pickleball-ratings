import { createClient } from '@supabase/supabase-js';

// This client uses the Service Role Key and MUST ONLY be used in Server Actions/Server Components.
// It bypasses RLS and provides administrative access.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);
