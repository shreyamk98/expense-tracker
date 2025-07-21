import React, { useState } from 'react';
import { Card, Text, Group, Stack, TextInput, Select, Button, SimpleGrid, Accordion } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useMediaQuery } from '@mantine/hooks';
import { Search, Filter } from 'lucide-react';
import { ExpenseCategory, PaymentType } from '../../types/enums';
import { formatCategory } from '../../utils/formatters';

interface FilterSectionProps {
	searchTerm: string;
	categoryFilter: string;
	paymentFilter: string;
	dateFilter: Date | null;
	onSearchChange: (value: string) => void;
	onCategoryChange: (value: string | null) => void;
	onPaymentChange: (value: string | null) => void;
	onDateChange: (value: Date | null) => void;
	onClearFilters: () => void;
}

export const FilterSection: React.FC<FilterSectionProps> = ({
	searchTerm,
	categoryFilter,
	paymentFilter,
	dateFilter,
	onSearchChange,
	onCategoryChange,
	onPaymentChange,
	onDateChange,
	onClearFilters,
}) => {
	const isMobile = useMediaQuery('(max-width: 768px)');
	const [accordionValue, setAccordionValue] = useState<string | null>(null);

	const categoryOptions = [
		{ value: '', label: 'All Categories' },
		...Object.values(ExpenseCategory).map((cat) => ({
			value: cat,
			label: formatCategory(cat),
		})),
	];

	const paymentOptions = [
		{ value: '', label: 'All Payment Methods' },
		{ value: PaymentType.CASH, label: 'Cash' },
		{ value: PaymentType.CREDIT_CARD, label: 'Credit Card' },
		{ value: PaymentType.DEBIT_CARD, label: 'Debit Card' },
		{ value: PaymentType.UPI, label: 'UPI' },
	];

	const hasActiveFilters = searchTerm || categoryFilter || paymentFilter || dateFilter;

	const renderFilterContent = () => (
		<Stack gap="sm">
			<TextInput
				placeholder="Search expenses..."
				value={searchTerm}
				onChange={(e) => onSearchChange(e.target.value)}
				leftSection={<Search size={16} />}
			/>

			<Select
				placeholder="Category"
				data={categoryOptions}
				value={categoryFilter}
				onChange={onCategoryChange}
				clearable
			/>

			<Select
				placeholder="Payment Method"
				data={paymentOptions}
				value={paymentFilter}
				onChange={onPaymentChange}
				clearable
			/>

			<DateInput placeholder="Filter by date" value={dateFilter} onChange={onDateChange} clearable />
		</Stack>
	);

	if (isMobile) {
		return (
			<Accordion value={accordionValue} onChange={setAccordionValue} variant="contained">
				<Accordion.Item value="filters">
					<Accordion.Control icon={<Filter size={16} />}>
						<Group justify="space-between" style={{ width: '100%' }}>
							<Text fw={500}>
								Filters{' '}
								{hasActiveFilters &&
									`(${
										[searchTerm, categoryFilter, paymentFilter, dateFilter].filter(Boolean).length
									})`}
							</Text>
							{hasActiveFilters && (
								<Button
									variant="subtle"
									size="xs"
									onClick={(e) => {
										e.stopPropagation();
										onClearFilters();
									}}
								>
									Clear All
								</Button>
							)}
						</Group>
					</Accordion.Control>
					<Accordion.Panel>{renderFilterContent()}</Accordion.Panel>
				</Accordion.Item>
			</Accordion>
		);
	}

	// Desktop layout
	return (
		<Card p="md">
			<Stack gap="sm">
				<Group justify="space-between">
					<Text fw={500}>Filters</Text>
					<Button variant="subtle" size="xs" onClick={onClearFilters}>
						Clear All
					</Button>
				</Group>

				<SimpleGrid cols={4} spacing="sm">
					<TextInput
						placeholder="Search expenses..."
						value={searchTerm}
						onChange={(e) => onSearchChange(e.target.value)}
						leftSection={<Search size={16} />}
					/>

					<Select
						placeholder="Category"
						data={categoryOptions}
						value={categoryFilter}
						onChange={onCategoryChange}
						clearable
					/>

					<Select
						placeholder="Payment Method"
						data={paymentOptions}
						value={paymentFilter}
						onChange={onPaymentChange}
						clearable
					/>

					<DateInput placeholder="Filter by date" value={dateFilter} onChange={onDateChange} clearable />
				</SimpleGrid>
			</Stack>
		</Card>
	);
};
