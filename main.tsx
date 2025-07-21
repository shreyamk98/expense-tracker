import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ExpenseTrackerApp } from './src/ExpenseTrackerApp';
import ErrorBoundary from '@kombai/react-error-boundary';
import './index.css';

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<ErrorBoundary>
			<ExpenseTrackerApp />
		</ErrorBoundary>
	</StrictMode>
);
