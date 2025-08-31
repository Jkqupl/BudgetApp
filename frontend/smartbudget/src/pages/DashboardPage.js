import { ArrowUpRight} from 'lucide-react';
import { UserAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Import your existing hooks
import { useIncome } from '../hooks/useIncome';
import { useSpending } from '../hooks/useSpending';  
import { useGoals } from '../hooks/useGoals';
import { useFinancialData } from '../hooks/useFinancialData';
import { useHistoryData } from '../hooks/useHistoryData';
import { useFilteredSpending } from '../hooks/useFilteredSpending';
import { useFilteredIncome } from '../hooks/useFilteredIncome';
import { useCategoryData } from '../hooks/useCategoryData';
import { useIncomeCharts } from '../hooks/useIncomeCharts';

// Import your existing components
import SpendingCharts from '../components/SpendingComponents/SpendingCharts';
import IncomeCharts from '../components/IncomeComponents/IncomeCharts';
import { Bar } from 'react-chartjs-2';
import { getChartData, getChartOptions } from '../charts/HistoryCharts';
import GoalsGrid from '../components/GoalsComponents/GoalsGrid';

const DashboardPage = () => {
  const { session } = UserAuth();
  const navigate = useNavigate();
  
  // Navigation handler
  const handleNavigation = (path) => {
    navigate(path);
  };

  // Data hooks
  const { income: incomeEntries, loading: incomeLoading } = useIncome(session);
  const { spending, loading: spendingLoading } = useSpending(session);
  const { goals, loading: goalsLoading } = useGoals(session);
  
  // Financial data
  const { income: allIncome, expenses: allExpenses, loading: financialLoading } = useFinancialData(session?.user?.id);
  
  // History data
  const { chartData } = useHistoryData(allIncome, allExpenses);
  
  // Filtered data for charts
  const { filteredSpending, totalSpent } = useFilteredSpending(spending, 'all', 'all');
  const { filteredIncome, totalIncome } = useFilteredIncome(incomeEntries, 'all', 'all');
  const { sortedCategoryEntries, pieChartData } = useCategoryData(filteredSpending);
  const { donutChartData, barChartData, lineChartData, donutChartOptions, chartOptions } = useIncomeCharts(filteredIncome);


  const loading = incomeLoading || spendingLoading || goalsLoading || financialLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Dashboard card component with proper content containment
  const DashboardCard = ({ title, children, onClick, className = "" }) => (
    <div 
      onClick={onClick}
      className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group border border-gray-100 overflow-hidden ${className}`}
    >
      <div className="p-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <ArrowUpRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
        </div>
        <div className="flex-1 min-h-0">
          {children}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* Main Dashboard Cards Grid - More reasonable sizing */}
      <div className="grid grid-cols-3 grid-rows-2 gap-6 min-h-[600px]">
        
        {/* Income Card - Row 1, Column 1 */}
        <DashboardCard
          title="Income Overview"
          onClick={() => handleNavigation('/income')}
          className="row-start-1 col-start-1 min-h-[280px]"
        >
          <div className="flex flex-col h-full">
            <div className="mb-4 flex-shrink-0">
              <p className="text-xl font-bold text-green-600">£{totalIncome?.toLocaleString() || '0'}</p>
              <p className="text-xs text-gray-500">Total Income</p>
            </div>
            <div className="flex-1 min-h-[180px] [&>div]:border-0 [&>div]:shadow-none [&>div]:bg-transparent [&>div]:p-0">
              <IncomeCharts
                chartType="donut"
                donutChartData={donutChartData}
                barChartData={barChartData}
                lineChartData={lineChartData}
                donutChartOptions={{
                  ...donutChartOptions,
                  maintainAspectRatio: false,
                  responsive: true,
                   plugins: {
                    legend: {
                      position: "bottom", // ⬅️ Moves categories to bottom
                      labels: {
                        boxWidth: 12,
                        font: { size: 12 }
                      }
                    }
                  }

                }}
                chartOptions={chartOptions}
              />
            </div>
          </div>
        </DashboardCard>

        {/* Spending Card - Row 1, Column 2 */}
        <DashboardCard
          title="Spending Overview"
          onClick={() => handleNavigation('/expenses')}
          className="row-start-1 col-start-2 min-h-[280px]"
        >
          <div className="flex flex-col h-full">
            <div className="mb-4 flex-shrink-0">
              <p className="text-xl font-bold text-red-600">£{totalSpent?.toLocaleString() || '0'}</p>
              <p className="text-xs text-gray-500">Total Spent</p>
            </div>
            <div className="flex-1 min-h-[180px] [&>div]:border-0 [&>div]:shadow-none [&>div]:bg-transparent [&>div]:p-0">
              <SpendingCharts
                chartType="horizontal-bar"
                sortedCategoryEntries={sortedCategoryEntries}
                totalSpent={totalSpent}
                pieChartData={pieChartData}
                options={{
                  maintainAspectRatio: false,
                  responsive: true
                }}
              />
            </div>
          </div>
        </DashboardCard>

        {/* Goals Card - Row 1 & 2, Column 3 (spans both rows) */}
        <DashboardCard
          title="Goals Progress"
          onClick={() => handleNavigation('/goals')}
          className="row-start-1 col-start-3 row-span-2 flex flex-col min-h-[580px]"
        >
          <div className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto pr-2">
              {/* Custom wrapper to override GoalsGrid's responsive grid */}
              <div className="[&>div]:!grid-cols-1 [&>div]:!gap-3">
                <GoalsGrid
                  goals={goals.slice(0, 4)} // Limit to 4 goals for dashboard space
                  financialSummary={null}
                  onEdit={() => {}}
                  onDelete={() => {}}
                  onAllocate={() => {}}
                  onToggleComplete={() => {}}
                  readOnly={true}
                />
              </div>
              
              {goals.length > 4 && (
                <div className="text-center text-xs text-gray-500 py-2 mt-2">
                  +{goals.length - 4} more goals
                </div>
              )}
            </div>
          </div>
        </DashboardCard>

        {/* History Card - Row 2, Columns 1 & 2 (spans both columns) */}
        <DashboardCard
          title="Financial History"
          onClick={() => handleNavigation('/history')}
          className="row-start-2 col-start-1 col-span-2 min-h-[280px]"
        >
          <div className="flex flex-col h-full">
            <div className="mb-4 flex-shrink-0">
              <p className="text-sm font-semibold text-gray-900">Income vs Expenses</p>
              <p className="text-xs text-gray-500">Historical comparison</p>
            </div>
            <div className="flex-1 min-h-[180px]">
              <Bar 
                data={getChartData(chartData)} 
                options={{
                  ...getChartOptions(),
                  maintainAspectRatio: false,
                  responsive: true
                }} 
              />
            </div>
          </div>
        </DashboardCard>

      </div>
    </div>
  );
};

export default DashboardPage;