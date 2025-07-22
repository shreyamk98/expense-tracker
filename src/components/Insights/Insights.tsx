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
import { PieChart, BarChart } from '@mantine/charts';
import { useAppContext } from '../../context/AppContext';
import { formatCategory, formatTimePeriod } from '../../utils/formatters';
import { ExpenseCategory, PaymentType, TimePeriod } from '../../types/enums';
import { BudgetConsumptionChart } from './BudgetConsumptionChart';
import { ExpenseFrequencyChart } from './ExpenseFrequencyChart';
import { CategoryComparisonChart } from './CategoryComparisonChart';

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

  // Budget consumption data
  const budgetConsumptionData = getBudgetConsumptionData(filteredExpenses, budgets, theme);
  const totalBudget = budgets.reduce((sum, budget) => sum + budget.limit, 0);

  // Expense frequency data
  const expenseFrequencyData = getExpenseFrequencyData(filteredExpenses, theme);

  // Category comparison data
  const categoryComparisonData = getCategoryComparisonData(expenses, theme);

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
        {/* Budget Consumption */}
        <BudgetConsumptionChart
          data={budgetConsumptionData}
          totalSpent={totalSpent}
          totalBudget={totalBudget}
          formatCurrency={formatCurrency}
          hasBudget={budgets.length > 0 && totalBudget > 0}
        />

        {/* Expense Frequency Analysis */}
        <ExpenseFrequencyChart
          data={expenseFrequencyData}
          formatCurrency={formatCurrency}
        />
      </SimpleGrid>

      {/* Charts Row 3 */}
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        {/* Category Comparison */}
        <CategoryComparisonChart
          data={categoryComparisonData}
          formatCurrency={formatCurrency}
        />

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
      <Card p="md" withBorder>
        <Text fw={500} mb="md">Budget Analysis</Text>
        {budgetAnalysis.length > 0 ? (
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
        ) : (
          <Stack gap="sm" align="center" py="xl">
            <Text ta="center" c="dimmed" size="lg">
              No budgets configured
            </Text>
            <Text size="sm" ta="center" c="dimmed" maw={400}>
              Set up budgets for different expense categories to track your spending limits and get detailed budget analysis insights.
            </Text>
          </Stack>
        )}
      </Card>
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

function getBudgetConsumptionData(expenses: any[], budgets: any[], theme: any) {
  return budgets.map(budget => {
    const categoryExpenses = expenses.filter(exp => exp.category === budget.category);
    const spent = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const percentage = (spent / budget.limit) * 100;
    
    return {
      category: formatCategory(budget.category),
      spent,
      budget: budget.limit,
      percentage,
      color: getCategoryColor(budget.category, theme)
    };
  }).filter(item => item.budget > 0);
}

function getExpenseFrequencyData(expenses: any[], theme: any) {
  const categoryFrequency = Object.values(ExpenseCategory).map(category => {
    const categoryExpenses = expenses.filter(exp => exp.category === category);
    const frequency = categoryExpenses.length;
    const totalAmount = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const avgAmount = frequency > 0 ? totalAmount / frequency : 0;
    
    return {
      category: formatCategory(category),
      frequency,
      avgAmount,
      totalAmount,
      color: getCategoryColor(category, theme)
    };
  }).filter(item => item.frequency > 0);
  
  return categoryFrequency;
}

function getCategoryComparisonData(expenses: any[], theme: any) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const currentMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
  });
  
  const previousMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    return expenseDate.getMonth() === prevMonth && expenseDate.getFullYear() === prevYear;
  });
  
  return Object.values(ExpenseCategory).map(category => {
    const currentAmount = currentMonthExpenses
      .filter(exp => exp.category === category)
      .reduce((sum, exp) => sum + exp.amount, 0);
    
    const previousAmount = previousMonthExpenses
      .filter(exp => exp.category === category)
      .reduce((sum, exp) => sum + exp.amount, 0);
    
    const change = currentAmount - previousAmount;
    const changePercent = previousAmount > 0 ? (change / previousAmount) * 100 : 0;
    
    return {
      category: formatCategory(category),
      currentMonth: currentAmount,
      previousMonth: previousAmount,
      change,
      changePercent,
      color: getCategoryColor(category, theme)
    };
  }).filter(item => item.currentMonth > 0 || item.previousMonth > 0);
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