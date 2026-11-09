import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '../types/auth';
import { authService } from '../services/authService';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  loginAs: (username: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isFarmer: boolean;
  isTechnician: boolean;
}

const DEV_ACCOUNTS = {
  admin: { username: 'admin', password: 'admin123' },
  farmer: { username: 'farmer', password: 'farmer123' },
  technician: { username: 'technician', password: 'tech123' },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const initAuth = async () => {
    try {
      const token = localStorage.getItem('farmverse_token');
      if (token) {
        const profile = await authService.getCurrentUser();
        setUser(profile);
      } else {
        // Auto-login with default admin account for seamless development
        await loginAs('admin');
      }
    } catch (err) {
      console.warn('Authentication initialization falling back to admin login', err);
      try {
        await loginAs('admin');
      } catch (e) {
        console.error('Fatal auth failure', e);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const loginAs = async (roleKey: string) => {
    setLoading(true);
    try {
      const creds = DEV_ACCOUNTS[roleKey as keyof typeof DEV_ACCOUNTS] || DEV_ACCOUNTS.admin;
      const res = await authService.login(creds.username, creds.password);
      setUser({
        userId: res.userId,
        username: res.username,
        name: res.name,
        email: res.email,
        role: res.role,
        organizationId: res.organizationId,
        farmId: res.farmId,
      });
    } catch (err) {
      console.error('Error logging in as ' + roleKey, err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const isAdmin = user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN';
  const isFarmer = user?.role === 'ROLE_FARMER' || user?.role === 'FARMER';
  const isTechnician = user?.role === 'ROLE_TECHNICIAN' || user?.role === 'TECHNICIAN';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginAs,
        logout,
        isAdmin,
        isFarmer,
        isTechnician,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

