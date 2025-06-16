import { useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  User,
  onAuthStateChanged 
} from 'firebase/auth';
import { auth } from '../firebase.js';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string) => {
    setError('');
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setError('');
    try {
      await signOut(auth);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  return {
    user,
    error,
    loading,
    login,
    signup,
    logout
  };
}; 