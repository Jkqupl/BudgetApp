import React, { useState, useEffect } from 'react';

const IncomeForm = ({ 
  incomeSources, 
  editingIncome, 
  onSubmit, 
  onCancel 
}) => {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    source_id: '',
    date: new Date().toISOString().split('T')[0],
    is_recurring: false,
    recurring_frequency: ''
  });

  // Update form data when editing income changes
  useEffect(() => {
    if (editingIncome) {
      setFormData({
        ...editingIncome,
        date: editingIncome.date.split('T')[0]
      });
    } else {
      setFormData({
        amount: '',
        description: '',
        source_id: '',
        date: new Date().toISOString().split('T')[0],
        is_recurring: false,
        recurring_frequency: ''
      });
    }
  }, [editingIncome]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await onSubmit(formData);
    if (success) {
      // Reset form only if submission was successful
      setFormData({
        amount: '',
        description: '',
        source_id: '',
        date: new Date().toISOString().split('T')[0],
        is_recurring: false,
        recurring_frequency: ''
      });
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-sm border mb-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input 
          type="number" 
          step="0.01" 
          placeholder="Amount" 
          value={formData.amount} 
          onChange={(e) => handleInputChange('amount', e.target.value)} 
          className="border rounded-md px-3 py-2" 
          required 
        />
        
        <input 
          type="text" 
          placeholder="Description" 
          value={formData.description} 
          onChange={(e) => handleInputChange('description', e.target.value)} 
          className="border rounded-md px-3 py-2" 
          required 
        />
        
        <select 
          value={formData.source_id} 
          onChange={(e) => handleInputChange('source_id', e.target.value)} 
          className="border rounded-md px-3 py-2" 
          required
        >
          <option value="">Select Income Source</option>
          {incomeSources.map(source => (
            <option key={source.id} value={source.id}>
              {source.name}
            </option>
          ))}
        </select>
        
        <input 
          type="date" 
          value={formData.date} 
          onChange={(e) => handleInputChange('date', e.target.value)} 
          className="border rounded-md px-3 py-2" 
          required 
        />
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.is_recurring}
            onChange={(e) => handleInputChange('is_recurring', e.target.checked)}
            className="rounded"
          />
          <span className="text-sm">Recurring Income</span>
        </label>
        
        {formData.is_recurring && (
          <select 
            value={formData.recurring_frequency} 
            onChange={(e) => handleInputChange('recurring_frequency', e.target.value)} 
            className="border rounded-md px-3 py-1 text-sm"
            required
          >
            <option value="">Select Frequency</option>
            <option value="weekly">Weekly</option>
            <option value="bi-weekly">Bi-weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="annually">Annually</option>
          </select>
        )}
      </div>

      <div className="flex gap-2">
        <button 
          type="submit" 
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
        >
          {editingIncome ? 'Update' : 'Add'} Income
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

export default IncomeForm;