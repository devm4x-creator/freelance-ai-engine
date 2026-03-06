import { createBrowserClient } from '@supabase/ssr';

// Environment variables are replaced at build time by Next.js
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Detect if running in an iframe
function isInIframe(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.self !== window.top;
  } catch {
    // If we can't access window.top due to cross-origin restrictions, we're in an iframe
    return true;
  }
}

// Check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  // Check if we have valid credentials (not empty, not placeholders)
  const hasUrl = SUPABASE_URL &&
    SUPABASE_URL.startsWith('https://') &&
    SUPABASE_URL !== 'your-supabase-project-url' &&
    !SUPABASE_URL.includes('placeholder');

  const hasKey = SUPABASE_ANON_KEY &&
    SUPABASE_ANON_KEY.length > 20 &&
    SUPABASE_ANON_KEY !== 'your-supabase-anon-key' &&
    !SUPABASE_ANON_KEY.includes('placeholder');

  return Boolean(hasUrl && hasKey);
}

// Singleton client instance
let client: ReturnType<typeof createBrowserClient> | null = null;

// Custom localStorage-based storage for iframe contexts
const localStorageAdapter = {
  getItem: (key: string) => {
    if (typeof window === 'undefined') return null;
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // localStorage might be blocked
    }
  },
  removeItem: (key: string) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(key);
    } catch {
      // localStorage might be blocked
    }
  },
};

export function createClient() {
  if (client) {
    return client;
  }

  if (!isSupabaseConfigured()) {
    // Create a non-functional client for build time
    console.warn('[Supabase] Not configured - creating placeholder client');
    console.warn('[Supabase] Debug:', getSupabaseDebugInfo());
    client = createBrowserClient(
      'https://placeholder.supabase.co',
      'placeholder-anon-key-placeholder-placeholder'
    );
    return client;
  }

  const inIframe = isInIframe();
  console.log('[Supabase] Creating client with URL:', SUPABASE_URL.substring(0, 40) + '...', 'inIframe:', inIframe);

  // Use localStorage for auth storage in iframe contexts to avoid cookie issues
  client = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      // Use localStorage to avoid third-party cookie issues in iframes
      storage: localStorageAdapter,
      // Persist session across tabs/windows
      persistSession: true,
      // Auto-refresh tokens
      autoRefreshToken: true,
      // Detect session from URL (for OAuth callbacks)
      detectSessionInUrl: true,
      // Use PKCE flow (more secure and iframe-friendly)
      flowType: 'pkce',
    },
    // Cookie options for when cookies are used
    cookieOptions: {
      // Allow cookies to work in iframes
      sameSite: 'none',
      secure: true,
    },
  });

  return client;
}

// For debugging
export function getSupabaseDebugInfo() {
  return {
    hasUrl: !!SUPABASE_URL,
    urlStart: SUPABASE_URL?.substring(0, 30) || 'none',
    hasKey: !!SUPABASE_ANON_KEY,
    keyLength: SUPABASE_ANON_KEY?.length || 0,
    isConfigured: isSupabaseConfigured(),
    inIframe: typeof window !== 'undefined' ? isInIframe() : 'server',
  };
}
