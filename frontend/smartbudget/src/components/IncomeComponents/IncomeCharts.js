import React from 'react';
import { Doughnut, Bar, Line } from 'react-chartjs-2';

const IncomeCharts = ({ 
  chartType, 
  donutChartData,
  barChartData,
  lineChartData,
  donutChartOptions,
  chartOptions
}) => {
  const renderChart = () => {
    switch (chartType) {
      case 'donut':
        return <Doughnut data={donutChartData} options={donutChartOptions} />;
      case 'bar':
        return <Bar data={barChartData} options={chartOptions} />;
      case 'line':
        return <Line data={lineChartData} options={chartOptions} />;
      default:
        return <Doughnut data={donutChartData} options={donutChartOptions} />;
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
      <h2 className="text-lg font-semibold mb-4">Income Visualization</h2>
      <div className="flex justify-center">
        <div className="h-80 w-full max-w-2xl">
          {renderChart()}
        </div>
      </div>
    </div>
  );
};

export default IncomeCharts;