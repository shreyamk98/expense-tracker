import { baseApi } from './baseApi';
import { Budget, PaymentMethodsData, Card, UPIAppConfig } from '../../types/schema';
import { indexedDBService } from '../../services/indexedDbService';
import { TimePeriod, ExpenseCategory } from '../../types/enums';

// Helper function to check if expense is in budget period
const isExpenseInBudgetPeriod = (expenseDate: Date, period: TimePeriod): boolean => {
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
};

export const budgetApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBudgets: builder.query<Budget[], void>({
      queryFn: async () => {
        try {
          await indexedDBService.init();
          const budgets = await indexedDBService.getBudgets();
          const expenses = await indexedDBService.getExpenses();
          
          // Calculate spent amounts for each budget
          const budgetsWithSpent = budgets.map(budget => {
            const categoryExpenses = expenses.filter(expense => 
              expense.category === budget.category &&
              isExpenseInBudgetPeriod(new Date(expense.date), budget.period)
            );
            
            const spent = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
            
            return { ...budget, spent };
          });
          
          return { data: budgetsWithSpent };
        } catch (error) {
          return { error: error instanceof Error ? error.message : 'Failed to get budgets' };
        }
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Budget' as const, id })),
              { type: 'Budget', id: 'LIST' },
            ]
          : [{ type: 'Budget', id: 'LIST' }],
    }),

    createBudget: builder.mutation<Budget, Omit<Budget, 'id' | 'spent'>>({
      queryFn: async (budget) => {
        try {
          await indexedDBService.init();
          const result = await indexedDBService.createBudget(budget);
          return { data: result };
        } catch (error) {
          return { error: error instanceof Error ? error.message : 'Failed to create budget' };
        }
      },
      invalidatesTags: [{ type: 'Budget', id: 'LIST' }],
    }),

    updateBudget: builder.mutation<Budget, { id: string; budget: Partial<Budget> }>({
      queryFn: async ({ id, budget }) => {
        try {
          await indexedDBService.init();
          const result = await indexedDBService.updateBudget(id, budget);
          return { data: result };
        } catch (error) {
          return { error: error instanceof Error ? error.message : 'Failed to update budget' };
        }
      },
      invalidatesTags: (result, error, { id }) => [{ type: 'Budget', id }],
    }),

    deleteBudget: builder.mutation<void, string>({
      queryFn: async (id) => {
        try {
          await indexedDBService.init();
          await indexedDBService.deleteBudget(id);
          return { data: undefined };
        } catch (error) {
          return { error: error instanceof Error ? error.message : 'Failed to delete budget' };
        }
      },
      invalidatesTags: (result, error, id) => [{ type: 'Budget', id }],
    }),

    getPaymentMethods: builder.query<PaymentMethodsData, void>({
      queryFn: async () => {
        try {
          await indexedDBService.init();
          const [cards, upiApps] = await Promise.all([
            indexedDBService.getCards(),
            indexedDBService.getUPIApps()
          ]);
          
          return { data: { cards, upiApps } };
        } catch (error) {
          return { error: error instanceof Error ? error.message : 'Failed to get payment methods' };
        }
      },
      providesTags: ['PaymentMethod'],
    }),

    createCard: builder.mutation<Card, Omit<Card, 'id'>>({
      queryFn: async (card) => {
        try {
          await indexedDBService.init();
          const result = await indexedDBService.createCard(card);
          return { data: result };
        } catch (error) {
          return { error: error instanceof Error ? error.message : 'Failed to create card' };
        }
      },
      invalidatesTags: ['PaymentMethod'],
    }),

    updateCard: builder.mutation<Card, { id: string; card: Partial<Card> }>({
      queryFn: async ({ id, card }) => {
        try {
          await indexedDBService.init();
          const result = await indexedDBService.updateCard(id, card);
          return { data: result };
        } catch (error) {
          return { error: error instanceof Error ? error.message : 'Failed to update card' };
        }
      },
      invalidatesTags: ['PaymentMethod'],
    }),

    deleteCard: builder.mutation<void, string>({
      queryFn: async (id) => {
        try {
          await indexedDBService.init();
          await indexedDBService.deleteCard(id);
          return { data: undefined };
        } catch (error) {
          return { error: error instanceof Error ? error.message : 'Failed to delete card' };
        }
      },
      invalidatesTags: ['PaymentMethod'],
    }),

    createUPIApp: builder.mutation<UPIAppConfig, Omit<UPIAppConfig, 'id'>>({
      queryFn: async (upiApp) => {
        try {
          await indexedDBService.init();
          const result = await indexedDBService.createUPIApp(upiApp);
          return { data: result };
        } catch (error) {
          return { error: error instanceof Error ? error.message : 'Failed to create UPI app' };
        }
      },
      invalidatesTags: ['PaymentMethod'],
    }),

    updateUPIApp: builder.mutation<UPIAppConfig, { id: string; upiApp: Partial<UPIAppConfig> }>({
      queryFn: async ({ id, upiApp }) => {
        try {
          await indexedDBService.init();
          const result = await indexedDBService.updateUPIApp(id, upiApp);
          return { data: result };
        } catch (error) {
          return { error: error instanceof Error ? error.message : 'Failed to update UPI app' };
        }
      },
      invalidatesTags: ['PaymentMethod'],
    }),

    deleteUPIApp: builder.mutation<void, string>({
      queryFn: async (id) => {
        try {
          await indexedDBService.init();
          await indexedDBService.deleteUPIApp(id);
          return { data: undefined };
        } catch (error) {
          return { error: error instanceof Error ? error.message : 'Failed to delete UPI app' };
        }
      },
      invalidatesTags: ['PaymentMethod'],
    }),
  }),
});

export const {
  useGetBudgetsQuery,
  useCreateBudgetMutation,
  useUpdateBudgetMutation,
  useDeleteBudgetMutation,
  useGetPaymentMethodsQuery,
  useCreateCardMutation,
  useUpdateCardMutation,
  useDeleteCardMutation,
  useCreateUPIAppMutation,
  useUpdateUPIAppMutation,
  useDeleteUPIAppMutation,
} = budgetApi;