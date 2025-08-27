import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export const useGoals = (session) => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchGoals = async () => {
    if (!session?.user?.id) return;
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_uuid', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error('Error fetching goals:', error);
    }
  };

  const addGoal = async (goalData) => {
    try {
      const dataToInsert = {
        ...goalData,
        target_amount: parseFloat(goalData.target_amount),
        user_uuid: session.user.id
      };

      const { error } = await supabase
        .from('goals')
        .insert(dataToInsert);
      
      if (error) throw error;
      await fetchGoals();
      return { success: true };
    } catch (error) {
      console.error('Error adding goal:', error);
      return { success: false, error };
    }
  };

  const updateGoal = async (id, goalData) => {
    try {
      const dataToUpdate = {
        ...goalData,
        target_amount: parseFloat(goalData.target_amount),
      };

      const { error } = await supabase
        .from('goals')
        .update(dataToUpdate)
        .eq('id', id);
      
      if (error) throw error;
      await fetchGoals();
      return { success: true };
    } catch (error) {
      console.error('Error updating goal:', error);
      return { success: false, error };
    }
  };

  const deleteGoal = async (id) => {
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      await fetchGoals();
      return { success: true };
    } catch (error) {
      console.error('Error deleting goal:', error);
      return { success: false, error };
    }
  };

  const allocateFunds = async (goalId, amount) => {
    try {
      const goal = goals.find(g => g.id === goalId);
      const newAmount = parseFloat(goal.current_amount || 0) + amount;
      
      const { error } = await supabase
        .from('goals')
        .update({ 
          current_amount: newAmount,
          is_completed: newAmount >= parseFloat(goal.target_amount)
        })
        .eq('id', goalId);

      if (error) throw error;
      await fetchGoals();
      return { success: true };
    } catch (error) {
      console.error('Error allocating funds:', error);
      return { success: false, error };
    }
  };

  const toggleComplete = async (goalId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('goals')
        .update({ is_completed: !currentStatus })
        .eq('id', goalId);
      
      if (error) throw error;
      await fetchGoals();
      return { success: true };
    } catch (error) {
      console.error('Error updating goal status:', error);
      return { success: false, error };
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchGoals().finally(() => {
        setLoading(false);
      });
    }
  }, [session]);

  return {
    goals,
    loading,
    addGoal,
    updateGoal,
    deleteGoal,
    allocateFunds,
    toggleComplete,
    refetch: fetchGoals
  };
};