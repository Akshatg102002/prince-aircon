import { createClient } from '@supabase/supabase-js';

// Browser Supabase client used for direct reads/writes when the site is hosted
// on static hosting (e.g. Hostinger Apache) where the /api/* Vercel functions
// do not exist. The publishable / anon key is safe to expose in the browser;
// row-level security on Supabase governs what it can read and write.
//
// Values come from the build-time env (see .env / vercel.json). Both the
// VITE_ and NEXT_PUBLIC_ prefixes are checked so the same keys work regardless
// of which naming the deploy environment uses.
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL || '';

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  // Fail loud in the console rather than silently returning empty data.
  console.error(
    'Missing Supabase config: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY ' +
      'in your build environment (.env) before running `npm run build`.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
