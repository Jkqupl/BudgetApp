import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement } from 'chart.js';
import { UserAuth } from '../context/AuthContext';

// Custom Hooks
import { useIncome } from '../hooks/useIncome';
import { useFilteredIncome } from '../hooks/useFilteredIncome';
import { useIncomeCharts } from '../hooks/useIncomeCharts';

// Components
import IncomeStats from '../components/IncomeComponents/IncomeStats';
import IncomeFilters from '../components/IncomeComponents/IncomeFilters';
import IncomeForm from '../components/IncomeComponents/IncomeForm';
import IncomeCharts from '../components/IncomeComponents/IncomeCharts';
import IncomeList from '../components/IncomeComponents/IncomeList';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement);

const IncomePage = () => {
  const { session } = UserAuth();
  
  // State for UI controls
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const [filterSource, setFilterSource] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [chartType, setChartType] = useState('donut');

  // Custom hooks for data management
  const { 
    income, 
    incomeSources, 
    loading, 
    addIncome, 
    updateIncome, 
    deleteIncome 
  } = useIncome(session);

  const { 
    filteredIncome, 
    totalIncome, 
    recurringIncome, 
    avgPerEntry, 
    entryCount 
  } = useFilteredIncome(income, filterSource, dateFilter);

  const { 
    donutChartData,
    barChartData,
    lineChartData,
    donutChartOptions,
    chartOptions
  } = useIncomeCharts(filteredIncome);

  // Form handlers
  const handleFormSubmit = async (formData) => {
    try {
      let result;
      if (editingIncome) {
        result = await updateIncome(editingIncome.id, formData);
      } else {
        result = await addIncome(formData);
      }
      
      if (result.success) {
        setShowAddForm(false);
        setEditingIncome(null);
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
    setEditingIncome(null);
  };

  const handleEditIncome = (entry) => {
    setEditingIncome(entry);
    setShowAddForm(true);
  };

  const handleDeleteIncome = async (id) => {
    await deleteIncome(id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Income Tracker</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="h-5 w-5" /> Add Income
        </button>
      </div>

      {/* Stats */}
      <IncomeStats
        totalIncome={totalIncome}
        entryCount={entryCount}
        avgPerEntry={avgPerEntry}
        recurringIncome={recurringIncome}
      />

      {/* Filters */}
      <IncomeFilters
        incomeSources={incomeSources}
        filterSource={filterSource}
        setFilterSource={setFilterSource}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        chartType={chartType}
        setChartType={setChartType}
      />

      {/* Add/Edit Form */}
      {showAddForm && (
        <IncomeForm
          incomeSources={incomeSources}
          editingIncome={editingIncome}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      )}

      {/* Charts */}
      <IncomeCharts
        chartType={chartType}
        donutChartData={donutChartData}
        barChartData={barChartData}
        lineChartData={lineChartData}
        donutChartOptions={donutChartOptions}
        chartOptions={chartOptions}
      />

      {/* Income List */}
      <IncomeList
        filteredIncome={filteredIncome}
        onEdit={handleEditIncome}
        onDelete={handleDeleteIncome}
      />
    </div>
  );
};

export default IncomePage;