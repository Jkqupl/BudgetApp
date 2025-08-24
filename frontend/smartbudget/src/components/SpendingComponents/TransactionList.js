import React from 'react';
import { Edit3, Trash2 } from 'lucide-react';

const TransactionList = ({ 
  filteredSpending, 
  onEdit, 
  onDelete 
}) => {
  const handleEdit = (expense) => {
    onEdit(expense);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    await onDelete(id);
  };

  if (filteredSpending.length === 0) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <h2 className="text-lg font-semibold mb-4">Transactions</h2>
        <p className="text-gray-500 text-center py-8">No transactions found</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <h2 className="text-lg font-semibold mb-4">Transactions</h2>
      <ul>
        {filteredSpending.map(expense => (
          <li key={expense.id} className="flex justify-between items-center border-b py-2 last:border-b-0">
            <div>
              <p className="font-medium">{expense.description}</p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{new Date(expense.date).toLocaleDateString()}</span>
                {expense.categories?.name && (
                  <>
                    <span>•</span>
                    <span 
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{ 
                        backgroundColor: expense.categories.color + '20',
                        color: expense.categories.color 
                      }}
                    >
                      {expense.categories.name}
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-red-600 font-semibold">
                £{parseFloat(expense.amount).toFixed(2)}
              </span>
              <button 
                onClick={() => handleEdit(expense)}
                className="p-1 hover:bg-blue-50 rounded transition-colors"
                title="Edit expense"
              >
                <Edit3 className="h-5 w-5 text-blue-500" />
              </button>
              <button 
                onClick={() => handleDelete(expense.id)}
                className="p-1 hover:bg-red-50 rounded transition-colors"
                title="Delete expense"
              >
                <Trash2 className="h-5 w-5 text-red-500" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TransactionList;