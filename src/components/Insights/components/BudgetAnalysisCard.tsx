import React from 'react';
import { Card, Text, Group, Badge, Progress, SimpleGrid } from '@mantine/core';
import { formatCategory } from '../../../utils/formatters';
import { ChartCard } from './ChartCard';
import { EmptyState } from './EmptyState';

interface BudgetAnalysisItem {
  id: string;
  category: string;
  limit: number;
  spent: number;
  remaining: number;
  percentage: number;
  isOverBudget: boolean;
  overAmount: number;
}

interface BudgetAnalysisCardProps {
  budgetAnalysis: BudgetAnalysisItem[];
  formatCurrency: (amount: number) => string;
}

export const BudgetAnalysisCard: React.FC<BudgetAnalysisCardProps> = ({
  budgetAnalysis,
  formatCurrency
}) => {
  return (
    <ChartCard title="Budget Analysis">
      {budgetAnalysis.length > 0 ? (
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
          {budgetAnalysis.map((budget) => (
            <Card key={budget.id} p="sm" withBorder>
              <Group justify="space-between" mb="xs">
                <Text fw={500}>{formatCategory(budget.category as any)}</Text>
                <Group gap="xs">
                  {budget.isOverBudget && (
                    <Badge color="red" size="xs">Over Budget</Badge>
                  )}
                  <Badge 
                    color={budget.percentage > 80 ? 'yellow' : 'green'} 
                    size="xs"
                  >
                    {budget.percentage.toFixed(0)}%
                  </Badge>
                </Group>
              </Group>
              
              <Progress
                value={budget.percentage}
                color={budget.isOverBudget ? 'red' : budget.percentage > 80 ? 'yellow' : 'green'}
                size="md"
                mb="xs"
              />
              
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  Spent: {formatCurrency(budget.spent)}
                </Text>
                <Text size="sm" c="dimmed">
                  Limit: {formatCurrency(budget.limit)}
                </Text>
              </Group>
              
              {budget.isOverBudget ? (
                <Text size="sm" c="red" ta="center" mt="xs">
                  Over by {formatCurrency(budget.overAmount)}
                </Text>
              ) : (
                <Text size="sm" c="green" ta="center" mt="xs">
                  {formatCurrency(budget.remaining)} remaining
                </Text>
              )}
            </Card>
          ))}
        </SimpleGrid>
      ) : (
        <EmptyState
          title="No budgets configured"
          description="Set up budgets for different expense categories to track your spending limits and get detailed budget analysis insights."
        />
      )}
    </ChartCard>
  );
};