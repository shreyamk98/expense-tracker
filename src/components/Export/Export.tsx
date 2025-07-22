import React, { useState } from 'react';
import {
  Card,
  Text,
  Group,
  Stack,
  Button,
  Select,
  MultiSelect,
  Switch,
  Badge,
  Divider,
  useMantineTheme
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { Download, FileText, Database, FileImage } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { ExportFormat, ExpenseCategory, PaymentType } from '../../types/enums';
import { formatCategory } from '../../utils/formatters';

export const Export: React.FC = () => {
  const { state, formatCurrency } = useAppContext();
  const { expenses } = state;
  const theme = useMantineTheme();

  const [exportFormat, setExportFormat] = useState<ExportFormat>(ExportFormat.CSV);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<string[]>([]);
  const [includeTags, setIncludeTags] = useState(true);
  const [includeReceipts, setIncludeReceipts] = useState(false);

  // Filter expenses based on selected criteria
  const getFilteredExpenses = () => {
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      
      // Date filter
      if (startDate && expenseDate < startDate) return false;
      if (endDate && expenseDate > endDate) return false;
      
      // Category filter
      if (selectedCategories.length > 0 && !selectedCategories.includes(expense.category)) {
        return false;
      }
      
      // Payment method filter
      if (selectedPaymentMethods.length > 0 && !selectedPaymentMethods.includes(expense.paymentMethod.type)) {
        return false;
      }
      
      return true;
    });
  };

  const filteredExpenses = getFilteredExpenses();
  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  const formatOptions = [
    { value: ExportFormat.CSV, label: 'CSV (Spreadsheet)', icon: <Database size={16} /> },
    { value: ExportFormat.JSON, label: 'JSON (Data)', icon: <FileText size={16} /> },
    { value: ExportFormat.PDF, label: 'PDF (Report)', icon: <FileImage size={16} /> }
  ];

  const categoryOptions = Object.values(ExpenseCategory).map(cat => ({
    value: cat,
    label: formatCategory(cat)
  }));

  const paymentMethodOptions = [
    { value: PaymentType.CASH, label: 'Cash' },
    { value: PaymentType.CREDIT_CARD, label: 'Credit Card' },
    { value: PaymentType.DEBIT_CARD, label: 'Debit Card' },
    { value: PaymentType.UPI, label: 'UPI' }
  ];

  const handleExport = () => {
    const exportData = {
      expenses: filteredExpenses.map(expense => ({
        id: expense.id,
        amount: expense.amount,
        date: expense.date,
        description: expense.description,
        category: expense.category,
        paymentMethod: expense.paymentMethod,
        ...(includeTags && { tags: expense.tags }),
        ...(includeReceipts && { receiptUrl: expense.receiptUrl })
      })),
      summary: {
        totalExpenses: filteredExpenses.length,
        totalAmount,
        dateRange: {
          start: startDate?.toISOString(),
          end: endDate?.toISOString()
        },
        filters: {
          categories: selectedCategories,
          paymentMethods: selectedPaymentMethods
        }
      }
    };

    switch (exportFormat) {
      case ExportFormat.CSV:
        exportToCSV(exportData.expenses);
        break;
      case ExportFormat.JSON:
        exportToJSON(exportData);
        break;
      case ExportFormat.PDF:
        exportToPDF(exportData);
        break;
    }
  };

  const exportToCSV = (data: any[]) => {
    const headers = [
      'ID',
      'Amount',
      'Date',
      'Description',
      'Category',
      'Payment Type',
      ...(includeTags ? ['Tags'] : []),
      ...(includeReceipts ? ['Receipt URL'] : [])
    ];

    const csvContent = [
      headers.join(','),
      ...data.map(expense => [
        expense.id,
        expense.amount,
        new Date(expense.date).toLocaleDateString(),
        `"${expense.description}"`,
        expense.category,
        expense.paymentMethod.type,
        ...(includeTags ? [`"${expense.tags?.join('; ') || ''}"`] : []),
        ...(includeReceipts ? [expense.receiptUrl || ''] : [])
      ].join(','))
    ].join('\n');

    downloadFile(csvContent, 'expenses.csv', 'text/csv');
  };

  const exportToJSON = (data: any) => {
    const jsonContent = JSON.stringify(data, null, 2);
    downloadFile(jsonContent, 'expenses.json', 'application/json');
  };

  const exportToPDF = (data: any) => {
    // In a real implementation, you would use a PDF library like jsPDF
    // For now, we'll create a simple HTML report and trigger print
    const htmlContent = `
      <html>
        <head>
          <title>Expense Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid var(--mantine-color-default-border); padding: 8px; text-align: left; }
            th { background-color: var(--mantine-color-gray-1); }
            .summary { background-color: var(--mantine-color-gray-0); padding: 15px; border-radius: ${theme.defaultRadius}; }
          </style>
        </head>
        <body>
          <h1>Expense Report</h1>
          <div class="summary">
            <h3>Summary</h3>
            <p>Total Expenses: ${data.summary.totalExpenses}</p>
            <p>Total Amount: ${formatCurrency(data.summary.totalAmount)}</p>
            <p>Date Range: ${startDate?.toLocaleDateString() || 'All'} - ${endDate?.toLocaleDateString() || 'All'}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Payment Method</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${data.expenses.map((expense: any) => `
                <tr>
                  <td>${new Date(expense.date).toLocaleDateString()}</td>
                  <td>${expense.description}</td>
                  <td>${formatCategory(expense.category)}</td>
                  <td>${expense.paymentMethod.type}</td>
                  <td>${formatCurrency(expense.amount)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const downloadFile = (content: string, filename: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setSelectedCategories([]);
    setSelectedPaymentMethods([]);
  };

  return (
    <Stack gap="lg">
      {/* Header */}
      <div>
        <Text size="xl" fw={600}>Export Data</Text>
        <Text size="sm" c="dimmed">Export your expense data in various formats</Text>
      </div>

      {/* Export Configuration */}
      <Card p="md" withBorder>
        <Text fw={500} mb="md">Export Configuration</Text>
        
        <Stack gap="md">
          {/* Format Selection */}
          <div>
            <Text size="sm" fw={500} mb="xs">Export Format</Text>
            <Group gap="sm">
              {formatOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={exportFormat === option.value ? 'filled' : 'light'}
                  leftSection={option.icon}
                  onClick={() => setExportFormat(option.value)}
                  size="sm"
                >
                  {option.label}
                </Button>
              ))}
            </Group>
          </div>

          <Divider />

          {/* Date Range */}
          <div>
            <Text size="sm" fw={500} mb="xs">Date Range</Text>
            <Group grow>
              <DateInput
                label="Start Date"
                placeholder="Select start date"
                value={startDate}
                onChange={setStartDate}
                clearable
              />
              <DateInput
                label="End Date"
                placeholder="Select end date"
                value={endDate}
                onChange={setEndDate}
                clearable
              />
            </Group>
          </div>

          {/* Filters */}
          <Group grow>
            <MultiSelect
              label="Categories"
              placeholder="Select categories"
              data={categoryOptions}
              value={selectedCategories}
              onChange={setSelectedCategories}
              clearable
            />
            <MultiSelect
              label="Payment Methods"
              placeholder="Select payment methods"
              data={paymentMethodOptions}
              value={selectedPaymentMethods}
              onChange={setSelectedPaymentMethods}
              clearable
            />
          </Group>

          {/* Options */}
          <div>
            <Text size="sm" fw={500} mb="xs">Include Options</Text>
            <Stack gap="xs">
              <Switch
                label="Include tags"
                checked={includeTags}
                onChange={(event) => setIncludeTags(event.currentTarget.checked)}
              />
              <Switch
                label="Include receipt URLs"
                checked={includeReceipts}
                onChange={(event) => setIncludeReceipts(event.currentTarget.checked)}
              />
            </Stack>
          </div>

          <Group justify="space-between">
            <Button variant="subtle" onClick={clearFilters}>
              Clear Filters
            </Button>
            <Button
              leftSection={<Download size={16} />}
              onClick={handleExport}
              disabled={filteredExpenses.length === 0}
            >
              Export Data
            </Button>
          </Group>
        </Stack>
      </Card>

      {/* Preview */}
      <Card p="md" withBorder>
        <Text fw={500} mb="md">Export Preview</Text>
        
        <Stack gap="sm">
          <Group justify="space-between">
            <Text size="sm" c="dimmed">Total Expenses to Export:</Text>
            <Badge variant="light" size="lg">{filteredExpenses.length}</Badge>
          </Group>
          
          <Group justify="space-between">
            <Text size="sm" c="dimmed">Total Amount:</Text>
            <Text fw={500}>{formatCurrency(totalAmount)}</Text>
          </Group>
          
          {startDate && (
            <Group justify="space-between">
              <Text size="sm" c="dimmed">Start Date:</Text>
              <Text size="sm">{startDate.toLocaleDateString()}</Text>
            </Group>
          )}
          
          {endDate && (
            <Group justify="space-between">
              <Text size="sm" c="dimmed">End Date:</Text>
              <Text size="sm">{endDate.toLocaleDateString()}</Text>
            </Group>
          )}
          
          {selectedCategories.length > 0 && (
            <Group justify="space-between" align="flex-start">
              <Text size="sm" c="dimmed">Categories:</Text>
              <Group gap="xs">
                {selectedCategories.map((cat) => (
                  <Badge key={cat} variant="light" size="xs">
                    {formatCategory(cat as ExpenseCategory)}
                  </Badge>
                ))}
              </Group>
            </Group>
          )}
          
          {selectedPaymentMethods.length > 0 && (
            <Group justify="space-between" align="flex-start">
              <Text size="sm" c="dimmed">Payment Methods:</Text>
              <Group gap="xs">
                {selectedPaymentMethods.map((method) => (
                  <Badge key={method} variant="light" size="xs">
                    {method.replace('_', ' ')}
                  </Badge>
                ))}
              </Group>
            </Group>
          )}
        </Stack>
      </Card>
    </Stack>
  );
};