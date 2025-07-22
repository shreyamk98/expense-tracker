import React from 'react';
import {
	Card,
	Text,
	Group,
	Badge,
	ActionIcon,
	Stack,
	useMantineTheme,
	rem,
	useMantineColorScheme,
} from '@mantine/core';
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
	const { colorScheme } = useMantineColorScheme();
	const isMobile = useMediaQuery('(max-width: 768px)');
	const isDark = colorScheme === 'dark';

	const getCategoryColor = (category: ExpenseCategory): string => {
		const colors: Record<ExpenseCategory, string> = {
			[ExpenseCategory.FOOD]: isDark ? theme.colors.red[4] : theme.colors.red[6],
			[ExpenseCategory.TRAVEL]: isDark ? theme.colors.teal[4] : theme.colors.teal[6],
			[ExpenseCategory.UTILITIES]: isDark ? theme.colors.blue[4] : theme.colors.blue[6],
			[ExpenseCategory.SUBSCRIPTIONS]: isDark ? theme.colors.green[4] : theme.colors.green[6],
			[ExpenseCategory.ENTERTAINMENT]: isDark ? theme.colors.yellow[4] : theme.colors.yellow[6],
			[ExpenseCategory.HEALTHCARE]: isDark ? theme.colors.pink[4] : theme.colors.pink[6],
			[ExpenseCategory.SHOPPING]: isDark ? theme.colors.violet[4] : theme.colors.violet[6],
			[ExpenseCategory.OTHER]: isDark ? theme.colors.gray[4] : theme.colors.gray[6],
		};
		return colors[category];
	};

	const getCategoryBadgeColors = (category: ExpenseCategory) => {
		const colorMap: Record<ExpenseCategory, string> = {
			[ExpenseCategory.FOOD]: 'red',
			[ExpenseCategory.TRAVEL]: 'teal',
			[ExpenseCategory.UTILITIES]: 'blue',
			[ExpenseCategory.SUBSCRIPTIONS]: 'green',
			[ExpenseCategory.ENTERTAINMENT]: 'yellow',
			[ExpenseCategory.HEALTHCARE]: 'pink',
			[ExpenseCategory.SHOPPING]: 'violet',
			[ExpenseCategory.OTHER]: 'gray',
		};

		const colorName = colorMap[category];
		return {
			backgroundColor: isDark ? theme.colors[colorName][9] : theme.colors[colorName][1],
			color: isDark ? theme.colors[colorName][3] : theme.colors[colorName][7],
			borderColor: isDark ? theme.colors[colorName][7] : theme.colors[colorName][3],
		};
	};

	const getPaymentMethodBadgeColors = (type: PaymentType) => {
		const colorMap: Record<PaymentType, string> = {
			[PaymentType.CASH]: 'green',
			[PaymentType.CREDIT_CARD]: 'expense',
			[PaymentType.DEBIT_CARD]: 'blue',
			[PaymentType.UPI]: 'primary',
		};

		const colorName = colorMap[type];
		return {
			backgroundColor: isDark ? theme.colors[colorName][9] : theme.colors[colorName][1],
			color: isDark ? theme.colors[colorName][3] : theme.colors[colorName][7],
			borderColor: isDark ? theme.colors[colorName][7] : theme.colors[colorName][3],
		};
	};

	const getActionIconColors = (colorName: string) => ({
		backgroundColor: isDark ? theme.colors[colorName][9] : theme.colors[colorName][1],
		color: isDark ? theme.colors[colorName][4] : theme.colors[colorName][7],
	});

	const getHoverBackgroundColor = (category: ExpenseCategory): string => {
		const colorMap: Record<ExpenseCategory, string> = {
			[ExpenseCategory.FOOD]: 'red',
			[ExpenseCategory.TRAVEL]: 'teal',
			[ExpenseCategory.UTILITIES]: 'blue',
			[ExpenseCategory.SUBSCRIPTIONS]: 'green',
			[ExpenseCategory.ENTERTAINMENT]: 'yellow',
			[ExpenseCategory.HEALTHCARE]: 'pink',
			[ExpenseCategory.SHOPPING]: 'violet',
			[ExpenseCategory.OTHER]: 'gray',
		};

		const colorName = colorMap[category];
		return isDark ? theme.colors[colorName][9] : theme.colors[colorName][1];
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
						backgroundColor: getHoverBackgroundColor(expense.category),
					},
				},
			}}
		>
			<Group justify="space-between" align="flex-start" gap={isMobile ? 0 : 'xs'}>
				<Stack gap="xs" style={{ flex: 1 }}>
					<Group justify="space-between">
						<Text fw={600} size="md" c={isDark ? 'gray.1' : 'dark.8'}>
							{expense.description}
						</Text>
						<Text fw={700} size="lg" c="expense.6">
							{formatCurrency(expense.amount)}
						</Text>
					</Group>

					<Group gap="xs">
						<Badge variant="light" style={getCategoryBadgeColors(expense.category)}>
							{formatCategory(expense.category)}
						</Badge>
						<Badge variant="light" style={getPaymentMethodBadgeColors(expense.paymentMethod.type)}>
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
								style={getActionIconColors('blue')}
							>
								<Receipt size={18} />
							</ActionIcon>
						)}

						<ActionIcon
							variant="light"
							color="yellow"
							size="md"
							onClick={handleEdit}
							style={getActionIconColors('yellow')}
						>
							<Edit size={18} />
						</ActionIcon>

						<ActionIcon
							variant="light"
							color="red"
							size="md"
							onClick={handleDelete}
							style={getActionIconColors('red')}
						>
							<Trash2 size={18} />
						</ActionIcon>
					</Group>
				)}
			</Group>
		</Card>
	);
};
