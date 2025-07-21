import { AuthStatus, UserRole, NotificationPreference, ProfileSetupStep, TimePeriod } from '../types/enums';

// Data for authentication store
export const mockAuthStore = {
  currentUser: {
    id: "user123" as const,
    email: "john.doe@example.com",
    firstName: "John",
    lastName: "Doe",
    fullName: "John Doe",
    profilePicture: "https://i.pravatar.cc/150?img=1",
    phoneNumber: "+1-555-0123",
    dateOfBirth: "1990-05-15",
    role: UserRole.USER,
    isEmailVerified: true,
    createdAt: "2024-01-01T00:00:00Z",
    lastLoginAt: "2024-01-15T10:30:00Z",
    preferences: {
      currency: "USD" as const,
      defaultBudgetPeriod: TimePeriod.MONTH,
      notifications: NotificationPreference.IMPORTANT,
      darkMode: false,
      language: "en" as const
    },
    profileSetupStep: ProfileSetupStep.COMPLETED
  },
  authStatus: AuthStatus.UNAUTHENTICATED,
  isLoading: false,
  error: null as string | null
};

// Data for authentication API responses
export const mockAuthQuery = {
  loginResponse: {
    success: true,
    user: mockAuthStore.currentUser,
    token: "mock-jwt-token-12345",
    refreshToken: "mock-refresh-token-67890",
    expiresIn: 3600
  },
  signupResponse: {
    success: true,
    user: {
      ...mockAuthStore.currentUser,
      profileSetupStep: ProfileSetupStep.PERSONAL_INFO
    },
    token: "mock-jwt-token-12345",
    message: "Account created successfully"
  },
  profileUpdateResponse: {
    success: true,
    user: mockAuthStore.currentUser,
    message: "Profile updated successfully"
  }
};

// Data for form validation
export const mockValidationRules = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "Please enter a valid email address"
  },
  password: {
    required: true,
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    message: "Password must be at least 8 characters with uppercase, lowercase, number and special character"
  },
  name: {
    required: true,
    minLength: 2,
    pattern: /^[a-zA-Z\s]+$/,
    message: "Name must contain only letters and spaces"
  }
};