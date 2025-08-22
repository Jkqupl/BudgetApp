import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Edit3, Trash2, Target, TrendingUp, Calendar, PoundSterling, CheckCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { UserAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';

const GoalsPage = () => {
  const { session } = UserAuth();
  const [goals, setGoals] = useState([]);
  const [income, setIncome] = useState([]);
  const [spending, setSpending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [showAllocationModal, setShowAllocationModal] = useState(null);
  const [allocationAmount, setAllocationAmount] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target_amount: '',
    target_date: '',
    color: '#3B82F6'
  });

  // Fetch all data
  const fetchGoals = async () => {
    if (!session?.user?.id) return;
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_uuid', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error('Error fetching goals:', error);
    }
  };

  const fetchIncome = async () => {
    if (!session?.user?.id) return;
    try {
      const { data, error } = await supabase
        .from('income')
        .select('*')
        .eq('user_uuid', session.user.id);

      if (error) throw error;
      setIncome(data || []);
    } catch (error) {
      console.error('Error fetching income:', error);
    }
  };

  const fetchSpending = async () => {
    if (!session?.user?.id) return;
    try {
      const { data, error } = await supabase
        .from('spending')
        .select('*')
        .eq('user_uuid', session.user.id);

      if (error) throw error;
      setSpending(data || []);
    } catch (error) {
      console.error('Error fetching spending:', error);
    }
  };

  useEffect(() => {
    if (session?.user) {
      Promise.all([fetchGoals(), fetchIncome(), fetchSpending()]).finally(() => {
        setLoading(false);
      });
    }
  }, [session]);

  // Calculate available funds
  const financialSummary = useMemo(() => {
    const totalIncome = income.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
    const totalSpending = spending.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
    const totalAllocated = goals.reduce((sum, goal) => sum + parseFloat(goal.current_amount || 0), 0);
    const availableFunds = totalIncome - totalSpending - totalAllocated;

    return {
      totalIncome,
      totalSpending,
      totalAllocated,
      availableFunds
    };
  }, [income, spending, goals]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const goalData = {
        ...formData,
        target_amount: parseFloat(formData.target_amount),
        user_uuid: session.user.id
      };

      if (editingGoal) {
        const { error } = await supabase
          .from('goals')
          .update(goalData)
          .eq('id', editingGoal.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('goals')
          .insert(goalData);
        if (error) throw error;
      }

      setFormData({
        title: '',
        description: '',
        target_amount: '',
        target_date: '',
        color: '#3B82F6'
      });
      setShowAddForm(false);
      setEditingGoal(null);
      fetchGoals();
    } catch (error) {
      console.error('Error saving goal:', error);
      alert('Error saving goal. Please try again.');
    }
  };

  const handleAllocation = async (goalId) => {
    const amount = parseFloat(allocationAmount);
    if (!amount || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (amount > financialSummary.availableFunds) {
      alert('Insufficient funds available for allocation');
      return;
    }

    try {
      const goal = goals.find(g => g.id === goalId);
      const newAmount = parseFloat(goal.current_amount) + amount;
      
      // Prevent allocating more than target
      if (newAmount > parseFloat(goal.target_amount)) {
        alert('Cannot allocate more than the target amount');
        return;
      }

      const { error } = await supabase
        .from('goals')
        .update({ 
          current_amount: newAmount,
          is_completed: newAmount >= parseFloat(goal.target_amount)
        })
        .eq('id', goalId);

      if (error) throw error;

      setShowAllocationModal(null);
      setAllocationAmount('');
      fetchGoals();
    } catch (error) {
      console.error('Error allocating funds:', error);
      alert('Error allocating funds. Please try again.');
    }
  };

  const deleteGoal = async (id) => {
    if (!window.confirm('Are you sure you want to delete this goal? Any allocated funds will be returned to your available balance.')) return;
    
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id);
      if (error) throw error;
      fetchGoals();
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const toggleComplete = async (goal) => {
    try {
      const { error } = await supabase
        .from('goals')
        .update({ is_completed: !goal.is_completed })
        .eq('id', goal.id);
      if (error) throw error;
      fetchGoals();
    } catch (error) {
      console.error('Error updating goal:', error);
    }
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">

        <StatCard
          icon={TrendingUp}
          label="Total Income"
          value={`£${financialSummary.totalIncome.toFixed(2)}`}
          color="text-green-600"
        />

        <StatCard
          icon={PoundSterling}
          label="Total Spending"
          value={`£${financialSummary.totalSpending.toFixed(2)}`}
          color="text-red-600"  
        />

        <StatCard
          icon={Target}
          label="Allocated to Goals"
          value={`£${financialSummary.totalAllocated.toFixed(2)}`}
          color="text-blue-600"
        />

        <StatCard
          icon={PoundSterling}
          label="Available Funds"
          value={`£${financialSummary.availableFunds.toFixed(2)}`}
          color={financialSummary.availableFunds >= 0 ? 'text-purple-600' : 'text-red-600'}
        />

      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border mb-6">
          <h2 className="text-xl font-semibold mb-4">{editingGoal ? 'Edit Goal' : 'Add New Goal'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Goal Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="border rounded-md px-3 py-2"
              required
            />
            <input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="Target Amount"
              value={formData.target_amount}
              onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
              className="border rounded-md px-3 py-2"
              required
            />
            <input
              type="date"
              placeholder="Target Date (optional)"
              value={formData.target_date}
              onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
              className="border rounded-md px-3 py-2"
            />
            <input
              type="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="border rounded-md px-3 py-2 h-10"
            />
          </div>
          <textarea
            placeholder="Description (optional)"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="border rounded-md px-3 py-2 w-full mt-4"
            rows="3"
          />
          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              {editingGoal ? 'Update' : 'Create'} Goal
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setEditingGoal(null);
                setFormData({
                  title: '',
                  description: '',
                  target_amount: '',
                  target_date: '',
                  color: '#3B82F6'
                });
              }}
              className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-md"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map(goal => {
          const progress = (parseFloat(goal.current_amount) / parseFloat(goal.target_amount)) * 100;
          const isOverdue = goal.target_date && new Date(goal.target_date) < new Date() && !goal.is_completed;
          
          return (
            <div key={goal.id} className="bg-white p-6 rounded-lg shadow-sm border">
              {/* Goal Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: goal.color }}
                  />
                  <h3 className="font-semibold text-lg">{goal.title}</h3>
                  {goal.is_completed && <CheckCircle className="h-5 w-5 text-green-600" />}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setEditingGoal(goal);
                      setFormData({
                        title: goal.title,
                        description: goal.description || '',
                        target_amount: goal.target_amount.toString(),
                        target_date: goal.target_date || '',
                        color: goal.color
                      });
                      setShowAddForm(true);
                    }}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Edit3 className="h-4 w-4 text-blue-500" />
                  </button>
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              </div>

              {/* Description */}
              {goal.description && (
                <p className="text-gray-600 text-sm mb-4">{goal.description}</p>
              )}

              {/* Progress */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Progress</span>
                  <span className="text-sm font-medium">{progress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="h-3 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(progress, 100)}%`,
                      backgroundColor: goal.color
                    }}
                  />
                </div>
              </div>

              {/* Amounts */}
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-sm text-gray-600">Current</p>
                  <p className="font-semibold">£{parseFloat(goal.current_amount).toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Target</p>
                  <p className="font-semibold">£{parseFloat(goal.target_amount).toFixed(2)}</p>
                </div>
              </div>

              {/* Target Date */}
              {goal.target_date && (
                <div className={`flex items-center gap-2 mb-4 ${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">
                    Target: {new Date(goal.target_date).toLocaleDateString()}
                    {isOverdue && ' (Overdue)'}
                  </span>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                {!goal.is_completed && (
                  <button
                    onClick={() => setShowAllocationModal(goal)}
                    disabled={financialSummary.availableFunds <= 0}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-3 py-2 rounded-md text-sm transition-colors"
                  >
                    Allocate Funds
                  </button>
                )}
                <button
                  onClick={() => toggleComplete(goal)}
                  className={`flex-1 px-3 py-2 rounded-md text-sm transition-colors ${
                    goal.is_completed
                      ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {goal.is_completed ? 'Mark Incomplete' : 'Mark Complete'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {goals.length === 0 && (
        <div className="text-center py-12">
          <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">No Goals Yet</h2>
          <p className="text-gray-500 mb-4">Start by creating your first financial goal.</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
          >
            Create Your First Goal
          </button>
        </div>
      )}

      {/* Allocation Modal */}
      {showAllocationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">Allocate Funds</h2>
            <p className="text-gray-600 mb-2">Goal: {showAllocationModal.title}</p>
            <p className="text-gray-600 mb-4">Available: £{financialSummary.availableFunds.toFixed(2)}</p>
            
            <input
              type="number"
              step="0.01"
              min="0.01"
              max={Math.min(
                financialSummary.availableFunds,
                parseFloat(showAllocationModal.target_amount) - parseFloat(showAllocationModal.current_amount)
              )}
              placeholder="Amount to allocate"
              value={allocationAmount}
              onChange={(e) => setAllocationAmount(e.target.value)}
              className="border rounded-md px-3 py-2 w-full mb-4"
            />
            
            <div className="flex gap-2">
              <button
                onClick={() => handleAllocation(showAllocationModal.id)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
              >
                Allocate
              </button>
              <button
                onClick={() => {
                  setShowAllocationModal(null);
                  setAllocationAmount('');
                }}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-md"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalsPage;