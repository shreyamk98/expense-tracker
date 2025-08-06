import {
	ExpenseCategory,
	TimePeriod,
	ExportFormat,
	PaymentType,
	UPIApp,
	CardType,
	AuthStatus,
	UserRole,
	NotificationPreference,
	ProfileSetupStep,
} from './enums';

// Props types (data passed to components)
export interface ExpenseFormProps {
	expense?: Expense;
	onSubmit: (expense: Omit<Expense, 'id'>) => void;
	onCancel: () => void;
	isOpen: boolean;
	paymentMethods: PaymentMethodsData;
}

export interface ExpenseListProps {
	onEdit?: (expense: Expense) => void;
	onViewReceipt?: (receiptUrl: string) => void;
	paymentMethods?: PaymentMethodsData;
}

export interface StatsProps {
	monthlyStats: MonthlyStats;
	weeklyTrends: WeeklyTrend[];
	timePeriod: TimePeriod;
	onTimePeriodChange: (period: TimePeriod) => void;
}

export interface PaymentMethodFormProps {
	isOpen: boolean;
	onSubmit: (paymentMethod: Card | UPIAppConfig) => void;
	onCancel: () => void;
	type: 'card' | 'upi';
	editingItem?: Card | UPIAppConfig;
}

// Store types (global state data)
export interface Expense {
	id: string;
	amount: number;
	date: string;
	description: string;
	category: ExpenseCategory;
	tags: string[];
	receiptUrl: string | null;
	paymentMethod: PaymentMethod;
}

export interface PaymentMethod {
	type: PaymentType;
	upiApp?: UPIApp;
	cardId?: string;
}

export interface Card {
	id: string;
	name: string;
	type: CardType;
	lastFourDigits: string;
	isDefault: boolean;
}

export interface UPIAppConfig {
	id: string;
	app: UPIApp;
	isEnabled: boolean;
}

export interface PaymentMethodsData {
	cards: Card[];
	upiApps: UPIAppConfig[];
}

export interface Budget {
	id: string;
	category: ExpenseCategory;
	limit: number;
	spent: number;
	period: TimePeriod;
}

export interface AppSettings {
	darkMode: boolean;
	currency: string;
	defaultCategories: ExpenseCategory[];
	defaultPaymentMethod: PaymentMethod;
}

export interface AppState {
	expenses: Expense[];
	budgets: Budget[];
	paymentMethods: PaymentMethodsData;
	settings: AppSettings;
}

// Query types (API response data)
export interface MonthlyStats {
	totalSpent: number;
	expenseCount: number;
	averagePerDay: number;
	categoryBreakdown: CategoryBreakdown[];
	paymentMethodBreakdown: PaymentMethodBreakdown[];
}

export interface CategoryBreakdown {
	category: ExpenseCategory;
	amount: number;
	percentage: number;
}

export interface PaymentMethodBreakdown {
	type: PaymentType;
	amount: number;
	percentage: number;
}

export interface WeeklyTrend {
	week: string;
	amount: number;
}

export interface ExportOptions {
	format: ExportFormat;
	dateRange: {
		start: Date;
		end: Date;
	};
	categories: ExpenseCategory[];
	paymentMethods: PaymentType[];
	includeTags: boolean;
}

// Authentication types
export interface User {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	fullName: string;
	profilePicture?: string;
	phoneNumber?: string;
	dateOfBirth?: string;
	role: UserRole;
	isEmailVerified: boolean;
	createdAt: string;
	lastLoginAt: string;
	preferences: UserPreferences;
	profileSetupStep: ProfileSetupStep;
	hashedPassword?: string; // Only used internally, never exposed to frontend
}

export interface UserPreferences {
	currency: string;
	defaultBudgetPeriod: TimePeriod;
	notifications: NotificationPreference;
	darkMode: boolean;
	language: string;
}

export interface AuthState {
	currentUser: User | null;
	authStatus: AuthStatus;
	isLoading: boolean;
	error: string | null;
}

// Form types
export interface SignInFormData {
	email: string;
	password: string;
	rememberMe: boolean;
}

export interface SignUpFormData {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	confirmPassword: string;
	agreeToTerms: boolean;
}

export interface ProfileSetupData {
	phoneNumber?: string;
	dateOfBirth?: string;
	profilePicture?: File;
	preferences: Partial<UserPreferences>;
}

// API response types
export interface AuthResponse {
	success: boolean;
	user: User;
	token: string;
	refreshToken?: string;
	expiresIn?: number;
	message?: string;
}

export interface ValidationRule {
	required: boolean;
	minLength?: number;
	pattern?: RegExp;
	message: string;
}

// Navigation and layout types
export interface NavigationItem {
	id: string;
	label: string;
	icon: string;
	path: string;
	isActive: boolean;
}

export interface NavigationStateType {
	isOpen: boolean;
	isCollapsed: boolean;
	isMobile: boolean;
}

export interface HeaderProps {
	navigationState: NavigationStateType;
	onToggleNavigation: () => void;
	onToggleCollapse: () => void;
	currentUser: User | null;
	onSignOut: () => void;
}

export interface SidebarProps {
	navigationState: NavigationStateType;
	navigationItems: NavigationItem[];
	activeTab: string;
	onTabChange: (tab: string) => void;
	onToggleCollapse: () => void;
}