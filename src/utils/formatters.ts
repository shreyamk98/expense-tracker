import { ExpenseCategory, TimePeriod, AuthStatus, UserRole, NotificationPreference } from '../types/enums';

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  const currencyMap: Record<string, string> = {
    'USD': 'en-US',
    'EUR': 'en-GB',
    'GBP': 'en-GB',
    'INR': 'en-IN'
  };
  
  const locale = currencyMap[currency] || 'en-US';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(amount);
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
};

export const formatDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export const formatCategory = (category: ExpenseCategory): string => {
  return category.charAt(0).toUpperCase() + category.slice(1);
};

export const formatTimePeriod = (period: TimePeriod): string => {
  switch (period) {
    case TimePeriod.TODAY:
      return 'Today';
    case TimePeriod.WEEK:
      return 'This Week';
    case TimePeriod.MONTH:
      return 'This Month';
    case TimePeriod.YEAR:
      return 'This Year';
    case TimePeriod.CUSTOM:
      return 'Custom Range';
    default:
      return period;
  }
};

export const formatPercentage = (value: number): string => {
  return `${Math.round(value)}%`;
};

export const formatAuthStatus = (status: AuthStatus): string => {
  switch (status) {
    case AuthStatus.LOADING:
      return 'Loading...';
    case AuthStatus.AUTHENTICATED:
      return 'Authenticated';
    case AuthStatus.UNAUTHENTICATED:
      return 'Not Authenticated';
    default:
      return status;
  }
};

export const formatUserRole = (role: UserRole): string => {
  switch (role) {
    case UserRole.USER:
      return 'User';
    case UserRole.PREMIUM:
      return 'Premium User';
    case UserRole.ADMIN:
      return 'Administrator';
    default:
      return role;
  }
};

export const formatNotificationPreference = (preference: NotificationPreference): string => {
  switch (preference) {
    case NotificationPreference.ALL:
      return 'All Notifications';
    case NotificationPreference.IMPORTANT:
      return 'Important Only';
    case NotificationPreference.NONE:
      return 'No Notifications';
    default:
      return preference;
  }
};

export const formatUserInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`;
};