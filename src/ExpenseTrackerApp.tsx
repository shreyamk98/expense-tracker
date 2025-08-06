import React from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import { MantineProvider, AppShell, Container } from '@mantine/core';
import { Provider } from 'react-redux';
import theme from './theme/theme';
import { store } from './store';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { AppHeader } from './components/Navigation/AppHeader';
import { AppSidebar } from './components/Navigation/AppSidebar';
import { MobileDrawer } from './components/Navigation/MobileDrawer';
import { AppRoutes } from './routes/AppRoutes';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useResponsiveNavigation } from './hooks/useResponsiveNavigation';
import { ErrorBoundary } from './components/ExpenseTracker/ErrorBoundary';

const ExpenseTrackerContent: React.FC = () => {
	const { authState, signOut } = useAuth();
	const { navigationState, toggleNavigation, closeNavigation, toggleCollapse } = useResponsiveNavigation();
	const location = useLocation();

	const currentUser = authState.currentUser;

	const getCurrentTab = () => {
		const path = location.pathname;
		if (path === '/' || path === '/dashboard') return 'dashboard';
		return path.substring(1); // Remove leading slash
	};

	const handleTabChange = (tab: string) => {
		// Navigation is now handled by React Router
		if (navigationState.isMobile) {
			closeNavigation();
		}
	};

	return (
		<AppShell
			header={{ height: 60 }}
			navbar={{
				width: navigationState.isCollapsed ? 60 : 280,
				breakpoint: 'md',
				collapsed: { mobile: true },
			}}
			padding="md"
			style={{ position: 'relative' }}
		>
			<AppHeader
				navigationState={navigationState}
				onToggleNavigation={toggleNavigation}
				onToggleCollapse={toggleCollapse}
				currentUser={currentUser}
				onSignOut={signOut}
			/>

			<AppSidebar
				navigationState={navigationState}
				navigationItems={[]}
				activeTab={getCurrentTab()}
				onTabChange={handleTabChange}
				onToggleCollapse={toggleCollapse}
			/>

			<MobileDrawer
				opened={navigationState.isOpen && navigationState.isMobile}
				onClose={closeNavigation}
				activeTab={getCurrentTab()}
				onTabChange={handleTabChange}
			/>

			<AppShell.Main>
				<Container size="xl">
					<AppRoutes />
				</Container>
			</AppShell.Main>
		</AppShell>
	);
};

const AppWithAuth: React.FC = () => {
	return (
		<ProtectedRoute>
			<Router>
				<ExpenseTrackerContent />
			</Router>
		</ProtectedRoute>
	);
};

const AppWithTheme: React.FC = () => {
	const { colorScheme } = useTheme();

	return (
		<MantineProvider theme={theme} defaultColorScheme={colorScheme} forceColorScheme={colorScheme}>
			<AuthProvider>
				<AppWithAuth />
			</AuthProvider>
		</MantineProvider>
	);
};

export const ExpenseTrackerApp: React.FC = () => {
	return (
		<ErrorBoundary>
			<Provider store={store}>
				<ThemeProvider>
					<AppWithTheme />
				</ThemeProvider>
			</Provider>
		</ErrorBoundary>
	);
};
