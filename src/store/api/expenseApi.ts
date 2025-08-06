import { baseApi } from './baseApi';
import { Expense, MonthlyStats, WeeklyTrend, CategoryBreakdown, PaymentMethodBreakdown, ExportOptions } from '../../types/schema';
import { indexedDBService } from '../../services/indexedDbService';
import { TimePeriod, ExpenseCategory, PaymentType } from '../../types/enums';

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

// Helper function to filter and sort expenses
const processExpenses = (expenses: Expense[], params: ExpenseQueryParams): PaginatedResponse<Expense> => {
  let filteredExpenses = [...expenses];
  
  // Apply filters
  if (params.search) {
    const searchLower = params.search.toLowerCase();
    filteredExpenses = filteredExpenses.filter(expense => 
      expense.description.toLowerCase().includes(searchLower) ||
      expense.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  }
  
  if (params.category) {
    filteredExpenses = filteredExpenses.filter(expense => expense.category === params.category);
  }
  
  if (params.paymentType) {
    filteredExpenses = filteredExpenses.filter(expense => expense.paymentMethod.type === params.paymentType);
  }
  
  if (params.dateFrom) {
    filteredExpenses = filteredExpenses.filter(expense => new Date(expense.date) >= new Date(params.dateFrom!));
  }
  
  if (params.dateTo) {
    filteredExpenses = filteredExpenses.filter(expense => new Date(expense.date) <= new Date(params.dateTo!));
  }
  
  // Apply sorting
  const sortBy = params.sortBy || 'date';
  const sortOrder = params.sortOrder || 'desc';
  
  filteredExpenses.sort((a, b) => {
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
  
  const paginatedExpenses = filteredExpenses.slice(startIndex, endIndex);
  
  return {
    data: paginatedExpenses,
    pagination: {
      page,
      limit,
      total: filteredExpenses.length,
      totalPages: Math.ceil(filteredExpenses.length / limit)
    }
  };
};

// Helper function to generate CSV export
const generateCSV = (expenses: Expense[], includeTags: boolean): string => {
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
};

export const expenseApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getExpenses: builder.query<PaginatedResponse<Expense>, ExpenseQueryParams>({
      queryFn: async (params) => {
        try {
          await indexedDBService.init();
          const expenses = await indexedDBService.getExpenses();
          const result = processExpenses(expenses, params);
          return { data: result };
        } catch (error) {
          return { error: error instanceof Error ? error.message : 'Failed to get expenses' };
        }
      },
      providesTags: (result, error, params) => {
        const tags: any[] = [{ type: 'Expense', id: 'LIST' }];
        
        if (result) {
          // Add individual expense tags
          result.data.forEach(expense => {
            tags.push({ type: 'Expense', id: expense.id });
          });
          
          // Add category-specific tags for better cache invalidation
          if (params.category) {
            tags.push({ type: 'Expense', id: `CATEGORY-${params.category}` });
          }
          
          // Add date-range specific tags
          if (params.dateFrom || params.dateTo) {
            tags.push({ type: 'Expense', id: `DATE-${params.dateFrom}-${params.dateTo}` });
          }
        }
        
        return tags;
      },
    }),
    
    createExpense: builder.mutation<Expense, Omit<Expense, 'id'>>({
      queryFn: async (expense) => {
        try {
          await indexedDBService.init();
          const result = await indexedDBService.createExpense(expense);
          return { data: result };
        } catch (error) {
          return { error: error instanceof Error ? error.message : 'Failed to create expense' };
        }
      },
      invalidatesTags: [
        { type: 'Expense', id: 'LIST' },
        { type: 'Budget', id: 'LIST' }, // Budgets need to recalculate spent amounts
      ],
      // Optimistic update
      async onQueryStarted(expense, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          expenseApi.util.updateQueryData('getExpenses', {}, (draft) => {
            const optimisticExpense = {
              ...expense,
              id: `temp-${Date.now()}`, // Temporary ID
            };
            draft.data.unshift(optimisticExpense);
            draft.pagination.total += 1;
          })
        );
        try {
          const { data: newExpense } = await queryFulfilled;
          // Replace optimistic update with real data
          dispatch(
            expenseApi.util.updateQueryData('getExpenses', {}, (draft) => {
              const index = draft.data.findIndex(e => e.id.startsWith('temp-'));
              if (index !== -1) {
                draft.data[index] = newExpense;
              }
            })
          );
        } catch {
          patchResult.undo();
        }
      },
    }),
    
    updateExpense: builder.mutation<Expense, { id: string; expense: Partial<Expense> }>({
      queryFn: async ({ id, expense }) => {
        try {
          await indexedDBService.init();
          const result = await indexedDBService.updateExpense(id, expense);
          return { data: result };
        } catch (error) {
          return { error: error instanceof Error ? error.message : 'Failed to update expense' };
        }
      },
      invalidatesTags: (result, error, { id }) => [
        { type: 'Expense', id },
        { type: 'Budget', id: 'LIST' }, // Budgets need to recalculate spent amounts
      ],
      // Optimistic update
      async onQueryStarted({ id, expense }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          expenseApi.util.updateQueryData('getExpenses', {}, (draft) => {
            const existingExpense = draft.data.find(e => e.id === id);
            if (existingExpense) {
              Object.assign(existingExpense, expense);
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
    
    deleteExpense: builder.mutation<void, string>({
      queryFn: async (id) => {
        try {
          await indexedDBService.init();
          await indexedDBService.deleteExpense(id);
          return { data: undefined };
        } catch (error) {
          return { error: error instanceof Error ? error.message : 'Failed to delete expense' };
        }
      },
      invalidatesTags: (result, error, id) => [
        { type: 'Expense', id },
        { type: 'Budget', id: 'LIST' }, // Budgets need to recalculate spent amounts
      ],
      // Optimistic update
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          expenseApi.util.updateQueryData('getExpenses', {}, (draft) => {
            draft.data = draft.data.filter(e => e.id !== id);
            draft.pagination.total -= 1;
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
    
    getMonthlyStats: builder.query<MonthlyStats, { month?: number; year?: number }>({
      queryFn: async ({ month, year }) => {
        try {
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
          
          const result: MonthlyStats = {
            totalSpent,
            expenseCount,
            averagePerDay,
            categoryBreakdown,
            paymentMethodBreakdown
          };
          
          return { data: result };
        } catch (error) {
          return { error: error instanceof Error ? error.message : 'Failed to get monthly stats' };
        }
      },
      providesTags: (result, error, { month, year }) => [
        { type: 'Expense', id: `STATS-${month}-${year}` }
      ],
    }),
    
    getWeeklyTrends: builder.query<WeeklyTrend[], { period?: TimePeriod }>({
      queryFn: async ({ period = TimePeriod.MONTH }) => {
        try {
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
          
          return { data: weeks };
        } catch (error) {
          return { error: error instanceof Error ? error.message : 'Failed to get weekly trends' };
        }
      },
      providesTags: (result, error, { period }) => [
        { type: 'Expense', id: `TRENDS-${period}` }
      ],
    }),

    exportExpenses: builder.query<Blob, ExportOptions>({
      queryFn: async (options) => {
        try {
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
              content = generateCSV(filteredExpenses, options.includeTags);
              mimeType = 'text/csv';
              break;
            case 'json':
              content = JSON.stringify(filteredExpenses, null, 2);
              mimeType = 'application/json';
              break;
            default:
              throw new Error('Unsupported export format');
          }
          
          const blob = new Blob([content], { type: mimeType });
          return { data: blob };
        } catch (error) {
          return { error: error instanceof Error ? error.message : 'Failed to export expenses' };
        }
      },
    }),

    uploadReceipt: builder.mutation<string, File>({
      queryFn: async (file) => {
        try {
          await indexedDBService.init();
          const receiptUrl = await indexedDBService.storeReceipt(file);
          return { data: receiptUrl };
        } catch (error) {
          return { error: error instanceof Error ? error.message : 'Failed to upload receipt' };
        }
      },
    }),
  }),
});

export const {
  useGetExpensesQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
  useGetMonthlyStatsQuery,
  useGetWeeklyTrendsQuery,
  useLazyExportExpensesQuery,
  useUploadReceiptMutation,
} = expenseApi;