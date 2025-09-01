import React, { useState, useMemo } from 'react';
import { Text, Group, Stack, Button, Image, Pagination } from '@mantine/core';
import { FilterSection } from './FilterSection';
import { ExpenseCard } from './ExpenseCard';
import { ExpenseListProps } from '../../types/schema';
import { PaymentType } from '../../types/enums';
import { useExpenseRTK } from '../../hooks/useExpenseRTK';
import { useGetPaymentMethodsQuery } from '../../store/api/budgetApi';
import { useAppData } from '../../hooks/useAppData';
import { BaseModal, ConfirmationModal } from '../common/BaseModal';

export const ExpenseList: React.FC<ExpenseListProps> = ({ onEdit, onViewReceipt, paymentMethods }) => {
	const { expenses, removeExpense } = useExpenseRTK();
	const { data: paymentMethodsData } = useGetPaymentMethodsQuery();
	const { formatCurrency } = useAppData();

	// Use RTK Query data if props are not provided (for router-based navigation)
	const expenseList = expenses;
	const paymentMethodsInfo = paymentMethods || paymentMethodsData || { cards: [], upiApps: [] };

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
			const card = paymentMethodsInfo.cards.find((c) => c.id === expense.paymentMethod.cardId);
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
			await removeExpense(expenseToDelete);
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
			<BaseModal
				opened={receiptModalOpen}
				onClose={() => setReceiptModalOpen(false)}
				title="Receipt"
				description="View expense receipt"
				size="lg"
				secondaryAction={{
					label: 'Close',
					onClick: () => setReceiptModalOpen(false)
				}}
			>
				<Image 
					src={selectedReceipt} 
					alt="Receipt" 
					fit="contain" 
					style={{ 
						maxHeight: '60vh',
						borderRadius: '8px',
						border: '1px solid var(--mantine-color-default-border)'
					}} 
				/>
			</BaseModal>

			{/* Delete Confirmation Modal */}
			<ConfirmationModal
				opened={deleteModalOpen}
				onClose={() => setDeleteModalOpen(false)}
				onConfirm={handleDeleteConfirm}
				title="Delete Expense"
				message="Are you sure you want to delete this expense? This action cannot be undone."
				confirmLabel="Delete"
				confirmColor="red"
			/>
		</Stack>
	);
};