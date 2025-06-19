'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/store/providers/AuthProviders';
import { getUsers } from '@/lib/apiClient';
import { User } from '@/types/api/responses/user.types';
import LoginPage from '@/components/features/auth/LoginPage';
import Dashboard from '@/components/features/dashboard/Dashboard';

export default function Home() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  const auth = useAuth();

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersList = await getUsers();
        const usersMap = usersList.reduce((acc, user) => ({
          ...acc,
          [user.id]: user
        }), {});
        setUsers(usersMap);
        
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
  }, []);

  // If a user is logged in via auth system, use that instead
  // useEffect(() => {
  //   if (auth?.user) {
  //     setCurrentUser(auth.user.id);
  //   }
  // }, [auth?.user]);

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
        <LoginPage users={users} onUserSelect={setCurrentUser} />
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
} 