import React, { createContext, useContext, ReactNode } from 'react';
import { useAuthRTK } from '../hooks/useAuthRTK';
import { AuthState, User, SignInFormData, SignUpFormData } from '../types/schema';

interface AuthContextType {
  authState: AuthState;
  signIn: (credentials: SignInFormData) => Promise<void>;
  signUp: (userData: SignUpFormData) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (profileData: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const authRTK = useAuthRTK();

  const value: AuthContextType = {
    authState: authRTK.authState,
    signIn: authRTK.signIn,
    signUp: authRTK.signUp,
    signOut: authRTK.signOut,
    updateProfile: authRTK.updateProfile,
    isAuthenticated: authRTK.isAuthenticated,
    isLoading: authRTK.isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};