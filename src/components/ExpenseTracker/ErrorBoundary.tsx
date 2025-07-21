import React, { Component, ReactNode } from 'react';
import { Alert, Button, Stack, Text, Container } from '@mantine/core';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryState {
	hasError: boolean;
	error: Error | null;
}

interface ErrorBoundaryProps {
	children: ReactNode;
	onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorFallbackProps {
	error: Error;
	resetError: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError }) => {
	return (
		<Container size="sm" py="xl">
			<Stack align="center" gap="md">
				<Alert icon={<AlertTriangle size={24} />} title="Something went wrong" color="red" variant="light">
					<Stack gap="sm">
						<Text size="sm">
							We encountered an unexpected error. Please try refreshing the page or contact support if the
							problem persists.
						</Text>

						{(import.meta as any).env?.MODE === 'development' && (
							<Text size="xs" c="dimmed" style={{ fontFamily: 'monospace' }}>
								{error.message}
							</Text>
						)}

						<Button
							leftSection={<RefreshCw size={16} />}
							onClick={resetError}
							variant="light"
							color="red"
							size="sm"
						>
							Try Again
						</Button>
					</Stack>
				</Alert>
			</Stack>
		</Container>
	);
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		console.error('Error caught by boundary:', error, errorInfo);

		// Log to external service in production
		if ((import.meta as any).env?.MODE === 'production' && this.props.onError) {
			this.props.onError(error, errorInfo);
		}
	}

	resetError = () => {
		this.setState({ hasError: false, error: null });
	};

	render() {
		if (this.state.hasError && this.state.error) {
			return <ErrorFallback error={this.state.error} resetError={this.resetError} />;
		}

		return this.props.children;
	}
}
