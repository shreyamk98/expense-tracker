import { ApolloClient, InMemoryCache, from, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { TokenManager } from '../services/apiClient';
import { config } from '../config/environment';

// HTTP link for GraphQL endpoint
const httpLink = createHttpLink({
  uri: config.graphqlUrl,
});

// Auth link to add authorization header
const authLink = setContext((_, { headers }) => {
  const token = TokenManager.getAccessToken();
  
  return {
    headers: {
      ...headers,
      ...(token && { authorization: `Bearer ${token}` }),
    }
  };
});

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path, extensions }) => {
      console.error(`GraphQL error: Message: ${message}, Location: ${locations}, Path: ${path}`);
      
      // Handle authentication errors
      if (extensions?.code === 'UNAUTHENTICATED') {
        TokenManager.clearTokens();
        window.location.href = '/auth/signin';
      }
      
      throw new Error(`GraphQL error: ${message}`);
    });
  }

  if (networkError) {
    console.error(`Network error: ${networkError}`);
    
    // Handle network authentication errors
    if ('statusCode' in networkError && networkError.statusCode === 401) {
      TokenManager.clearTokens();
      window.location.href = '/auth/signin';
    }
    
    throw new Error(`Network error: ${networkError.message}`);
  }
});

// Create real Apollo Client
export const realApolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          expenses: {
            // Enable pagination for expenses
            keyArgs: ['filters'],
            merge(existing = [], incoming) {
              return [...existing, ...incoming];
            },
          },
        },
      },
      Expense: {
        fields: {
          date: {
            // Ensure dates are properly handled
            read(value) {
              return value ? new Date(value) : null;
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
      fetchPolicy: 'cache-and-network',
    },
    query: {
      errorPolicy: 'all',
      fetchPolicy: 'cache-first',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});

// GraphQL queries and mutations
export const GRAPHQL_OPERATIONS = {
  // Expense operations
  GET_EXPENSES: `
    query GetExpenses($filters: ExpenseFilters, $pagination: PaginationInput) {
      expenses(filters: $filters, pagination: $pagination) {
        data {
          id
          amount
          date
          description
          category
          tags
          receiptUrl
          paymentMethod {
            type
            upiApp
            cardId
          }
          createdAt
          updatedAt
        }
        pagination {
          page
          limit
          total
          totalPages
        }
      }
    }
  `,

  CREATE_EXPENSE: `
    mutation CreateExpense($input: CreateExpenseInput!) {
      createExpense(input: $input) {
        id
        amount
        date
        description
        category
        tags
        receiptUrl
        paymentMethod {
          type
          upiApp
          cardId
        }
        createdAt
        updatedAt
      }
    }
  `,

  UPDATE_EXPENSE: `
    mutation UpdateExpense($id: ID!, $input: UpdateExpenseInput!) {
      updateExpense(id: $id, input: $input) {
        id
        amount
        date
        description
        category
        tags
        receiptUrl
        paymentMethod {
          type
          upiApp
          cardId
        }
        updatedAt
      }
    }
  `,

  DELETE_EXPENSE: `
    mutation DeleteExpense($id: ID!) {
      deleteExpense(id: $id) {
        success
        message
      }
    }
  `,

  // Statistics operations
  GET_MONTHLY_STATS: `
    query GetMonthlyStats($month: Int, $year: Int) {
      monthlyStats(month: $month, year: $year) {
        totalSpent
        expenseCount
        averagePerDay
        categoryBreakdown {
          category
          amount
          percentage
        }
        paymentMethodBreakdown {
          type
          amount
          percentage
        }
      }
    }
  `,

  GET_WEEKLY_TRENDS: `
    query GetWeeklyTrends($period: TimePeriod!) {
      weeklyTrends(period: $period) {
        week
        amount
      }
    }
  `,

  // Budget operations
  GET_BUDGETS: `
    query GetBudgets {
      budgets {
        id
        category
        limit
        spent
        period
        createdAt
        updatedAt
      }
    }
  `,

  CREATE_BUDGET: `
    mutation CreateBudget($input: CreateBudgetInput!) {
      createBudget(input: $input) {
        id
        category
        limit
        spent
        period
        createdAt
        updatedAt
      }
    }
  `,

  UPDATE_BUDGET: `
    mutation UpdateBudget($id: ID!, $input: UpdateBudgetInput!) {
      updateBudget(id: $id, input: $input) {
        id
        category
        limit
        spent
        period
        updatedAt
      }
    }
  `,

  DELETE_BUDGET: `
    mutation DeleteBudget($id: ID!) {
      deleteBudget(id: $id) {
        success
        message
      }
    }
  `,

  // Payment methods operations
  GET_PAYMENT_METHODS: `
    query GetPaymentMethods {
      paymentMethods {
        cards {
          id
          name
          type
          lastFourDigits
          isDefault
          createdAt
        }
        upiApps {
          id
          app
          isEnabled
          createdAt
        }
      }
    }
  `,

  CREATE_CARD: `
    mutation CreateCard($input: CreateCardInput!) {
      createCard(input: $input) {
        id
        name
        type
        lastFourDigits
        isDefault
        createdAt
      }
    }
  `,

  UPDATE_CARD: `
    mutation UpdateCard($id: ID!, $input: UpdateCardInput!) {
      updateCard(id: $id, input: $input) {
        id
        name
        type
        lastFourDigits
        isDefault
        updatedAt
      }
    }
  `,

  DELETE_CARD: `
    mutation DeleteCard($id: ID!) {
      deleteCard(id: $id) {
        success
        message
      }
    }
  `,

  CREATE_UPI_APP: `
    mutation CreateUPIApp($input: CreateUPIAppInput!) {
      createUPIApp(input: $input) {
        id
        app
        isEnabled
        createdAt
      }
    }
  `,

  UPDATE_UPI_APP: `
    mutation UpdateUPIApp($id: ID!, $input: UpdateUPIAppInput!) {
      updateUPIApp(id: $id, input: $input) {
        id
        app
        isEnabled
        updatedAt
      }
    }
  `,

  DELETE_UPI_APP: `
    mutation DeleteUPIApp($id: ID!) {
      deleteUPIApp(id: $id) {
        success
        message
      }
    }
  `
};