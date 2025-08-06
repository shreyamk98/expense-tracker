import { baseApi } from './baseApi';
import { SignInFormData, SignUpFormData, User, AuthResponse } from '../../types/schema';
import { AuthService } from '../../services/authService';
import { setCurrentUser, setAuthLoading, setAuthError, clearAuth } from '../slices/authSlice';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    signIn: builder.mutation<AuthResponse, SignInFormData>({
      queryFn: async (credentials) => {
        try {
          const result = await AuthService.signIn(credentials);
          return { data: result };
        } catch (error) {
          return { error: error instanceof Error ? error.message : 'Sign in failed' };
        }
      },
      invalidatesTags: ['User'],
      async onQueryStarted(credentials, { dispatch, queryFulfilled }) {
        dispatch(setAuthLoading(true));
        dispatch(setAuthError(null));
        
        try {
          const { data } = await queryFulfilled;
          dispatch(setCurrentUser(data.user));
        } catch (error: any) {
          // Handle RTK Query error structure
          const errorMessage = error?.error || error?.data || error?.message || 'Sign in failed';
          dispatch(setAuthError(errorMessage));
        } finally {
          dispatch(setAuthLoading(false));
        }
      },
    }),
    
    signUp: builder.mutation<AuthResponse, SignUpFormData>({
      queryFn: async (userData) => {
        try {
          const result = await AuthService.signUp(userData);
          return { data: result };
        } catch (error) {
          return { error: error instanceof Error ? error.message : 'Sign up failed' };
        }
      },
      invalidatesTags: ['User'],
      async onQueryStarted(userData, { dispatch, queryFulfilled }) {
        dispatch(setAuthLoading(true));
        dispatch(setAuthError(null));
        
        try {
          const { data } = await queryFulfilled;
          dispatch(setCurrentUser(data.user));
        } catch (error: any) {
          // Handle RTK Query error structure
          console.log('SignUp onQueryStarted error:', error);
          const errorMessage = error?.error || error?.data || error?.message || 'Sign up failed';
          console.log('Setting auth error:', errorMessage);
          dispatch(setAuthError(errorMessage));
        } finally {
          dispatch(setAuthLoading(false));
        }
      },
    }),
    
    getCurrentUser: builder.query<User | null, void>({
      queryFn: async () => {
        try {
          const user = await AuthService.getCurrentUser();
          return { data: user };
        } catch (error) {
          return { error: error instanceof Error ? error.message : 'Failed to get current user' };
        }
      },
      providesTags: ['User'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCurrentUser(data));
        } catch (error) {
          dispatch(setCurrentUser(null));
        }
      },
    }),
    
    updateProfile: builder.mutation<User, Partial<User>>({
      queryFn: async (profileData) => {
        try {
          const updatedUser = await AuthService.updateProfile(profileData);
          return { data: updatedUser };
        } catch (error) {
          return { error: error instanceof Error ? error.message : 'Profile update failed' };
        }
      },
      invalidatesTags: ['User'],
      async onQueryStarted(profileData, { dispatch, queryFulfilled }) {
        dispatch(setAuthLoading(true));
        dispatch(setAuthError(null));
        
        try {
          const { data } = await queryFulfilled;
          dispatch(setCurrentUser(data));
        } catch (error) {
          dispatch(setAuthError(error instanceof Error ? error.message : 'Profile update failed'));
        } finally {
          dispatch(setAuthLoading(false));
        }
      },
    }),
    
    signOut: builder.mutation<void, void>({
      queryFn: async () => {
        try {
          await AuthService.signOut();
          return { data: undefined };
        } catch (error) {
          return { error: error instanceof Error ? error.message : 'Sign out failed' };
        }
      },
      invalidatesTags: ['User', 'Expense', 'Budget', 'PaymentMethod', 'Card', 'UPIApp'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        dispatch(setAuthLoading(true));
        
        try {
          await queryFulfilled;
          dispatch(clearAuth());
        } catch (error) {
          dispatch(setAuthError(error instanceof Error ? error.message : 'Sign out failed'));
        } finally {
          dispatch(setAuthLoading(false));
        }
      },
    }),
    
    checkSession: builder.query<boolean, void>({
      queryFn: async () => {
        try {
          const isAuthenticated = AuthService.isAuthenticated();
          return { data: isAuthenticated };
        } catch (error) {
          return { error: error instanceof Error ? error.message : 'Session check failed' };
        }
      },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data: isAuthenticated } = await queryFulfilled;
          if (isAuthenticated) {
            // Trigger getCurrentUser if session is valid
            dispatch(authApi.endpoints.getCurrentUser.initiate());
          } else {
            dispatch(clearAuth());
          }
        } catch (error) {
          dispatch(clearAuth());
        }
      },
    }),
  }),
});

export const {
  useSignInMutation,
  useSignUpMutation,
  useGetCurrentUserQuery,
  useUpdateProfileMutation,
  useSignOutMutation,
  useCheckSessionQuery,
} = authApi;