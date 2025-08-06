import { baseApi } from './baseApi';
import { SignInFormData, SignUpFormData, User, AuthResponse } from '../../types/schema';
import { indexedDBService } from '../../services/indexedDbService';
import { setCurrentUser, setAuthLoading, setAuthError, clearAuth } from '../slices/authSlice';
import bcrypt from 'bcryptjs';
import { UserRole, TimePeriod, NotificationPreference, ProfileSetupStep } from '../../types/enums';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    signIn: builder.mutation<AuthResponse, SignInFormData>({
      queryFn: async (credentials) => {
        try {
          await indexedDBService.init();

          const user = await indexedDBService.getUserByEmail(credentials.email);
          if (!user) {
            throw new Error('Invalid email or password');
          }

          // Verify password using bcrypt
          const isValidPassword = await bcrypt.compare(credentials.password, (user as any).hashedPassword);
          if (!isValidPassword) {
            throw new Error('Invalid email or password');
          }

          // Generate secure tokens
          const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const refreshToken = `refresh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

          // Store session data
          localStorage.setItem('access_token', token);
          localStorage.setItem('refresh_token', refreshToken);
          localStorage.setItem('user_data', JSON.stringify(user));

          if (credentials.rememberMe) {
            localStorage.setItem('remember_me', 'true');
          }

          // Update last login
          const updatedUser = await indexedDBService.updateUser(user.id, {
            lastLoginAt: new Date().toISOString(),
          });

          // Initialize default data for new user
          await indexedDBService.initializeDefaultData();

          const authResponse: AuthResponse = {
            success: true,
            user: updatedUser,
            token,
            refreshToken,
            expiresIn: 3600,
          };

          return { data: authResponse };
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
          await indexedDBService.init();

          // Check if user already exists
          const existingUser = await indexedDBService.getUserByEmail(userData.email);
          if (existingUser) {
            throw new Error('User already exists with this email');
          }

          // Hash password before storing
          const hashedPassword = await bcrypt.hash(userData.password, 12);
          
          const userDataWithHashedPassword = {
            ...userData,
            hashedPassword,
          };

          // Create new user
          const user = await indexedDBService.createUser(userDataWithHashedPassword);

          // Generate secure tokens
          const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const refreshToken = `refresh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

          // Store session data
          localStorage.setItem('access_token', token);
          localStorage.setItem('refresh_token', refreshToken);
          localStorage.setItem('user_data', JSON.stringify(user));

          const authResponse: AuthResponse = {
            success: true,
            user,
            token,
            refreshToken,
            expiresIn: 3600,
            message: 'Account created successfully',
          };

          return { data: authResponse };
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
          const userData = localStorage.getItem('user_data');
          if (!userData) return { data: null };

          const storedUser = JSON.parse(userData);
          
          await indexedDBService.init();

          // Get fresh user data from IndexedDB
          const user = await indexedDBService.get<User>('users', storedUser.id);
          if (user) {
            // Update stored data
            localStorage.setItem('user_data', JSON.stringify(user));
            return { data: user };
          }

          return { data: null };
        } catch (error) {
          console.error('Failed to fetch current user:', error);
          // Clear invalid session
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user_data');
          localStorage.removeItem('remember_me');
          return { data: null };
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
          const userData = localStorage.getItem('user_data');
          if (!userData) {
            throw new Error('No authenticated user found');
          }

          const currentUser = JSON.parse(userData);
          await indexedDBService.init();

          // Update user in IndexedDB
          const updatedUser = await indexedDBService.updateUser(currentUser.id, profileData);

          // Update stored user data
          localStorage.setItem('user_data', JSON.stringify(updatedUser));

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
          // Clear local storage
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user_data');
          localStorage.removeItem('remember_me');
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
          const isAuthenticated = !!localStorage.getItem('access_token') && !!localStorage.getItem('user_data');
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

    refreshSession: builder.mutation<boolean, void>({
      queryFn: async () => {
        try {
          const refreshToken = localStorage.getItem('refresh_token');
          if (!refreshToken) return { data: false };

          // Generate new tokens
          const newToken = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const newRefreshToken = `refresh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

          localStorage.setItem('access_token', newToken);
          localStorage.setItem('refresh_token', newRefreshToken);

          return { data: true };
        } catch (error) {
          console.error('Session refresh failed:', error);
          // Clear invalid session
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user_data');
          localStorage.removeItem('remember_me');
          return { data: false };
        }
      },
    }),

    resetPassword: builder.mutation<void, string>({
      queryFn: async (email) => {
        try {
          await indexedDBService.init();

          const user = await indexedDBService.getUserByEmail(email);
          if (!user) {
            throw new Error('User not found');
          }

          // In production, send email with reset token
          console.log(`Password reset email would be sent to ${email}`);
          return { data: undefined };
        } catch (error) {
          return { error: error instanceof Error ? error.message : 'Password reset failed' };
        }
      },
    }),

    verifyEmail: builder.mutation<void, string>({
      queryFn: async (token) => {
        try {
          // In production, verify the token and update user status
          console.log(`Email verification token: ${token}`);
          return { data: undefined };
        } catch (error) {
          return { error: error instanceof Error ? error.message : 'Email verification failed' };
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
  useRefreshSessionMutation,
  useResetPasswordMutation,
  useVerifyEmailMutation,
} = authApi;