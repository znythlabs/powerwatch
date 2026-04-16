import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// During build time (prerendering), these environment variables might be missing.
// We should log a warning instead of throwing an error to allow the build to complete.
if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
        '[Supabase] Warning: Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    );
}

// Create a dummy client if variables are missing to prevent crashes
export const supabase = createClient<Database>(
    supabaseUrl || 'https://placeholder-url.supabase.co',
    supabaseAnonKey || 'placeholder-key'
);

