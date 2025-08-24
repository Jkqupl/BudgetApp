import React from 'react';
import { Filter } from 'lucide-react';

const IncomeFilters = ({ 
  incomeSources, 
  filterSource, 
  setFilterSource,
  dateFilter,
  setDateFilter,
  chartType,
  setChartType
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border mb-6 flex flex-wrap gap-4 items-center">
      <Filter className="h-5 w-5 text-gray-500" />
      
      <select 
        value={filterSource} 
        onChange={(e) => setFilterSource(e.target.value)} 
        className="border rounded-md px-3 py-1 text-sm"
      >
        <option value="all">All Sources</option>
        {incomeSources.map(source => (
          <option key={source.id} value={source.id}>
            {source.name}
          </option>
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
        <option value="donut">Donut Chart</option>
        <option value="bar">Bar Chart</option>
        <option value="line">Line Chart</option>
      </select>
    </div>
  );
};

export default IncomeFilters;