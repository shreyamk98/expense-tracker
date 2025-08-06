import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { setColorScheme, toggleColorScheme } from '../store/slices/uiSlice';

type ColorScheme = 'light' | 'dark';

interface ThemeContextType {
  colorScheme: ColorScheme;
  toggleColorScheme: () => void;
  setColorScheme: (scheme: ColorScheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const colorScheme = useAppSelector((state) => state.ui.colorScheme);
  const currentUser = useAppSelector((state) => state.auth.currentUser);

  // Update color scheme when user preferences change
  useEffect(() => {
    if (currentUser?.preferences?.darkMode !== undefined) {
      const newScheme = currentUser.preferences.darkMode ? 'dark' : 'light';
      dispatch(setColorScheme(newScheme));
    }
  }, [currentUser?.preferences?.darkMode, dispatch]);

  const handleSetColorScheme = (scheme: ColorScheme) => {
    dispatch(setColorScheme(scheme));
  };

  const handleToggleColorScheme = () => {
    dispatch(toggleColorScheme());
  };

  const value: ThemeContextType = {
    colorScheme,
    toggleColorScheme: handleToggleColorScheme,
    setColorScheme: handleSetColorScheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};