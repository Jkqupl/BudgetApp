import { useState } from 'react';
import { Plus } from 'lucide-react';
import { UserAuth } from '../context/AuthContext';

// Custom Hooks
import { useGoals } from '../hooks/useGoals';
import { useFinancialDataGoals, useFinancialSummary } from '../hooks/useFinancialDataGoals';

// Components
import FinancialSummary from '../components/GoalsComponents/FinancialSummary';
import GoalForm from '../components/GoalsComponents/GoalForm';
import GoalsGrid from '../components/GoalsComponents/GoalsGrid';
import AllocationModal from '../components/GoalsComponents/AllocationModal';

const GoalsPage = () => {
  const { session } = UserAuth();
  
  // State for UI controls
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [showAllocationModal, setShowAllocationModal] = useState(null);

  // Custom hooks for data management
  const { 
    goals, 
    loading: goalsLoading, 
    addGoal, 
    updateGoal, 
    deleteGoal,
    allocateFunds,
    toggleComplete
  } = useGoals(session);

  const { 
    income, 
    spending, 
    loading: financialLoading 
  } = useFinancialDataGoals(session);

  const financialSummary = useFinancialSummary(income, spending, goals);

  const loading = goalsLoading || financialLoading;

  // Form handlers
  const handleFormSubmit = async (formData) => {
    try {
      let result;
      if (editingGoal) {
        result = await updateGoal(editingGoal.id, formData);
      } else {
        result = await addGoal(formData);
      }
      
      if (result.success) {
        setShowAddForm(false);
        setEditingGoal(null);
        return true;
      } else {
        alert('Error saving goal. Please try again.');
        return false;
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error saving goal. Please try again.');
      return false;
    }
  };

  const handleFormCancel = () => {
    setShowAddForm(false);
    setEditingGoal(null);
  };

  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    setShowAddForm(true);
  };

  const handleDeleteGoal = async (id) => {
    const result = await deleteGoal(id);
    if (!result.success) {
      alert('Error deleting goal. Please try again.');
    }
  };

  const handleAllocateClick = (goal) => {
    setShowAllocationModal(goal);
  };

  const handleAllocation = async (goalId, amount) => {
    const result = await allocateFunds(goalId, amount);
    if (result.success) {
      return true;
    } else {
      return false;
    }
  };

  const handleToggleComplete = async (goalId, currentStatus) => {
    const result = await toggleComplete(goalId, currentStatus);
    if (!result.success) {
      alert('Error updating goal status. Please try again.');
    }
  };

  const handleCloseAllocationModal = () => {
    setShowAllocationModal(null);
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
        <h1 className="text-3xl font-bold text-gray-900">Financial Goals</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="h-5 w-5" /> Add Goal
        </button>
      </div>

      {/* Financial Summary */}
      <FinancialSummary financialSummary={financialSummary} />

      {/* Add/Edit Form */}
      {showAddForm && (
        <GoalForm
          editingGoal={editingGoal}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      )}

      {/* Goals Grid */}
      <GoalsGrid
        goals={goals}
        financialSummary={financialSummary}
        onEdit={handleEditGoal}
        onDelete={handleDeleteGoal}
        onAllocate={handleAllocateClick}
        onToggleComplete={handleToggleComplete}
      />

      {/* Allocation Modal */}
      <AllocationModal
        goal={showAllocationModal}
        financialSummary={financialSummary}
        isOpen={!!showAllocationModal}
        onAllocate={handleAllocation}
        onClose={handleCloseAllocationModal}
      />
    </div>
  );
};

export default GoalsPage;