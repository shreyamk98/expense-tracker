import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { 
  useSignInMutation, 
  useSignUpMutation, 
  useSignOutMutation, 
  useUpdateProfileMutation,
  useCheckSessionQuery 
} from '../store/api/authApi';
import { AuthStatus } from '../types/enums';
import { SignInFormData, SignUpFormData, User } from '../types/schema';
import { initializeAuth } from '../store/slices/authSlice';

export const useAuthRTK = () => {
  const dispatch = useAppDispatch();
  const authState = useAppSelector((state) => state.auth);
  
  // Mutations
  const [signInMutation] = useSignInMutation();
  const [signUpMutation] = useSignUpMutation();
  const [signOutMutation] = useSignOutMutation();
  const [updateProfileMutation] = useUpdateProfileMutation();
  
  // Check session on mount
  const { isLoading: sessionLoading } = useCheckSessionQuery(undefined, {
    skip: authState.authStatus !== AuthStatus.LOADING,
  });

  // Initialize auth state on mount
  useEffect(() => {
    if (authState.authStatus === AuthStatus.LOADING) {
      dispatch(initializeAuth());
    }
  }, [dispatch, authState.authStatus]);

  const signIn = async (credentials: SignInFormData): Promise<void> => {
    const result = await signInMutation(credentials);
    if ('error' in result) {
      // Error is already handled in onQueryStarted, just throw for form handling
      const errorMessage = (result.error as any)?.error || (result.error as any)?.data || result.error || 'Sign in failed';
      throw new Error(errorMessage);
    }
  };

  const signUp = async (userData: SignUpFormData): Promise<void> => {
    const result = await signUpMutation(userData);
    if ('error' in result) {
      // Error is already handled in onQueryStarted, just throw for form handling
      const errorMessage = (result.error as any)?.error || (result.error as any)?.data || result.error || 'Sign up failed';
      throw new Error(errorMessage);
    }
  };

  const signOut = async (): Promise<void> => {
    const result = await signOutMutation();
    if ('error' in result) {
      // Error is already handled in onQueryStarted, just throw for form handling
      const errorMessage = (result.error as any)?.error || (result.error as any)?.data || result.error || 'Sign out failed';
      throw new Error(errorMessage);
    }
  };

  const updateProfile = async (profileData: Partial<User>): Promise<void> => {
    const result = await updateProfileMutation(profileData);
    if ('error' in result) {
      // Error is already handled in onQueryStarted, just throw for form handling
      const errorMessage = (result.error as any)?.error || (result.error as any)?.data || result.error || 'Profile update failed';
      throw new Error(errorMessage);
    }
  };

  return {
    authState,
    signIn,
    signUp,
    signOut,
    updateProfile,
    isAuthenticated: authState.authStatus === AuthStatus.AUTHENTICATED,
    isLoading: authState.isLoading || sessionLoading,
  };
};