import React from 'react';
import { Edit3, Trash2, Repeat } from 'lucide-react';

const IncomeList = ({ 
  filteredIncome, 
  onEdit, 
  onDelete 
}) => {
  const handleEdit = (entry) => {
    onEdit(entry);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this income entry?')) return;
    await onDelete(id);
  };

  if (filteredIncome.length === 0) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <h2 className="text-lg font-semibold mb-4">Income Entries</h2>
        <p className="text-gray-500 text-center py-8">
          No income entries found. Add your first income entry above!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <h2 className="text-lg font-semibold mb-4">Income Entries</h2>
      <div className="space-y-2">
        {filteredIncome.map(entry => (
          <div key={entry.id} className="flex justify-between items-center border-b py-3 last:border-b-0">
            <div className="flex items-center gap-3">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.income_sources?.color || '#6B7280' }}
              />
              <div>
                <p className="font-medium">{entry.description}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>{entry.income_sources?.name}</span>
                  <span>•</span>
                  <span>{new Date(entry.date).toLocaleDateString()}</span>
                  {entry.is_recurring && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Repeat className="h-3 w-3" />
                        {entry.recurring_frequency}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-green-600 font-semibold">
                £{parseFloat(entry.amount).toFixed(2)}
              </span>
              <button 
                onClick={() => handleEdit(entry)}
                className="p-1 hover:bg-blue-50 rounded transition-colors"
                title="Edit income entry"
              >
                <Edit3 className="h-4 w-4 text-blue-500 hover:text-blue-700" />
              </button>
              <button 
                onClick={() => handleDelete(entry.id)}
                className="p-1 hover:bg-red-50 rounded transition-colors"
                title="Delete income entry"
              >
                <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IncomeList;