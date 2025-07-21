// Expense categories and related enums
export enum ExpenseCategory {
  FOOD = 'food',
  TRAVEL = 'travel',
  UTILITIES = 'utilities',
  SUBSCRIPTIONS = 'subscriptions',
  ENTERTAINMENT = 'entertainment',
  HEALTHCARE = 'healthcare',
  SHOPPING = 'shopping',
  OTHER = 'other'
}

export enum ExportFormat {
  CSV = 'csv',
  JSON = 'json',
  PDF = 'pdf'
}

export enum TimePeriod {
  TODAY = 'today',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
  CUSTOM = 'custom'
}

export enum ChartType {
  PIE = 'pie',
  BAR = 'bar',
  LINE = 'line',
  AREA = 'area'
}

export enum PaymentType {
  CASH = 'cash',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  UPI = 'upi'
}

export enum UPIApp {
  GPAY = 'gpay',
  PHONEPE = 'phonepe',
  PAYTM = 'paytm',
  AMAZON_PAY = 'amazon_pay',
  BHIM = 'bhim',
  OTHER = 'other'
}

export enum CardType {
  CREDIT = 'credit',
  DEBIT = 'debit'
}

// Authentication and user management enums
export enum AuthStatus {
  LOADING = 'loading',
  AUTHENTICATED = 'authenticated',
  UNAUTHENTICATED = 'unauthenticated'
}

export enum UserRole {
  USER = 'user',
  PREMIUM = 'premium',
  ADMIN = 'admin'
}

export enum NotificationPreference {
  ALL = 'all',
  IMPORTANT = 'important',
  NONE = 'none'
}

export enum ProfileSetupStep {
  PERSONAL_INFO = 'personal_info',
  PREFERENCES = 'preferences',
  PAYMENT_METHODS = 'payment_methods',
  COMPLETED = 'completed'
}

// Navigation and layout related enums
export enum NavigationState {
  OPEN = 'open',
  CLOSED = 'closed',
  COLLAPSED = 'collapsed'
}

export enum ViewportSize {
  MOBILE = 'mobile',
  TABLET = 'tablet', 
  DESKTOP = 'desktop'
}