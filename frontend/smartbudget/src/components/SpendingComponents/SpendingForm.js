import React, { useState, useEffect } from 'react';

const SpendingForm = ({ 
  categories, 
  editingExpense, 
  onSubmit, 
  onCancel 
}) => {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category_id: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Update form data when editing expense changes
  useEffect(() => {
    if (editingExpense) {
      setFormData({
        ...editingExpense,
        date: editingExpense.date.split('T')[0]
      });
    } else {
      setFormData({
        amount: '',
        description: '',
        category_id: '',
        date: new Date().toISOString().split('T')[0]
      });
    }
  }, [editingExpense]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await onSubmit(formData);
    if (success) {
      // Reset form only if submission was successful
      setFormData({
        amount: '',
        description: '',
        category_id: '',
        date: new Date().toISOString().split('T')[0]
      });
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-sm border mb-6 space-y-4">
      <input 
        type="number" 
        step="0.01" 
        placeholder="Amount" 
        value={formData.amount} 
        onChange={(e) => handleInputChange('amount', e.target.value)} 
        className="border rounded-md px-3 py-2 w-full" 
        required 
      />
      
      <input 
        type="text" 
        placeholder="Description" 
        value={formData.description} 
        onChange={(e) => handleInputChange('description', e.target.value)} 
        className="border rounded-md px-3 py-2 w-full" 
        required 
      />
      
      <select 
        value={formData.category_id} 
        onChange={(e) => handleInputChange('category_id', e.target.value)} 
        className="border rounded-md px-3 py-2 w-full" 
        required
      >
        <option value="">Select Category</option>
        {categories.map(cat => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>
      
      <input 
        type="date" 
        value={formData.date} 
        onChange={(e) => handleInputChange('date', e.target.value)} 
        className="border rounded-md px-3 py-2 w-full" 
        required 
      />
      
      <div className="flex gap-2">
        <button 
          type="submit" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          {editingExpense ? 'Update' : 'Add'} Expense
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

export default SpendingForm;