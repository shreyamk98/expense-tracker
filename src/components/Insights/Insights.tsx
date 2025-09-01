import React, { useState } from 'react';
import { Text, Group, Stack, Select, SimpleGrid, useMantineTheme } from '@mantine/core';
import { PieChart, BarChart } from '@mantine/charts';
import { useExpenseRTK } from '../../hooks/useExpenseRTK';
import { useGetBudgetsQuery } from '../../store/api/budgetApi';
import { useAppData } from '../../hooks/useAppData';
import { TimePeriod } from '../../types/enums';

// Import refactored components
import { BudgetConsumptionChart } from './BudgetConsumptionChart';
import { ExpenseFrequencyChart } from './ExpenseFrequencyChart';
import { CategoryComparisonChart } from './CategoryComparisonChart';
import { ChartCard } from './components/ChartCard';
import { EmptyState } from './components/EmptyState';
import { LegendItem } from './components/LegendItem';
import { SummaryMetrics } from './components/SummaryMetrics';
import { BudgetAnalysisCard } from './components/BudgetAnalysisCard';

// Import data processors
import {
	processCategoryData,
	processPaymentData,
	processBudgetConsumptionData,
	processExpenseFrequencyData,
	processCategoryComparisonData,
	processDailyPatternData,
} from './utils/dataProcessors';
import { getFilteredExpenses } from './utils/insightsUtils';

export const Insights: React.FC = () => {
	const { expenses } = useExpenseRTK();
	const { data: budgets = [] } = useGetBudgetsQuery();
	const { formatCurrency } = useAppData();
	const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>(TimePeriod.THIS_MONTH);
	const theme = useMantineTheme();

	// Filter expenses based on selected period
	const filteredExpenses = getFilteredExpenses(expenses, selectedPeriod);
	const totalSpent = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

	// Process data using utility functions
	const categoryData = processCategoryData(filteredExpenses, theme);
	const paymentData = processPaymentData(filteredExpenses, theme);
	const budgetConsumptionData = processBudgetConsumptionData(filteredExpenses, budgets, theme);
	const expenseFrequencyData = processExpenseFrequencyData(filteredExpenses, theme);
	const categoryComparisonData = processCategoryComparisonData(expenses, theme);
	const dailyPattern = processDailyPatternData(filteredExpenses);

	// Calculate metrics
	const totalBudget = budgets.reduce((sum, budget) => sum + budget.limit, 0);
	const averageTransaction = filteredExpenses.length > 0 ? totalSpent / filteredExpenses.length : 0;
	const topCategory = categoryData.length > 0 ? categoryData[0] : null;

	// Budget analysis
	const budgetAnalysis = budgets.map((budget) => {
		const categoryExpenses = filteredExpenses.filter((exp) => exp.category === budget.category);
		const spent = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);
		const percentage = (spent / budget.limit) * 100;
		const remaining = budget.limit - spent;

		return {
			...budget,
			spent,
			remaining: Math.max(remaining, 0),
			percentage: Math.min(percentage, 100),
			isOverBudget: spent > budget.limit,
			overAmount: spent > budget.limit ? spent - budget.limit : 0,
		};
	});

	const periodOptions = [
		{ value: TimePeriod.TODAY, label: 'Today' },
		{ value: TimePeriod.WEEK, label: 'Last 7 Days' },
		{ value: TimePeriod.THIS_MONTH, label: 'This Month' },
		{ value: TimePeriod.MONTH, label: 'Last 30 Days' },
		{ value: TimePeriod.YEAR, label: 'Last Year' },
	];

	return (
		<Stack gap="lg">
			{/* Header */}
			<Group justify="space-between">
				<div>
					<Text size="xl" fw={600}>
						Insights & Statistics
					</Text>
					<Text size="sm" c="dimmed">
						Analyze your spending patterns and trends
					</Text>
				</div>
				<Select
					data={periodOptions}
					value={selectedPeriod}
					onChange={(value) => setSelectedPeriod((value as TimePeriod) || TimePeriod.MONTH)}
					w={200}
				/>
			</Group>

			{/* Summary Stats */}
			<SummaryMetrics
				totalSpent={totalSpent}
				transactionCount={filteredExpenses.length}
				averageTransaction={averageTransaction}
				topCategory={topCategory}
				selectedPeriod={selectedPeriod}
				formatCurrency={formatCurrency}
			/>

			{/* Charts Row 1 */}
			<SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
				{/* Category Breakdown */}
				<ChartCard title="Category Breakdown">
					{categoryData.length > 0 ? (
						<div>
							<PieChart
								data={categoryData}
								size={250}
								withTooltip
								tooltipDataSource="segment"
								mx="auto"
								mb="md"
							/>
							<Stack gap="xs">
								{categoryData.map((item, index) => (
									<LegendItem
										key={index}
										color={item.color}
										label={item.name}
										value={formatCurrency(item.value)}
										badge={{
											text: `${item.percentage}%`,
										}}
									/>
								))}
							</Stack>
						</div>
					) : (
						<EmptyState title="No expenses in selected period" />
					)}
				</ChartCard>

				{/* Payment Method Breakdown */}
				<ChartCard title="Payment Method Breakdown">
					{paymentData.length > 0 ? (
						<div>
							<PieChart
								data={paymentData}
								size={250}
								withTooltip
								tooltipDataSource="segment"
								mx="auto"
								mb="md"
							/>
							<Stack gap="xs">
								{paymentData.map((item, index) => (
									<LegendItem
										key={index}
										color={item.color}
										label={item.name}
										value={formatCurrency(item.value)}
										badge={{
											text: `${item.percentage}%`,
										}}
									/>
								))}
							</Stack>
						</div>
					) : (
						<EmptyState title="No expenses in selected period" />
					)}
				</ChartCard>
			</SimpleGrid>

			{/* Charts Row 2 */}
			<SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
				{/* Budget Consumption */}
				<BudgetConsumptionChart
					data={budgetConsumptionData}
					totalSpent={totalSpent}
					totalBudget={totalBudget}
					formatCurrency={formatCurrency}
					hasBudget={budgets.length > 0 && totalBudget > 0}
				/>

				{/* Expense Frequency Analysis */}
				<ExpenseFrequencyChart data={expenseFrequencyData} formatCurrency={formatCurrency} />
			</SimpleGrid>

			{/* Charts Row 3 */}
			<SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
				{/* Category Comparison */}
				<CategoryComparisonChart data={categoryComparisonData} formatCurrency={formatCurrency} />

				{/* Daily Spending Pattern */}
				<ChartCard title="Daily Spending Pattern">
					{dailyPattern.length > 0 ? (
						<BarChart
							h={300}
							data={dailyPattern}
							dataKey="day"
							series={[{ name: 'amount', color: 'primary.6' }]}
							withXAxis
							withYAxis
							withTooltip
						/>
					) : (
						<EmptyState title="No data available" />
					)}
				</ChartCard>
			</SimpleGrid>

			{/* Budget Analysis */}
			<BudgetAnalysisCard budgetAnalysis={budgetAnalysis} formatCurrency={formatCurrency} />
		</Stack>
	);
};
