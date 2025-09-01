import React, { useState } from 'react';
import {
	Card,
	Text,
	Group,
	Stack,
	Button,
	TextInput,
	Select,
	NumberInput,
	Progress,
	Badge,
	ActionIcon,
	SimpleGrid,
	Alert,
} from '@mantine/core';
import { Plus, Edit, Trash2, AlertTriangle, Target } from 'lucide-react';
import { FormModal } from '../common/BaseModal';
import { useExpenseRTK } from '../../hooks/useExpenseRTK';
import { useGetBudgetsQuery, useCreateBudgetMutation, useUpdateBudgetMutation, useDeleteBudgetMutation } from '../../store/api/budgetApi';
import { useAppData } from '../../hooks/useAppData';
import { formatCategory } from '../../utils/formatters';
import { ExpenseCategory, TimePeriod } from '../../types/enums';
import { Budget } from '../../types/schema';

interface BudgetFormData {
	category: ExpenseCategory;
	limit: number;
	period: TimePeriod;
}

export const BudgetManagement: React.FC = () => {
	const { expenses } = useExpenseRTK();
	const { data: budgets = [] } = useGetBudgetsQuery();
	const { formatCurrency, getCurrentCurrency } = useAppData();
	const [createBudget] = useCreateBudgetMutation();
	const [updateBudget] = useUpdateBudgetMutation();
	const [deleteBudget] = useDeleteBudgetMutation();

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
	const [formData, setFormData] = useState<BudgetFormData>({
		category: ExpenseCategory.FOOD,
		limit: 0,
		period: TimePeriod.MONTH,
	});
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Calculate current month stats for each budget
	const budgetProgress = budgets.map((budget) => {
		const currentMonth = new Date().getMonth();
		const currentYear = new Date().getFullYear();

		const categoryExpenses = expenses.filter((expense) => {
			const expenseDate = new Date(expense.date);
			return (
				expense.category === budget.category &&
				expenseDate.getMonth() === currentMonth &&
				expenseDate.getFullYear() === currentYear
			);
		});

		const spent = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);
		const percentage = (spent / budget.limit) * 100;
		const remaining = budget.limit - spent;

		return {
			...budget,
			spent,
			percentage: Math.min(percentage, 100),
			remaining,
			isOverBudget: spent > budget.limit,
			overAmount: spent > budget.limit ? spent - budget.limit : 0,
		};
	});

	const handleOpenModal = (budget?: Budget) => {
		if (budget) {
			setEditingBudget(budget);
			setFormData({
				category: budget.category,
				limit: budget.limit,
				period: budget.period,
			});
		} else {
			setEditingBudget(null);
			setFormData({
				category: ExpenseCategory.FOOD,
				limit: 0,
				period: TimePeriod.MONTH,
			});
		}
		setError(null);
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setEditingBudget(null);
		setError(null);
	};

	const handleSubmit = async () => {
		if (formData.limit <= 0) {
			setError('Budget limit must be greater than 0');
			return;
		}

		// Check if category already has a budget (when creating new)
		if (!editingBudget && budgets.some((b) => b.category === formData.category)) {
			setError('A budget for this category already exists');
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			if (editingBudget) {
				// Update existing budget
				await updateBudget({
					id: editingBudget.id,
					budget: {
						category: formData.category,
						limit: formData.limit,
						period: formData.period,
					}
				}).unwrap();
			} else {
				// Create new budget
				await createBudget({
					category: formData.category,
					limit: formData.limit,
					period: formData.period,
				}).unwrap();
			}

			handleCloseModal();
		} catch (error) {
			console.error('Failed to save budget:', error);
			setError('Failed to save budget. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	const handleDelete = async (budgetId: string) => {
		if (!confirm('Are you sure you want to delete this budget?')) {
			return;
		}

		try {
			await deleteBudget(budgetId).unwrap();
		} catch (error) {
			console.error('Failed to delete budget:', error);
			alert('Failed to delete budget. Please try again.');
		}
	};

	const categoryOptions = Object.values(ExpenseCategory).map((category) => ({
		value: category,
		label: formatCategory(category),
	}));

	const periodOptions = Object.values(TimePeriod).map((period) => ({
		value: period,
		label: period.charAt(0).toUpperCase() + period.slice(1),
	}));

	// Helper function to get currency symbol
	const getCurrencySymbol = (currency: string): string => {
		const currencySymbols: Record<string, string> = {
			USD: '$',
			EUR: '€',
			GBP: '£',
			INR: '₹',
		};
		return currencySymbols[currency] || '$';
	};

	return (
		<Stack gap="lg">
			{/* Header */}
			<Group justify="space-between">
				<div>
					<Text size="xl" fw={600}>
						Budget Management
					</Text>
					<Text size="sm" c="dimmed">
						Set and track spending limits for different categories
					</Text>
				</div>
				<Button leftSection={<Plus size={16} />} onClick={() => handleOpenModal()}>
					Add Budget
				</Button>
			</Group>

			{/* Budget Cards */}
			{budgetProgress.length > 0 ? (
				<SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
					{budgetProgress.map((budget) => (
						<Card key={budget.id} p="md" withBorder>
							<Group justify="space-between" mb="md">
								<div>
									<Text fw={500}>{formatCategory(budget.category)}</Text>
									<Text size="sm" c="dimmed">
										{budget.period} budget
									</Text>
								</div>
								<Group gap="xs">
									<ActionIcon variant="subtle" size="sm" onClick={() => handleOpenModal(budget)}>
										<Edit size={14} />
									</ActionIcon>
									<ActionIcon
										variant="subtle"
										size="sm"
										color="red"
										onClick={() => handleDelete(budget.id)}
									>
										<Trash2 size={14} />
									</ActionIcon>
								</Group>
							</Group>

							<Stack gap="sm">
								<Group justify="space-between">
									<Text size="sm">Spent</Text>
									<Text size="sm" fw={500}>
										{formatCurrency(budget.spent)} / {formatCurrency(budget.limit)}
									</Text>
								</Group>

								<Progress
									value={budget.percentage}
									color={budget.isOverBudget ? 'red' : budget.percentage > 80 ? 'yellow' : 'green'}
									size="md"
								/>

								<Group justify="space-between">
									<Text size="xs" c="dimmed">
										{budget.percentage.toFixed(1)}% used
									</Text>
									{budget.isOverBudget && (
										<Badge color="red" size="xs">
											Over by {formatCurrency(budget.overAmount)}
										</Badge>
									)}
								</Group>

								{budget.isOverBudget ? (
									<Alert icon={<AlertTriangle size={16} />} color="red" variant="light">
										<Text size="xs">
											You've exceeded your budget by {formatCurrency(budget.overAmount)}
										</Text>
									</Alert>
								) : (
									<Group gap="xs">
										<Target size={14} color="green" />
										<Text size="xs" c="green">
											{formatCurrency(budget.remaining)} remaining
										</Text>
									</Group>
								)}
							</Stack>
						</Card>
					))}
				</SimpleGrid>
			) : (
				<Card p="xl" withBorder>
					<Stack align="center" gap="md">
						<Target size={48} color="gray" />
						<div style={{ textAlign: 'center' }}>
							<Text fw={500} mb="xs">
								No budgets set
							</Text>
							<Text size="sm" c="dimmed" mb="md">
								Create your first budget to start tracking your spending limits
							</Text>
							<Button leftSection={<Plus size={16} />} onClick={() => handleOpenModal()}>
								Create Budget
							</Button>
						</div>
					</Stack>
				</Card>
			)}

			{/* Budget Form Modal */}
			<FormModal
				opened={isModalOpen}
				onClose={handleCloseModal}
				onSubmit={handleSubmit}
				title={editingBudget ? 'Edit Budget' : 'Create Budget'}
				description={editingBudget ? 'Update your budget settings' : 'Set spending limits for a category'}
				size="md"
				submitLabel={editingBudget ? 'Update Budget' : 'Create Budget'}
				submitIcon={editingBudget ? <Edit size={16} /> : <Plus size={16} />}
				loading={isLoading}
			>
				<Stack gap="lg">
					{error && (
						<Alert color="red" variant="light">
							{error}
						</Alert>
					)}

					<Select
						label="Category"
						placeholder="Select category"
						data={categoryOptions}
						value={formData.category}
						onChange={(value) =>
							setFormData((prev) => ({
								...prev,
								category: value as ExpenseCategory,
							}))
						}
						required
					/>

					<NumberInput
						label="Budget Limit"
						placeholder="Enter amount"
						value={formData.limit}
						onChange={(value) =>
							setFormData((prev) => ({
								...prev,
								limit: Number(value) || 0,
							}))
						}
						min={0}
						step={100}
						prefix={getCurrencySymbol(getCurrentCurrency())}
						required
					/>

					<Select
						label="Period"
						placeholder="Select period"
						data={periodOptions}
						value={formData.period}
						onChange={(value) =>
							setFormData((prev) => ({
								...prev,
								period: value as TimePeriod,
							}))
						}
						required
					/>

				</Stack>
			</FormModal>
		</Stack>
	);
};