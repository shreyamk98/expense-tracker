import React, { useState, useMemo } from 'react';
import { Text, Group, Stack, Button, Modal, Image, Pagination } from '@mantine/core';
import { FilterSection } from './FilterSection';
import { ExpenseCard } from './ExpenseCard';
import { ExpenseListProps } from '../../types/schema';
import { PaymentType } from '../../types/enums';
import { useAppContext } from '../../context/AppContext';

export const ExpenseList: React.FC<ExpenseListProps> = ({ onEdit, onViewReceipt, paymentMethods }) => {
	const { state, formatCurrency, deleteExpense } = useAppContext();

	// Use context data if props are not provided (for router-based navigation)
	const expenseList = state.expenses;
	const paymentMethodsData = paymentMethods || state.paymentMethods;

	const handleEdit =
		onEdit ||
		((expense) => {
			console.log('Edit expense:', expense);
			// Could dispatch an action or navigate to edit form
		});

	const handleViewReceipt =
		onViewReceipt ||
		((receiptUrl) => {
			console.log('View receipt:', receiptUrl);
		});
	const [searchTerm, setSearchTerm] = useState('');
	const [categoryFilter, setCategoryFilter] = useState<string>('');
	const [paymentFilter, setPaymentFilter] = useState<string>('');
	const [dateFilter, setDateFilter] = useState<Date | null>(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [receiptModalOpen, setReceiptModalOpen] = useState(false);
	const [selectedReceipt, setSelectedReceipt] = useState<string>('');
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [expenseToDelete, setExpenseToDelete] = useState<string>('');

	const itemsPerPage = 10;

	const filteredExpenses = useMemo(() => {
		return expenseList.filter((expense) => {
			const matchesSearch =
				expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
				expense.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

			const matchesCategory = !categoryFilter || expense.category === categoryFilter;

			const matchesPayment = !paymentFilter || expense.paymentMethod.type === paymentFilter;

			const matchesDate = !dateFilter || new Date(expense.date).toDateString() === dateFilter.toDateString();

			return matchesSearch && matchesCategory && matchesPayment && matchesDate;
		});
	}, [expenseList, searchTerm, categoryFilter, paymentFilter, dateFilter]);

	const paginatedExpenses = useMemo(() => {
		const startIndex = (currentPage - 1) * itemsPerPage;
		return filteredExpenses.slice(startIndex, startIndex + itemsPerPage);
	}, [filteredExpenses, currentPage]);

	const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);

	const getPaymentMethodDisplay = (expense: any) => {
		if (expense.paymentMethod.type === PaymentType.CASH) {
			return 'Cash';
		}

		if (expense.paymentMethod.type === PaymentType.UPI) {
			return `${expense.paymentMethod.upiApp?.toUpperCase() || 'UPI'}`;
		}

		if (expense.paymentMethod.cardId) {
			const card = paymentMethodsData.cards.find((c) => c.id === expense.paymentMethod.cardId);
			return card ? `${card.name} (*${card.lastFourDigits})` : 'Card';
		}

		return expense.paymentMethod.type;
	};

	const handleViewReceiptModal = (receiptUrl: string) => {
		setSelectedReceipt(receiptUrl);
		setReceiptModalOpen(true);
		handleViewReceipt(receiptUrl);
	};

	const handleDeleteClick = (id: string) => {
		setExpenseToDelete(id);
		setDeleteModalOpen(true);
	};

	const handleDeleteConfirm = async () => {
		try {
			await deleteExpense(expenseToDelete);
			setDeleteModalOpen(false);
			setExpenseToDelete('');
		} catch (error) {
			console.error('Failed to delete expense:', error);
			// Keep modal open on error
		}
	};

	const clearFilters = () => {
		setSearchTerm('');
		setCategoryFilter('');
		setPaymentFilter('');
		setDateFilter(null);
		setCurrentPage(1);
	};

	return (
		<Stack gap="md">
			{/* Filters */}
			<FilterSection
				searchTerm={searchTerm}
				categoryFilter={categoryFilter}
				paymentFilter={paymentFilter}
				dateFilter={dateFilter}
				onSearchChange={setSearchTerm}
				onCategoryChange={(value) => setCategoryFilter(value || '')}
				onPaymentChange={(value) => setPaymentFilter(value || '')}
				onDateChange={setDateFilter}
				onClearFilters={clearFilters}
			/>

			{/* Results Summary */}
			<Group justify="space-between">
				<Text size="sm" c="dimmed">
					Showing {paginatedExpenses.length} of {filteredExpenses.length} expenses
				</Text>
				<Text size="sm" fw={500}>
					Total: {formatCurrency(filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0))}
				</Text>
			</Group>

			{/* Expense List */}
			<Stack gap="sm">
				{paginatedExpenses.map((expense) => (
					<ExpenseCard
						key={expense.id}
						expense={expense}
						onEdit={handleEdit}
						onDelete={handleDeleteClick}
						onViewReceipt={handleViewReceiptModal}
						formatCurrency={formatCurrency}
						getPaymentMethodDisplay={getPaymentMethodDisplay}
					/>
				))}
			</Stack>

			{/* Pagination */}
			{totalPages > 1 && (
				<Group justify="center">
					<Pagination value={currentPage} onChange={setCurrentPage} total={totalPages} size="sm" />
				</Group>
			)}

			{/* Receipt Modal */}
			<Modal opened={receiptModalOpen} onClose={() => setReceiptModalOpen(false)} title="Receipt" size="md">
				<Image src={selectedReceipt} alt="Receipt" fit="contain" style={{ maxHeight: '70vh' }} />
			</Modal>

			{/* Delete Confirmation Modal */}
			<Modal opened={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Confirm Delete" size="sm">
				<Stack gap="md">
					<Text>Are you sure you want to delete this expense? This action cannot be undone.</Text>
					<Group justify="flex-end" gap="sm">
						<Button variant="subtle" onClick={() => setDeleteModalOpen(false)}>
							Cancel
						</Button>
						<Button color="red" onClick={handleDeleteConfirm}>
							Delete
						</Button>
					</Group>
				</Stack>
			</Modal>
		</Stack>
	);
};
