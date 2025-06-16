import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { auth } from '../firebase.js';
import { useAuth } from './useAuth.js';

export const useUser = () => {
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set loading to false once we have the initial user state
    setIsLoading(false);
  }, [user]);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isLoading,
    logout: handleLogout,
    isAuthenticated: !!user,
    email: user?.email || '',
  };
}; 