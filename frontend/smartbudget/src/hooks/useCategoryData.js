import { useMemo } from 'react';

export const useCategoryData = (filteredSpending) => {
  const categoryData = useMemo(() => {
    return filteredSpending.reduce((acc, expense) => {
      const categoryName = expense.categories?.name || 'Uncategorized';
      const categoryColor = expense.categories?.color || '#6B7280';
      if (!acc[categoryName]) {
        acc[categoryName] = { total: 0, color: categoryColor };
      }
      acc[categoryName].total += parseFloat(expense.amount);
      return acc;
    }, {});
  }, [filteredSpending]);

  const totalSpent = useMemo(() => {
    return filteredSpending.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
  }, [filteredSpending]);

  const pieChartData = useMemo(() => {
    return {
      labels: Object.keys(categoryData),
      datasets: [{
        data: Object.values(categoryData).map(cat => cat.total),
        backgroundColor: Object.values(categoryData).map(cat => cat.color),
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    };
  }, [categoryData]);

  const sortedCategoryEntries = useMemo(() => {
    return Object.entries(categoryData)
      .sort(([,a], [,b]) => b.total - a.total);
  }, [categoryData]);

  return {
    categoryData,
    pieChartData,
    sortedCategoryEntries,
    totalSpent
  };
};