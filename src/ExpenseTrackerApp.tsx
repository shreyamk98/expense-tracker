import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import { MantineProvider, AppShell, Container } from '@mantine/core';
import { ApolloProvider } from '@apollo/client';
import theme from './theme/theme';
import { apolloClient } from './graphql/client';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { AppHeader } from './components/Navigation/AppHeader';
import { AppSidebar } from './components/Navigation/AppSidebar';
import { MobileDrawer } from './components/Navigation/MobileDrawer';
import { AppRoutes } from './routes/AppRoutes';
import { useAppContext } from './context/AppContext';
import { useAuth } from './context/AuthContext';
import { useResponsiveNavigation } from './hooks/useResponsiveNavigation';
import { LoadingOverlay } from './components/ExpenseTracker/LoadingOverlay';
import { ErrorBoundary } from './components/ExpenseTracker/ErrorBoundary';

const ExpenseTrackerContent: React.FC = () => {
	const { isLoading } = useAppContext();
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
			<LoadingOverlay visible={isLoading} message="Processing..." />

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

const AppWithTheme: React.FC = () => {
	const { authState } = useAuth();
	const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('light');

	useEffect(() => {
		const isDarkMode = authState.currentUser?.preferences?.darkMode || false;
		setColorScheme(isDarkMode ? 'dark' : 'light');
	}, [authState.currentUser?.preferences?.darkMode]);

	// Create a stable theme object to prevent unnecessary re-renders
	const themeWithColorScheme = React.useMemo(
		() => ({
			...theme,
			colorScheme,
		}),
		[colorScheme]
	);

	return (
		<MantineProvider theme={themeWithColorScheme} defaultColorScheme={colorScheme} forceColorScheme={colorScheme}>
			<ProtectedRoute>
				<AppProvider>
					<Router>
						<ExpenseTrackerContent />
					</Router>
				</AppProvider>
			</ProtectedRoute>
		</MantineProvider>
	);
};

export const ExpenseTrackerApp: React.FC = () => {
	return (
		<ErrorBoundary>
			<ApolloProvider client={apolloClient}>
				<AuthProvider>
					<AppWithTheme />
				</AuthProvider>
			</ApolloProvider>
		</ErrorBoundary>
	);
};
