import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Edit3, Trash2, Filter, Calendar, DollarSign, TrendingUp, Repeat } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { supabase } from '../supabaseClient';
import { UserAuth } from '../context/AuthContext';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement);

const IncomePage = () => {
  const { session } = UserAuth();
  const [income, setIncome] = useState([]);
  const [incomeSources, setIncomeSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const [filterSource, setFilterSource] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [chartType, setChartType] = useState('pie'); // pie, bar, line

  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    source_id: '',
    date: new Date().toISOString().split('T')[0],
    is_recurring: false,
    recurring_frequency: ''
  });

  const fetchIncome = async () => {
    if (!session?.user?.id) return;
    try {
      const { data, error } = await supabase
        .from('income')
        .select(`
          *,
          income_sources:source_id (
            id,
            name,
            color,
            icon
          )
        `)
        .eq('user_uuid', session.user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setIncome(data || []);
    } catch (error) {
      console.error('Error fetching income:', error);
    }
  };

  const fetchIncomeSources = async () => {
    try {
      const { data, error } = await supabase
        .from('income_sources')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setIncomeSources(data || []);
    } catch (error) {
      console.error('Error fetching income sources:', error);
    }
  };

  useEffect(() => {
    if (session?.user) {
      Promise.all([fetchIncome(), fetchIncomeSources()]).finally(() => {
        setLoading(false);
      });
    }
  }, [session]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const incomeData = {
        ...formData,
        amount: parseFloat(formData.amount),
        user_uuid: session.user.id,
        is_recurring: formData.is_recurring,
        recurring_frequency: formData.is_recurring ? formData.recurring_frequency : null
      };

      if (editingIncome) {
        const { error } = await supabase
          .from('income')
          .update(incomeData)
          .eq('id', editingIncome.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('income')
          .insert(incomeData);
        if (error) throw error;
      }

      setFormData({
        amount: '',
        description: '',
        source_id: '',
        date: new Date().toISOString().split('T')[0],
        is_recurring: false,
        recurring_frequency: ''
      });
      setShowAddForm(false);
      setEditingIncome(null);
      fetchIncome();
    } catch (error) {
      console.error('Error saving income:', error);
    }
  };

  const deleteIncome = async (id) => {
    if (!window.confirm('Are you sure you want to delete this income entry?')) return;
    try {
      const { error } = await supabase
        .from('income')
        .delete()
        .eq('id', id);
      if (error) throw error;
      fetchIncome();
    } catch (error) {
      console.error('Error deleting income:', error);
    }
  };

  const filteredIncome = useMemo(() => {
    return income.filter(entry => {
      const sourceMatch = filterSource === 'all' || entry.source_id === filterSource;
      let dateMatch = true;
      if (dateFilter !== 'all') {
        const entryDate = new Date(entry.date);
        const now = new Date();
        switch (dateFilter) {
          case 'today':
            dateMatch = entryDate.toDateString() === now.toDateString();
            break;
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            dateMatch = entryDate >= weekAgo;
            break;
          case 'month':
            dateMatch = entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear();
            break;
          case 'quarter':
            const quarter = Math.floor(now.getMonth() / 3);
            const entryQuarter = Math.floor(entryDate.getMonth() / 3);
            dateMatch = entryQuarter === quarter && entryDate.getFullYear() === now.getFullYear();
            break;
          case 'year':
            dateMatch = entryDate.getFullYear() === now.getFullYear();
            break;
        }
      }
      return sourceMatch && dateMatch;
    });
  }, [income, filterSource, dateFilter]);

  const totalIncome = filteredIncome.reduce((sum, entry) => sum + parseFloat(entry.amount), 0);
  const recurringIncome = filteredIncome.filter(entry => entry.is_recurring).reduce((sum, entry) => sum + parseFloat(entry.amount), 0);

  // Chart data
  const pieChartData = useMemo(() => {
    const sourceTotals = filteredIncome.reduce((acc, entry) => {
      const sourceName = entry.income_sources?.name || 'Unknown';
      const sourceColor = entry.income_sources?.color || '#6B7280';
      if (!acc[sourceName]) {
        acc[sourceName] = { total: 0, color: sourceColor };
      }
      acc[sourceName].total += parseFloat(entry.amount);
      return acc;
    }, {});
    return {
      labels: Object.keys(sourceTotals),
      datasets: [{
        data: Object.values(sourceTotals).map(source => source.total),
        backgroundColor: Object.values(sourceTotals).map(source => source.color),
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    };
  }, [filteredIncome]);

  const barChartData = useMemo(() => {
    const sourceTotals = filteredIncome.reduce((acc, entry) => {
      const sourceName = entry.income_sources?.name || 'Unknown';
      const sourceColor = entry.income_sources?.color || '#6B7280';
      if (!acc[sourceName]) {
        acc[sourceName] = { total: 0, color: sourceColor };
      }
      acc[sourceName].total += parseFloat(entry.amount);
      return acc;
    }, {});
    return {
      labels: Object.keys(sourceTotals),
      datasets: [{
        label: 'Income by Source',
        data: Object.values(sourceTotals).map(source => source.total),
        backgroundColor: Object.values(sourceTotals).map(source => source.color + '80'),
        borderColor: Object.values(sourceTotals).map(source => source.color),
        borderWidth: 1
      }]
    };
  }, [filteredIncome]);

  // Monthly trend data for line chart
 // Monthly trend data for line chart
const lineChartData = useMemo(() => {
  const monthlyData = {};

  filteredIncome.forEach(entry => {
    const date = new Date(entry.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; 
    // e.g. "2024-01"
    monthlyData[key] = (monthlyData[key] || 0) + parseFloat(entry.amount);
  });

  // Sort keys by real date
  const sortedKeys = Object.keys(monthlyData).sort((a, b) => new Date(a) - new Date(b));

  return {
    labels: sortedKeys.map(key => {
      const [year, month] = key.split('-');
      return new Date(year, month - 1).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    }),
    datasets: [{
      label: 'Monthly Income',
      data: sortedKeys.map(key => monthlyData[key]),
      borderColor: '#3B82F6',
      backgroundColor: '#3B82F680',
      fill: true,
      tension: 0.4
    }]
  };
}, [filteredIncome]);


  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: $${context.parsed.toLocaleString()}`;
          }
        }
      }
    }
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <p className="text-gray-600 text-sm">Total Income</p>
          <p className="text-2xl font-bold text-green-600">£{totalIncome.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <p className="text-gray-600 text-sm">Entries</p>
          <p className="text-2xl font-bold text-blue-600">{filteredIncome.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <p className="text-gray-600 text-sm">Avg per Entry</p>
          <p className="text-2xl font-bold text-purple-600">
            £{filteredIncome.length > 0 ? (totalIncome / filteredIncome.length).toFixed(2) : '0.00'}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <p className="text-gray-600 text-sm flex items-center gap-1">
            <Repeat className="h-4 w-4" />
            Recurring Income
          </p>
          <p className="text-2xl font-bold text-orange-600">£{recurringIncome.toFixed(2)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6 flex flex-wrap gap-4 items-center">
        <Filter className="h-5 w-5 text-gray-500" />
        <select 
          value={filterSource} 
          onChange={(e) => setFilterSource(e.target.value)} 
          className="border rounded-md px-3 py-1 text-sm"
        >
          <option value="all">All Sources</option>
          {incomeSources.map(source => (
            <option key={source.id} value={source.id}>{source.name}</option>
          ))}
        </select>
        <select 
          value={dateFilter} 
          onChange={(e) => setDateFilter(e.target.value)} 
          className="border rounded-md px-3 py-1 text-sm"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
          <option value="year">This Year</option>
        </select>
        <select 
          value={chartType} 
          onChange={(e) => setChartType(e.target.value)} 
          className="border rounded-md px-3 py-1 text-sm"
        >
          <option value="pie">Pie Chart</option>
          <option value="bar">Bar Chart</option>
          <option value="line">Line Chart</option>
        </select>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-sm border mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              type="number" 
              step="0.01" 
              placeholder="Amount" 
              value={formData.amount} 
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })} 
              className="border rounded-md px-3 py-2" 
              required 
            />
            <input 
              type="text" 
              placeholder="Description" 
              value={formData.description} 
              onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
              className="border rounded-md px-3 py-2" 
              required 
            />
            <select 
              value={formData.source_id} 
              onChange={(e) => setFormData({ ...formData, source_id: e.target.value })} 
              className="border rounded-md px-3 py-2" 
              required
            >
              <option value="">Select Income Source</option>
              {incomeSources.map(source => (
                <option key={source.id} value={source.id}>{source.name}</option>
              ))}
            </select>
            <input 
              type="date" 
              value={formData.date} 
              onChange={(e) => setFormData({ ...formData, date: e.target.value })} 
              className="border rounded-md px-3 py-2" 
              required 
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_recurring}
                onChange={(e) => setFormData({ ...formData, is_recurring: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm">Recurring Income</span>
            </label>
            {formData.is_recurring && (
              <select 
                value={formData.recurring_frequency} 
                onChange={(e) => setFormData({ ...formData, recurring_frequency: e.target.value })} 
                className="border rounded-md px-3 py-1 text-sm"
                required
              >
                <option value="">Select Frequency</option>
                <option value="weekly">Weekly</option>
                <option value="bi-weekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annually">Annually</option>
              </select>
            )}
          </div>
          <div className="flex gap-2">
            <button 
              type="submit" 
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
            >
              {editingIncome ? 'Update' : 'Add'} Income
            </button>
            <button 
              type="button" 
              onClick={() => { 
                setShowAddForm(false); 
                setEditingIncome(null); 
                setFormData({
                  amount: '',
                  description: '',
                  source_id: '',
                  date: new Date().toISOString().split('T')[0],
                  is_recurring: false,
                  recurring_frequency: ''
                });
              }} 
              className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-md"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Charts */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <h2 className="text-lg font-semibold mb-4">Income Visualization</h2>
        <div className="h-80">
          {chartType === 'pie' && <Pie data={pieChartData} options={chartOptions} />}
          {chartType === 'bar' && <Bar data={barChartData} options={chartOptions} />}
          {chartType === 'line' && <Line data={lineChartData} options={chartOptions} />}
        </div>
      </div>

      {/* Income List */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <h2 className="text-lg font-semibold mb-4">Income Entries</h2>
        {filteredIncome.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No income entries found. Add your first income entry above!</p>
        ) : (
          <div className="space-y-2">
            {filteredIncome.map(entry => (
              <div key={entry.id} className="flex justify-between items-center border-b py-3">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.income_sources?.color || '#6B7280' }}
                  ></div>
                  <div>
                    <p className="font-medium">{entry.description}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>{entry.income_sources?.name}</span>
                      <span>•</span>
                      <span>{new Date(entry.date).toLocaleDateString()}</span>
                      {entry.is_recurring && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Repeat className="h-3 w-3" />
                            {entry.recurring_frequency}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-green-600 font-semibold">£{parseFloat(entry.amount).toFixed(2)}</span>
                  <button 
                    onClick={() => { 
                      setEditingIncome(entry); 
                      setFormData({ 
                        ...entry, 
                        date: entry.date.split('T')[0] 
                      }); 
                      setShowAddForm(true); 
                    }}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => deleteIncome(entry.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default IncomePage;