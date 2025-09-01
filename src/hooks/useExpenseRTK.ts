import { 
  useGetExpensesQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
  useGetMonthlyStatsQuery,
  useGetWeeklyTrendsQuery,
} from '../store/api/expenseApi';
import { Expense, MonthlyStats, WeeklyTrend } from '../types/schema';
import { ExpenseQueryParams } from '../store/api/expenseApi';
import { TimePeriod } from '../types/enums';

export const useExpenseRTK = (queryParams: ExpenseQueryParams = {}) => {
  // Queries
  const { 
    data: expensesData, 
    isLoading: expensesLoading, 
    error: expensesError,
    refetch: refetchExpenses 
  } = useGetExpensesQuery(queryParams);

  // Mutations
  const [createExpense, { isLoading: createLoading }] = useCreateExpenseMutation();
  const [updateExpense, { isLoading: updateLoading }] = useUpdateExpenseMutation();
  const [deleteExpense, { isLoading: deleteLoading }] = useDeleteExpenseMutation();

  const addExpense = async (expense: Omit<Expense, 'id'>): Promise<void> => {
    const result = await createExpense(expense);
    if ('error' in result) {
      const errorMessage = (result.error as any)?.error || (result.error as any)?.data || result.error || 'Failed to add expense';
      throw new Error(errorMessage);
    }
  };

  const editExpense = async (id: string, expense: Partial<Expense>): Promise<void> => {
    const result = await updateExpense({ id, expense });
    if ('error' in result) {
      const errorMessage = (result.error as any)?.error || (result.error as any)?.data || result.error || 'Failed to update expense';
      throw new Error(errorMessage);
    }
  };

  const removeExpense = async (id: string): Promise<void> => {
    const result = await deleteExpense(id);
    if ('error' in result) {
      const errorMessage = (result.error as any)?.error || (result.error as any)?.data || result.error || 'Failed to delete expense';
      throw new Error(errorMessage);
    }
  };

  return {
    // Data
    expenses: expensesData?.data || [],
    pagination: expensesData?.pagination,
    
    // Loading states
    isLoading: expensesLoading || createLoading || updateLoading || deleteLoading,
    expensesLoading,
    createLoading,
    updateLoading,
    deleteLoading,
    
    // Error states
    error: expensesError,
    
    // Actions
    addExpense,
    editExpense,
    removeExpense,
    refetchExpenses,
  };
};

export const useExpenseStats = () => {
  const { 
    data: monthlyStats, 
    isLoading: monthlyStatsLoading, 
    error: monthlyStatsError 
  } = useGetMonthlyStatsQuery({});

  const { 
    data: weeklyTrends, 
    isLoading: weeklyTrendsLoading, 
    error: weeklyTrendsError 
  } = useGetWeeklyTrendsQuery({ period: TimePeriod.MONTH });

  return {
    monthlyStats,
    weeklyTrends,
    isLoading: monthlyStatsLoading || weeklyTrendsLoading,
    error: monthlyStatsError || weeklyTrendsError,
  };
};