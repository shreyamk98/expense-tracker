import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  // Theme settings
  colorScheme: 'light' | 'dark';
  
  // Modal states
  expenseFormOpen: boolean;
  editingExpense: string | null;
  
  // Filters and UI state
  sidebarCollapsed: boolean;
  mobileDrawerOpen: boolean;
}

const initialState: UIState = {
  colorScheme: (localStorage.getItem('mantine-color-scheme') as 'light' | 'dark') || 'light',
  expenseFormOpen: false,
  editingExpense: null,
  sidebarCollapsed: false,
  mobileDrawerOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setColorScheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.colorScheme = action.payload;
      localStorage.setItem('mantine-color-scheme', action.payload);
    },
    toggleColorScheme: (state) => {
      state.colorScheme = state.colorScheme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('mantine-color-scheme', state.colorScheme);
    },
    openExpenseForm: (state, action: PayloadAction<string | null>) => {
      state.expenseFormOpen = true;
      state.editingExpense = action.payload;
    },
    closeExpenseForm: (state) => {
      state.expenseFormOpen = false;
      state.editingExpense = null;
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    toggleMobileDrawer: (state) => {
      state.mobileDrawerOpen = !state.mobileDrawerOpen;
    },
    closeMobileDrawer: (state) => {
      state.mobileDrawerOpen = false;
    },
  },
});

export const {
  setColorScheme,
  toggleColorScheme,
  openExpenseForm,
  closeExpenseForm,
  toggleSidebar,
  toggleMobileDrawer,
  closeMobileDrawer,
} = uiSlice.actions;

export default uiSlice.reducer;