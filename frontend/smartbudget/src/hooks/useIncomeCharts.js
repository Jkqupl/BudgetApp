import { useMemo } from 'react';

export const useIncomeCharts = (filteredIncome) => {
  // Source totals for charts
  const sourceTotals = useMemo(() => {
    return filteredIncome.reduce((acc, entry) => {
      const sourceName = entry.income_sources?.name || 'Unknown';
      const sourceColor = entry.income_sources?.color || '#6B7280';
      if (!acc[sourceName]) {
        acc[sourceName] = { total: 0, color: sourceColor };
      }
      acc[sourceName].total += parseFloat(entry.amount);
      return acc;
    }, {});
  }, [filteredIncome]);

  // Donut chart data
  const donutChartData = useMemo(() => {
    return {
      labels: Object.keys(sourceTotals),
      datasets: [{
        data: Object.values(sourceTotals).map(source => source.total),
        backgroundColor: Object.values(sourceTotals).map(source => source.color),
        borderWidth: 2,
        borderColor: '#ffffff',
        cutout: '80%' // Creates the donut effect
      }]
    };
  }, [sourceTotals]);

  // Bar chart data
  const barChartData = useMemo(() => {
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
  }, [sourceTotals]);

  // Monthly trend data for line chart
  const lineChartData = useMemo(() => {
    const monthlyData = {};

    filteredIncome.forEach(entry => {
      const date = new Date(entry.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; 
      monthlyData[key] = (monthlyData[key] || 0) + parseFloat(entry.amount);
    });

    // Sort keys by date
    const sortedKeys = Object.keys(monthlyData).sort((a, b) => new Date(a) - new Date(b));

    return {
      labels: sortedKeys.map(key => {
        const [year, month] = key.split('-');
        return new Date(year, month - 1).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short' 
        });
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

  // Chart options
  const donutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        align: 'center',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: £${value.toLocaleString()} (${percentage}%)`;
          }
        }
      }
    },
    layout: {
      padding: 20
    }
  };

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
            return `${context.label}: £${context.parsed.toLocaleString()}`;
          }
        }
      }
    }
  };

  return {
    donutChartData,
    barChartData,
    lineChartData,
    donutChartOptions,
    chartOptions,
    sourceTotals
  };
};