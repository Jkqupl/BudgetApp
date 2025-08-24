import { useMemo } from 'react';

export const useFilteredSpending = (spending, filterCategory, dateFilter) => {
  const filteredSpending = useMemo(() => {
    return spending.filter(expense => {
      const categoryMatch = filterCategory === 'all' || expense.category_id === filterCategory;
      
      let dateMatch = true;
      if (dateFilter !== 'all') {
        const expenseDate = new Date(expense.date);
        const now = new Date();
        switch (dateFilter) {
          case 'today':
            dateMatch = expenseDate.toDateString() === now.toDateString();
            break;
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            dateMatch = expenseDate >= weekAgo;
            break;
          case 'month':
            dateMatch = expenseDate.getMonth() === now.getMonth() && 
                      expenseDate.getFullYear() === now.getFullYear();
            break;
          default:
            dateMatch = true;
        }
      }
      return categoryMatch && dateMatch;
    });
  }, [spending, filterCategory, dateFilter]);

  const totalSpent = useMemo(() => {
    return filteredSpending.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
  }, [filteredSpending]);

  const avgPerTransaction = useMemo(() => {
    return filteredSpending.length > 0 ? totalSpent / filteredSpending.length : 0;
  }, [totalSpent, filteredSpending.length]);

  return {
    filteredSpending,
    totalSpent,
    avgPerTransaction,
    transactionCount: filteredSpending.length
  };
};