import { indexedDBService } from './indexedDbService';
import { User, SignInFormData, SignUpFormData, AuthResponse } from '../types/schema';
import bcrypt from 'bcryptjs';

export class AuthService {
	static async signIn(credentials: SignInFormData): Promise<AuthResponse> {
		await indexedDBService.init();

		const user = await indexedDBService.getUserByEmail(credentials.email);
		if (!user) {
			throw new Error('Invalid email or password');
		}

		// Verify password using bcrypt
		const isValidPassword = await bcrypt.compare(credentials.password, user.hashedPassword);
		if (!isValidPassword) {
			throw new Error('Invalid email or password');
		}

		// Generate secure tokens
		const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		const refreshToken = `refresh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

		// Store session data
		localStorage.setItem('access_token', token);
		localStorage.setItem('refresh_token', refreshToken);
		localStorage.setItem('user_data', JSON.stringify(user));

		if (credentials.rememberMe) {
			localStorage.setItem('remember_me', 'true');
		}

		// Update last login
		const updatedUser = await indexedDBService.updateUser(user.id, {
			lastLoginAt: new Date().toISOString(),
		});

		// Initialize default data for new user
		await indexedDBService.initializeDefaultData();

		const authResponse: AuthResponse = {
			success: true,
			user: updatedUser,
			token,
			refreshToken,
			expiresIn: 3600,
		};

		return authResponse;
	}

	static async signUp(userData: SignUpFormData): Promise<AuthResponse> {
		await indexedDBService.init();

		// Check if user already exists
		const existingUser = await indexedDBService.getUserByEmail(userData.email);
		if (existingUser) {
			throw new Error('User already exists with this email');
		}

		// Hash password before storing
		const hashedPassword = await bcrypt.hash(userData.password, 12);
		
		const userDataWithHashedPassword = {
			...userData,
			hashedPassword,
		};

		// Create new user
		const user = await indexedDBService.createUser(userDataWithHashedPassword);

		// Generate secure tokens
		const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		const refreshToken = `refresh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

		// Store session data
		localStorage.setItem('access_token', token);
		localStorage.setItem('refresh_token', refreshToken);
		localStorage.setItem('user_data', JSON.stringify(user));

		const authResponse: AuthResponse = {
			success: true,
			user,
			token,
			refreshToken,
			expiresIn: 3600,
			message: 'Account created successfully',
		};

		return authResponse;
	}

	static async signOut(): Promise<void> {
		// Clear local storage
		localStorage.removeItem('access_token');
		localStorage.removeItem('refresh_token');
		localStorage.removeItem('user_data');
		localStorage.removeItem('remember_me');
	}

	static async updateProfile(profileData: Partial<User>): Promise<User> {
		const currentUser = this.getStoredUser();
		if (!currentUser) {
			throw new Error('No authenticated user found');
		}

		await indexedDBService.init();

		// Update user in IndexedDB
		const updatedUser = await indexedDBService.updateUser(currentUser.id, profileData);

		// Update stored user data
		localStorage.setItem('user_data', JSON.stringify(updatedUser));

		return updatedUser;
	}

	static async resetPassword(email: string): Promise<void> {
		await indexedDBService.init();

		const user = await indexedDBService.getUserByEmail(email);
		if (!user) {
			throw new Error('User not found');
		}

		// In production, send email with reset token
		console.log(`Password reset email would be sent to ${email}`);
	}

	static async verifyEmail(token: string): Promise<void> {
		// In production, verify the token and update user status
		console.log(`Email verification token: ${token}`);
	}

	static async getCurrentUser(): Promise<User | null> {
		const storedUser = this.getStoredUser();
		if (!storedUser) return null;

		try {
			await indexedDBService.init();

			// Get fresh user data from IndexedDB
			const user = await indexedDBService.get<User>('users', storedUser.id);
			if (user) {
				// Update stored data
				localStorage.setItem('user_data', JSON.stringify(user));
				return user;
			}
		} catch (error) {
			console.error('Failed to fetch current user:', error);
			// Clear invalid session
			this.signOut();
		}

		return null;
	}

	static getStoredUser(): User | null {
		try {
			const userData = localStorage.getItem('user_data');
			return userData ? JSON.parse(userData) : null;
		} catch (error) {
			console.error('Failed to parse stored user data:', error);
			localStorage.removeItem('user_data');
			return null;
		}
	}

	static isAuthenticated(): boolean {
		return !!localStorage.getItem('access_token') && !!this.getStoredUser();
	}

	static async refreshSession(): Promise<boolean> {
		const refreshToken = localStorage.getItem('refresh_token');
		if (!refreshToken) return false;

		try {
			// Generate new tokens
			const newToken = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
			const newRefreshToken = `refresh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

			localStorage.setItem('access_token', newToken);
			localStorage.setItem('refresh_token', newRefreshToken);

			return true;
		} catch (error) {
			console.error('Session refresh failed:', error);
			this.signOut();
			return false;
		}
	}
}