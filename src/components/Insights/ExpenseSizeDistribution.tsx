import React from 'react';
import { Card, Text, Group, Stack, Badge, Progress } from '@mantine/core';
import { DonutChart } from '@mantine/charts';
import { DollarSign } from 'lucide-react';

interface ExpenseSizeData {
  name: string;
  value: number;
  count: number;
  color: string;
  range: string;
}

interface ExpenseSizeDistributionProps {
  data: ExpenseSizeData[];
  totalExpenses: number;
  formatCurrency: (amount: number) => string;
}

export const ExpenseSizeDistribution: React.FC<ExpenseSizeDistributionProps> = ({
  data,
  totalExpenses,
  formatCurrency
}) => {
  const totalAmount = data.reduce((sum, item) => sum + item.value, 0);
  const totalCount = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card p="md" withBorder>
      <Group justify="space-between" mb="md">
        <Text fw={500}>Expense Size Distribution</Text>
        <Badge variant="light" leftSection={<DollarSign size={12} />}>
          Spending Patterns
        </Badge>
      </Group>

      {data.length > 0 ? (
        <>
          <DonutChart
            data={data}
            size={200}
            thickness={40}
            withTooltip
            tooltipDataSource="segment"
            mx="auto"
            mb="md"
          />
          
          <Stack gap="sm">
            {data.map((item, index) => (
              <div key={index}>
                <Group justify="space-between" mb="xs">
                  <Group gap="xs">
                    <div
                      style={{
                        width: 12,
                        height: 12,
                        backgroundColor: item.color,
                        borderRadius: 2
                      }}
                    />
                    <Text size="sm" fw={500}>{item.name}</Text>
                    <Badge variant="outline" size="xs">{item.range}</Badge>
                  </Group>
                  <Text size="sm" c="dimmed">
                    {item.count} transactions
                  </Text>
                </Group>
                
                <Group justify="space-between" mb="xs">
                  <Text size="sm">
                    {formatCurrency(item.value)} ({((item.value / totalAmount) * 100).toFixed(1)}%)
                  </Text>
                  <Text size="xs" c="dimmed">
                    {((item.count / totalCount) * 100).toFixed(1)}% of transactions
                  </Text>
                </Group>
                
                <Progress
                  value={(item.value / totalAmount) * 100}
                  color={item.color}
                  size="xs"
                />
              </div>
            ))}
          </Stack>

          <Text size="xs" c="dimmed" ta="center" mt="md">
            Total: {totalCount} transactions • {formatCurrency(totalAmount)}
          </Text>
        </>
      ) : (
        <Text ta="center" c="dimmed" py="xl">
          No expense data available
        </Text>
      )}
    </Card>
  );
};