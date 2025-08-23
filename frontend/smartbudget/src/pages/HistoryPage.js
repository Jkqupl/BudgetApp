import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Calendar, TrendingUp, TrendingDown, PoundSterling, BarChart3 } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { UserAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import useFinancialData from '../hooks/UseFinancialData';
import { getChartData, getChartOptions } from '../charts/HistoryCharts';
import { FinanceInsights } from '../components/FinanceInsights';
import { QuickStats } from '../components/QuickStats';
import { filteredData, chartData, summaryStats } from '../services/FinancialHelpers';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const HistoryPage = () => {
  const { session } = UserAuth();
  const { income, expenses, loading } = useFinancialData(session?.user?.id);
  const [timeRange, setTimeRange] = useState('6months'); // 3months, 6months, year, all
  const [groupBy, setGroupBy] = useState('month'); // week, month, quarter


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
    
    return sortedPeriods.map(period => ({
      period,
      income: incomeGrouped[period] || 0,
      expenses: expenseGrouped[period] || 0,
      net: (incomeGrouped[period] || 0) - (expenseGrouped[period] || 0)
    }));
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

        <StatCard 
          icon={TrendingUp}
          label="Total Income"
          value={`£${summaryStats.totalIncome.toLocaleString()}`}
          color="text-green-600"
        />

        <StatCard 
          icon={TrendingDown}
          label="Total Spending"
          value={`£${summaryStats.totalExpenses.toLocaleString()}`}
          color="text-red-600"
        />

        <StatCard
          icon={PoundSterling}
          label="Net Income"
          value={`£${summaryStats.netIncome.toLocaleString()}`}
          color={summaryStats.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}
        />
    
        <StatCard
          icon={Calendar}
          label="Savings Rate"
          value={`${summaryStats.savingsRate.toFixed(1)}%`}
          color={summaryStats.savingsRate >= 0 ? 'text-green-600' : 'text-red-600'}
        />

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

      {/* Chart.js Bar Chart */}
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
        <div style={{ height: '400px' }}>
          <Bar data={getChartData(chartData)} options={getChartOptions()} />
        </div>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <FinanceInsights netIncome={summaryStats.netIncome} 
                        savingsRate={summaryStats.savingsRate} 
                        />

        <QuickStats incomeEntries={filteredData.income.length} 
                    expenseEntries={filteredData.expenses.length} 
                    totalIncome={summaryStats.totalIncome} 
                    totalExpenses={summaryStats.totalExpenses} 
                    />

      </div>
    </div>
  );
};

export default HistoryPage;