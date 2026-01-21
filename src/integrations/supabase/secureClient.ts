// Secure Supabase client that includes session token in requests
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Storage key for auth store (must match authStore.ts)
const AUTH_STORAGE_KEY = 'korasutra-auth';

// Get session token from localStorage
function getSessionToken(): string | null {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed?.state?.sessionToken || null;
    }
  } catch (e) {
    console.error('Failed to get session token:', e);
  }
  return null;
}

// Create a Supabase client that includes the session token in headers
export function createSecureClient(): SupabaseClient<Database> {
  const sessionToken = getSessionToken();
  
  const headers: Record<string, string> = {};
  if (sessionToken) {
    headers['x-session-token'] = sessionToken;
  }

  return createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
    global: {
      headers,
    },
  });
}

// Export a function to get a fresh client with current session token
// Use this for all authenticated database operations
export function getSecureSupabase(): SupabaseClient<Database> {
  return createSecureClient();
}
