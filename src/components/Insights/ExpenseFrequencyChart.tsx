import React from 'react';
import { Card, Text, Group, Stack, Badge } from '@mantine/core';
import { BarChart } from '@mantine/charts';
import { Activity } from 'lucide-react';

interface ExpenseFrequencyData {
  category: string;
  frequency: number;
  avgAmount: number;
  totalAmount: number;
  color: string;
}

interface ExpenseFrequencyChartProps {
  data: ExpenseFrequencyData[];
  formatCurrency: (amount: number) => string;
}

export const ExpenseFrequencyChart: React.FC<ExpenseFrequencyChartProps> = ({
  data,
  formatCurrency
}) => {
  const sortedData = [...data].sort((a, b) => b.frequency - a.frequency);
  const maxFrequency = Math.max(...data.map(d => d.frequency));

  return (
    <Card p="md" withBorder>
      <Group justify="space-between" mb="md">
        <Text fw={500}>Expense Frequency Analysis</Text>
        <Badge variant="light" leftSection={<Activity size={12} />}>
          Transaction Patterns
        </Badge>
      </Group>

      {sortedData.length > 0 ? (
        <>
          <BarChart
            h={200}
            data={sortedData}
            dataKey="category"
            series={[{ name: 'frequency', color: 'primary.6' }]}
            withTooltip
            withXAxis
            withYAxis
            mb="md"
          />
          
          <Stack gap="xs">
            {sortedData.slice(0, 5).map((item, index) => (
              <Group key={index} justify="space-between">
                <Group gap="xs">
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      backgroundColor: item.color,
                      borderRadius: 2
                    }}
                  />
                  <Text size="sm">{item.category}</Text>
                </Group>
                <Group gap="md">
                  <Badge variant="outline" size="xs">
                    {item.frequency} times
                  </Badge>
                  <Text size="sm" c="dimmed">
                    Avg: {formatCurrency(item.avgAmount)}
                  </Text>
                </Group>
              </Group>
            ))}
          </Stack>

          {sortedData.length > 0 && (
            <Text size="xs" c="dimmed" ta="center" mt="md">
              Most frequent: {sortedData[0].category} ({sortedData[0].frequency} transactions)
            </Text>
          )}
        </>
      ) : (
        <Text ta="center" c="dimmed" py="xl">
          No expense data available
        </Text>
      )}
    </Card>
  );
};