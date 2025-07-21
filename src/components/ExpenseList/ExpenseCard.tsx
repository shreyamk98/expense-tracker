import React from 'react';
import { Card, Text, Group, Badge, ActionIcon, Stack, useMantineTheme, rem } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { Edit, Trash2, Receipt } from 'lucide-react';
import { ExpenseCardMenu } from './ExpenseCardMenu';
import { ExpenseCategory, PaymentType } from '../../types/enums';
import { formatDate, formatCategory } from '../../utils/formatters';

interface ExpenseCardProps {
	expense: any;
	onEdit: (expense: any) => void;
	onDelete: (id: string) => void;
	onViewReceipt?: (receiptUrl: string) => void;
	formatCurrency: (amount: number) => string;
	getPaymentMethodDisplay: (expense: any) => string;
}

export const ExpenseCard: React.FC<ExpenseCardProps> = ({
	expense,
	onEdit,
	onDelete,
	onViewReceipt,
	formatCurrency,
	getPaymentMethodDisplay,
}) => {
	const theme = useMantineTheme();
	const isMobile = useMediaQuery('(max-width: 768px)');

	const getCategoryColor = (category: ExpenseCategory): string => {
		const colors: Record<ExpenseCategory, string> = {
			[ExpenseCategory.FOOD]: theme.colors.red[6],
			[ExpenseCategory.TRAVEL]: theme.colors.teal[6],
			[ExpenseCategory.UTILITIES]: theme.colors.blue[6],
			[ExpenseCategory.SUBSCRIPTIONS]: theme.colors.green[6],
			[ExpenseCategory.ENTERTAINMENT]: theme.colors.yellow[6],
			[ExpenseCategory.HEALTHCARE]: theme.colors.pink[6],
			[ExpenseCategory.SHOPPING]: theme.colors.violet[6],
			[ExpenseCategory.OTHER]: theme.colors.gray[6],
		};
		return colors[category];
	};

	const getCategoryColorLight = (category: ExpenseCategory): string => {
		const colors: Record<ExpenseCategory, string> = {
			[ExpenseCategory.FOOD]: theme.colors.red[1],
			[ExpenseCategory.TRAVEL]: theme.colors.teal[1],
			[ExpenseCategory.UTILITIES]: theme.colors.blue[1],
			[ExpenseCategory.SUBSCRIPTIONS]: theme.colors.green[1],
			[ExpenseCategory.ENTERTAINMENT]: theme.colors.yellow[1],
			[ExpenseCategory.HEALTHCARE]: theme.colors.pink[1],
			[ExpenseCategory.SHOPPING]: theme.colors.violet[1],
			[ExpenseCategory.OTHER]: theme.colors.gray[1],
		};
		return colors[category];
	};

	const getPaymentMethodColor = (type: PaymentType): string => {
		const colors: Record<PaymentType, string> = {
			[PaymentType.CASH]: theme.colors.green[6],
			[PaymentType.CREDIT_CARD]: theme.colors.expense[6],
			[PaymentType.DEBIT_CARD]: theme.colors.blue[6],
			[PaymentType.UPI]: theme.colors.primary[6],
		};
		return colors[type];
	};

	const getPaymentMethodColorLight = (type: PaymentType): string => {
		const colors: Record<PaymentType, string> = {
			[PaymentType.CASH]: theme.colors.green[1],
			[PaymentType.CREDIT_CARD]: theme.colors.expense[1],
			[PaymentType.DEBIT_CARD]: theme.colors.blue[1],
			[PaymentType.UPI]: theme.colors.primary[1],
		};
		return colors[type];
	};

	const handleEdit = () => onEdit(expense);
	const handleDelete = () => onDelete(expense.id);
	const handleViewReceipt = () => onViewReceipt?.(expense.receiptUrl!);

	return (
		<Card
			p="md"
			withBorder
			style={{
				borderLeft: `${rem(4)} solid ${getCategoryColor(expense.category)}`,
				borderRadius: theme.defaultRadius,
				transition: 'all 0.2s ease',
				position: 'relative',
				backgroundColor: 'var(--mantine-color-body)',
				borderColor: 'var(--mantine-color-default-border)',
			}}
			styles={{
				root: {
					'&:hover': {
						transform: 'translateY(-1px)',
						boxShadow: theme.shadows.md,
						borderLeftWidth: rem(6),
						backgroundColor: getCategoryColorLight(expense.category),
					},
				},
			}}
		>
			<Group justify="space-between" align="flex-start" gap={isMobile ? 0 : 'xs'}>
				<Stack gap="xs" style={{ flex: 1 }}>
					<Group justify="space-between">
						<Text fw={600} size="md" c="dark.8">
							{expense.description}
						</Text>
						<Text fw={700} size="lg" c="expense.6">
							{formatCurrency(expense.amount)}
						</Text>
					</Group>

					<Group gap="xs">
						<Badge
							variant="light"
							style={{
								backgroundColor: getCategoryColorLight(expense.category),
								color: getCategoryColor(expense.category),
								border: `1px solid ${getCategoryColor(expense.category)}`,
								fontWeight: 500,
							}}
						>
							{formatCategory(expense.category)}
						</Badge>
						<Badge
							variant="light"
							style={{
								backgroundColor: getPaymentMethodColorLight(expense.paymentMethod.type),
								color: getPaymentMethodColor(expense.paymentMethod.type),
								border: `1px solid ${getPaymentMethodColor(expense.paymentMethod.type)}`,
								fontWeight: 500,
							}}
						>
							{getPaymentMethodDisplay(expense)}
						</Badge>
						<Text size="sm" c="dimmed" fw={400}>
							{formatDate(new Date(expense.date))}
						</Text>
					</Group>

					{expense.tags.length > 0 && (
						<Group gap="xs">
							{expense.tags.map((tag: string, index: number) => (
								<Badge
									key={index}
									variant="outline"
									size="xs"
									style={{
										borderColor: getCategoryColor(expense.category),
										color: getCategoryColor(expense.category),
										backgroundColor: 'transparent',
									}}
								>
									{tag}
								</Badge>
							))}
						</Group>
					)}
				</Stack>

				{/* Mobile: Three-dot menu */}
				{isMobile ? (
					<ExpenseCardMenu
						onEdit={handleEdit}
						onDelete={handleDelete}
						onViewReceipt={expense.receiptUrl ? handleViewReceipt : undefined}
						hasReceipt={!!expense.receiptUrl}
					/>
				) : (
					/* Desktop: Individual action buttons */
					<Group gap="xxs">
						{expense.receiptUrl && (
							<ActionIcon
								variant="light"
								color="blue"
								size="md"
								onClick={handleViewReceipt}
								style={{
									backgroundColor: theme.colors.blue[1],
									color: theme.colors.blue[7],
								}}
							>
								<Receipt size={18} />
							</ActionIcon>
						)}

						<ActionIcon
							variant="light"
							color="yellow"
							size="md"
							onClick={handleEdit}
							style={{
								backgroundColor: theme.colors.yellow[1],
								color: theme.colors.yellow[7],
							}}
						>
							<Edit size={18} />
						</ActionIcon>

						<ActionIcon
							variant="light"
							color="red"
							size="md"
							onClick={handleDelete}
							style={{
								backgroundColor: theme.colors.red[1],
								color: theme.colors.red[7],
							}}
						>
							<Trash2 size={18} />
						</ActionIcon>
					</Group>
				)}
			</Group>
		</Card>
	);
};
