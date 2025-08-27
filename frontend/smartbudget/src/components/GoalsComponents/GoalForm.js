import React, { useState, useEffect } from 'react';

const GoalForm = ({ editingGoal, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target_amount: '',
    target_date: '',
    color: '#3B82F6'
  });

  // Update form data when editing goal changes
  useEffect(() => {
    if (editingGoal) {
      setFormData({
        title: editingGoal.title,
        description: editingGoal.description || '',
        target_amount: editingGoal.target_amount.toString(),
        target_date: editingGoal.target_date || '',
        color: editingGoal.color
      });
    } else {
      setFormData({
        title: '',
        description: '',
        target_amount: '',
        target_date: '',
        color: '#3B82F6'
      });
    }
  }, [editingGoal]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await onSubmit(formData);
    if (success) {
      // Reset form only if submission was successful
      setFormData({
        title: '',
        description: '',
        target_amount: '',
        target_date: '',
        color: '#3B82F6'
      });
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border mb-6">
      <h2 className="text-xl font-semibold mb-4">
        {editingGoal ? 'Edit Goal' : 'Add New Goal'}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Goal Title"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          className="border rounded-md px-3 py-2"
          required
        />
        
        <input
          type="number"
          step="0.01"
          min="0.01"
          placeholder="Target Amount"
          value={formData.target_amount}
          onChange={(e) => handleInputChange('target_amount', e.target.value)}
          className="border rounded-md px-3 py-2"
          required
        />
        
        <input
          type="date"
          placeholder="Target Date (optional)"
          value={formData.target_date}
          onChange={(e) => handleInputChange('target_date', e.target.value)}
          className="border rounded-md px-3 py-2"
        />
        
        <input
          type="color"
          value={formData.color}
          onChange={(e) => handleInputChange('color', e.target.value)}
          className="border rounded-md px-3 py-2 h-10"
        />
      </div>
      
      <textarea
        placeholder="Description (optional)"
        value={formData.description}
        onChange={(e) => handleInputChange('description', e.target.value)}
        className="border rounded-md px-3 py-2 w-full mt-4"
        rows="3"
      />
      
      <div className="flex gap-2 mt-4">
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          {editingGoal ? 'Update' : 'Create'} Goal
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-md"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default GoalForm;