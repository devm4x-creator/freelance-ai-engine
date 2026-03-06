'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, type ReactNode } from 'react';
import { translations, type Language, type TranslationType } from '@/lib/i18n';
import { useAuth } from './AuthContext';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  profilePicture?: string | null;
  plan: 'free' | 'pro';
  generationsToday: number;
  totalSaved: number;
}

interface SavedOutput {
  id: string;
  type: string;
  title: string;
  content: string;
  createdAt: Date;
}

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationType;
  dir: 'ltr' | 'rtl';
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  profilePicture: string | null;
  setProfilePicture: (picture: string | null) => void;
  isLoggedIn: boolean;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  savedOutputs: SavedOutput[];
  saveOutput: (output: SavedOutput) => void;
  deleteOutput: (id: string) => void;
  logout: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Get initial values from localStorage (only on client)
function getInitialLanguage(): Language {
  if (typeof window === 'undefined') return 'en';
  return (localStorage.getItem('fae-language') as Language) || 'en';
}

function getInitialTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark';
  return (localStorage.getItem('fae-theme') as 'light' | 'dark') || 'dark';
}

function getInitialOutputs(): SavedOutput[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem('fae-outputs');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function getInitialUserName(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('fae-user-name');
}

function getInitialProfilePicture(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('fae-profile-picture');
}

export function AppProvider({ children }: { children: ReactNode }) {
  const { user: authUser, signOut } = useAuth();
  const [language, setLanguageState] = useState<Language>('en');
  const [theme, setThemeState] = useState<'light' | 'dark'>('dark');
  const [savedOutputs, setSavedOutputs] = useState<SavedOutput[]>([]);
  const [customUserName, setCustomUserName] = useState<string | null>(null);
  const [profilePicture, setProfilePictureState] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate state from localStorage once on mount
  useEffect(() => {
    setLanguageState(getInitialLanguage());
    setThemeState(getInitialTheme());
    setSavedOutputs(getInitialOutputs());
    setCustomUserName(getInitialUserName());
    setProfilePictureState(getInitialProfilePicture());
    setIsHydrated(true);
  }, []);

  // Apply theme
  useEffect(() => {
    if (!isHydrated) return;
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('fae-theme', theme);
  }, [theme, isHydrated]);

  // Apply language direction
  useEffect(() => {
    if (!isHydrated) return;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    localStorage.setItem('fae-language', language);
  }, [language, isHydrated]);

  // Memoized user profile - only real authenticated users
  const user: UserProfile | null = useMemo(() => {
    if (authUser) {
      return {
        id: authUser.id,
        email: authUser.email || '',
        name: customUserName || authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
        profilePicture: profilePicture,
        plan: 'free' as const,
        generationsToday: 0,
        totalSaved: savedOutputs.length,
      };
    }
    // No demo mode - return null if not authenticated
    return null;
  }, [authUser, savedOutputs.length, customUserName, profilePicture]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  const setTheme = useCallback((newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
  }, []);

  const setUser = useCallback((updatedUser: UserProfile | null) => {
    if (updatedUser) {
      setCustomUserName(updatedUser.name);
      localStorage.setItem('fae-user-name', updatedUser.name);
    }
  }, []);

  const setProfilePicture = useCallback((picture: string | null) => {
    setProfilePictureState(picture);
    if (picture) {
      localStorage.setItem('fae-profile-picture', picture);
    } else {
      localStorage.removeItem('fae-profile-picture');
    }
  }, []);

  const logout = useCallback(async () => {
    // Clear all local storage
    localStorage.removeItem('fae-user-name');
    localStorage.removeItem('fae-profile-picture');
    localStorage.removeItem('fae-outputs');
    
    // Sign out from Supabase
    await signOut();
    
    // Clear local state
    setCustomUserName(null);
    setProfilePictureState(null);
    setSavedOutputs([]);
  }, [signOut]);

  const saveOutput = useCallback((output: SavedOutput) => {
    setSavedOutputs(prev => {
      const newOutputs = [output, ...prev];
      localStorage.setItem('fae-outputs', JSON.stringify(newOutputs));
      return newOutputs;
    });
  }, []);

  const deleteOutput = useCallback((id: string) => {
    setSavedOutputs(prev => {
      const newOutputs = prev.filter(o => o.id !== id);
      localStorage.setItem('fae-outputs', JSON.stringify(newOutputs));
      return newOutputs;
    });
  }, []);

  const t = useMemo(() => translations[language], [language]);
  const dir: 'ltr' | 'rtl' = useMemo(() => language === 'ar' ? 'rtl' : 'ltr', [language]);

  const value = useMemo<AppContextType>(() => ({
    language,
    setLanguage,
    t,
    dir,
    user,
    setUser,
    profilePicture,
    setProfilePicture,
    isLoggedIn: !!user,
    theme,
    setTheme,
    savedOutputs,
    saveOutput,
    deleteOutput,
    logout,
  }), [language, setLanguage, t, dir, user, setUser, profilePicture, setProfilePicture, theme, setTheme, savedOutputs, saveOutput, deleteOutput, logout]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
