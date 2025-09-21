import { useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister, logout as apiLogout, isAuthenticated } from '../api';
import toast from 'react-hot-toast';
import { User } from '../types/Contact';

const USERNAME_STORAGE_KEY = 'current_username';

const getStoredUsername = (): string | null => {
  return localStorage.getItem(USERNAME_STORAGE_KEY);
};

const setStoredUsername = (username: string | null) => {
  if (username) {
    localStorage.setItem(USERNAME_STORAGE_KEY, username);
  } else {
    localStorage.removeItem(USERNAME_STORAGE_KEY);
  }
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(() => {
    // Check if user is already authenticated on mount
    if (isAuthenticated()) {
      const storedUsername = getStoredUsername();
      return storedUsername ? { username: storedUsername } : null;
    }
    return null;
  });
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    // Set initial auth state if tokens exist but no user is set
    if (isAuthenticated() && !user) {
      const storedUsername = getStoredUsername();
      if (storedUsername) {
        setUser({ username: storedUsername });
      }
    }
  }, [user]);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoggingIn(true);
    
    try {
      console.log('Attempting login for user:', username);
      await apiLogin(username, password);
      setStoredUsername(username);
      setUser({ username });
      setIsLoggingIn(false);
      toast.success('Login successful!');
      return true;
    } catch (error: any) {
      setIsLoggingIn(false);
      console.error('Login failed:', error);
      toast.error(error.message || 'Login failed');
      return false;
    }
  };

  const logout = () => {
    apiLogout();
    setStoredUsername(null);
    setUser(null);
    toast.success('Logged out successfully');
  };

  return {
    user,
    isLoggingIn,
    login,
    logout
  };
};