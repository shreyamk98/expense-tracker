import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from '../components/Dashboard/Dashboard';
import { ExpenseList } from '../components/ExpenseList/ExpenseList';
import { Insights } from '../components/Insights/Insights';
import { BudgetManagement } from '../components/Budget/BudgetManagement';
import { Export } from '../components/Export/Export';
import { UserProfile } from '../components/Auth/UserProfile';
import { Settings } from '../components/Settings/Settings';
import { ExpenseForm } from '../components/ExpenseForm/ExpenseForm';
import { useExpenseRTK } from '../hooks/useExpenseRTK';
import { useGetPaymentMethodsQuery } from '../store/api/budgetApi';

export const AppRoutes: React.FC = () => {
  const { addExpense, editExpense } = useExpenseRTK();
  const { data: paymentMethods } = useGetPaymentMethodsQuery();
  const [expenseFormOpen, setExpenseFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);

  const handleAddExpense = () => {
    setEditingExpense(null);
    setExpenseFormOpen(true);
  };

  const handleEditExpense = (expense: any) => {
    setEditingExpense(expense);
    setExpenseFormOpen(true);
  };

  const handleExpenseSubmit = async (expenseData: any) => {
    try {
      if (editingExpense) {
        await editExpense(editingExpense.id, expenseData);
      } else {
        await addExpense(expenseData);
      }
      setExpenseFormOpen(false);
      setEditingExpense(null);
    } catch (error) {
      console.error('Failed to save expense:', error);
    }
  };

  const handleExpenseCancel = () => {
    setExpenseFormOpen(false);
    setEditingExpense(null);
  };

  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route 
          path="/dashboard" 
          element={<Dashboard onAddExpense={handleAddExpense} />} 
        />
        <Route 
          path="/expenses" 
          element={<ExpenseList onEdit={handleEditExpense} />} 
        />
        <Route path="/insights" element={<Insights />} />
        <Route path="/budgets" element={<BudgetManagement />} />
        <Route path="/export" element={<Export />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>

      <ExpenseForm
        expense={editingExpense}
        onSubmit={handleExpenseSubmit}
        onCancel={handleExpenseCancel}
        isOpen={expenseFormOpen}
        paymentMethods={paymentMethods || { cards: [], upiApps: [] }}
      />
    </>
  );
};