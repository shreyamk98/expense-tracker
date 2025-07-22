import React from 'react';
import { Stack, Text } from '@mantine/core';
import { BarChart } from '@mantine/charts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { ChartCard } from './components/ChartCard';
import { EmptyState } from './components/EmptyState';
import { LegendItem } from './components/LegendItem';
import { CategoryComparisonData } from './utils/dataProcessors';
import { getTrendIcon, getTrendColor } from './utils/insightsUtils';

interface CategoryComparisonChartProps {
  data: CategoryComparisonData[];
  formatCurrency: (amount: number) => string;
}

export const CategoryComparisonChart: React.FC<CategoryComparisonChartProps> = ({
  data,
  formatCurrency
}) => {
  const getIconComponent = (change: number) => {
    const iconType = getTrendIcon(change);
    switch (iconType) {
      case 'up': return TrendingUp;
      case 'down': return TrendingDown;
      default: return Minus;
    }
  };

  return (
    <ChartCard
      title="Category Comparison"
      badge={{
        text: "Current vs Previous Month"
      }}
    >
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
              const TrendIcon = getIconComponent(item.changePercent);
              const trendColor = getTrendColor(item.changePercent);
              
              return (
                <LegendItem
                  key={index}
                  color={item.color}
                  label={item.category}
                  value={formatCurrency(item.currentMonth)}
                  badge={{
                    text: `${item.changePercent > 0 ? '+' : ''}${item.changePercent.toFixed(1)}%`,
                    color: trendColor
                  }}
                  rightContent={<TrendIcon size={10} />}
                />
              );
            })}
          </Stack>

          <Text size="xs" c="dimmed" ta="center" mt="md">
            Comparing spending patterns between months
          </Text>
        </>
      ) : (
        <EmptyState title="Insufficient data for comparison" />
      )}
    </ChartCard>
  );
};