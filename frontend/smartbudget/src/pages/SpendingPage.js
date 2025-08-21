import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Edit3, Trash2, Filter, Calendar, DollarSign, Tag } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { supabase } from '../supabaseClient';
import { UserAuth } from '../context/AuthContext';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const SpendingPage = () => {
  const { session } = UserAuth();
  const [spending, setSpending] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [chartType, setChartType] = useState('horizontal-bar'); // Default to horizontal bar

  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category_id: '',
    date: new Date().toISOString().split('T')[0]
  });

const fetchSpending = async () => {
  if (!session?.user?.id) return;
  try {
    const { data, error } = await supabase
      .from('spending')
      .select(`
        *,
        categories:category_id (
          id,
          name,
          color,
          icon
        )
      `)
      .eq('user_uuid', session.user.id)
      .order('date', { ascending: false });

    if (error) throw error;
    setSpending(data || []);
  } catch (error) {
    console.error('Error fetching spending:', error);
  }
};

const fetchCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    console.log("Fetched categories:", data);
    setCategories(data || []);
  } catch (error) {
    console.error('Error fetching categories:', error);
  }
};

  useEffect(() => {
    if (session?.user) {
      Promise.all([fetchSpending(), fetchCategories()]).finally(() => {
        setLoading(false);
      });
    }
  }, [session]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const expenseData = {
        ...formData,
        amount: parseFloat(formData.amount),
        category_id: formData.category_id, 
        user_uuid: session.user.id
      };

      if (editingExpense) {
        const { error } = await supabase
          .from('spending')
          .update(expenseData)
          .eq('id', editingExpense.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('spending')
          .insert(expenseData);
        if (error) throw error;
      }

      setFormData({
        amount: '',
        description: '',
        category_id: '',
        date: new Date().toISOString().split('T')[0]
      });
      setShowAddForm(false);
      setEditingExpense(null);
      fetchSpending();
    } catch (error) {
      console.error('Error saving expense:', error);
    }
  };

  const deleteExpense = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      const { error } = await supabase
        .from('spending')
        .delete()
        .eq('id', id);
      if (error) throw error;
      fetchSpending();
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

const filteredSpending = useMemo(() => {
  return spending.filter(expense => {
    const categoryMatch = filterCategory === 'all' || expense.category_id === filterCategory;
    
    let dateMatch = true;
    if (dateFilter !== 'all') {
      const expenseDate = new Date(expense.date);
      const now = new Date();
      switch (dateFilter) {
        case 'today':
          dateMatch = expenseDate.toDateString() === now.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          dateMatch = expenseDate >= weekAgo;
          break;
        case 'month':
          dateMatch = expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear();
          break;
      }
    }
    return categoryMatch && dateMatch;
  });
}, [spending, filterCategory, dateFilter]);

  const totalSpent = filteredSpending.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

  // Category data for both charts
  const categoryData = useMemo(() => {
    return filteredSpending.reduce((acc, expense) => {
      const categoryName = expense.categories?.name || 'Uncategorized';
      const categoryColor = expense.categories?.color || '#6B7280';
      if (!acc[categoryName]) {
        acc[categoryName] = { total: 0, color: categoryColor };
      }
      acc[categoryName].total += parseFloat(expense.amount);
      return acc;
    }, {});
  }, [filteredSpending]);

  const pieChartData = useMemo(() => {
    return {
      labels: Object.keys(categoryData),
      datasets: [{
        data: Object.values(categoryData).map(cat => cat.total),
        backgroundColor: Object.values(categoryData).map(cat => cat.color),
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    };
  }, [categoryData]);

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const percentage = ((context.parsed / totalSpent) * 100).toFixed(1);
            return `${context.label}: £${context.parsed.toFixed(2)} (${percentage}%)`;
          }
        }
      }
    },
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <p className="text-gray-600 text-sm">Total Spent</p>
          <p className="text-2xl font-bold text-red-600">£{totalSpent.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <p className="text-gray-600 text-sm">Transactions</p>
          <p className="text-2xl font-bold text-blue-600">{filteredSpending.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <p className="text-gray-600 text-sm">Avg per Transaction</p>
          <p className="text-2xl font-bold text-green-600">
            £{filteredSpending.length > 0 ? (totalSpent / filteredSpending.length).toFixed(2) : '0.00'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6 flex flex-wrap gap-4 items-center">
        <Filter className="h-5 w-5 text-gray-500" />
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="border rounded-md px-3 py-1 text-sm">
          <option value="all">All Categories</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
        <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="border rounded-md px-3 py-1 text-sm">
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
        <select value={chartType} onChange={(e) => setChartType(e.target.value)} className="border rounded-md px-3 py-1 text-sm">
          <option value="horizontal-bar">Category Breakdown</option>
          <option value="pie">Pie Chart</option>
        </select>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-sm border mb-6 space-y-4">
          <input type="number" step="0.01" placeholder="Amount" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className="border rounded-md px-3 py-2 w-full" required />
          <input type="text" placeholder="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="border rounded-md px-3 py-2 w-full" required />
          <select value={formData.category_id} onChange={(e) => setFormData({ ...formData, category_id: e.target.value })} className="border rounded-md px-3 py-2 w-full" required>
            <option value="">Select Category</option>
            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
          <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="border rounded-md px-3 py-2 w-full" required />
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">{editingExpense ? 'Update' : 'Add'} Expense</button>
            <button type="button" onClick={() => { setShowAddForm(false); setEditingExpense(null); }} className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-md">Cancel</button>
          </div>
        </form>
      )}

      {/* Charts */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <h2 className="text-lg font-semibold mb-4">Spending by Category</h2>
        
        {chartType === 'horizontal-bar' ? (
          <div className="space-y-4">
            
            {/* Category Breakdown */}
            <div className="space-y-3">
              {Object.entries(categoryData)
                .sort(([,a], [,b]) => b.total - a.total) // Sort by amount descending
                .map(([categoryName, data]) => {
                  const percentage = ((data.total / totalSpent) * 100).toFixed(1);
                  return (
                    <div key={categoryName} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium" style={{ color: data.color }}>
                          {percentage}% {categoryName}
                        </span>
                        <span className="text-sm text-gray-600">
                          £{data.total.toLocaleString()}
                        </span>
                      </div>
                      {/* Progress bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all duration-300" 
                          style={{ 
                            width: `${percentage}%`, 
                            backgroundColor: data.color 
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        ) : (
          <div className="h-80">
            <Pie data={pieChartData} options={pieChartOptions} />
          </div>
        )}
      </div>

      {/* Transactions List */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <h2 className="text-lg font-semibold mb-4">Transactions</h2>
        <ul>
          {filteredSpending.map(expense => (
            <li key={expense.id} className="flex justify-between items-center border-b py-2">
              <div>
                <p className="font-medium">{expense.description}</p>
                <p className="text-sm text-gray-500">{new Date(expense.date).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-red-600 font-semibold">£{expense.amount.toFixed(2)}</span>
                <button onClick={() => { setEditingExpense(expense); setFormData({ ...expense, date: expense.date.split('T')[0] }); setShowAddForm(true); }}>
                  <Edit3 className="h-5 w-5 text-blue-500" />
                </button>
                <button onClick={() => deleteExpense(expense.id)}>
                  <Trash2 className="h-5 w-5 text-red-500" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SpendingPage;