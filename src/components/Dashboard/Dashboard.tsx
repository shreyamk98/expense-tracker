import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Text,
  Group,
  Stack,
  Button,
  SimpleGrid,
  Progress,
  Badge,
  ActionIcon,
  useMantineTheme
} from '@mantine/core';
import { PieChart, AreaChart } from '@mantine/charts';
import { Plus, TrendingUp, Calendar } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { CurrencyIcon } from '../common/CurrencyIcon';
import { ReceiptIcon } from '../common/ReceiptIcon';
import { formatDate, formatCategory } from '../../utils/formatters';
import { ExpenseCategory, PaymentType } from '../../types/enums';

interface DashboardProps {
  onAddExpense?: () => void;
  onViewAllExpenses?: () => void;
  onViewInsights?: () => void;
  onManageBudgets?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onAddExpense,
  onViewAllExpenses,
  onViewInsights,
  onManageBudgets
}) => {
  const { state, formatCurrency, getCurrentCurrency } = useAppContext();
  const { expenses, budgets } = state;
  const navigate = useNavigate();
  const theme = useMantineTheme();

  const handleAddExpense = () => {
    if (onAddExpense) {
      onAddExpense();
    } else {
      // Default behavior - could open a modal or navigate to expense form
      console.log('Add expense clicked');
    }
  };

  const handleViewAllExpenses = () => {
    if (onViewAllExpenses) {
      onViewAllExpenses();
    } else {
      navigate('/expenses');
    }
  };

  const handleViewInsights = () => {
    if (onViewInsights) {
      onViewInsights();
    } else {
      navigate('/insights');
    }
  };

  const handleManageBudgets = () => {
    if (onManageBudgets) {
      onManageBudgets();
    } else {
      navigate('/budgets');
    }
  };

  // Calculate current month stats
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
  });

  const totalSpent = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const expenseCount = monthlyExpenses.length;
  const averagePerDay = totalSpent / new Date().getDate();

  // Recent expenses (last 5)
  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Category breakdown for pie chart
  const categoryData = Object.values(ExpenseCategory).map(category => {
    const categoryExpenses = monthlyExpenses.filter(exp => exp.category === category);
    const amount = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    return {
      name: formatCategory(category),
      value: amount,
      color: getCategoryColor(category, theme)
    };
  }).filter(item => item.value > 0);

  // Payment method breakdown
  const paymentData = Object.values(PaymentType).map(type => {
    const paymentExpenses = monthlyExpenses.filter(exp => exp.paymentMethod.type === type);
    const amount = paymentExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    return {
      name: getPaymentTypeLabel(type),
      value: amount,
      color: getPaymentTypeColor(type, theme)
    };
  }).filter(item => item.value > 0);

  // Weekly trends for area chart
  const weeklyData = getWeeklyTrends(expenses);

  // Budget progress
  const budgetProgress = budgets.map(budget => {
    const categoryExpenses = monthlyExpenses.filter(exp => exp.category === budget.category);
    const spent = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const percentage = (spent / budget.limit) * 100;
    
    return {
      ...budget,
      spent,
      percentage: Math.min(percentage, 100),
      isOverBudget: spent > budget.limit
    };
  });

  return (
    <Stack gap="lg">
      {/* Header */}
      <Group justify="space-between">
        <div>
          <Text size="xl" fw={600}>Dashboard</Text>
          <Text size="sm" c="dimmed">Track your expenses and manage your budget</Text>
        </div>
        <Button leftSection={<Plus size={16} />} onClick={handleAddExpense}>
          Add Expense
        </Button>
      </Group>

      {/* Stats Cards */}
      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
        <Card p="md" withBorder>
          <Group justify="space-between">
            <div>
              <Text size="sm" c="dimmed">Total Spent</Text>
              <Text size="xl" fw={600} c="expense.6">
                {formatCurrency(totalSpent)}
              </Text>
              <Text size="xs" c="dimmed">This Month</Text>
            </div>
            <ActionIcon size="xl" variant="light" color="red">
              <CurrencyIcon currency={getCurrentCurrency()} size={24} />
            </ActionIcon>
          </Group>
        </Card>

        <Card p="md" withBorder>
          <Group justify="space-between">
            <div>
              <Text size="sm" c="dimmed">Expenses</Text>
              <Text size="xl" fw={600}>
                {expenseCount}
              </Text>
              <Text size="xs" c="dimmed">This Month</Text>
            </div>
            <ActionIcon size="xl" variant="light" color="blue">
              <ReceiptIcon currency={getCurrentCurrency()} size={24} />
            </ActionIcon>
          </Group>
        </Card>

        <Card p="md" withBorder>
          <Group justify="space-between">
            <div>
              <Text size="sm" c="dimmed">Daily Average</Text>
              <Text size="xl" fw={600}>
                {formatCurrency(averagePerDay)}
              </Text>
              <Text size="xs" c="dimmed">This Month</Text>
            </div>
            <ActionIcon size="xl" variant="light" color="green">
              <TrendingUp size={24} />
            </ActionIcon>
          </Group>
        </Card>

        <Card p="md" withBorder>
          <Group justify="space-between">
            <div>
              <Text size="sm" c="dimmed">Last Expense</Text>
              <Text size="xl" fw={600}>
                {recentExpenses.length > 0 ? formatCurrency(recentExpenses[0].amount) : formatCurrency(0)}
              </Text>
              <Text size="xs" c="dimmed">
                {recentExpenses.length > 0 ? formatDate(new Date(recentExpenses[0].date)) : 'No expenses'}
              </Text>
            </div>
            <ActionIcon size="xl" variant="light" color="yellow">
              <Calendar size={24} />
            </ActionIcon>
          </Group>
        </Card>
      </SimpleGrid>

      {/* Charts Row */}
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        {/* Category Breakdown */}
        <Card p="md" withBorder>
          <Group justify="space-between" mb="md">
            <Text fw={500}>Category Breakdown</Text>
            <Button variant="subtle" size="xs" onClick={handleViewInsights}>
              View Details
            </Button>
          </Group>
          {categoryData.length > 0 ? (
            <PieChart
              data={categoryData}
              size={200}
              withTooltip
              tooltipDataSource="segment"
              mx="auto"
            />
          ) : (
            <Text ta="center" c="dimmed" py="xl">
              No expenses this month
            </Text>
          )}
        </Card>

        {/* Weekly Trends */}
        <Card p="md" withBorder>
          <Group justify="space-between" mb="md">
            <Text fw={500}>Weekly Trends</Text>
            <Button variant="subtle" size="xs" onClick={handleViewInsights}>
              View Details
            </Button>
          </Group>
          {weeklyData.length > 0 ? (
            <AreaChart
              h={200}
              data={weeklyData}
              dataKey="week"
              series={[{ name: 'amount', color: 'expense.6' }]}
              curveType="linear"
              withGradient
            />
          ) : (
            <Text ta="center" c="dimmed" py="xl">
              No data available
            </Text>
          )}
        </Card>
      </SimpleGrid>

      {/* Budget Progress & Recent Expenses */}
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        {/* Budget Progress */}
        <Card p="md" withBorder>
          <Group justify="space-between" mb="md">
            <Text fw={500}>Budget Progress</Text>
            <Button variant="subtle" size="xs" onClick={handleManageBudgets}>
              Manage Budgets
            </Button>
          </Group>
          <Stack gap="sm">
            {budgetProgress.length > 0 ? (
              budgetProgress.map((budget) => (
                <div key={budget.id}>
                  <Group justify="space-between" mb="xs">
                    <Text size="sm">{formatCategory(budget.category)}</Text>
                    <Group gap="xs">
                      <Text size="sm" fw={500}>
                        {formatCurrency(budget.spent)} / {formatCurrency(budget.limit)}
                      </Text>
                      {budget.isOverBudget && (
                        <Badge color="red" size="xs">Over Budget</Badge>
                      )}
                    </Group>
                  </Group>
                  <Progress
                    value={budget.percentage}
                    color={budget.isOverBudget ? 'red' : budget.percentage > 80 ? 'yellow' : 'green'}
                    size="sm"
                  />
                </div>
              ))
            ) : (
              <Text ta="center" c="dimmed" py="md">
                No budgets set
              </Text>
            )}
          </Stack>
        </Card>

        {/* Recent Expenses */}
        <Card p="md" withBorder>
          <Group justify="space-between" mb="md">
            <Text fw={500}>Recent Expenses</Text>
            <Button variant="subtle" size="xs" onClick={handleViewAllExpenses}>
              View All
            </Button>
          </Group>
          <Stack gap="sm">
            {recentExpenses.length > 0 ? (
              recentExpenses.map((expense) => (
                <Group key={expense.id} justify="space-between">
                  <div>
                    <Text size="sm" fw={500}>{expense.description}</Text>
                    <Group gap="xs">
                      <Badge variant="light" size="xs">
                        {formatCategory(expense.category)}
                      </Badge>
                      <Text size="xs" c="dimmed">
                        {formatDate(new Date(expense.date))}
                      </Text>
                    </Group>
                  </div>
                  <Text size="sm" fw={500} c="expense.6">
                    {formatCurrency(expense.amount)}
                  </Text>
                </Group>
              ))
            ) : (
              <Text ta="center" c="dimmed" py="md">
                No expenses yet
              </Text>
            )}
          </Stack>
        </Card>
      </SimpleGrid>
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

function getWeeklyTrends(expenses: any[]) {
  const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  return weeks.map((week, index) => {
    const weekStart = new Date(currentYear, currentMonth, index * 7 + 1);
    const weekEnd = new Date(currentYear, currentMonth, (index + 1) * 7);
    
    const weekExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= weekStart && expenseDate <= weekEnd;
    });
    
    const amount = weekExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    return { week, amount };
  });
}