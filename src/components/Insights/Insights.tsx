import React, { useState } from 'react';
import {
  Card,
  Text,
  Group,
  Stack,
  Select,
  SimpleGrid,
  Progress,
  Badge,
  useMantineTheme
} from '@mantine/core';
import { PieChart, AreaChart, BarChart } from '@mantine/charts';
import { useAppContext } from '../../context/AppContext';
import { formatCategory, formatTimePeriod } from '../../utils/formatters';
import { ExpenseCategory, PaymentType, TimePeriod } from '../../types/enums';

export const Insights: React.FC = () => {
  const { state, formatCurrency } = useAppContext();
  const { expenses, budgets } = state;
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>(TimePeriod.MONTH);
  const theme = useMantineTheme();

  // Filter expenses based on selected period
  const getFilteredExpenses = () => {
    const now = new Date();
    const startDate = new Date();

    switch (selectedPeriod) {
      case TimePeriod.TODAY:
        startDate.setHours(0, 0, 0, 0);
        break;
      case TimePeriod.WEEK:
        startDate.setDate(now.getDate() - 7);
        break;
      case TimePeriod.MONTH:
        startDate.setMonth(now.getMonth() - 1);
        break;
      case TimePeriod.YEAR:
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }

    return expenses.filter(expense => new Date(expense.date) >= startDate);
  };

  const filteredExpenses = getFilteredExpenses();
  const totalSpent = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Category breakdown data
  const categoryData = Object.values(ExpenseCategory).map(category => {
    const categoryExpenses = filteredExpenses.filter(exp => exp.category === category);
    const amount = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const percentage = totalSpent > 0 ? (amount / totalSpent) * 100 : 0;
    
    return {
      name: formatCategory(category),
      value: amount,
      percentage: percentage.toFixed(1),
      color: getCategoryColor(category, theme),
      count: categoryExpenses.length
    };
  }).filter(item => item.value > 0);

  // Payment method breakdown data
  const paymentData = Object.values(PaymentType).map(type => {
    const paymentExpenses = filteredExpenses.filter(exp => exp.paymentMethod.type === type);
    const amount = paymentExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const percentage = totalSpent > 0 ? (amount / totalSpent) * 100 : 0;
    
    return {
      name: getPaymentTypeLabel(type),
      value: amount,
      percentage: percentage.toFixed(1),
      color: getPaymentTypeColor(type, theme),
      count: paymentExpenses.length
    };
  }).filter(item => item.value > 0);

  // Monthly trends data
  const monthlyTrends = getMonthlyTrends(expenses);

  // Daily spending pattern
  const dailyPattern = getDailyPattern(filteredExpenses);

  // Budget analysis
  const budgetAnalysis = budgets.map(budget => {
    const categoryExpenses = filteredExpenses.filter(exp => exp.category === budget.category);
    const spent = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const percentage = (spent / budget.limit) * 100;
    const remaining = budget.limit - spent;
    
    return {
      ...budget,
      spent,
      remaining: Math.max(remaining, 0),
      percentage: Math.min(percentage, 100),
      isOverBudget: spent > budget.limit,
      overAmount: spent > budget.limit ? spent - budget.limit : 0
    };
  });

  const periodOptions = [
    { value: TimePeriod.TODAY, label: 'Today' },
    { value: TimePeriod.WEEK, label: 'Last 7 Days' },
    { value: TimePeriod.MONTH, label: 'Last 30 Days' },
    { value: TimePeriod.YEAR, label: 'Last Year' }
  ];

  return (
    <Stack gap="lg">
      {/* Header */}
      <Group justify="space-between">
        <div>
          <Text size="xl" fw={600}>Insights & Statistics</Text>
          <Text size="sm" c="dimmed">Analyze your spending patterns and trends</Text>
        </div>
        <Select
          data={periodOptions}
          value={selectedPeriod}
          onChange={(value) => setSelectedPeriod(value as TimePeriod || TimePeriod.MONTH)}
          w={200}
        />
      </Group>

      {/* Summary Stats */}
      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
        <Card p="md" withBorder>
          <Text size="sm" c="dimmed">Total Spent</Text>
          <Text size="xl" fw={600} c="expense.6">
            {formatCurrency(totalSpent)}
          </Text>
          <Text size="xs" c="dimmed">{formatTimePeriod(selectedPeriod)}</Text>
        </Card>

        <Card p="md" withBorder>
          <Text size="sm" c="dimmed">Transactions</Text>
          <Text size="xl" fw={600}>
            {filteredExpenses.length}
          </Text>
          <Text size="xs" c="dimmed">{formatTimePeriod(selectedPeriod)}</Text>
        </Card>

        <Card p="md" withBorder>
          <Text size="sm" c="dimmed">Average per Transaction</Text>
          <Text size="xl" fw={600}>
            {formatCurrency(filteredExpenses.length > 0 ? totalSpent / filteredExpenses.length : 0)}
          </Text>
          <Text size="xs" c="dimmed">{formatTimePeriod(selectedPeriod)}</Text>
        </Card>

        <Card p="md" withBorder>
          <Text size="sm" c="dimmed">Top Category</Text>
          <Text size="xl" fw={600}>
            {categoryData.length > 0 ? categoryData[0].name : 'None'}
          </Text>
          <Text size="xs" c="dimmed">
            {categoryData.length > 0 ? formatCurrency(categoryData[0].value) : formatCurrency(0)}
          </Text>
        </Card>
      </SimpleGrid>

      {/* Charts Row 1 */}
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        {/* Category Breakdown */}
        <Card p="md" withBorder>
          <Text fw={500} mb="md">Category Breakdown</Text>
          {categoryData.length > 0 ? (
            <div>
              <PieChart
                data={categoryData}
                size={250}
                withTooltip
                tooltipDataSource="segment"
                mx="auto"
                mb="md"
              />
              <Stack gap="xs">
                {categoryData.map((item, index) => (
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
                      <Text size="sm">{item.name}</Text>
                    </Group>
                    <Group gap="xs">
                      <Text size="sm" fw={500}>{formatCurrency(item.value)}</Text>
                      <Badge variant="light" size="xs">{item.percentage}%</Badge>
                    </Group>
                  </Group>
                ))}
              </Stack>
            </div>
          ) : (
            <Text ta="center" c="dimmed" py="xl">
              No expenses in selected period
            </Text>
          )}
        </Card>

        {/* Payment Method Breakdown */}
        <Card p="md" withBorder>
          <Text fw={500} mb="md">Payment Method Breakdown</Text>
          {paymentData.length > 0 ? (
            <div>
              <PieChart
                data={paymentData}
                size={250}
                withTooltip
                tooltipDataSource="segment"
                mx="auto"
                mb="md"
              />
              <Stack gap="xs">
                {paymentData.map((item, index) => (
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
                      <Text size="sm">{item.name}</Text>
                    </Group>
                    <Group gap="xs">
                      <Text size="sm" fw={500}>{formatCurrency(item.value)}</Text>
                      <Badge variant="light" size="xs">{item.percentage}%</Badge>
                    </Group>
                  </Group>
                ))}
              </Stack>
            </div>
          ) : (
            <Text ta="center" c="dimmed" py="xl">
              No expenses in selected period
            </Text>
          )}
        </Card>
      </SimpleGrid>

      {/* Charts Row 2 */}
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        {/* Monthly Trends */}
        <Card p="md" withBorder>
          <Text fw={500} mb="md">Monthly Trends</Text>
          {monthlyTrends.length > 0 ? (
            <AreaChart
              h={300}
              data={monthlyTrends}
              dataKey="month"
              series={[{ name: 'amount', color: 'expense.6' }]}
              curveType="linear"
              withGradient
              withXAxis
              withYAxis
              withTooltip
            />
          ) : (
            <Text ta="center" c="dimmed" py="xl">
              No data available
            </Text>
          )}
        </Card>

        {/* Daily Spending Pattern */}
        <Card p="md" withBorder>
          <Text fw={500} mb="md">Daily Spending Pattern</Text>
          {dailyPattern.length > 0 ? (
            <BarChart
              h={300}
              data={dailyPattern}
              dataKey="day"
              series={[{ name: 'amount', color: 'primary.6' }]}
              withXAxis
              withYAxis
              withTooltip
            />
          ) : (
            <Text ta="center" c="dimmed" py="xl">
              No data available
            </Text>
          )}
        </Card>
      </SimpleGrid>

      {/* Budget Analysis */}
      {budgetAnalysis.length > 0 && (
        <Card p="md" withBorder>
          <Text fw={500} mb="md">Budget Analysis</Text>
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
            {budgetAnalysis.map((budget) => (
              <Card key={budget.id} p="sm" withBorder>
                <Group justify="space-between" mb="xs">
                  <Text fw={500}>{formatCategory(budget.category)}</Text>
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
        </Card>
      )}
    </Stack>
  );
};

// Helper functions - Updated to use theme colors
const getCategoryColor = (category: ExpenseCategory, theme: any): string => {
  const colors: Record<ExpenseCategory, string> = {
    [ExpenseCategory.FOOD]: theme.colors.red[6],
    [ExpenseCategory.TRAVEL]: theme.colors.teal[6],
    [ExpenseCategory.UTILITIES]: theme.colors.blue[6],
    [ExpenseCategory.SUBSCRIPTIONS]: theme.colors.green[6],
    [ExpenseCategory.ENTERTAINMENT]: theme.colors.yellow[6],
    [ExpenseCategory.HEALTHCARE]: theme.colors.pink[6],
    [ExpenseCategory.SHOPPING]: theme.colors.violet[6],
    [ExpenseCategory.OTHER]: theme.colors.gray[6]
  };
  return colors[category];
};

const getPaymentTypeColor = (type: PaymentType, theme: any): string => {
  const colors: Record<PaymentType, string> = {
    [PaymentType.CASH]: theme.colors.income[6],
    [PaymentType.CREDIT_CARD]: theme.colors.expense[6],
    [PaymentType.DEBIT_CARD]: theme.colors.blue[6],
    [PaymentType.UPI]: theme.colors.primary[6]
  };
  return colors[type];
};

function getPaymentTypeLabel(type: PaymentType): string {
  const labels: Record<PaymentType, string> = {
    [PaymentType.CASH]: 'Cash',
    [PaymentType.CREDIT_CARD]: 'Credit Card',
    [PaymentType.DEBIT_CARD]: 'Debit Card',
    [PaymentType.UPI]: 'UPI'
  };
  return labels[type];
}

function getMonthlyTrends(expenses: any[]) {
  const months = [];
  const now = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = date.toLocaleDateString('en-US', { month: 'short' });
    
    const monthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === date.getMonth() && 
             expenseDate.getFullYear() === date.getFullYear();
    });
    
    const amount = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    months.push({ month: monthName, amount });
  }
  
  return months;
}

function getDailyPattern(expenses: any[]) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  return days.map((day, index) => {
    const dayExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getDay() === (index + 1) % 7;
    });
    
    const amount = dayExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    return { day, amount };
  });
}