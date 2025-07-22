import { ExpenseCategory, PaymentType } from '../../../types/enums';
import { formatCategory } from '../../../utils/formatters';
import { Expense, Budget, getCategoryColor, getPaymentTypeColor, getPaymentTypeLabel } from './insightsUtils';

export interface CategoryData {
  name: string;
  value: number;
  percentage: string;
  color: string;
  count: number;
}

export interface PaymentData {
  name: string;
  value: number;
  percentage: string;
  color: string;
  count: number;
}

export interface BudgetConsumptionData {
  category: string;
  spent: number;
  budget: number;
  percentage: number;
  color: string;
}

export interface ExpenseFrequencyData {
  category: string;
  frequency: number;
  avgAmount: number;
  totalAmount: number;
  color: string;
}

export interface CategoryComparisonData {
  category: string;
  currentMonth: number;
  previousMonth: number;
  change: number;
  changePercent: number;
  color: string;
}

export interface DailyPatternData {
  day: string;
  amount: number;
}

// Category breakdown data processor
export const processCategoryData = (expenses: Expense[], theme: any): CategoryData[] => {
  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  return Object.values(ExpenseCategory).map(category => {
    const categoryExpenses = expenses.filter(exp => exp.category === category);
    const amount = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const percentage = totalSpent > 0 ? (amount / totalSpent) * 100 : 0;
    
    return {
      name: formatCategory(category),
      value: amount,
      percentage: percentage.toFixed(1),
      color: getCategoryColor(category, theme),
      count: categoryExpenses.length
    };
  }).filter(item => item.value > 0);
};

// Payment method breakdown data processor
export const processPaymentData = (expenses: Expense[], theme: any): PaymentData[] => {
  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  return Object.values(PaymentType).map(type => {
    const paymentExpenses = expenses.filter(exp => exp.paymentMethod.type === type);
    const amount = paymentExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const percentage = totalSpent > 0 ? (amount / totalSpent) * 100 : 0;
    
    return {
      name: getPaymentTypeLabel(type),
      value: amount,
      percentage: percentage.toFixed(1),
      color: getPaymentTypeColor(type, theme),
      count: paymentExpenses.length
    };
  }).filter(item => item.value > 0);
};

// Budget consumption data processor
export const processBudgetConsumptionData = (expenses: Expense[], budgets: Budget[], theme: any): BudgetConsumptionData[] => {
  return budgets.map(budget => {
    const categoryExpenses = expenses.filter(exp => exp.category === budget.category);
    const spent = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const percentage = (spent / budget.limit) * 100;
    
    return {
      category: formatCategory(budget.category),
      spent,
      budget: budget.limit,
      percentage,
      color: getCategoryColor(budget.category, theme)
    };
  }).filter(item => item.budget > 0);
};

// Expense frequency data processor
export const processExpenseFrequencyData = (expenses: Expense[], theme: any): ExpenseFrequencyData[] => {
  const categoryFrequency = Object.values(ExpenseCategory).map(category => {
    const categoryExpenses = expenses.filter(exp => exp.category === category);
    const frequency = categoryExpenses.length;
    const totalAmount = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const avgAmount = frequency > 0 ? totalAmount / frequency : 0;
    
    return {
      category: formatCategory(category),
      frequency,
      avgAmount,
      totalAmount,
      color: getCategoryColor(category, theme)
    };
  }).filter(item => item.frequency > 0);
  
  return categoryFrequency.sort((a, b) => b.frequency - a.frequency);
};

// Category comparison data processor
export const processCategoryComparisonData = (expenses: Expense[], theme: any): CategoryComparisonData[] => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const currentMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
  });
  
  const previousMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    return expenseDate.getMonth() === prevMonth && expenseDate.getFullYear() === prevYear;
  });
  
  return Object.values(ExpenseCategory).map(category => {
    const currentAmount = currentMonthExpenses
      .filter(exp => exp.category === category)
      .reduce((sum, exp) => sum + exp.amount, 0);
    
    const previousAmount = previousMonthExpenses
      .filter(exp => exp.category === category)
      .reduce((sum, exp) => sum + exp.amount, 0);
    
    const change = currentAmount - previousAmount;
    const changePercent = previousAmount > 0 ? (change / previousAmount) * 100 : 0;
    
    return {
      category: formatCategory(category),
      currentMonth: currentAmount,
      previousMonth: previousAmount,
      change,
      changePercent,
      color: getCategoryColor(category, theme)
    };
  }).filter(item => item.currentMonth > 0 || item.previousMonth > 0);
};

// Daily spending pattern data processor
export const processDailyPatternData = (expenses: Expense[]): DailyPatternData[] => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  return days.map((day, index) => {
    const dayExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getDay() === (index + 1) % 7;
    });
    
    const amount = dayExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    return { day, amount };
  });
};