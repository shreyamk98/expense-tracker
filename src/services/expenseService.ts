import { indexedDBService } from './indexedDbService';
import { 
  Expense, 
  Budget, 
  PaymentMethodsData, 
  Card, 
  UPIAppConfig, 
  MonthlyStats, 
  WeeklyTrend,
  ExportOptions,
  CategoryBreakdown,
  PaymentMethodBreakdown
} from '../types/schema';
import { ExpenseCategory, TimePeriod, PaymentType } from '../types/enums';

// Query parameters for expense listing
export interface ExpenseQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: ExpenseCategory;
  paymentType?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'date' | 'amount' | 'description';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class ExpenseService {
  // Expense CRUD operations
  static async getExpenses(params: ExpenseQueryParams = {}): Promise<PaginatedResponse<Expense>> {
    await indexedDBService.init();
    
    let expenses = await indexedDBService.getExpenses();
    
    // Apply filters
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      expenses = expenses.filter(expense => 
        expense.description.toLowerCase().includes(searchLower) ||
        expense.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    if (params.category) {
      expenses = expenses.filter(expense => expense.category === params.category);
    }
    
    if (params.paymentType) {
      expenses = expenses.filter(expense => expense.paymentMethod.type === params.paymentType);
    }
    
    if (params.dateFrom) {
      expenses = expenses.filter(expense => new Date(expense.date) >= new Date(params.dateFrom!));
    }
    
    if (params.dateTo) {
      expenses = expenses.filter(expense => new Date(expense.date) <= new Date(params.dateTo!));
    }
    
    // Apply sorting
    const sortBy = params.sortBy || 'date';
    const sortOrder = params.sortOrder || 'desc';
    
    expenses.sort((a, b) => {
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];
      
      if (sortBy === 'date') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    // Apply pagination
    const page = params.page || 1;
    const limit = params.limit || 50;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const paginatedExpenses = expenses.slice(startIndex, endIndex);
    
    return {
      data: paginatedExpenses,
      pagination: {
        page,
        limit,
        total: expenses.length,
        totalPages: Math.ceil(expenses.length / limit)
      }
    };
  }

  static async createExpense(expense: Omit<Expense, 'id'>): Promise<Expense> {
    await indexedDBService.init();
    return await indexedDBService.createExpense(expense);
  }

  static async updateExpense(id: string, expense: Partial<Expense>): Promise<Expense> {
    await indexedDBService.init();
    return await indexedDBService.updateExpense(id, expense);
  }

  static async deleteExpense(id: string): Promise<void> {
    await indexedDBService.init();
    await indexedDBService.deleteExpense(id);
  }

  // Statistics and analytics
  static async getMonthlyStats(month?: number, year?: number): Promise<MonthlyStats> {
    await indexedDBService.init();
    
    const expenses = await indexedDBService.getExpenses();
    const currentDate = new Date();
    const targetMonth = month !== undefined ? month : currentDate.getMonth();
    const targetYear = year !== undefined ? year : currentDate.getFullYear();
    
    // Filter expenses for the target month/year
    const monthlyExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === targetMonth && expenseDate.getFullYear() === targetYear;
    });
    
    const totalSpent = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const expenseCount = monthlyExpenses.length;
    const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
    const averagePerDay = totalSpent / daysInMonth;
    
    // Category breakdown
    const categoryTotals: Record<ExpenseCategory, number> = {} as any;
    Object.values(ExpenseCategory).forEach(category => {
      categoryTotals[category] = 0;
    });
    
    monthlyExpenses.forEach(expense => {
      categoryTotals[expense.category] += expense.amount;
    });
    
    const categoryBreakdown: CategoryBreakdown[] = Object.entries(categoryTotals)
      .filter(([_, amount]) => amount > 0)
      .map(([category, amount]) => ({
        category: category as ExpenseCategory,
        amount,
        percentage: (amount / totalSpent) * 100
      }));
    
    // Payment method breakdown
    const paymentTotals: Record<PaymentType, number> = {} as any;
    Object.values(PaymentType).forEach(type => {
      paymentTotals[type] = 0;
    });
    
    monthlyExpenses.forEach(expense => {
      paymentTotals[expense.paymentMethod.type] += expense.amount;
    });
    
    const paymentMethodBreakdown: PaymentMethodBreakdown[] = Object.entries(paymentTotals)
      .filter(([_, amount]) => amount > 0)
      .map(([type, amount]) => ({
        type: type as PaymentType,
        amount,
        percentage: (amount / totalSpent) * 100
      }));
    
    return {
      totalSpent,
      expenseCount,
      averagePerDay,
      categoryBreakdown,
      paymentMethodBreakdown
    };
  }

  static async getWeeklyTrends(period: TimePeriod = TimePeriod.MONTH): Promise<WeeklyTrend[]> {
    await indexedDBService.init();
    
    const expenses = await indexedDBService.getExpenses();
    const currentDate = new Date();
    
    // Generate weekly data based on period
    const weeks: WeeklyTrend[] = [];
    const weeksCount = period === TimePeriod.MONTH ? 4 : 12;
    
    for (let i = 0; i < weeksCount; i++) {
      const weekStart = new Date(currentDate);
      weekStart.setDate(currentDate.getDate() - (i + 1) * 7);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      const weekExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= weekStart && expenseDate <= weekEnd;
      });
      
      const amount = weekExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      weeks.unshift({
        week: `Week ${weeksCount - i}`,
        amount
      });
    }
    
    return weeks;
  }

  // Budget operations
  static async getBudgets(): Promise<Budget[]> {
    await indexedDBService.init();
    
    const budgets = await indexedDBService.getBudgets();
    const expenses = await indexedDBService.getExpenses();
    
    // Calculate spent amounts for each budget
    return budgets.map(budget => {
      const categoryExpenses = expenses.filter(expense => 
        expense.category === budget.category &&
        this.isExpenseInBudgetPeriod(expense, budget.period)
      );
      
      const spent = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      return { ...budget, spent };
    });
  }

  private static isExpenseInBudgetPeriod(expense: Expense, period: TimePeriod): boolean {
    const expenseDate = new Date(expense.date);
    const currentDate = new Date();
    
    switch (period) {
      case TimePeriod.MONTH:
        return expenseDate.getMonth() === currentDate.getMonth() &&
               expenseDate.getFullYear() === currentDate.getFullYear();
      case TimePeriod.YEAR:
        return expenseDate.getFullYear() === currentDate.getFullYear();
      case TimePeriod.WEEK:
        const weekStart = new Date(currentDate);
        weekStart.setDate(currentDate.getDate() - currentDate.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return expenseDate >= weekStart && expenseDate <= weekEnd;
      default:
        return true;
    }
  }

  static async createBudget(budget: Omit<Budget, 'id' | 'spent'>): Promise<Budget> {
    await indexedDBService.init();
    return await indexedDBService.createBudget(budget);
  }

  static async updateBudget(id: string, budget: Partial<Budget>): Promise<Budget> {
    await indexedDBService.init();
    return await indexedDBService.updateBudget(id, budget);
  }

  static async deleteBudget(id: string): Promise<void> {
    await indexedDBService.init();
    await indexedDBService.deleteBudget(id);
  }

  // Payment methods
  static async getPaymentMethods(): Promise<PaymentMethodsData> {
    await indexedDBService.init();
    
    const [cards, upiApps] = await Promise.all([
      indexedDBService.getCards(),
      indexedDBService.getUPIApps()
    ]);
    
    return { cards, upiApps };
  }

  static async createCard(card: Omit<Card, 'id'>): Promise<Card> {
    await indexedDBService.init();
    return await indexedDBService.createCard(card);
  }

  static async updateCard(id: string, card: Partial<Card>): Promise<Card> {
    await indexedDBService.init();
    return await indexedDBService.updateCard(id, card);
  }

  static async deleteCard(id: string): Promise<void> {
    await indexedDBService.init();
    await indexedDBService.deleteCard(id);
  }

  static async createUPIApp(upiApp: Omit<UPIAppConfig, 'id'>): Promise<UPIAppConfig> {
    await indexedDBService.init();
    return await indexedDBService.createUPIApp(upiApp);
  }

  static async updateUPIApp(id: string, upiApp: Partial<UPIAppConfig>): Promise<UPIAppConfig> {
    await indexedDBService.init();
    return await indexedDBService.updateUPIApp(id, upiApp);
  }

  static async deleteUPIApp(id: string): Promise<void> {
    await indexedDBService.init();
    await indexedDBService.deleteUPIApp(id);
  }

  // File upload operations (store in IndexedDB)
  static async uploadReceipt(file: File): Promise<string> {
    await indexedDBService.init();
    return await indexedDBService.storeReceipt(file);
  }

  static async uploadAvatar(file: File): Promise<string> {
    await indexedDBService.init();
    return await indexedDBService.storeReceipt(file); // Reuse receipt storage for avatars
  }

  // Export operations
  static async exportExpenses(options: ExportOptions): Promise<Blob> {
    await indexedDBService.init();
    
    const expenses = await indexedDBService.getExpenses();
    
    // Filter expenses based on options
    const filteredExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      const startDate = new Date(options.dateRange.start);
      const endDate = new Date(options.dateRange.end);
      
      const dateInRange = expenseDate >= startDate && expenseDate <= endDate;
      const categoryMatch = options.categories.length === 0 || options.categories.includes(expense.category);
      const paymentMatch = options.paymentMethods.length === 0 || options.paymentMethods.includes(expense.paymentMethod.type);
      
      return dateInRange && categoryMatch && paymentMatch;
    });
    
    // Generate export data based on format
    let content: string;
    let mimeType: string;
    
    switch (options.format) {
      case 'csv':
        content = this.generateCSV(filteredExpenses, options.includeTags);
        mimeType = 'text/csv';
        break;
      case 'json':
        content = JSON.stringify(filteredExpenses, null, 2);
        mimeType = 'application/json';
        break;
      default:
        throw new Error('Unsupported export format');
    }
    
    return new Blob([content], { type: mimeType });
  }

  private static generateCSV(expenses: Expense[], includeTags: boolean): string {
    const headers = ['Date', 'Description', 'Amount', 'Category', 'Payment Method'];
    if (includeTags) headers.push('Tags');
    
    const rows = expenses.map(expense => {
      const row = [
        expense.date,
        expense.description,
        expense.amount.toString(),
        expense.category,
        expense.paymentMethod.type
      ];
      
      if (includeTags) {
        row.push(expense.tags.join('; '));
      }
      
      return row.map(field => `"${field}"`).join(',');
    });
    
    return [headers.join(','), ...rows].join('\n');
  }
}