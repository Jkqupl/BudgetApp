import { Calendar, TrendingUp, TrendingDown, PoundSterling, BarChart3 } from 'lucide-react';
import { UserAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import { useFinancialData } from '../hooks/useFinancialData';
import { getChartData, getChartOptions } from '../charts/HistoryCharts';
import { FinanceInsights } from '../components/FinanceInsights';
import { QuickStats } from '../components/QuickStats';
import { useHistoryData } from '../hooks/useHistoryData';
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
  const {income, expenses,loading} = useFinancialData(session?.user?.id);

  const {
    timeRange,
    setTimeRange,
    groupBy,
    setGroupBy,
    filteredData,
    chartData,
    summaryStats,
  } = useHistoryData(income, expenses);
  
  if (loading) { return <div className="p-6 max-w-7xl mx-auto">Loading...</div>; }

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