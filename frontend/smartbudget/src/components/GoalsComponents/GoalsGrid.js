import React from 'react';
import { Edit3, Trash2, Calendar, CheckCircle, Target } from 'lucide-react';

const GoalsGrid = ({ 
  goals, 
  financialSummary,
  onEdit, 
  onDelete, 
  onAllocate, 
  onToggleComplete,
  readOnly = false // 👈 NEW PROP
}) => {
  const handleEdit = (goal) => {
    onEdit(goal);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this goal? Any allocated funds will be returned to your available balance.')) return;
    await onDelete(id);
  };

  if (goals.length === 0) {
    return (
      <div className="text-center py-12">
        <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-600 mb-2">No Goals Yet</h2>
        <p className="text-gray-500 mb-4">Start by creating your first financial goal.</p>
        {!readOnly && ( // 👈 Hide the "Create" button in readOnly
          <button
            onClick={() => onEdit(null)} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
          >
            Create Your First Goal
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {goals.map(goal => {
        const progress = (parseFloat(goal.current_amount || 0) / parseFloat(goal.target_amount)) * 100;
        const isOverdue = goal.target_date && new Date(goal.target_date) < new Date() && !goal.is_completed;
        
        return (
          <div key={goal.id} className="bg-white p-6 rounded-lg shadow-sm border">
            {/* Goal Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: goal.color }}
                />
                <h3 className="font-semibold text-lg">{goal.title}</h3>
                {goal.is_completed && <CheckCircle className="h-5 w-5 text-green-600" />}
              </div>

              {!readOnly && ( // 👈 Hide edit/delete buttons in readOnly
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(goal)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    title="Edit goal"
                  >
                    <Edit3 className="h-4 w-4 text-blue-500" />
                  </button>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    title="Delete goal"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              )}
            </div>

            {/* Description */}
            {goal.description && (
              <p className="text-gray-600 text-sm mb-4">{goal.description}</p>
            )}

            {/* Progress */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Progress</span>
                <span className="text-sm font-medium">{progress.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="h-3 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(progress, 100)}%`,
                    backgroundColor: goal.color
                  }}
                />
              </div>
            </div>

            {/* Amounts */}
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-sm text-gray-600">Current</p>
                <p className="font-semibold">£{parseFloat(goal.current_amount || 0).toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Target</p>
                <p className="font-semibold">£{parseFloat(goal.target_amount).toFixed(2)}</p>
              </div>
            </div>

            {/* Target Date */}
            {goal.target_date && (
              <div className={`flex items-center gap-2 mb-4 ${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
                <Calendar className="h-4 w-4" />
                <span className="text-sm">
                  Target: {new Date(goal.target_date).toLocaleDateString()}
                  {isOverdue && ' (Overdue)'}
                </span>
              </div>
            )}

            {/* Actions */}
            {!readOnly && ( // 👈 Hide all action buttons in readOnly
              <div className="flex gap-2">
                {!goal.is_completed && (
                  <button
                    onClick={() => onAllocate(goal)}
                    disabled={financialSummary.availableFunds <= 0}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-3 py-2 rounded-md text-sm transition-colors"
                  >
                    Allocate Funds
                  </button>
                )}
                <button
                  onClick={() => onToggleComplete(goal.id, goal.is_completed)}
                  className={`flex-1 px-3 py-2 rounded-md text-sm transition-colors ${
                    goal.is_completed
                      ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {goal.is_completed ? 'Mark Incomplete' : 'Mark Complete'}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default GoalsGrid;
