import React from 'react';
import { Card, Text, Group, Stack, Badge, Progress, RingProgress } from '@mantine/core';
import { Target, TrendingUp, AlertTriangle } from 'lucide-react';

interface BudgetConsumptionData {
	category: string;
	spent: number;
	budget: number;
	percentage: number;
	color: string;
}

interface BudgetConsumptionChartProps {
	data: BudgetConsumptionData[];
	totalSpent: number;
	totalBudget: number;
	formatCurrency: (amount: number) => string;
	hasBudget?: boolean;
}

export const BudgetConsumptionChart: React.FC<BudgetConsumptionChartProps> = ({
	data,
	totalSpent,
	totalBudget,
	formatCurrency,
	hasBudget = true,
}) => {
	// If no budget is set, show spending summary without budget comparison
	if (!hasBudget || totalBudget === 0) {
		return (
			<Card p="md" withBorder>
				<Group justify="space-between" mb="md">
					<Text fw={500}>Spending Summary</Text>
					<Badge variant="light" color="blue" leftSection={<Target size={12} />}>
						No Budget Set
					</Badge>
				</Group>

				<Stack gap="md" align="center">
					<div style={{ textAlign: 'center' }}>
						<Text size="xl" fw={700} c="expense.6">
							{formatCurrency(totalSpent)}
						</Text>
						<Text size="sm" c="dimmed">
							Total Spent This Month
						</Text>
					</div>

					<Text size="xs" c="dimmed" ta="center" maw={300}>
						Set up budgets for different categories to track your spending and get insights on your budget
						consumption
					</Text>
				</Stack>
			</Card>
		);
	}

	// Calculate overall consumption metrics
	const overallPercentage = (totalSpent / totalBudget) * 100;
	const remaining = totalBudget - totalSpent;
	const isOverBudget = totalSpent > totalBudget;
	const overAmount = isOverBudget ? totalSpent - totalBudget : 0;

	const getStatusIcon = () => {
		if (isOverBudget) return AlertTriangle;
		if (overallPercentage > 80) return TrendingUp;
		return Target;
	};

	const getStatusColor = () => {
		if (isOverBudget) return 'red';
		if (overallPercentage > 80) return 'yellow';
		return 'green';
	};

	const StatusIcon = getStatusIcon();
	const statusColor = getStatusColor();

	// Prepare ring progress data
	const ringData = [
		{
			value: Math.min(overallPercentage, 100),
			color: statusColor,
			tooltip: `${overallPercentage.toFixed(1)}% of budget used`,
		},
	];

	return (
		<Card p="md" withBorder>
			<Group justify="space-between" mb="md">
				<Text fw={500}>Budget Consumption</Text>
				<Badge variant="light" color={statusColor} leftSection={<StatusIcon size={12} />}>
					{isOverBudget ? 'Over Budget' : overallPercentage > 80 ? 'Near Limit' : 'On Track'}
				</Badge>
			</Group>

			<Stack gap="md">
				{/* Ring Progress Chart */}
				<Group justify="center">
					<RingProgress
						size={180}
						thickness={16}
						sections={ringData}
						label={
							<div style={{ textAlign: 'center' }}>
								<Text size="xl" fw={700} c={statusColor}>
									{overallPercentage.toFixed(1)}%
								</Text>
								<Text size="xs" c="dimmed">
									Budget Used
								</Text>
							</div>
						}
					/>
				</Group>

				{/* Summary Stats */}
				<Stack gap="xs">
					<Group justify="space-between">
						<Text size="sm" c="dimmed">
							Total Spent
						</Text>
						<Text size="sm" fw={500} c="expense.6">
							{formatCurrency(totalSpent)}
						</Text>
					</Group>

					<Group justify="space-between">
						<Text size="sm" c="dimmed">
							Total Budget
						</Text>
						<Text size="sm" fw={500}>
							{formatCurrency(totalBudget)}
						</Text>
					</Group>

					<Group justify="space-between">
						<Text size="sm" c="dimmed">
							{isOverBudget ? 'Over by' : 'Remaining'}
						</Text>
						<Text size="sm" fw={500} c={isOverBudget ? 'red' : 'green'}>
							{formatCurrency(isOverBudget ? overAmount : remaining)}
						</Text>
					</Group>
				</Stack>

				{/* Overall Progress Bar */}
				<div>
					<Progress value={Math.min(overallPercentage, 100)} color={statusColor} size="lg" radius="md" />
					<Text size="xs" c="dimmed" ta="center" mt="xs">
						{formatCurrency(totalSpent)} of {formatCurrency(totalBudget)} budget
					</Text>
				</div>

				{/* Category Breakdown */}
				{data.length > 0 && (
					<Stack gap="xs" mt="md">
						<Text size="sm" fw={500} c="dimmed">
							Category Breakdown
						</Text>
						{data.slice(0, 3).map((item, index) => (
							<Group key={index} justify="space-between">
								<Group gap="xs">
									<div
										style={{
											width: 8,
											height: 8,
											backgroundColor: item.color,
											borderRadius: '50%',
										}}
									/>
									<Text size="xs">{item.category}</Text>
								</Group>
								<Group gap="xs">
									<Text size="xs" c="dimmed">
										{formatCurrency(item.spent)}
									</Text>
									<Badge
										variant="outline"
										size="xs"
										color={
											item.percentage > 100 ? 'red' : item.percentage > 80 ? 'yellow' : 'green'
										}
									>
										{item.percentage.toFixed(0)}%
									</Badge>
								</Group>
							</Group>
						))}
						{data.length > 3 && (
							<Text size="xs" c="dimmed" ta="center">
								+{data.length - 3} more categories
							</Text>
						)}
					</Stack>
				)}
			</Stack>
		</Card>
	);
};
