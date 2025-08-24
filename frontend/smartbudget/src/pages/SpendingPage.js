import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { UserAuth } from '../context/AuthContext';

// Custom Hooks
import { useSpending } from '../hooks/useSpending';
import { useFilteredSpending } from '../hooks/useFilteredSpending';
import { useCategoryData } from '../hooks/useCategoryData';

// Components
import SpendingFilters from '../components/SpendingComponents/SpendingFilters';
import SpendingForm from '../components/SpendingComponents/SpendingForm';
import SpendingStats from '../components/SpendingComponents/SpendingStats';
import SpendingCharts from '../components/SpendingComponents/SpendingCharts';
import TransactionList from '../components/SpendingComponents/TransactionList';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const SpendingPage = () => {
  const { session } = UserAuth();
  
  // State for UI controls
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [chartType, setChartType] = useState('horizontal-bar');

  // Custom hooks for data management
  const { 
    spending, 
    categories, 
    loading, 
    addExpense, 
    updateExpense, 
    deleteExpense 
  } = useSpending(session);

  const { 
    filteredSpending, 
    totalSpent, 
    avgPerTransaction, 
    transactionCount 
  } = useFilteredSpending(spending, filterCategory, dateFilter);

  const { 
    sortedCategoryEntries, 
    pieChartData 
  } = useCategoryData(filteredSpending);

  // Form handlers
  const handleFormSubmit = async (formData) => {
    try {
      let result;
      if (editingExpense) {
        result = await updateExpense(editingExpense.id, formData);
      } else {
        result = await addExpense(formData);
      }
      
      if (result.success) {
        setShowAddForm(false);
        setEditingExpense(null);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error submitting form:', error);
      return false;
    }
  };

  const handleFormCancel = () => {
    setShowAddForm(false);
    setEditingExpense(null);
  };

  const handleEditTransaction = (expense) => {
    setEditingExpense(expense);
    setShowAddForm(true);
  };

  const handleDeleteTransaction = async (id) => {
    await deleteExpense(id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Spending Tracker</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="h-5 w-5" /> Add Expense
        </button>
      </div>

      {/* Stats */}
      <SpendingStats
        totalSpent={totalSpent}
        transactionCount={transactionCount}
        avgPerTransaction={avgPerTransaction}
      />

      {/* Filters */}
      <SpendingFilters
        categories={categories}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        chartType={chartType}
        setChartType={setChartType}
      />

      {/* Add/Edit Form */}
      {showAddForm && (
        <SpendingForm
          categories={categories}
          editingExpense={editingExpense}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      )}

      {/* Charts */}
      <SpendingCharts
        chartType={chartType}
        sortedCategoryEntries={sortedCategoryEntries}
        totalSpent={totalSpent}
        pieChartData={pieChartData}
      />

      {/* Transactions List */}
      <TransactionList
        filteredSpending={filteredSpending}
        onEdit={handleEditTransaction}
        onDelete={handleDeleteTransaction}
      />
    </div>
  );
};

export default SpendingPage;