import React from 'react';
import { Filter } from 'lucide-react';

const SpendingFilters = ({ 
  categories, 
  filterCategory, 
  setFilterCategory,
  dateFilter,
  setDateFilter,
  chartType,
  setChartType
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border mb-6 flex flex-wrap gap-4 items-center">
      <Filter className="h-5 w-5 text-gray-500" />
      
      <select 
        value={filterCategory} 
        onChange={(e) => setFilterCategory(e.target.value)} 
        className="border rounded-md px-3 py-1 text-sm"
      >
        <option value="all">All Categories</option>
        {categories.map(category => (
          <option key={category.id} value={category.id}>
            {category.name}
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
      </select>
      
      <select 
        value={chartType} 
        onChange={(e) => setChartType(e.target.value)} 
        className="border rounded-md px-3 py-1 text-sm"
      >
        <option value="horizontal-bar">Category Breakdown</option>
        <option value="pie">Pie Chart</option>
      </select>
    </div>
  );
};

export default SpendingFilters;