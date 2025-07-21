import { ExpenseCategory, TimePeriod, ExportFormat, PaymentType, UPIApp, CardType } from '../types/enums';

// Data for global state store
export const mockStore = {
  expenses: [
    {
      id: "1" as const,
      amount: 45.50,
      date: "2024-01-15T10:30:00Z",
      description: "Lunch at Italian restaurant",
      category: ExpenseCategory.FOOD,
      tags: ["lunch", "restaurant"],
      receiptUrl: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=600&fit=crop",
      paymentMethod: {
        type: PaymentType.UPI,
        upiApp: UPIApp.GPAY,
        cardId: "card-1"
      }
    },
    {
      id: "2" as const,
      amount: 120.00,
      date: "2024-01-14T14:20:00Z",
      description: "Gas station fill-up",
      category: ExpenseCategory.TRAVEL,
      tags: ["gas", "car"],
      receiptUrl: "https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=400&h=600&fit=crop",
      paymentMethod: {
        type: PaymentType.CREDIT_CARD,
        cardId: "card-2"
      }
    },
    {
      id: "3" as const,
      amount: 89.99,
      date: "2024-01-13T09:15:00Z",
      description: "Monthly internet bill",
      category: ExpenseCategory.UTILITIES,
      tags: ["monthly", "internet"],
      receiptUrl: null,
      paymentMethod: {
        type: PaymentType.UPI,
        upiApp: UPIApp.PHONEPE,
        cardId: "card-1"
      }
    },
    {
      id: "4" as const,
      amount: 15.99,
      date: "2024-01-12T16:45:00Z",
      description: "Netflix subscription",
      category: ExpenseCategory.SUBSCRIPTIONS,
      tags: ["streaming", "monthly"],
      receiptUrl: null,
      paymentMethod: {
        type: PaymentType.DEBIT_CARD,
        cardId: "card-3"
      }
    },
    {
      id: "5" as const,
      amount: 67.25,
      date: "2024-01-11T19:30:00Z",
      description: "Grocery shopping",
      category: ExpenseCategory.FOOD,
      tags: ["groceries", "weekly"],
      receiptUrl: "https://images.unsplash.com/photo-1586380951230-4c0b90d0b8b8?w=400&h=600&fit=crop",
      paymentMethod: {
        type: PaymentType.CASH
      }
    }
  ],
  budgets: [
    {
      id: "1" as const,
      category: ExpenseCategory.FOOD,
      limit: 500.00,
      spent: 112.75,
      period: TimePeriod.MONTH
    },
    {
      id: "2" as const,
      category: ExpenseCategory.TRAVEL,
      limit: 300.00,
      spent: 120.00,
      period: TimePeriod.MONTH
    }
  ],
  paymentMethods: {
    cards: [
      {
        id: "card-1" as const,
        name: "HDFC Credit Card",
        type: CardType.CREDIT,
        lastFourDigits: "1234",
        isDefault: true
      },
      {
        id: "card-2" as const,
        name: "SBI Debit Card",
        type: CardType.DEBIT,
        lastFourDigits: "5678",
        isDefault: false
      },
      {
        id: "card-3" as const,
        name: "ICICI Debit Card",
        type: CardType.DEBIT,
        lastFourDigits: "9012",
        isDefault: false
      }
    ],
    upiApps: [
      {
        id: "upi-1" as const,
        app: UPIApp.GPAY,
        isEnabled: true
      },
      {
        id: "upi-2" as const,
        app: UPIApp.PHONEPE,
        isEnabled: true
      },
      {
        id: "upi-3" as const,
        app: UPIApp.PAYTM,
        isEnabled: false
      }
    ]
  },
  settings: {
    darkMode: false,
    currency: "USD" as const,
    defaultCategories: Object.values(ExpenseCategory),
    defaultPaymentMethod: {
      type: PaymentType.UPI,
      upiApp: UPIApp.GPAY,
      cardId: "card-1"
    }
  }
};

// Data returned by API queries
export const mockQuery = {
  monthlyStats: {
    totalSpent: 338.73,
    expenseCount: 5,
    averagePerDay: 11.29,
    categoryBreakdown: [
      { category: ExpenseCategory.FOOD, amount: 112.75, percentage: 33.3 },
      { category: ExpenseCategory.TRAVEL, amount: 120.00, percentage: 35.4 },
      { category: ExpenseCategory.UTILITIES, amount: 89.99, percentage: 26.6 },
      { category: ExpenseCategory.SUBSCRIPTIONS, amount: 15.99, percentage: 4.7 }
    ],
    paymentMethodBreakdown: [
      { type: PaymentType.UPI, amount: 135.49, percentage: 40.0 },
      { type: PaymentType.CREDIT_CARD, amount: 120.00, percentage: 35.4 },
      { type: PaymentType.DEBIT_CARD, amount: 15.99, percentage: 4.7 },
      { type: PaymentType.CASH, amount: 67.25, percentage: 19.9 }
    ]
  },
  weeklyTrends: [
    { week: "Week 1", amount: 156.25 },
    { week: "Week 2", amount: 182.48 },
    { week: "Week 3", amount: 338.73 }
  ]
};

// Data passed as props to the root component
export const mockRootProps = {
  initialView: "dashboard" as const,
  userId: "user123" as const
};