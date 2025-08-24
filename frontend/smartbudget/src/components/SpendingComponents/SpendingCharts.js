import React from 'react';
import { Pie } from 'react-chartjs-2';

const SpendingCharts = ({ 
  chartType, 
  sortedCategoryEntries, 
  totalSpent, 
  pieChartData 
}) => {
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

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
      <h2 className="text-lg font-semibold mb-4">Spending by Category</h2>
      
      {chartType === 'horizontal-bar' ? (
        <div className="space-y-4">
          <div className="space-y-3">
            {sortedCategoryEntries.map(([categoryName, data]) => {
              const percentage = totalSpent > 0 ? ((data.total / totalSpent) * 100).toFixed(1) : 0;
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
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-300" 
                      style={{ 
                        width: `${percentage}%`, 
                        backgroundColor: data.color 
                      }}
                    />
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
  );
};

export default SpendingCharts;