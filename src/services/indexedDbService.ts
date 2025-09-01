// IndexedDB service for local data persistence
import {
	Expense,
	Budget,
	PaymentMethodsData,
	Card,
	UPIAppConfig,
	MonthlyStats,
	WeeklyTrend,
	User,
	AuthResponse,
} from '../types/schema';
import {
	ExpenseCategory,
	TimePeriod,
	PaymentType,
	UPIApp,
	CardType,
	UserRole,
	NotificationPreference,
	ProfileSetupStep,
} from '../types/enums';

const DB_NAME = 'ExpenseTrackerDB';
const DB_VERSION = 1;

// Store names
const STORES = {
	USERS: 'users',
	EXPENSES: 'expenses',
	BUDGETS: 'budgets',
	CARDS: 'cards',
	UPI_APPS: 'upiApps',
	RECEIPTS: 'receipts',
};

class IndexedDBService {
	private db: IDBDatabase | null = null;

	async init(): Promise<void> {
		return new Promise((resolve, reject) => {
			const request = indexedDB.open(DB_NAME, DB_VERSION);

			request.onerror = () => reject(request.error);
			request.onsuccess = () => {
				this.db = request.result;
				resolve();
			};

			request.onupgradeneeded = (event) => {
				const db = (event.target as IDBOpenDBRequest).result;

				// Users store
				if (!db.objectStoreNames.contains(STORES.USERS)) {
					const userStore = db.createObjectStore(STORES.USERS, { keyPath: 'id' });
					userStore.createIndex('email', 'email', { unique: true });
				}

				// Expenses store
				if (!db.objectStoreNames.contains(STORES.EXPENSES)) {
					const expenseStore = db.createObjectStore(STORES.EXPENSES, { keyPath: 'id' });
					expenseStore.createIndex('userId', 'userId');
					expenseStore.createIndex('date', 'date');
					expenseStore.createIndex('category', 'category');
				}

				// Budgets store
				if (!db.objectStoreNames.contains(STORES.BUDGETS)) {
					const budgetStore = db.createObjectStore(STORES.BUDGETS, { keyPath: 'id' });
					budgetStore.createIndex('userId', 'userId');
				}

				// Cards store
				if (!db.objectStoreNames.contains(STORES.CARDS)) {
					const cardStore = db.createObjectStore(STORES.CARDS, { keyPath: 'id' });
					cardStore.createIndex('userId', 'userId');
				}

				// UPI Apps store
				if (!db.objectStoreNames.contains(STORES.UPI_APPS)) {
					const upiStore = db.createObjectStore(STORES.UPI_APPS, { keyPath: 'id' });
					upiStore.createIndex('userId', 'userId');
				}

				// Receipts store (for file storage)
				if (!db.objectStoreNames.contains(STORES.RECEIPTS)) {
					db.createObjectStore(STORES.RECEIPTS, { keyPath: 'id' });
				}
			};
		});
	}

	private async ensureDB(): Promise<IDBDatabase> {
		if (!this.db) {
			await this.init();
		}
		return this.db!;
	}

	private generateId(): string {
		return Date.now().toString() + Math.random().toString(36).substr(2, 9);
	}

	private getCurrentUserId(): string {
		const userData = localStorage.getItem('user_data');
		if (userData) {
			const user = JSON.parse(userData);
			return user.id;
		}
		throw new Error('No authenticated user found');
	}

	// Generic CRUD operations
	async add<T>(storeName: string, data: T): Promise<T> {
		const db = await this.ensureDB();
		return new Promise((resolve, reject) => {
			const transaction = db.transaction([storeName], 'readwrite');
			const store = transaction.objectStore(storeName);
			const request = store.add(data);

			request.onsuccess = () => resolve(data);
			request.onerror = () => reject(request.error);
		});
	}

	async update<T>(storeName: string, data: T): Promise<T> {
		const db = await this.ensureDB();
		return new Promise((resolve, reject) => {
			const transaction = db.transaction([storeName], 'readwrite');
			const store = transaction.objectStore(storeName);
			const request = store.put(data);

			request.onsuccess = () => resolve(data);
			request.onerror = () => reject(request.error);
		});
	}

