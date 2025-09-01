import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';

export const useFinancialDataGoals = (session) => {
  const [income, setIncome] = useState([]);
  const [spending, setSpending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchData = async () => {
      try {
        const { data: incomeData, error: incomeError } = await supabase
          .from('income')
          .select('*')
          .eq('user_uuid', session.user.id);

        if (incomeError) throw incomeError;

        const { data: spendingData, error: spendingError } = await supabase
          .from('spending')
          .select('*')
          .eq('user_uuid', session.user.id);

        if (spendingError) throw spendingError;

        setIncome(incomeData || []);
        setSpending(spendingData || []);
      } catch (err) {
        console.error('Error fetching financial data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session]);

  // optional refetch function
  const refetch = async () => {
    if (!session?.user?.id) return;
    try {
      const { data: incomeData } = await supabase
        .from('income')
        .select('*')
        .eq('user_uuid', session.user.id);

      const { data: spendingData } = await supabase
        .from('spending')
        .select('*')
        .eq('user_uuid', session.user.id);

      setIncome(incomeData || []);
      setSpending(spendingData || []);
    } catch (err) {
      console.error('Error refetching data:', err);
    }
  };

  return {
    income,
    spending,
    loading,
    refetch,
  };
};

export const useFinancialSummary = (income, spending, goals) => {
  const financialSummary = useMemo(() => {
    const totalIncome = income.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
    const totalSpending = spending.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
    const totalAllocated = goals.reduce((sum, goal) => sum + parseFloat(goal.current_amount || 0), 0);
    const availableFunds = totalIncome - totalSpending - totalAllocated;

    return {
      totalIncome,
      totalSpending,
      totalAllocated,
      availableFunds,
    };
  }, [income, spending, goals]);

  return financialSummary;
};
