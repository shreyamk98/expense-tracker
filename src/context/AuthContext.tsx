import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthState, User, SignInFormData, SignUpFormData } from '../types/schema';
import { AuthStatus } from '../types/enums';
import { AuthService } from '../services/authService';

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
  const [authState, setAuthState] = useState<AuthState>({
    currentUser: null,
    authStatus: AuthStatus.LOADING,
    isLoading: false,
    error: null
  });

  useEffect(() => {
    // Check for existing session on mount - Real API only
    const checkExistingSession = async () => {
      try {
        if (AuthService.isAuthenticated()) {
          const user = await AuthService.getCurrentUser();
          if (user) {
            setAuthState({
              currentUser: user,
              authStatus: AuthStatus.AUTHENTICATED,
              isLoading: false,
              error: null
            });
          } else {
            setAuthState(prev => ({
              ...prev,
              authStatus: AuthStatus.UNAUTHENTICATED,
              isLoading: false
            }));
          }
        } else {
          setAuthState(prev => ({
            ...prev,
            authStatus: AuthStatus.UNAUTHENTICATED,
            isLoading: false
          }));
        }
      } catch (error) {
        console.error('Session check failed:', error);
        setAuthState(prev => ({
          ...prev,
          authStatus: AuthStatus.UNAUTHENTICATED,
          isLoading: false,
          error: 'Session validation failed'
        }));
      }
    };

    checkExistingSession();
  }, []);

  const signIn = async (credentials: SignInFormData) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Use real authentication service only
      const authResponse = await AuthService.signIn(credentials);
      
      setAuthState({
        currentUser: authResponse.user,
        authStatus: AuthStatus.AUTHENTICATED,
        isLoading: false,
        error: null
      });
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Sign in failed'
      }));
      throw error;
    }
  };

  const signUp = async (userData: SignUpFormData) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Use real authentication service only
      const authResponse = await AuthService.signUp(userData);
      
      setAuthState({
        currentUser: authResponse.user,
        authStatus: AuthStatus.AUTHENTICATED,
        isLoading: false,
        error: null
      });
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Sign up failed'
      }));
      throw error;
    }
  };

  const signOut = async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }));

    try {
      // Use real authentication service only
      await AuthService.signOut();

      setAuthState({
        currentUser: null,
        authStatus: AuthStatus.UNAUTHENTICATED,
        isLoading: false,
        error: null
      });
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Sign out failed'
      }));
    }
  };

  const updateProfile = async (profileData: Partial<User>) => {
    if (!authState.currentUser) return;

    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Use real authentication service only
      const updatedUser = await AuthService.updateProfile(profileData);
      
      // Use React's batched updates to prevent context issues
      React.startTransition(() => {
        setAuthState(prev => ({
          ...prev,
          currentUser: updatedUser,
          isLoading: false
        }));
      });
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Profile update failed'
      }));
      throw error;
    }
  };

  const value: AuthContextType = {
    authState,
    signIn,
    signUp,
    signOut,
    updateProfile,
    isAuthenticated: authState.authStatus === AuthStatus.AUTHENTICATED,
    isLoading: authState.isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};