	async delete(storeName: string, id: string): Promise<void> {
		const db = await this.ensureDB();
		return new Promise((resolve, reject) => {
			const transaction = db.transaction([storeName], 'readwrite');
			const store = transaction.objectStore(storeName);
			const request = store.delete(id);

			request.onsuccess = () => resolve();
			request.onerror = () => reject(request.error);
		});
	}

	async get<T>(storeName: string, id: string): Promise<T | null> {
		const db = await this.ensureDB();
		return new Promise((resolve, reject) => {
			const transaction = db.transaction([storeName], 'readonly');
			const store = transaction.objectStore(storeName);
			const request = store.get(id);

			request.onsuccess = () => resolve(request.result || null);
			request.onerror = () => reject(request.error);
		});
	}

	async getAll<T>(storeName: string): Promise<T[]> {
		const db = await this.ensureDB();
		return new Promise((resolve, reject) => {
			const transaction = db.transaction([storeName], 'readonly');
			const store = transaction.objectStore(storeName);
			const request = store.getAll();

			request.onsuccess = () => resolve(request.result || []);
			request.onerror = () => reject(request.error);
		});
	}

	async getByIndex<T>(storeName: string, indexName: string, value: any): Promise<T[]> {
		const db = await this.ensureDB();
		return new Promise((resolve, reject) => {
			const transaction = db.transaction([storeName], 'readonly');
			const store = transaction.objectStore(storeName);
			const index = store.index(indexName);
			const request = index.getAll(value);

			request.onsuccess = () => resolve(request.result || []);
			request.onerror = () => reject(request.error);
		});
	}

	// User operations
	async createUser(userData: any): Promise<User> {
		const userWithPassword = {
			id: this.generateId(),
			email: userData.email,
			firstName: userData.firstName,
			lastName: userData.lastName,
			fullName: `${userData.firstName} ${userData.lastName}`,
			profilePicture: undefined,
			phoneNumber: undefined,
			dateOfBirth: undefined,
			role: UserRole.USER,
			isEmailVerified: false,
			createdAt: new Date().toISOString(),
			lastLoginAt: new Date().toISOString(),
			preferences: {
				currency: 'INR',
				defaultBudgetPeriod: TimePeriod.MONTH,
				notifications: NotificationPreference.IMPORTANT,
				darkMode: false,
				language: 'en',
			},
			profileSetupStep: ProfileSetupStep.COMPLETED,
			hashedPassword: userData.hashedPassword,
		};

		await this.add(STORES.USERS, userWithPassword);
		
		// Return user without password for security
		const { hashedPassword, ...user } = userWithPassword;
		return user as User;
	}

	async getUserByEmail(email: string): Promise<User | null> {
		const users = await this.getByIndex<User>(STORES.USERS, 'email', email);
		return users.length > 0 ? users[0] : null;
	}

	async updateUser(userId: string, userData: Partial<User>): Promise<User> {
		const existingUser = await this.get<User>(STORES.USERS, userId);
		if (!existingUser) {
			throw new Error('User not found');
		}

		const updatedUser = { ...existingUser, ...userData };
		await this.update(STORES.USERS, updatedUser);
		return updatedUser;
	}

	// Expense operations
	async createExpense(expenseData: Omit<Expense, 'id'>): Promise<Expense> {
		const userId = this.getCurrentUserId();
		const expense: Expense & { userId: string } = {
			...expenseData,
			id: this.generateId(),
			userId,
		} as any;

		await this.add(STORES.EXPENSES, expense);
		return expense;
	}

	async getExpenses(userId?: string): Promise<Expense[]> {
		const currentUserId = userId || this.getCurrentUserId();
		const expenses = await this.getByIndex<Expense & { userId: string }>(STORES.EXPENSES, 'userId', currentUserId);
		return expenses.map(({ userId, ...expense }) => expense);
	}

	async updateExpense(id: string, expenseData: Partial<Expense>): Promise<Expense> {
		const userId = this.getCurrentUserId();
		const existingExpense = await this.get<Expense & { userId: string }>(STORES.EXPENSES, id);

		if (!existingExpense || existingExpense.userId !== userId) {
			throw new Error('Expense not found');
		}

		const updatedExpense = { ...existingExpense, ...expenseData };
		await this.update(STORES.EXPENSES, updatedExpense);

		const { userId: _, ...expense } = updatedExpense;
		return expense;
	}

