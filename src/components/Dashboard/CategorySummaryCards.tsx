import React from 'react';
import { Card, Text, Group, Stack, Badge, Progress, SimpleGrid } from '@mantine/core';
import { 
  ShoppingCart, 
  Car, 
  Zap, 
  Tv, 
  Heart, 
  ShoppingBag, 
  Utensils,
  MoreHorizontal 
} from 'lucide-react';

interface CategoryData {
  name: string;
  value: number;
  color: string;
  count?: number;
}

interface CategorySummaryCardsProps {
  data: CategoryData[];
  totalSpent: number;
  formatCurrency: (amount: number) => string;
  onViewDetails?: () => void;
}

const getCategoryIcon = (categoryName: string) => {
  const iconMap: Record<string, React.ComponentType<any>> = {
    'Food': Utensils,
    'Travel': Car,
    'Utilities': Zap,
    'Entertainment': Tv,
    'Healthcare': Heart,
    'Shopping': ShoppingBag,
    'Subscriptions': ShoppingCart,
    'Other': MoreHorizontal
  };
  
  return iconMap[categoryName] || MoreHorizontal;
};

export const CategorySummaryCards: React.FC<CategorySummaryCardsProps> = ({
  data,
  totalSpent,
  formatCurrency,
  onViewDetails
}) => {
  if (data.length === 0) {
    return (
      <Card p="md" withBorder>
        <Group justify="space-between" mb="md">
          <Text fw={500}>Category Summary</Text>
        </Group>
        <Text ta="center" c="dimmed" py="xl">
          No expenses this month
        </Text>
      </Card>
    );
  }

  // Sort by value and take top 6 categories
  const topCategories = [...data]
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  return (
    <Card p="md" withBorder>
      <Group justify="space-between" mb="md">
        <Text fw={500}>Category Summary</Text>
        {onViewDetails && (
          <Badge 
            variant="light" 
            style={{ cursor: 'pointer' }}
            onClick={onViewDetails}
          >
            View Details
          </Badge>
        )}
      </Group>

      <SimpleGrid cols={{ base: 1, xs: 2, sm: 3 }} spacing="xs">
        {topCategories.map((category, index) => {
          const IconComponent = getCategoryIcon(category.name);
          const percentage = totalSpent > 0 ? (category.value / totalSpent) * 100 : 0;
          
          return (
            <Card key={index} p="sm" withBorder radius="md" bg="gray.0">
              <Stack gap="xs">
                <Group justify="space-between" align="flex-start">
                  <Group gap="xs">
                    <div
                      style={{
                        padding: '6px',
                        borderRadius: '6px',
                        backgroundColor: category.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <IconComponent size={14} color="white" />
                    </div>
                    <div>
                      <Text size="sm" fw={500} lineClamp={1}>
                        {category.name}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {percentage.toFixed(1)}% of total
                      </Text>
                    </div>
                  </Group>
                </Group>
                
                <div>
                  <Group justify="space-between" mb="xs">
                    <Text size="lg" fw={600} c={category.color}>
                      {formatCurrency(category.value)}
                    </Text>
                    {category.count && (
                      <Badge variant="outline" size="xs">
                        {category.count} items
                      </Badge>
                    )}
                  </Group>
                  
                  <Progress
                    value={percentage}
                    color={category.color}
                    size="xs"
                    radius="xl"
                  />
                </div>
              </Stack>
            </Card>
          );
        })}
      </SimpleGrid>

      {data.length > 6 && (
        <Text size="xs" c="dimmed" ta="center" mt="md">
          +{data.length - 6} more categories
        </Text>
      )}
    </Card>
  );
};