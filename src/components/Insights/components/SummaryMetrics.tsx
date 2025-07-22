import React from 'react';
import { SimpleGrid } from '@mantine/core';
import { MetricCard } from './MetricCard';
import { formatTimePeriod } from '../../../utils/formatters';
import { TimePeriod } from '../../../types/enums';
import { CategoryData } from '../utils/dataProcessors';

interface SummaryMetricsProps {
  totalSpent: number;
  transactionCount: number;
  averageTransaction: number;
  topCategory: CategoryData | null;
  selectedPeriod: TimePeriod;
  formatCurrency: (amount: number) => string;
}

export const SummaryMetrics: React.FC<SummaryMetricsProps> = ({
  totalSpent,
  transactionCount,
  averageTransaction,
  topCategory,
  selectedPeriod,
  formatCurrency
}) => {
  const periodLabel = formatTimePeriod(selectedPeriod);

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
      <MetricCard
        label="Total Spent"
        value={formatCurrency(totalSpent)}
        subtitle={periodLabel}
        color="expense.6"
      />

      <MetricCard
        label="Transactions"
        value={transactionCount.toString()}
        subtitle={periodLabel}
      />

      <MetricCard
        label="Average per Transaction"
        value={formatCurrency(averageTransaction)}
        subtitle={periodLabel}
      />

      <MetricCard
        label="Top Category"
        value={topCategory ? topCategory.name : 'None'}
        subtitle={topCategory ? formatCurrency(topCategory.value) : formatCurrency(0)}
      />
    </SimpleGrid>
  );
};