import React, { useState, useEffect } from 'react';
import {
	TextInput,
	NumberInput,
	Select,
	TagsInput,
	Button,
	FileButton,
	Text,
	Group,
	Stack,
	Image,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { Plus, Upload, X } from 'lucide-react';
import { FormModal } from '../common/BaseModal';
import { ExpenseFormProps } from '../../types/schema';
import { ExpenseCategory, PaymentType, UPIApp } from '../../types/enums';
import { formatCategory } from '../../utils/formatters';
import { useAppContext } from '../../context/AppContext';
import { ExpenseService } from '../../services/expenseService';

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ expense, onSubmit, onCancel, isOpen, paymentMethods }) => {
	const { getCurrentCurrency } = useAppContext();
	const [formData, setFormData] = useState({
		amount: 0,
		date: new Date(),
		description: '',
		category: ExpenseCategory.OTHER,
		tags: [] as string[],
		receiptUrl: null as string | null,
		paymentMethod: {
			type: PaymentType.CASH,
			upiApp: undefined as UPIApp | undefined,
			cardId: undefined as string | undefined,
		},
	});

	const [receiptFile, setReceiptFile] = useState<File | null>(null);
	const [errors, setErrors] = useState<Record<string, string>>({});

	useEffect(() => {
		if (expense) {
			setFormData({
				amount: expense.amount,
				date: new Date(expense.date),
				description: expense.description,
				category: expense.category,
				tags: expense.tags,
				receiptUrl: expense.receiptUrl,
				paymentMethod: {
					type: expense.paymentMethod.type,
					upiApp: expense.paymentMethod.upiApp || undefined,
					cardId: expense.paymentMethod.cardId || undefined,
				},
			});
		} else {
			setFormData({
				amount: 0,
				date: new Date(),
				description: '',
				category: ExpenseCategory.OTHER,
				tags: [],
				receiptUrl: null,
				paymentMethod: {
					type: PaymentType.CASH,
					upiApp: undefined,
					cardId: undefined,
				},
			});
		}
		setErrors({});
	}, [expense, isOpen]);

	const validateForm = () => {
		const newErrors: Record<string, string> = {};

		if (formData.amount <= 0) {
			newErrors.amount = 'Amount must be greater than 0';
		}

		if (!formData.description.trim()) {
			newErrors.description = 'Description is required';
		}

		if (formData.paymentMethod.type === PaymentType.UPI && !formData.paymentMethod.upiApp) {
			newErrors.paymentMethod = 'UPI app is required for UPI payments';
		}

		if (
			(formData.paymentMethod.type === PaymentType.CREDIT_CARD ||
				formData.paymentMethod.type === PaymentType.DEBIT_CARD) &&
			!formData.paymentMethod.cardId
		) {
			newErrors.paymentMethod = 'Card selection is required';
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async () => {
		if (validateForm()) {
			let receiptUrl = formData.receiptUrl;

			// Upload receipt if a new file is selected - Real API only
			if (receiptFile) {
				try {
					receiptUrl = await ExpenseService.uploadReceipt(receiptFile);
				} catch (error) {
					console.error('Failed to upload receipt:', error);
					// Continue without receipt if upload fails
				}
			}

			onSubmit({
				...formData,
				date: formData.date.toISOString(),
				receiptUrl,
				paymentMethod: {
					type: formData.paymentMethod.type,
					...(formData.paymentMethod.upiApp && { upiApp: formData.paymentMethod.upiApp }),
					...(formData.paymentMethod.cardId && { cardId: formData.paymentMethod.cardId }),
				},
			});
		}
	};

	const categoryOptions = Object.values(ExpenseCategory).map((cat) => ({
		value: cat,
		label: formatCategory(cat),
	}));

	const paymentTypeOptions = [
		{ value: PaymentType.CASH, label: 'Cash' },
		{ value: PaymentType.CREDIT_CARD, label: 'Credit Card' },
		{ value: PaymentType.DEBIT_CARD, label: 'Debit Card' },
		{ value: PaymentType.UPI, label: 'UPI' },
	];

	const upiAppOptions = paymentMethods.upiApps
		.filter((app) => app.isEnabled)
		.map((app) => ({
			value: app.app,
			label: app.app.toUpperCase(),
		}));

	const cardOptions = paymentMethods.cards.map((card) => ({
		value: card.id,
		label: `${card.name} (*${card.lastFourDigits})`,
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
		<FormModal
			opened={isOpen}
			onClose={onCancel}
			onSubmit={handleSubmit}
			title={expense ? 'Edit Expense' : 'Add Expense'}
			description={expense ? 'Update expense details' : 'Add a new expense to track your spending'}
			size="md"
			submitLabel={expense ? 'Update Expense' : 'Add Expense'}
			submitIcon={<Plus size={16} />}
		>
			<Stack gap="lg">
				<NumberInput
					label="Amount"
					placeholder="Enter amount"
					value={formData.amount}
					onChange={(value) => setFormData((prev) => ({ ...prev, amount: Number(value) || 0 }))}
					min={0}
					step={0.01}
					prefix={getCurrencySymbol(getCurrentCurrency())}
					required
					error={errors.amount}
				/>

				<DateInput
					label="Date"
					value={formData.date}
					onChange={(date) => setFormData((prev) => ({ ...prev, date: date ? new Date(date) : new Date() }))}
					required
				/>

				<TextInput
					label="Description"
					placeholder="Enter description"
					value={formData.description}
					onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
					required
					error={errors.description}
				/>

				<Select
					label="Category"
					data={categoryOptions}
					value={formData.category}
					onChange={(value) =>
						setFormData((prev) => ({
							...prev,
							category: (value as ExpenseCategory) || ExpenseCategory.OTHER,
						}))
					}
					required
				/>

				<TagsInput
					label="Tags"
					placeholder="Add tags"
					value={formData.tags}
					onChange={(tags) => setFormData((prev) => ({ ...prev, tags }))}
				/>

				<Select
					label="Payment Method"
					data={paymentTypeOptions}
					value={formData.paymentMethod.type}
					onChange={(value) =>
						setFormData((prev) => ({
							...prev,
							paymentMethod: {
								type: (value as PaymentType) || PaymentType.CASH,
								upiApp: undefined,
								cardId: undefined,
							},
						}))
					}
					required
				/>

				{formData.paymentMethod.type === PaymentType.UPI && (
					<Select
						label="UPI App"
						data={upiAppOptions}
						value={formData.paymentMethod.upiApp}
						onChange={(value) =>
							setFormData((prev) => ({
								...prev,
								paymentMethod: {
									...prev.paymentMethod,
									upiApp: value as UPIApp,
								},
							}))
						}
						required
						error={errors.paymentMethod}
					/>
				)}

				{(formData.paymentMethod.type === PaymentType.CREDIT_CARD ||
					formData.paymentMethod.type === PaymentType.DEBIT_CARD) && (
					<Select
						label="Card"
						data={cardOptions}
						value={formData.paymentMethod.cardId}
						onChange={(value) =>
							setFormData((prev) => ({
								...prev,
								paymentMethod: {
									...prev.paymentMethod,
									cardId: value || undefined,
								},
							}))
						}
						required
						error={errors.paymentMethod}
					/>
				)}

				<div>
					<Text size="sm" fw={500} mb="xs">
						Receipt
					</Text>
					<Group gap="sm">
						<FileButton onChange={setReceiptFile} accept="image/*">
							{(props) => (
								<Button {...props} leftSection={<Upload size={16} />} variant="light">
									Upload Receipt
								</Button>
							)}
						</FileButton>
						{(receiptFile || formData.receiptUrl) && (
							<Button
								variant="subtle"
								color="red"
								leftSection={<X size={16} />}
								onClick={() => {
									setReceiptFile(null);
									setFormData((prev) => ({ ...prev, receiptUrl: null }));
								}}
							>
								Remove
							</Button>
						)}
					</Group>
					{receiptFile && (
						<Image
							src={URL.createObjectURL(receiptFile)}
							alt="Receipt preview"
							w={100}
							h={100}
							fit="cover"
							mt="xs"
						/>
					)}
					{!receiptFile && formData.receiptUrl && (
						<Image src={formData.receiptUrl} alt="Receipt" w={100} h={100} fit="cover" mt="xs" />
					)}
				</div>
			</Stack>
		</FormModal>
	);
};
