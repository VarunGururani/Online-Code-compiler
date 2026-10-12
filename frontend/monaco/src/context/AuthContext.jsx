import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { MOCK_USER } from '../utils/mockData';
import { getIsDemoMode } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize session verification on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (getIsDemoMode()) {
          // Check if previously logged out in session
          const loggedOut = sessionStorage.getItem('cloud_ide_logged_out');
          if (!loggedOut) {
            setUser(MOCK_USER);
          } else {
            setUser(null);
          }
        } else {
          // Verify with backend via HTTP-only cookie
          const data = await authService.getMe();
          if (data && data.user) {
            setUser(data.user);
          }
        }
      } catch (err) {
        console.warn('Initial session check note:', err.message);
        // If demo mode is active, default to mock user for instant preview
        if (getIsDemoMode() && !sessionStorage.getItem('cloud_ide_logged_out')) {
          setUser(MOCK_USER);
        } else {
          setUser(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    setIsLoading(true);
    try {
      const res = await authService.login(credentials);
      sessionStorage.removeItem('cloud_ide_logged_out');
      setUser(res.user || MOCK_USER);
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    try {
      const res = await authService.register(userData);
      sessionStorage.removeItem('cloud_ide_logged_out');
      setUser(res.user || { ...MOCK_USER, name: userData.name, email: userData.email });
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      sessionStorage.setItem('cloud_ide_logged_out', 'true');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreferences = (newPrefs) => {
    if (user) {
      setUser((prev) => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          ...newPrefs,
        },
      }));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updatePreferences,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
