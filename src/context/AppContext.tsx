import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppState, Expense, Budget, PaymentMethodsData, AppSettings, Card, UPIAppConfig } from '../types/schema';
import { ExpenseService } from '../services/expenseService';
import { ExpenseCategory, PaymentType } from '../types/enums';
import { useAuth } from './AuthContext';

interface AppContextType {
	state: AppState;
	addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
	updateExpense: (id: string, expense: Partial<Expense>) => Promise<void>;
	deleteExpense: (id: string) => Promise<void>;
	setBudget: (budget: Budget) => void;
	addCard: (card: Omit<Card, 'id'>) => Promise<void>;
	updateCard: (id: string, card: Partial<Card>) => void;
	deleteCard: (id: string) => void;
	addUPIApp: (upiApp: Omit<UPIAppConfig, 'id'>) => void;
	updateUPIApp: (id: string, upiApp: Partial<UPIAppConfig>) => void;
	deleteUPIApp: (id: string) => void;
	updateSettings: (settings: Partial<AppSettings>) => void;
	// Currency and formatting utilities
	formatCurrency: (amount: number) => string;
	getCurrentCurrency: () => string;
	isDarkMode: () => boolean;
	// Loading and error states
	isLoading: boolean;
	error: string | null;
	refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
	const context = useContext(AppContext);
	if (!context) {
		throw new Error('useAppContext must be used within an AppProvider');
	}
	return context;
};

interface AppProviderProps {
	children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
	const { authState } = useAuth();
	const [state, setState] = useState<AppState>({
		expenses: [],
		budgets: [],
		paymentMethods: { cards: [], upiApps: [] },
		settings: {
			darkMode: false,
			currency: 'INR',
			defaultCategories: Object.values(ExpenseCategory),
			defaultPaymentMethod: { type: PaymentType.CASH },
		},
	});
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Load initial data when user is authenticated - Real API only
	useEffect(() => {
		if (authState.currentUser) {
			loadInitialData();
		}
	}, [authState.currentUser]);

	// Sync settings with user preferences when user changes
	useEffect(() => {
		if (authState.currentUser?.preferences) {
			const userPrefs = authState.currentUser.preferences;
			setState((prev) => ({
				...prev,
				settings: {
					...prev.settings,
					darkMode: userPrefs.darkMode,
					currency: userPrefs.currency,
					defaultPaymentMethod: prev.settings.defaultPaymentMethod,
				},
			}));
		}
	}, [authState.currentUser]);

	const loadInitialData = async () => {
		setIsLoading(true);
		setError(null);

		try {
			const [expenses, budgets, paymentMethods] = await Promise.all([
				ExpenseService.getExpenses({ limit: 100 }),
				ExpenseService.getBudgets(),
				ExpenseService.getPaymentMethods(),
			]);

			setState((prev) => ({
				...prev,
				expenses: expenses.data || [],
				budgets,
				paymentMethods,
			}));
		} catch (error) {
			console.error('Failed to load initial data:', error);
			setError(error instanceof Error ? error.message : 'Failed to load data');
		} finally {
			setIsLoading(false);
		}
	};

