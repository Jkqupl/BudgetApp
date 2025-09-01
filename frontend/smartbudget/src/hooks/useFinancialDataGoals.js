import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';

export const useFinancialDataGoals = (session) => {
  const [income, setIncome] = useState([]);
  const [spending, setSpending] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchIncome = async () => {
    if (!session?.user?.id) return;
    try {
      const { data, error } = await supabase
        .from('income')
        .select('*')
        .eq('user_uuid', session.user.id);

      if (error) throw error;
      setIncome(data || []);
    } catch (error) {
      console.error('Error fetching income:', error);
    }
  };

  const fetchSpending = async () => {
    if (!session?.user?.id) return;
    try {
      const { data, error } = await supabase
        .from('spending')
        .select('*')
        .eq('user_uuid', session.user.id);

      if (error) throw error;
      setSpending(data || []);
    } catch (error) {
      console.error('Error fetching spending:', error);
    }
  };

  useEffect(() => {
    if (session?.user) {
      Promise.all([fetchIncome(), fetchSpending()]).finally(() => {
        setLoading(false);
      });
    }
  }, [session,fetchIncome,fetchSpending]);

  return {
    income,
    spending,
    loading,
    refetch: () => Promise.all([fetchIncome(), fetchSpending()])
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
      availableFunds
    };
  }, [income, spending, goals]);

  return financialSummary;
};