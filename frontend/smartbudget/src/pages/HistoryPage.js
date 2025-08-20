import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, TrendingUp, TrendingDown, PoundSterlingIcon, BarChart3 } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { supabase } from '../supabaseClient';
import { UserAuth } from '../context/AuthContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const HistoryPage = () => {
  const { session } = UserAuth();
  const [income, setIncome] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('6months'); // 3months, 6months, year, all
  const [groupBy, setGroupBy] = useState('month'); // week, month, quarter

  const fetchData = async () => {
    if (!session?.user?.id) return;
    
    try {
      // Fetch income
      const { data: incomeData, error: incomeError } = await supabase
        .from('income')
        .select(`
          *,
          income_sources:source_id (
            name,
            color
          )
        `)
        .eq('user_uuid', session.user.id)
        .order('date', { ascending: true });

      if (incomeError) throw incomeError;

      // Fetch expenses (spending)
      const { data: expenseData, error: expenseError } = await supabase
        .from('spending')
        .select(`
          *,
          categories:category_id (
            name,
            color
          )
        `)
        .eq('user_uuid', session.user.id)
        .order('date', { ascending: true });

      if (expenseError) throw expenseError;

      setIncome(incomeData || []);
      setExpenses(expenseData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchData();
    }
  }, [session]);

  // Filter data based on time range
  const filteredData = useMemo(() => {
    const now = new Date();
    let startDate = new Date();

    switch (timeRange) {
      case '3months':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case '6months':
        startDate.setMonth(now.getMonth() - 6);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
        startDate = new Date('2020-01-01'); // Set to a very early date
        break;
    }

    const filteredIncome = income.filter(item => new Date(item.date) >= startDate);
    const filteredExpenses = expenses.filter(item => new Date(item.date) >= startDate);

    return { income: filteredIncome, expenses: filteredExpenses };
  }, [income, expenses, timeRange]);

  // Group data by time period
  const chartData = useMemo(() => {
    const { income: filteredIncome, expenses: filteredExpenses } = filteredData;
    
    const groupData = (data, isIncome = true) => {
      const grouped = {};
      
      data.forEach(item => {
        const date = new Date(item.date);
        let key;
        
        switch (groupBy) {
          case 'week':
            // Get week starting Monday
            const dayOfWeek = date.getDay();
            const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
            const monday = new Date(date.setDate(diff));
            key = monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            break;
          case 'month':
            key = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
            break;
          case 'quarter':
            const quarter = Math.floor(date.getMonth() / 3) + 1;
            key = `Q${quarter} ${date.getFullYear()}`;
            break;
          default:
            key = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        }
        
        if (!grouped[key]) grouped[key] = 0;
        grouped[key] += parseFloat(item.amount);
      });
      
      return grouped;
    };

    const incomeGrouped = groupData(filteredIncome, true);
    const expenseGrouped = groupData(filteredExpenses, false);
    
    // Get all unique time periods and sort them
    const allPeriods = [...new Set([...Object.keys(incomeGrouped), ...Object.keys(expenseGrouped)])];
    const sortedPeriods = allPeriods.sort((a, b) => {
      // Simple date sorting - you might want to improve this based on your needs
      return new Date(a) - new Date(b);
    });
    
    const incomeData = sortedPeriods.map(period => incomeGrouped[period] || 0);
    const expenseData = sortedPeriods.map(period => -(expenseGrouped[period] || 0)); // Negative for below x-axis
    
    return {
      labels: sortedPeriods,
      datasets: [
        {
          label: 'Income',
          data: incomeData,
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgb(34, 197, 94)',
          borderWidth: 1,
          borderRadius: 4,
          borderSkipped: false,
        },
        {
          label: 'Expenses',
          data: expenseData,
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
          borderColor: 'rgb(239, 68, 68)',
          borderWidth: 1,
          borderRadius: 4,
          borderSkipped: false,
        }
      ]
    };
  }, [filteredData, groupBy]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const { income: filteredIncome, expenses: filteredExpenses } = filteredData;
    
    const totalIncome = filteredIncome.reduce((sum, item) => sum + parseFloat(item.amount), 0);
    const totalExpenses = filteredExpenses.reduce((sum, item) => sum + parseFloat(item.amount), 0);
    const netIncome = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? ((netIncome / totalIncome) * 100) : 0;

    return {
      totalIncome,
      totalExpenses,
      netIncome,
      savingsRate
    };
  }, [filteredData]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      title: {
        display: true,
        text: 'Income vs Expenses Over Time',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.dataset.label;
            const value = Math.abs(context.parsed.y);
            return `${label}: $${value.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: function(context) {
            if (context.tick.value === 0) {
              return 'rgba(0, 0, 0, 0.3)'; // Darker line at zero
            }
            return 'rgba(0, 0, 0, 0.1)';
          },
        },
        ticks: {
          callback: function(value) {
            return '£' + Math.abs(value).toLocaleString();
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
        <h1 className="text-3xl font-bold text-gray-900">Financial History</h1>
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-gray-600" />
          <span className="text-gray-600">Income vs Expenses</span>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <p className="text-gray-600 text-sm">Total Income</p>
          </div>
          <p className="text-2xl font-bold text-green-600">
            £{summaryStats.totalIncome.toLocaleString()}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="h-5 w-5 text-red-600" />
            <p className="text-gray-600 text-sm">Total Expenses</p>
          </div>
          <p className="text-2xl font-bold text-red-600">
            £{summaryStats.totalExpenses.toLocaleString()}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-2 mb-2">
            <PoundSterlingIcon className="h-5 w-5 text-blue-600" />
            <p className="text-gray-600 text-sm">Net Income</p>
          </div>
          <p className={`text-2xl font-bold £{summaryStats.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            £{summaryStats.netIncome.toLocaleString()}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            <p className="text-gray-600 text-sm">Savings Rate</p>
          </div>
          <p className={`text-2xl font-bold £{summaryStats.savingsRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {summaryStats.savingsRate.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-500" />
          <span className="text-sm text-gray-600">Time Range:</span>
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)} 
            className="border rounded-md px-3 py-1 text-sm"
          >
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="year">Last Year</option>
            <option value="all">All Time</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-gray-500" />
          <span className="text-sm text-gray-600">Group By:</span>
          <select 
            value={groupBy} 
            onChange={(e) => setGroupBy(e.target.value)} 
            className="border rounded-md px-3 py-1 text-sm"
          >
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
            <option value="quarter">Quarterly</option>
          </select>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
        <div className="h-96">
          <Bar data={chartData} options={chartOptions} />
        </div>
        
        {/* Chart Legend/Info */}
        <div className="mt-4 pt-4 border-t flex flex-wrap gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Income (above baseline)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>Expenses (below baseline)</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Net income = Income - Expenses</span>
          </div>
        </div>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Financial Insights</h3>
          <div className="space-y-3 text-sm">
            {summaryStats.netIncome > 0 ? (
              <p className="text-green-600">✓ You're saving money! Keep up the good work.</p>
            ) : (
              <p className="text-red-600">⚠ You're spending more than you earn. Consider reducing expenses.</p>
            )}
            
            {summaryStats.savingsRate >= 20 ? (
              <p className="text-green-600">✓ Excellent savings rate of {summaryStats.savingsRate.toFixed(1)}%</p>
            ) : summaryStats.savingsRate >= 10 ? (
              <p className="text-yellow-600">○ Good savings rate of {summaryStats.savingsRate.toFixed(1)}%. Consider increasing to 20%+</p>
            ) : (
              <p className="text-red-600">⚠ Low savings rate of {summaryStats.savingsRate.toFixed(1)}%. Try to save at least 10-20%</p>
            )}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Income Entries:</span>
              <span className="font-medium">{filteredData.income.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Expense Entries:</span>
              <span className="font-medium">{filteredData.expenses.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg Income per Entry:</span>
              <span className="font-medium text-green-600">
                £{filteredData.income.length > 0 ? (summaryStats.totalIncome / filteredData.income.length).toFixed(0) : '0'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg Expense per Entry:</span>
              <span className="font-medium text-red-600">
                £{filteredData.expenses.length > 0 ? (summaryStats.totalExpenses / filteredData.expenses.length).toFixed(0) : '0'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;