	const addExpense = async (expense: Omit<Expense, 'id'>) => {
		try {
			setIsLoading(true);
			const newExpense = await ExpenseService.createExpense(expense);
			setState((prev) => ({
				...prev,
				expenses: [...prev.expenses, newExpense],
			}));
		} catch (error) {
			console.error('Failed to add expense:', error);
			setError(error instanceof Error ? error.message : 'Failed to add expense');
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	const updateExpense = async (id: string, expense: Partial<Expense>) => {
		try {
			setIsLoading(true);
			const updatedExpense = await ExpenseService.updateExpense(id, expense);
			setState((prev) => ({
				...prev,
				expenses: prev.expenses.map((exp) => (exp.id === id ? updatedExpense : exp)),
			}));
		} catch (error) {
			console.error('Failed to update expense:', error);
			setError(error instanceof Error ? error.message : 'Failed to update expense');
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	const deleteExpense = async (id: string) => {
		try {
			setIsLoading(true);
			await ExpenseService.deleteExpense(id);
			setState((prev) => ({
				...prev,
				expenses: prev.expenses.filter((exp) => exp.id !== id),
			}));
		} catch (error) {
			console.error('Failed to delete expense:', error);
			setError(error instanceof Error ? error.message : 'Failed to delete expense');
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	const setBudget = (budget: Budget) => {
		setState((prev) => ({
			...prev,
			budgets: prev.budgets.some((b) => b.id === budget.id)
				? prev.budgets.map((b) => (b.id === budget.id ? budget : b))
				: [...prev.budgets, budget],
		}));
	};

	const addCard = async (card: Omit<Card, 'id'>) => {
		try {
			setIsLoading(true);
			const newCard = await ExpenseService.createCard(card);
			setState((prev) => ({
				...prev,
				paymentMethods: {
					...prev.paymentMethods,
					cards: [...prev.paymentMethods.cards, newCard],
				},
			}));
		} catch (error) {
			console.error('Failed to add card:', error);
			setError(error instanceof Error ? error.message : 'Failed to add card');
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	const updateCard = (id: string, card: Partial<Card>) => {
		setState((prev) => ({
			...prev,
			paymentMethods: {
				...prev.paymentMethods,
				cards: prev.paymentMethods.cards.map((c) => (c.id === id ? { ...c, ...card } : c)),
			},
		}));
	};

	const deleteCard = (id: string) => {
		setState((prev) => ({
			...prev,
			paymentMethods: {
				...prev.paymentMethods,
				cards: prev.paymentMethods.cards.filter((c) => c.id !== id),
			},
		}));
	};

	const addUPIApp = (upiApp: Omit<UPIAppConfig, 'id'>) => {
		const newUPIApp: UPIAppConfig = {
			...upiApp,
			id: Date.now().toString(),
		};
		setState((prev) => ({
			...prev,
			paymentMethods: {
				...prev.paymentMethods,
				upiApps: [...prev.paymentMethods.upiApps, newUPIApp],
			},
		}));
	};

	const updateUPIApp = (id: string, upiApp: Partial<UPIAppConfig>) => {
		setState((prev) => ({
			...prev,
			paymentMethods: {
				...prev.paymentMethods,
				upiApps: prev.paymentMethods.upiApps.map((u) => (u.id === id ? { ...u, ...upiApp } : u)),
			},
		}));
	};

	const deleteUPIApp = (id: string) => {
		setState((prev) => ({
			...prev,
			paymentMethods: {
				...prev.paymentMethods,
				upiApps: prev.paymentMethods.upiApps.filter((u) => u.id !== id),
			},
		}));
	};

	const updateSettings = (settings: Partial<AppSettings>) => {
		// Use React's batched updates to prevent context issues
		React.startTransition(() => {
			setState((prev) => ({
				...prev,
				settings: { ...prev.settings, ...settings },
			}));
		});

		// Also persist to localStorage for immediate effect
		if (settings.darkMode !== undefined) {
			localStorage.setItem('app_dark_mode', settings.darkMode.toString());
		}
		if (settings.currency) {
			localStorage.setItem('app_currency', settings.currency);
		}
	};

	// Currency and formatting utilities
	const getCurrentCurrency = () => {
		return authState.currentUser?.preferences?.currency || state.settings.currency || 'USD';
	};

	const formatCurrency = (amount: number): string => {
		const currency = getCurrentCurrency();
		const currencyMap: Record<string, string> = {
			USD: 'en-US',
			EUR: 'en-GB',
			GBP: 'en-GB',
			INR: 'en-IN',
		};

		const locale = currencyMap[currency] || 'en-US';

		return new Intl.NumberFormat(locale, {
			style: 'currency',
			currency: currency,
		}).format(amount);
	};

	const isDarkMode = (): boolean => {
		return authState.currentUser?.preferences?.darkMode || state.settings.darkMode || false;
	};

	const value: AppContextType = {
		state,
		addExpense,
		updateExpense,
		deleteExpense,
		setBudget,
		addCard,
		updateCard,
		deleteCard,
		addUPIApp,
		updateUPIApp,
		deleteUPIApp,
		updateSettings,
		formatCurrency,
		getCurrentCurrency,
		isDarkMode,
		isLoading,
		error,
		refreshData: loadInitialData,
	};

	return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
