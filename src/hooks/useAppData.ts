import { useAppSelector } from '../store/hooks';
import { useGetCurrentUserQuery } from '../store/api/authApi';
import { formatCurrency } from '../utils/currency';

export const useAppData = () => {
  const { data: currentUser } = useGetCurrentUserQuery();
  const settings = useAppSelector((state) => state.settings.settings);
  const colorScheme = useAppSelector((state) => state.ui.colorScheme);

  const getCurrentCurrency = () => {
    return currentUser?.preferences?.currency || settings.currency || 'USD';
  };

  const formatCurrencyAmount = (amount: number): string => {
    const currency = getCurrentCurrency();
    return formatCurrency(amount, currency);
  };

  const isDarkMode = (): boolean => {
    return currentUser?.preferences?.darkMode || colorScheme === 'dark';
  };

  return {
    currentUser,
    settings,
    getCurrentCurrency,
    formatCurrency: formatCurrencyAmount,
    isDarkMode,
  };
};