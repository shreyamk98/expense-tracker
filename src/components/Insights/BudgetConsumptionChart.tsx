import React from 'react';
import { Group, Stack, Badge, Progress, RingProgress, Text } from '@mantine/core';
import { Target, TrendingUp, AlertTriangle } from 'lucide-react';
import { ChartCard } from './components/ChartCard';
import { EmptyState } from './components/EmptyState';
import { LegendItem } from './components/LegendItem';
import { BudgetConsumptionData } from './utils/dataProcessors';
import { getBudgetStatus } from './utils/insightsUtils';

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
      <ChartCard
        title="Spending Summary"
        badge={{
          text: "No Budget Set",
          color: "blue",
          icon: <Target size={12} />
        }}
      >
        <Stack gap="md" align="center">
          <div style={{ textAlign: 'center' }}>
            <Text size="xl" fw={700} c="expense.6">
              {formatCurrency(totalSpent)}
            </Text>
            <Text size="sm" c="dimmed">
              Total Spent This Month
            </Text>
          </div>

          <EmptyState
            title=""
            description="Set up budgets for different categories to track your spending and get insights on your budget consumption"
            py="xs"
          />
        </Stack>
      </ChartCard>
    );
  }

  // Calculate overall consumption metrics
  const budgetStatus = getBudgetStatus(totalSpent, totalBudget);
  const remaining = totalBudget - totalSpent;
  const overAmount = budgetStatus.isOverBudget ? totalSpent - totalBudget : 0;

  const getStatusIcon = () => {
    if (budgetStatus.isOverBudget) return AlertTriangle;
    if (budgetStatus.percentage > 80) return TrendingUp;
    return Target;
  };

  const StatusIcon = getStatusIcon();

  // Prepare ring progress data
  const ringData = [
    {
      value: Math.min(budgetStatus.percentage, 100),
      color: budgetStatus.color,
      tooltip: `${budgetStatus.percentage.toFixed(1)}% of budget used`,
    },
  ];

  const getBadgeText = () => {
    if (budgetStatus.isOverBudget) return 'Over Budget';
    if (budgetStatus.percentage > 80) return 'Near Limit';
    return 'On Track';
  };

  return (
    <ChartCard
      title="Budget Consumption"
      badge={{
        text: getBadgeText(),
        color: budgetStatus.color,
        icon: <StatusIcon size={12} />
      }}
    >
      <Stack gap="md">
        {/* Ring Progress Chart */}
        <Group justify="center">
          <RingProgress
            size={180}
            thickness={16}
            sections={ringData}
            label={
              <div style={{ textAlign: 'center' }}>
                <Text size="xl" fw={700} c={budgetStatus.color}>
                  {budgetStatus.percentage.toFixed(1)}%
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
            <Text size="sm" c="dimmed">Total Spent</Text>
            <Text size="sm" fw={500} c="expense.6">
              {formatCurrency(totalSpent)}
            </Text>
          </Group>

          <Group justify="space-between">
            <Text size="sm" c="dimmed">Total Budget</Text>
            <Text size="sm" fw={500}>
              {formatCurrency(totalBudget)}
            </Text>
          </Group>

          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              {budgetStatus.isOverBudget ? 'Over by' : 'Remaining'}
            </Text>
            <Text size="sm" fw={500} c={budgetStatus.isOverBudget ? 'red' : 'green'}>
              {formatCurrency(budgetStatus.isOverBudget ? overAmount : remaining)}
            </Text>
          </Group>
        </Stack>

        {/* Overall Progress Bar */}
        <div>
          <Progress value={Math.min(budgetStatus.percentage, 100)} color={budgetStatus.color} size="lg" radius="md" />
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
              <LegendItem
                key={index}
                color={item.color}
                label={item.category}
                value={formatCurrency(item.spent)}
                badge={{
                  text: `${item.percentage.toFixed(0)}%`,
                  color: item.percentage > 100 ? 'red' : item.percentage > 80 ? 'yellow' : 'green',
                  variant: "outline"
                }}
              />
            ))}
            {data.length > 3 && (
              <Text size="xs" c="dimmed" ta="center">
                +{data.length - 3} more categories
              </Text>
            )}
          </Stack>
        )}
      </Stack>
    </ChartCard>
  );
};