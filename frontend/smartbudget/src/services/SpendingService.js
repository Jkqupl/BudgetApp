// services/spendingService.js
import { supabase } from '../supabaseClient';

export class SpendingService {
  // Get all spending records for a user
  static async getSpending(userUuid) {
    try {
      const { data, error } = await supabase
        .from('spending')
        .select(`
          *,
          categories (
            id,
            name,
            color,
            icon
          )
        `)
        .eq('user_uuid', userUuid)
        .order('date', { ascending: false });

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error) {
      return { success: false, error };
    }
  }

  // Get spending with date filters
  static async getSpendingByDateRange(userUuid, startDate, endDate) {
    try {
      const { data, error } = await supabase
        .from('spending')
        .select(`
          *,
          categories (
            id,
            name,
            color,
            icon
          )
        `)
        .eq('user_uuid', userUuid)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error) {
      return { success: false, error };
    }
  }

  // Create new spending record
  static async createSpending(spendingData) {
    try {
      const { data, error } = await supabase
        .from('spending')
        .insert(spendingData)
        .select(`
          *,
          categories (
            id,
            name,
            color,
            icon
          )
        `)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error };
    }
  }

  // Update spending record
  static async updateSpending(id, spendingData) {
    try {
      const { data, error } = await supabase
        .from('spending')
        .update(spendingData)
        .eq('id', id)
        .select(`
          *,
          categories (
            id,
            name,
            color,
            icon
          )
        `)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error };
    }
  }

  // Delete spending record
  static async deleteSpending(id) {
    try {
      const { error } = await supabase
        .from('spending')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }

  // Get spending totals by category
  static async getSpendingByCategory(userUuid, startDate = null, endDate = null) {
    try {
      let query = supabase
        .from('spending')
        .select(`
          amount,
          categories (
            id,
            name,
            color
          )
        `)
        .eq('user_uuid', userUuid);

      if (startDate) query = query.gte('date', startDate);
      if (endDate) query = query.lte('date', endDate);

      const { data, error } = await query;

      if (error) throw error;

      // Group by category
      const categoryTotals = data.reduce((acc, expense) => {
        const categoryName = expense.categories?.name || 'Uncategorized';
        const categoryColor = expense.categories?.color || '#6B7280';
        
        if (!acc[categoryName]) {
          acc[categoryName] = { total: 0, color: categoryColor };
        }
        acc[categoryName].total += parseFloat(expense.amount);
        return acc;
      }, {});

      return { success: true, data: categoryTotals };
    } catch (error) {
      return { success: false, error };
    }
  }

  // Get spending statistics
  static async getSpendingStats(userUuid, period = 'month') {
    try {
      const now = new Date();
      let startDate;

      switch (period) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      const { data, error } = await supabase
        .from('spending')
        .select('amount, date')
        .eq('user_uuid', userUuid)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', now.toISOString().split('T')[0]);

      if (error) throw error;

      const total = data.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
      const count = data.length;
      const average = count > 0 ? total / count : 0;

      return {
        success: true,
        data: {
          total,
          count,
          average,
          period
        }
      };
    } catch (error) {
      return { success: false, error };
    }
  }
}

// Category Service
export class CategoryService {
  // Get all categories (user's + default)
  static async getCategories(userUuid) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .or(`user_uuid.eq.${userUuid},user_uuid.is.null`)
        .order('name');

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error) {
      return { success: false, error };
    }
  }

  // Create new category
  static async createCategory(categoryData) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert(categoryData)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error };
    }
  }

  // Update category
  static async updateCategory(id, categoryData) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update(categoryData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error };
    }
  }

  // Delete category
  static async deleteCategory(id) {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }

  // Get category usage stats
  static async getCategoryUsage(userUuid) {
    try {
      const { data, error } = await supabase
        .from('spending')
        .select(`
          category_id,
          amount,
          categories (
            name,
            color
          )
        `)
        .eq('user_uuid', userUuid);

      if (error) throw error;

      const usage = data.reduce((acc, expense) => {
        const categoryId = expense.category_id || 'uncategorized';
        const categoryName = expense.categories?.name || 'Uncategorized';
        
        if (!acc[categoryId]) {
          acc[categoryId] = {
            name: categoryName,
            count: 0,
            total: 0,
            color: expense.categories?.color || '#6B7280'
          };
        }
        
        acc[categoryId].count += 1;
        acc[categoryId].total += parseFloat(expense.amount);
        
        return acc;
      }, {});

      return { success: true, data: usage };
    } catch (error) {
      return { success: false, error };
    }
  }
}