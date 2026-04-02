import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from './supabase';
import { getMe } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  user:                any;
  profile:             any;
  loading:             boolean;
  hasSeenOnboarding:   boolean;
  signOut:             () => Promise<void>;
  refreshProfile:      () => Promise<void>;
  markOnboardingSeen:  () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null, profile: null, loading: true, hasSeenOnboarding: false,
  signOut: async () => {}, refreshProfile: async () => {}, markOnboardingSeen: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,              setUser]              = useState<any>(null);
  const [profile,           setProfile]           = useState<any>(null);
  const [loading,           setLoading]           = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  useEffect(() => {
    checkOnboarding();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await loadProfile();
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const checkOnboarding = async () => {
    try {
      const seen = await AsyncStorage.getItem('hasSeenOnboarding');
      setHasSeenOnboarding(seen === 'true');
    } catch {}
  };

  const loadProfile = async () => {
    try {
      const data = await getMe();
      setProfile(data);
    } catch {}
  };

  const refreshProfile = async () => {
    await loadProfile();
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const markOnboardingSeen = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    setHasSeenOnboarding(true);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, hasSeenOnboarding, signOut, refreshProfile, markOnboardingSeen }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
