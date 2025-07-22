import React from 'react';
import { ActionIcon, Menu, useMantineColorScheme } from '@mantine/core';
import { MoreVertical, Edit, Trash2, Receipt } from 'lucide-react';
import { useMantineTheme } from '@mantine/core';

interface ExpenseCardMenuProps {
	onEdit: () => void;
	onDelete: () => void;
	onViewReceipt?: () => void;
	hasReceipt?: boolean;
}

export const ExpenseCardMenu: React.FC<ExpenseCardMenuProps> = ({
	onEdit,
	onDelete,
	onViewReceipt,
	hasReceipt = false,
}) => {
	const theme = useMantineTheme();
	const { colorScheme } = useMantineColorScheme();
	const isDark = colorScheme === 'dark';

	return (
		<Menu shadow="md" width={160} position="bottom-end">
			<Menu.Target>
				<ActionIcon
					variant="subtle"
					color="gray"
					size="md"
					style={{
						color: isDark ? theme.colors.gray[4] : theme.colors.gray[6],
					}}
				>
					<MoreVertical size={18} />
				</ActionIcon>
			</Menu.Target>

			<Menu.Dropdown>
				{hasReceipt && onViewReceipt && (
					<Menu.Item
						leftSection={<Receipt size={16} />}
						onClick={onViewReceipt}
						style={{
							color: isDark ? theme.colors.blue[4] : theme.colors.blue[7],
						}}
					>
						View Receipt
					</Menu.Item>
				)}

				<Menu.Item
					leftSection={<Edit size={16} />}
					onClick={onEdit}
					style={{
						color: isDark ? theme.colors.yellow[4] : theme.colors.yellow[7],
					}}
				>
					Edit
				</Menu.Item>

				<Menu.Item
					leftSection={<Trash2 size={16} />}
					onClick={onDelete}
					color="red"
					style={{
						color: isDark ? theme.colors.red[4] : theme.colors.red[7],
					}}
				>
					Delete
				</Menu.Item>
			</Menu.Dropdown>
		</Menu>
	);
};
