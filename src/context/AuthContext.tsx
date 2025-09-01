import React, { createContext, useContext, ReactNode } from 'react';
import { 
  useSignInMutation, 
  useSignUpMutation, 
  useSignOutMutation, 
  useUpdateProfileMutation,
  useGetCurrentUserQuery,
  useCheckSessionQuery 
} from '../store/api/authApi';
import { AuthStatus } from '../types/enums';
import { SignInFormData, SignUpFormData, User, AuthState } from '../types/schema';

interface AuthContextType {
  authState: AuthState;
  signIn: (credentials: SignInFormData) => Promise<void>;
  signUp: (userData: SignUpFormData) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (profileData: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  currentUser: User | null;
  refetchUser: () => void;
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
  // RTK Query hooks - centralized in the provider
  const [signInMutation, { isLoading: signInLoading }] = useSignInMutation();
  const [signUpMutation, { isLoading: signUpLoading }] = useSignUpMutation();
  const [signOutMutation, { isLoading: signOutLoading }] = useSignOutMutation();
  const [updateProfileMutation, { isLoading: updateProfileLoading }] = useUpdateProfileMutation();
  
  // Get current user data
  const { 
    data: currentUser, 
    isLoading: userLoading, 
    error: userError,
    refetch: refetchUser 
  } = useGetCurrentUserQuery(undefined, {
    skip: !localStorage.getItem('access_token'),
  });
  
  // Check session validity
  const { 
    data: isSessionValid, 
    isLoading: sessionLoading 
  } = useCheckSessionQuery(undefined, {
    pollingInterval: 5 * 60 * 1000, // Check every 5 minutes
  });

  // Determine authentication status
  const getAuthStatus = (): AuthStatus => {
    if (userLoading || sessionLoading) return AuthStatus.LOADING;
    if (currentUser && isSessionValid) return AuthStatus.AUTHENTICATED;
    return AuthStatus.UNAUTHENTICATED;
  };

  const authStatus = getAuthStatus();
  const isAuthenticated = authStatus === AuthStatus.AUTHENTICATED;
  const isLoading = userLoading || sessionLoading || signInLoading || signUpLoading || signOutLoading || updateProfileLoading;

  // Create auth state object
  const authState: AuthState = {
    currentUser: currentUser || null,
    authStatus,
    isLoading,
    error: userError ? (typeof userError === 'string' ? userError : 'Authentication error') : null,
  };

  const signIn = async (credentials: SignInFormData): Promise<void> => {
    const result = await signInMutation(credentials);
    if ('error' in result) {
      const errorMessage = (result.error as any)?.error || (result.error as any)?.data || result.error || 'Sign in failed';
      throw new Error(errorMessage);
    }
    // Refetch user data after successful sign in
    refetchUser();
  };

  const signUp = async (userData: SignUpFormData): Promise<void> => {
    const result = await signUpMutation(userData);
    if ('error' in result) {
      const errorMessage = (result.error as any)?.error || (result.error as any)?.data || result.error || 'Sign up failed';
      throw new Error(errorMessage);
    }
    // Refetch user data after successful sign up
    refetchUser();
  };

  const signOut = async (): Promise<void> => {
    const result = await signOutMutation();
    if ('error' in result) {
      const errorMessage = (result.error as any)?.error || (result.error as any)?.data || result.error || 'Sign out failed';
      throw new Error(errorMessage);
    }
  };

  const updateProfile = async (profileData: Partial<User>): Promise<void> => {
    const result = await updateProfileMutation(profileData);
    if ('error' in result) {
      const errorMessage = (result.error as any)?.error || (result.error as any)?.data || result.error || 'Profile update failed';
      throw new Error(errorMessage);
    }
  };

  const value: AuthContextType = {
    authState,
    signIn,
    signUp,
    signOut,
    updateProfile,
    isAuthenticated,
    isLoading,
    currentUser: currentUser || null,
    refetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};