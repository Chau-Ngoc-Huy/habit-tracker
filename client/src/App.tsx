import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import { User } from './types';
import { AuthProvider, AuthContextType } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import { getUsers } from './lib/apiClient';
import './App.css';

// Separate component to use hooks properly
const AppContent: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  // Correctly use Auth context
  const auth = useAuth();

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersList = await getUsers();
        // Convert array to Record<string, User>
        const usersMap = usersList.reduce((acc, user) => ({
          ...acc,
          [user.id]: user
        }), {});
        setUsers(usersMap);
        
        // Set current user to first user if no user is selected
        if (!currentUser && usersList.length > 0) {
          setCurrentUser(usersList[0].id);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [currentUser]);

  // If a user is logged in via auth system, use that instead
  useEffect(() => {
    if (auth?.user) {
      // A user is logged in
      setCurrentUser(auth.user.id);
    }
  }, [auth?.user]);

  const handleLogout = async () => {
    if (auth) {
      try {
        await auth.signOut();
      } catch (error) {
        console.error('Error signing out:', error);
      }
    }
    setCurrentUser(null);
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen">
      {!currentUser ? (
        <LoginPage users={users} onLogin={setCurrentUser} />
      ) : (
        <Dashboard 
          currentUser={currentUser}
          users={users}
          setUsers={setUsers}
          onLogout={handleLogout}
          onUserSelect={setCurrentUser}
        />
      )}
    </div>
  );
};

// Fallback AppContent to use when no Auth context is available
const AppContentWithoutAuth: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersList = await getUsers();
        // Convert array to Record<string, User>
        const usersMap = usersList.reduce((acc, user) => ({
          ...acc,
          [user.id]: user
        }), {});
        setUsers(usersMap);
        
        // Set current user to first user if no user is selected
        if (!currentUser && usersList.length > 0) {
          setCurrentUser(usersList[0].id);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [currentUser]);
  
  const handleLogout = () => {
    setCurrentUser(null);
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen">
      <Dashboard 
        currentUser={currentUser}
        users={users}
        setUsers={setUsers}
        onLogout={handleLogout}
        onUserSelect={setCurrentUser}
      />
    </div>
  );
};

function App() {
  // We need to determine at runtime if we want to use Auth or not
  // This is for development purposes only, in production we always use Auth
  const shouldUseAuth = process.env.REACT_APP_USE_SUPABASE === 'true' || false

  return (
    <AuthProvider>
      {shouldUseAuth ? (
        <AppContent />
      ) : (
        <AppContentWithoutAuth />
      )}
    </AuthProvider>
  );
}

export default App; 