import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ExpenseCategory, PaymentType } from '../../types/enums';

interface AppSettings {
  currency: string;
  defaultCategories: ExpenseCategory[];
  defaultPaymentMethod: { type: PaymentType };
}

interface SettingsState {
  settings: AppSettings;
}

const initialState: SettingsState = {
  settings: {
    currency: localStorage.getItem('app_currency') || 'INR',
    defaultCategories: Object.values(ExpenseCategory),
    defaultPaymentMethod: { type: PaymentType.CASH },
  },
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateSettings: (state, action: PayloadAction<Partial<AppSettings>>) => {
      state.settings = { ...state.settings, ...action.payload };
      
      // Persist to localStorage
      if (action.payload.currency) {
        localStorage.setItem('app_currency', action.payload.currency);
      }
    },
    setCurrency: (state, action: PayloadAction<string>) => {
      state.settings.currency = action.payload;
      localStorage.setItem('app_currency', action.payload);
    },
  },
});

export const { updateSettings, setCurrency } = settingsSlice.actions;
export default settingsSlice.reducer;