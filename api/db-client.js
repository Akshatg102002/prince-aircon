import { createClient } from '@supabase/supabase-js';
import { triggerRestore } from './db-wake.js';

// Resolve the Supabase URL and key from any of the env var names that may be
// configured for this project. The service-role key is preferred when present
// (server-side, full access); otherwise we fall back to the public anon /
// publishable key so read-only public endpoints still work.
const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  '';

const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  '';

if (!supabaseUrl || !supabaseKey) {
  // Surface a clear, actionable message instead of the opaque
  // "supabaseKey is required." crash at import time.
  console.error(
    'Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY ' +
      '(or the NEXT_PUBLIC_/VITE_ anon key) in the environment.'
  );
}

// Use non-empty placeholders when config is missing so createClient does not
// throw at module load (which would leak the raw function source to the client).
// Any resulting failure then happens inside each handler's try/catch and is
// returned as a clean JSON error response.
const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key',
  {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  global: {
    fetch: async (url, options) => {
      const res = await fetch(url, options);
      if (!res.ok && res.status >= 500) triggerRestore();
      return res;
    },
  },
});

export default supabase;