	async deleteExpense(id: string): Promise<void> {
		const userId = this.getCurrentUserId();
		const existingExpense = await this.get<Expense & { userId: string }>(STORES.EXPENSES, id);

		if (!existingExpense || existingExpense.userId !== userId) {
			throw new Error('Expense not found');
		}

		await this.delete(STORES.EXPENSES, id);
	}

	// Budget operations
	async createBudget(budgetData: Omit<Budget, 'id' | 'spent'>): Promise<Budget> {
		const userId = this.getCurrentUserId();
		const budget: Budget & { userId: string } = {
			...budgetData,
			id: this.generateId(),
			spent: 0,
			userId,
		} as any;

		await this.add(STORES.BUDGETS, budget);
		const { userId: _, ...result } = budget;
		return result;
	}

	async getBudgets(): Promise<Budget[]> {
		const userId = this.getCurrentUserId();
		const budgets = await this.getByIndex<Budget & { userId: string }>(STORES.BUDGETS, 'userId', userId);
		return budgets.map(({ userId, ...budget }) => budget);
	}

	async updateBudget(id: string, budgetData: Partial<Budget>): Promise<Budget> {
		const userId = this.getCurrentUserId();
		const existingBudget = await this.get<Budget & { userId: string }>(STORES.BUDGETS, id);

		if (!existingBudget || existingBudget.userId !== userId) {
			throw new Error('Budget not found');
		}

		const updatedBudget = { ...existingBudget, ...budgetData };
		await this.update(STORES.BUDGETS, updatedBudget);

		const { userId: _, ...budget } = updatedBudget;
		return budget;
	}

	async deleteBudget(id: string): Promise<void> {
		const userId = this.getCurrentUserId();
		const existingBudget = await this.get<Budget & { userId: string }>(STORES.BUDGETS, id);

		if (!existingBudget || existingBudget.userId !== userId) {
			throw new Error('Budget not found');
		}

		await this.delete(STORES.BUDGETS, id);
	}

	// Card operations
	async createCard(cardData: Omit<Card, 'id'>): Promise<Card> {
		const userId = this.getCurrentUserId();
		const card: Card & { userId: string } = {
			...cardData,
			id: this.generateId(),
			userId,
		} as any;

		await this.add(STORES.CARDS, card);
		const { userId: _, ...result } = card;
		return result;
	}

	async getCards(): Promise<Card[]> {
		const userId = this.getCurrentUserId();
		const cards = await this.getByIndex<Card & { userId: string }>(STORES.CARDS, 'userId', userId);
		return cards.map(({ userId, ...card }) => card);
	}

	async updateCard(id: string, cardData: Partial<Card>): Promise<Card> {
		const userId = this.getCurrentUserId();
		const existingCard = await this.get<Card & { userId: string }>(STORES.CARDS, id);

		if (!existingCard || existingCard.userId !== userId) {
			throw new Error('Card not found');
		}

		const updatedCard = { ...existingCard, ...cardData };
		await this.update(STORES.CARDS, updatedCard);

		const { userId: _, ...card } = updatedCard;
		return card;
	}

	async deleteCard(id: string): Promise<void> {
		const userId = this.getCurrentUserId();
		const existingCard = await this.get<Card & { userId: string }>(STORES.CARDS, id);

		if (!existingCard || existingCard.userId !== userId) {
			throw new Error('Card not found');
		}

		await this.delete(STORES.CARDS, id);
	}

	// UPI App operations
	async createUPIApp(upiData: Omit<UPIAppConfig, 'id'>): Promise<UPIAppConfig> {
		const userId = this.getCurrentUserId();
		const upiApp: UPIAppConfig & { userId: string } = {
			...upiData,
			id: this.generateId(),
			userId,
		} as any;

		await this.add(STORES.UPI_APPS, upiApp);
		const { userId: _, ...result } = upiApp;
		return result;
	}

	async getUPIApps(): Promise<UPIAppConfig[]> {
		const userId = this.getCurrentUserId();
		const upiApps = await this.getByIndex<UPIAppConfig & { userId: string }>(STORES.UPI_APPS, 'userId', userId);
		return upiApps.map(({ userId, ...upiApp }) => upiApp);
	}

