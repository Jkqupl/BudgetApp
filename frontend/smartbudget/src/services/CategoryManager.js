import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Tag, Palette } from 'lucide-react';
import { CategoryService } from '/spendingService';
import { UserAuth } from '../context/AuthContext';

const CategoryManager = ({ onClose, onCategoryChange }) => {
  const { session } = UserAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    color: '#3B82F6',
    icon: 'tag'
  });

  // Color options
  const colorOptions = [
    '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16',
    '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9',
    '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF',
    '#EC4899', '#F43F5E', '#6B7280', '#374151', '#1F2937'
  ];

  // Icon options
  const iconOptions = [
    'tag', 'utensils', 'car', 'shopping-bag', 'film', 'receipt',
    'heart', 'home', 'briefcase', 'plane', 'coffee', 'book',
    'gamepad', 'music', 'camera', 'gift', 'tool', 'more-horizontal'
  ];

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const result = await CategoryService.getCategories(session?.user?.id);
      if (result.success) {
        // Separate user categories from default ones
        const userCategories = result.data.filter(cat => cat.user_uuid === session?.user?.id);
        const defaultCategories = result.data.filter(cat => cat.user_uuid === null);
        setCategories([...userCategories, ...defaultCategories]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchCategories();
    }
  }, [session]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const categoryData = {
        ...formData,
        user_uuid: session.user.id
      };

      let result;
      if (editingCategory) {
        result = await CategoryService.updateCategory(editingCategory.id, categoryData);
      } else {
        result = await CategoryService.createCategory(categoryData);
      }

      if (result.success) {
        // Reset form
        setFormData({
          name: '',
          color: '#3B82F6',
          icon: 'tag'
        });
        setShowAddForm(false);
        setEditingCategory(null);
        
        // Refresh categories
        await fetchCategories();
        
        // Notify parent component
        if (onCategoryChange) {
          onCategoryChange();
        }
      }
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  // Delete category
  const deleteCategory = async (id, hasSpending = false) => {
    if (hasSpending) {
      alert('Cannot delete category that has spending records. Please reassign or delete the spending records first.');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this category?')) return;
    
    try {
      const result = await CategoryService.deleteCategory(id);
      if (result.success) {
        await fetchCategories();
        if (onCategoryChange) {
          onCategoryChange();
        }
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  // Start editing
  const startEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      color: category.color,
      icon: category.icon
    });
    setShowAddForm(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Manage Categories</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
            >
              <Plus className="h-4 w-4" />
              Add Category
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Categories List */}
        <div className="p-6 max-h-96 overflow-y-auto">
          <div className="grid gap-3">
            {categories.map(category => (
              <div 
                key={category.id} 
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <Tag className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{category.name}</span>
                  {!category.user_uuid && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      Default
                    </span>
                  )}
                </div>
                
                {category.user_uuid && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(category)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteCategory(category.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="border-t p-6 bg-gray-50">
            <h3 className="text-lg font-medium mb-4">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter category name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Color</label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                      className={`w-8 h-8 rounded-full border-2 ${
                        formData.color === color ? 'border-gray-800' : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleSubmit(e);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
                >
                  {editingCategory ? 'Update Category' : 'Add Category'}
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingCategory(null);
                    setFormData({
                      name: '',
                      color: '#3B82F6',
                      icon: 'tag'
                    });
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryManager;