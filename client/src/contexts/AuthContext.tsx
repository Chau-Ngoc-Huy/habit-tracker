import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User as AppUser, getUserById, createUser } from '../lib/apiClient';
import { verifyUserCredentials } from '../lib/mockApiClient';
import { seedMockData } from '../lib/mockApiClient';
import { USE_MOCK_API } from '../config';

// Simplified Session type since we're not using Supabase
type Session = {
  user: {
    id: string;
    email?: string;
  }
};

// Define auth functions using local storage
export type AuthContextType = {
  user: AppUser | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

// Simple in-memory store for session info
// In a real app, you'd use localStorage, cookies, etc.
const localSessionStore: {
  session: Session | null;
} = {
  session: null
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize storage when component mounts
  useEffect(() => {
    if (USE_MOCK_API) {
      seedMockData();
    }
  }, []);

  // Define getCurrentUser with useCallback to avoid dependency issues
  const getCurrentUser = useCallback(async () => {
    if (!session?.user) return;
    
    try {
      // Try to get the user from localStorage
      const appUser = await getUserById(session.user.id);
      
      // If the user doesn't exist in our storage yet, create them
      if (!appUser) {
        const email = session.user.email || '';
        const name = email.split('@')[0]; // Default name from email
        const newUser = await createUser(name, email, ''); // Empty password for existing users
        setUser(newUser);
      } else {
        setUser(appUser);
      }
    } catch (error) {
      console.error('Error getting current user:', error);
    }
  }, [session]);

  useEffect(() => {
    // Check active sessions
    const getSession = async () => {
      setLoading(true);
      
      // Get current session from local storage or other source
      const storedSession = localSessionStore.session;
      setSession(storedSession);
      
      if (storedSession?.user) {
        await getCurrentUser();
      }
      
      setLoading(false);
    };

    getSession();
  }, [getCurrentUser]);

  const signIn = async (email: string, password: string) => {
    try {
      // Verify user credentials
      const verifiedUser = await verifyUserCredentials(email, password);
      
      if (!verifiedUser) {
        throw new Error('Invalid email or password');
      }

      // Create session
      const newSession: Session = {
        user: {
          id: verifiedUser.id,
          email: verifiedUser.email
        }
      };
      
      // Store the session
      localSessionStore.session = newSession;
      setSession(newSession);
      setUser(verifiedUser);
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      // Create new user with password
      const newUser = await createUser(name, email, password);
      
      if (newUser) {
        // Create a session for the new user
        const newSession: Session = {
          user: {
            id: newUser.id,
            email: newUser.email
          }
        };
        
        // Store the session
        localSessionStore.session = newSession;
        setSession(newSession);
        setUser(newUser);
      }
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Clear the session
      localSessionStore.session = null;
      setSession(null);
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    getCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 