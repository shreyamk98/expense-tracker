import { ExpenseCategory, PaymentType, TimePeriod } from '../../../types/enums';
import { formatCategory } from '../../../utils/formatters';

export interface Expense {
  id: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  paymentMethod: {
    type: PaymentType;
  };
}

export interface Budget {
  id: string;
  category: ExpenseCategory;
  limit: number;
}

// Color mapping utilities
export const getCategoryColor = (category: ExpenseCategory, theme: any): string => {
  const colors: Record<ExpenseCategory, string> = {
    [ExpenseCategory.FOOD]: theme.colors.red[6],
    [ExpenseCategory.TRAVEL]: theme.colors.teal[6],
    [ExpenseCategory.UTILITIES]: theme.colors.blue[6],
    [ExpenseCategory.SUBSCRIPTIONS]: theme.colors.green[6],
    [ExpenseCategory.ENTERTAINMENT]: theme.colors.yellow[6],
    [ExpenseCategory.HEALTHCARE]: theme.colors.pink[6],
    [ExpenseCategory.SHOPPING]: theme.colors.violet[6],
    [ExpenseCategory.OTHER]: theme.colors.gray[6]
  };
  return colors[category];
};

export const getPaymentTypeColor = (type: PaymentType, theme: any): string => {
  const colors: Record<PaymentType, string> = {
    [PaymentType.CASH]: theme.colors.income[6],
    [PaymentType.CREDIT_CARD]: theme.colors.expense[6],
    [PaymentType.DEBIT_CARD]: theme.colors.blue[6],
    [PaymentType.UPI]: theme.colors.primary[6]
  };
  return colors[type];
};

export const getPaymentTypeLabel = (type: PaymentType): string => {
  const labels: Record<PaymentType, string> = {
    [PaymentType.CASH]: 'Cash',
    [PaymentType.CREDIT_CARD]: 'Credit Card',
    [PaymentType.DEBIT_CARD]: 'Debit Card',
    [PaymentType.UPI]: 'UPI'
  };
  return labels[type];
};

// Date filtering utilities
export const getFilteredExpenses = (expenses: Expense[], period: TimePeriod): Expense[] => {
  const now = new Date();
  const startDate = new Date();

  switch (period) {
    case TimePeriod.TODAY:
      startDate.setHours(0, 0, 0, 0);
      break;
    case TimePeriod.WEEK:
      startDate.setDate(now.getDate() - 7);
      break;
    case TimePeriod.MONTH:
      startDate.setMonth(now.getMonth() - 1);
      break;
    case TimePeriod.YEAR:
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      startDate.setMonth(now.getMonth() - 1);
  }

  return expenses.filter(expense => new Date(expense.date) >= startDate);
};

// Status calculation utilities
export const getBudgetStatus = (spent: number, budget: number) => {
  const percentage = (spent / budget) * 100;
  const isOverBudget = spent > budget;
  
  return {
    percentage,
    isOverBudget,
    status: isOverBudget ? 'over' : percentage > 80 ? 'warning' : 'good',
    color: isOverBudget ? 'red' : percentage > 80 ? 'yellow' : 'green'
  };
};

export const getTrendIcon = (change: number) => {
  if (change > 5) return 'up';
  if (change < -5) return 'down';
  return 'stable';
};

export const getTrendColor = (change: number) => {
  if (change > 5) return 'red';
  if (change < -5) return 'green';
  return 'gray';
};