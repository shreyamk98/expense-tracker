import React from 'react';
import { Card, Text, Group, Stack, Badge } from '@mantine/core';
import { BarChart } from '@mantine/charts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface CategoryComparisonData {
  category: string;
  currentMonth: number;
  previousMonth: number;
  change: number;
  changePercent: number;
  color: string;
}

interface CategoryComparisonChartProps {
  data: CategoryComparisonData[];
  formatCurrency: (amount: number) => string;
}

export const CategoryComparisonChart: React.FC<CategoryComparisonChartProps> = ({
  data,
  formatCurrency
}) => {
  const getTrendIcon = (change: number) => {
    if (change > 5) return TrendingUp;
    if (change < -5) return TrendingDown;
    return Minus;
  };

  const getTrendColor = (change: number) => {
    if (change > 5) return 'red';
    if (change < -5) return 'green';
    return 'gray';
  };

  return (
    <Card p="md" withBorder>
      <Group justify="space-between" mb="md">
        <Text fw={500}>Category Comparison</Text>
        <Badge variant="light">
          Current vs Previous Month
        </Badge>
      </Group>

      {data.length > 0 ? (
        <>
          <BarChart
            h={250}
            data={data}
            dataKey="category"
            series={[
              { name: 'currentMonth', color: 'primary.6', label: 'Current Month' },
              { name: 'previousMonth', color: 'gray.5', label: 'Previous Month' }
            ]}
            withTooltip
            withLegend
            withXAxis
            withYAxis
            mb="md"
          />
          
          <Stack gap="xs">
            {data.map((item, index) => {
              const TrendIcon = getTrendIcon(item.changePercent);
              const trendColor = getTrendColor(item.changePercent);
              
              return (
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
                  <Group gap="xs">
                    <Text size="sm">
                      {formatCurrency(item.currentMonth)}
                    </Text>
                    <Badge 
                      variant="light" 
                      color={trendColor}
                      size="xs"
                      leftSection={<TrendIcon size={10} />}
                    >
                      {item.changePercent > 0 ? '+' : ''}{item.changePercent.toFixed(1)}%
                    </Badge>
                  </Group>
                </Group>
              );
            })}
          </Stack>

          <Text size="xs" c="dimmed" ta="center" mt="md">
            Comparing spending patterns between months
          </Text>
        </>
      ) : (
        <Text ta="center" c="dimmed" py="xl">
          Insufficient data for comparison
        </Text>
      )}
    </Card>
  );
};