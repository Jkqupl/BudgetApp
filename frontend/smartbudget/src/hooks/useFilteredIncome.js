import { useMemo } from 'react';

export const useFilteredIncome = (income, filterSource, dateFilter) => {
  const filteredIncome = useMemo(() => {
    return income.filter(entry => {
      const sourceMatch = filterSource === 'all' || entry.source_id === filterSource;
      
      let dateMatch = true;
      if (dateFilter !== 'all') {
        const entryDate = new Date(entry.date);
        const now = new Date();
        switch (dateFilter) {
          case 'today':
            dateMatch = entryDate.toDateString() === now.toDateString();
            break;
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            dateMatch = entryDate >= weekAgo;
            break;
          case 'month':
            dateMatch = entryDate.getMonth() === now.getMonth() && 
                      entryDate.getFullYear() === now.getFullYear();
            break;
          case 'quarter':
            const quarter = Math.floor(now.getMonth() / 3);
            const entryQuarter = Math.floor(entryDate.getMonth() / 3);
            dateMatch = entryQuarter === quarter && 
                       entryDate.getFullYear() === now.getFullYear();
            break;
          case 'year':
            dateMatch = entryDate.getFullYear() === now.getFullYear();
            break;
          default:
            dateMatch = true;
        }
      }
      return sourceMatch && dateMatch;
    });
  }, [income, filterSource, dateFilter]);

  const totalIncome = useMemo(() => {
    return filteredIncome.reduce((sum, entry) => sum + parseFloat(entry.amount), 0);
  }, [filteredIncome]);

  const recurringIncome = useMemo(() => {
    return filteredIncome
      .filter(entry => entry.is_recurring)
      .reduce((sum, entry) => sum + parseFloat(entry.amount), 0);
  }, [filteredIncome]);

  const avgPerEntry = useMemo(() => {
    return filteredIncome.length > 0 ? totalIncome / filteredIncome.length : 0;
  }, [totalIncome, filteredIncome.length]);

  return {
    filteredIncome,
    totalIncome,
    recurringIncome,
    avgPerEntry,
    entryCount: filteredIncome.length
  };
};