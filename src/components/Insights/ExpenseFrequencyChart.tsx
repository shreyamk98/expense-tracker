import React from 'react';
import { Stack, Text, Group, Badge } from '@mantine/core';
import { BarChart } from '@mantine/charts';
import { Activity } from 'lucide-react';
import { ChartCard } from './components/ChartCard';
import { EmptyState } from './components/EmptyState';
import { LegendItem } from './components/LegendItem';
import { ExpenseFrequencyData } from './utils/dataProcessors';

interface ExpenseFrequencyChartProps {
  data: ExpenseFrequencyData[];
  formatCurrency: (amount: number) => string;
}

export const ExpenseFrequencyChart: React.FC<ExpenseFrequencyChartProps> = ({
  data,
  formatCurrency
}) => {
  return (
    <ChartCard
      title="Expense Frequency Analysis"
      badge={{
        text: "Transaction Patterns",
        icon: <Activity size={12} />
      }}
    >
      {data.length > 0 ? (
        <>
          <BarChart
            h={200}
            data={data}
            dataKey="category"
            series={[{ name: 'frequency', color: 'primary.6' }]}
            withTooltip
            withXAxis
            withYAxis
            mb="md"
          />
          
          <Stack gap="xs">
            {data.slice(0, 5).map((item, index) => (
              <LegendItem
                key={index}
                color={item.color}
                label={item.category}
                rightContent={
                  <Group gap="md">
                    <Badge variant="outline" size="xs">
                      {item.frequency} times
                    </Badge>
                    <Text size="sm" c="dimmed">
                      Avg: {formatCurrency(item.avgAmount)}
                    </Text>
                  </Group>
                }
              />
            ))}
          </Stack>

          {data.length > 0 && (
            <Text size="xs" c="dimmed" ta="center" mt="md">
              Most frequent: {data[0].category} ({data[0].frequency} transactions)
            </Text>
          )}
        </>
      ) : (
        <EmptyState title="No expense data available" />
      )}
    </ChartCard>
  );
};