'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef, type ReactNode } from 'react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import type { User, Session, SupabaseClient } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isConfigured: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null; session: Session | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null; session: Session | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Singleton supabase client
let supabaseInstance: SupabaseClient | null = null;
function getSupabase() {
  if (!supabaseInstance && isSupabaseConfigured()) {
    supabaseInstance = createClient();
  }
  return supabaseInstance;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const initRef = useRef(false);

  // Check configuration on mount (client-side only)
  useEffect(() => {
    const configured = isSupabaseConfigured();
    setIsConfigured(configured);

    if (!configured || initRef.current) {
      setIsLoading(false);
      return;
    }

    initRef.current = true;
    const supabase = getSupabase();
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    // Get initial session with timeout
    const sessionTimeout = setTimeout(() => {
      console.warn('[Auth] Session check timed out');
      setIsLoading(false);
    }, 5000);

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        clearTimeout(sessionTimeout);
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      })
      .catch((error) => {
        clearTimeout(sessionTimeout);
        console.error('[Auth] Error getting session:', error);
        setIsLoading(false);
      });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    if (!isSupabaseConfigured()) {
      return { error: 'Supabase is not configured', session: null };
    }

    const supabase = getSupabase();
    if (!supabase) {
      return { error: 'Supabase client not available', session: null };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });

    if (data.session) {
      setSession(data.session);
      setUser(data.session.user);
    }

    return { error: error?.message ?? null, session: data.session };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      return { error: 'Supabase is not configured', session: null };
    }

    const supabase = getSupabase();
    if (!supabase) {
      return { error: 'Supabase client not available', session: null };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // Immediately update state on success
    if (data.session) {
      setSession(data.session);
      setUser(data.session.user);
    }

    return { error: error?.message ?? null, session: data.session };
  }, []);

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured()) return;

    const supabase = getSupabase();
    if (!supabase) return;

    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextType>(() => ({
    user,
    session,
    isLoading,
    isConfigured,
    signUp,
    signIn,
    signOut,
  }), [user, session, isLoading, isConfigured, signUp, signIn, signOut]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
