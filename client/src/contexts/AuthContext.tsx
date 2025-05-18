import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User as AppUser, getUserById, createUser, verifyUserCredentials } from '../lib/apiClient';

// Simplified Session type since we're not using Supabase
type Session = {
  user: AppUser | null;
  access_token: string;
};

export type AuthContextType = {
  session: Session | null;
  user: AppUser | null; // For backward compatibility
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session in localStorage
    const storedSession = localStorage.getItem('session');
    if (storedSession) {
      try {
        const parsedSession = JSON.parse(storedSession);
        setSession(parsedSession);
      } catch (error) {
        console.error('Error parsing stored session:', error);
        localStorage.removeItem('session');
      }
    }
    setLoading(false);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const user = await verifyUserCredentials(email, password);
      if (!user) {
        throw new Error('Invalid credentials');
      }

      const session: Session = {
        user,
        access_token: 'dummy-token', // Since we're not using real auth tokens
      };

      setSession(session);
      localStorage.setItem('session', JSON.stringify(session));
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    try {
      const user = await createUser(name, email, password);
      const session: Session = {
        user,
        access_token: 'dummy-token', // Since we're not using real auth tokens
      };

      setSession(session);
      localStorage.setItem('session', JSON.stringify(session));
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  }, []);

  const signOut = useCallback(() => {
    setSession(null);
    localStorage.removeItem('session');
  }, []);

  const value = {
    session,
    user: session?.user ?? null, // For backward compatibility
    signIn,
    signUp,
    signOut,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 