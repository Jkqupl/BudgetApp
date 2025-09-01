import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';

export const useSpending = (session) => {
  const [spending, setSpending] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSpending = useCallback(async () => {
    if (!session?.user?.id) return;
    try {
      const { data, error } = await supabase
        .from('spending')
        .select(`
          *,
          categories:category_id (
            id,
            name,
            color,
            icon
          )
        `)
        .eq('user_uuid', session.user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setSpending(data || []);
    } catch (error) {
      console.error('Error fetching spending:', error);
    }
  }, [session?.user?.id]);

  const fetchCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []); // No dependencies since it doesn't depend on session

  const addExpense = async (expenseData) => {
    try {
      const { error } = await supabase
        .from('spending')
        .insert({
          ...expenseData,
          amount: parseFloat(expenseData.amount),
          user_uuid: session.user.id
        });
      if (error) throw error;
      await fetchSpending();
      return { success: true };
    } catch (error) {
      console.error('Error adding expense:', error);
      return { success: false, error };
    }
  };

  const updateExpense = async (id, expenseData) => {
    try {
      const { error } = await supabase
        .from('spending')
        .update({
          ...expenseData,
          amount: parseFloat(expenseData.amount),
        })
        .eq('id', id);
      if (error) throw error;
      await fetchSpending();
      return { success: true };
    } catch (error) {
      console.error('Error updating expense:', error);
      return { success: false, error };
    }
  };

  const deleteExpense = async (id) => {
    try {
      const { error } = await supabase
        .from('spending')
        .delete()
        .eq('id', id);
      if (error) throw error;
      await fetchSpending();
      return { success: true };
    } catch (error) {
      console.error('Error deleting expense:', error);
      return { success: false, error };
    }
  };

  useEffect(() => {
    if (session?.user) {
      Promise.all([fetchSpending(), fetchCategories()]).finally(() => {
        setLoading(false);
      });
    }
  }, [session, fetchSpending, fetchCategories]); // Now both functions are included

  return {
    spending,
    categories,
    loading,
    addExpense,
    updateExpense,
    deleteExpense,
    refetch: fetchSpending
  };
};