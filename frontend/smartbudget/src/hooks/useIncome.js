import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export const useIncome = (session) => {
  const [income, setIncome] = useState([]);
  const [incomeSources, setIncomeSources] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchIncome = async () => {
    if (!session?.user?.id) return;
    try {
      const { data, error } = await supabase
        .from('income')
        .select(`
          *,
          income_sources:source_id (
            id,
            name,
            color,
            icon
          )
        `)
        .eq('user_uuid', session.user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setIncome(data || []);
    } catch (error) {
      console.error('Error fetching income:', error);
    }
  };

  const fetchIncomeSources = async () => {
    try {
      const { data, error } = await supabase
        .from('income_sources')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setIncomeSources(data || []);
    } catch (error) {
      console.error('Error fetching income sources:', error);
    }
  };

  const addIncome = async (incomeData) => {
    try {
      const dataToInsert = {
        ...incomeData,
        amount: parseFloat(incomeData.amount),
        user_uuid: session.user.id,
        is_recurring: incomeData.is_recurring,
        recurring_frequency: incomeData.is_recurring ? incomeData.recurring_frequency : null
      };

      const { error } = await supabase
        .from('income')
        .insert(dataToInsert);
      
      if (error) throw error;
      await fetchIncome();
      return { success: true };
    } catch (error) {
      console.error('Error adding income:', error);
      return { success: false, error };
    }
  };

  const updateIncome = async (id, incomeData) => {
    try {
      const dataToUpdate = {
        ...incomeData,
        amount: parseFloat(incomeData.amount),
        is_recurring: incomeData.is_recurring,
        recurring_frequency: incomeData.is_recurring ? incomeData.recurring_frequency : null
      };

      const { error } = await supabase
        .from('income')
        .update(dataToUpdate)
        .eq('id', id);
      
      if (error) throw error;
      await fetchIncome();
      return { success: true };
    } catch (error) {
      console.error('Error updating income:', error);
      return { success: false, error };
    }
  };

  const deleteIncome = async (id) => {
    try {
      const { error } = await supabase
        .from('income')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      await fetchIncome();
      return { success: true };
    } catch (error) {
      console.error('Error deleting income:', error);
      return { success: false, error };
    }
  };

  useEffect(() => {
    if (session?.user) {
      Promise.all([fetchIncome(), fetchIncomeSources()]).finally(() => {
        setLoading(false);
      });
    }
  }, [session]);

  return {
    income,
    incomeSources,
    loading,
    addIncome,
    updateIncome,
    deleteIncome,
    refetch: fetchIncome
  };
};