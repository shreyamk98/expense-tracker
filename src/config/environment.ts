// Environment configuration for the application
export interface AppConfig {
  apiUrl: string;
  graphqlUrl: string;
  authUrl: string;
  uploadUrl: string;
  environment: 'development' | 'staging' | 'production';
  enableMockData: boolean;
  apiTimeout: number;
}

const getConfig = (): AppConfig => {
  const env = (import.meta as any).env?.MODE || 'development';
  
  // Default configuration - Mock data disabled
  const defaultConfig: AppConfig = {
    apiUrl: (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001/api',
    graphqlUrl: (import.meta as any).env?.VITE_GRAPHQL_URL || 'http://localhost:3001/graphql',
    authUrl: (import.meta as any).env?.VITE_AUTH_URL || 'http://localhost:3001/auth',
    uploadUrl: (import.meta as any).env?.VITE_UPLOAD_URL || 'http://localhost:3001/upload',
    environment: env as 'development' | 'staging' | 'production',
    enableMockData: false, // Mock data completely disabled
    apiTimeout: parseInt((import.meta as any).env?.VITE_API_TIMEOUT || '10000', 10)
  };

  // Environment-specific overrides
  switch (env) {
    case 'production':
      return {
        ...defaultConfig,
        apiUrl: (import.meta as any).env?.VITE_API_URL || 'https://api.expensetracker.com/api',
        graphqlUrl: (import.meta as any).env?.VITE_GRAPHQL_URL || 'https://api.expensetracker.com/graphql',
        authUrl: (import.meta as any).env?.VITE_AUTH_URL || 'https://api.expensetracker.com/auth',
        uploadUrl: (import.meta as any).env?.VITE_UPLOAD_URL || 'https://api.expensetracker.com/upload',
        enableMockData: false
      };
    
    case 'staging':
      return {
        ...defaultConfig,
        apiUrl: (import.meta as any).env?.VITE_API_URL || 'https://staging-api.expensetracker.com/api',
        graphqlUrl: (import.meta as any).env?.VITE_GRAPHQL_URL || 'https://staging-api.expensetracker.com/graphql',
        authUrl: (import.meta as any).env?.VITE_AUTH_URL || 'https://staging-api.expensetracker.com/auth',
        uploadUrl: (import.meta as any).env?.VITE_UPLOAD_URL || 'https://staging-api.expensetracker.com/upload',
        enableMockData: false // Mock data disabled in staging too
      };
    
    default:
      return defaultConfig;
  }
};

export const config = getConfig();

// API endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  auth: {
    signIn: `${config.authUrl}/signin`,
    signUp: `${config.authUrl}/signup`,
    signOut: `${config.authUrl}/signout`,
    refresh: `${config.authUrl}/refresh`,
    profile: `${config.authUrl}/profile`,
    resetPassword: `${config.authUrl}/reset-password`,
    verifyEmail: `${config.authUrl}/verify-email`
  },
  
  // Expense endpoints
  expenses: {
    list: `${config.apiUrl}/expenses`,
    create: `${config.apiUrl}/expenses`,
    update: (id: string) => `${config.apiUrl}/expenses/${id}`,
    delete: (id: string) => `${config.apiUrl}/expenses/${id}`,
    stats: `${config.apiUrl}/expenses/stats`,
    export: `${config.apiUrl}/expenses/export`
  },
  
  // Budget endpoints
  budgets: {
    list: `${config.apiUrl}/budgets`,
    create: `${config.apiUrl}/budgets`,
    update: (id: string) => `${config.apiUrl}/budgets/${id}`,
    delete: (id: string) => `${config.apiUrl}/budgets/${id}`
  },
  
  // Payment methods endpoints
  paymentMethods: {
    list: `${config.apiUrl}/payment-methods`,
    cards: {
      create: `${config.apiUrl}/payment-methods/cards`,
      update: (id: string) => `${config.apiUrl}/payment-methods/cards/${id}`,
      delete: (id: string) => `${config.apiUrl}/payment-methods/cards/${id}`
    },
    upi: {
      create: `${config.apiUrl}/payment-methods/upi`,
      update: (id: string) => `${config.apiUrl}/payment-methods/upi/${id}`,
      delete: (id: string) => `${config.apiUrl}/payment-methods/upi/${id}`
    }
  },
  
  // Upload endpoints
  upload: {
    receipt: `${config.uploadUrl}/receipts`,
    avatar: `${config.uploadUrl}/avatars`
  }
};