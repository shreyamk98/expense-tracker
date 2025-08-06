import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types/schema';
import { AuthStatus } from '../../types/enums';

interface AuthState {
  currentUser: User | null;
  authStatus: AuthStatus;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  currentUser: null,
  authStatus: AuthStatus.LOADING,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setAuthError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setCurrentUser: (state, action: PayloadAction<User | null>) => {
      state.currentUser = action.payload;
      state.authStatus = action.payload ? AuthStatus.AUTHENTICATED : AuthStatus.UNAUTHENTICATED;
      state.error = null; // Clear error on successful user set
    },
    clearAuth: (state) => {
      state.currentUser = null;
      state.authStatus = AuthStatus.UNAUTHENTICATED;
      state.error = null;
      state.isLoading = false;
    },
    initializeAuth: (state) => {
      state.authStatus = AuthStatus.LOADING;
      state.isLoading = true;
      state.error = null;
    },
  },
});

export const { setAuthLoading, setAuthError, setCurrentUser, clearAuth, initializeAuth } = authSlice.actions;
export default authSlice.reducer;