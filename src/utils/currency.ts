export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  const currencyMap: Record<string, string> = {
    USD: 'en-US',
    EUR: 'en-GB',
    GBP: 'en-GB',
    INR: 'en-IN',
  };

  const locale = currencyMap[currency] || 'en-US';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const getCurrencySymbol = (currency: string): string => {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹',
  };
  
  return symbols[currency] || '$';
};