	async updateUPIApp(id: string, upiData: Partial<UPIAppConfig>): Promise<UPIAppConfig> {
		const userId = this.getCurrentUserId();
		const existingUPI = await this.get<UPIAppConfig & { userId: string }>(STORES.UPI_APPS, id);

		if (!existingUPI || existingUPI.userId !== userId) {
			throw new Error('UPI app not found');
		}

		const updatedUPI = { ...existingUPI, ...upiData };
		await this.update(STORES.UPI_APPS, updatedUPI);

		const { userId: _, ...upiApp } = updatedUPI;
		return upiApp;
	}

	async deleteUPIApp(id: string): Promise<void> {
		const userId = this.getCurrentUserId();
		const existingUPI = await this.get<UPIAppConfig & { userId: string }>(STORES.UPI_APPS, id);

		if (!existingUPI || existingUPI.userId !== userId) {
			throw new Error('UPI app not found');
		}

		await this.delete(STORES.UPI_APPS, id);
	}

	// Receipt storage
	async storeReceipt(file: File): Promise<string> {
		const id = this.generateId();
		const receipt = {
			id,
			file: await this.fileToArrayBuffer(file),
			fileName: file.name,
			fileType: file.type,
			uploadedAt: new Date().toISOString(),
		};

		await this.add(STORES.RECEIPTS, receipt);
		return `receipt://${id}`; // Return a custom URL scheme
	}

	private async fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(reader.result as ArrayBuffer);
			reader.onerror = () => reject(reader.error);
			reader.readAsArrayBuffer(file);
		});
	}

	// Initialize with default data
	async initializeDefaultData(): Promise<void> {
		const userId = this.getCurrentUserId();

		// Check if data already exists
		const existingExpenses = await this.getExpenses(userId);
		if (existingExpenses.length > 0) return;

		// Create default cards
		const defaultCards: Omit<Card, 'id'>[] = [
			{
				name: 'Default Credit Card',
				type: CardType.CREDIT,
				lastFourDigits: '1234',
				isDefault: true,
			},
			{
				name: 'Default Debit Card',
				type: CardType.DEBIT,
				lastFourDigits: '5678',
				isDefault: false,
			},
		];

		for (const card of defaultCards) {
			await this.createCard(card);
		}

		// Create default UPI apps
		const defaultUPIApps: Omit<UPIAppConfig, 'id'>[] = [
			{ app: UPIApp.GPAY, isEnabled: true },
			{ app: UPIApp.PHONEPE, isEnabled: true },
			{ app: UPIApp.PAYTM, isEnabled: false },
		];

		for (const upiApp of defaultUPIApps) {
			await this.createUPIApp(upiApp);
		}

		// Create sample expenses
		const sampleExpenses: Omit<Expense, 'id'>[] = [
			{
				amount: 45.5,
				date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
				description: 'Lunch at Italian restaurant',
				category: ExpenseCategory.FOOD,
				tags: ['lunch', 'restaurant'],
				receiptUrl: null,
				paymentMethod: { type: PaymentType.UPI, upiApp: UPIApp.GPAY },
			},
			{
				amount: 120.0,
				date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
				description: 'Gas station fill-up',
				category: ExpenseCategory.TRAVEL,
				tags: ['gas', 'car'],
				receiptUrl: null,
				paymentMethod: { type: PaymentType.CREDIT_CARD },
			},
			{
				amount: 89.99,
				date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
				description: 'Monthly internet bill',
				category: ExpenseCategory.UTILITIES,
				tags: ['monthly', 'internet'],
				receiptUrl: null,
				paymentMethod: { type: PaymentType.UPI, upiApp: UPIApp.PHONEPE },
			},
		];

		for (const expense of sampleExpenses) {
			await this.createExpense(expense);
		}

		// Create sample budgets
		const sampleBudgets: Omit<Budget, 'id' | 'spent'>[] = [
			{
				category: ExpenseCategory.FOOD,
				limit: 500.0,
				period: TimePeriod.MONTH,
			},
			{
				category: ExpenseCategory.TRAVEL,
				limit: 300.0,
				period: TimePeriod.MONTH,
			},
		];

		for (const budget of sampleBudgets) {
			await this.createBudget(budget);
		}
	}
}

export const indexedDBService = new IndexedDBService();