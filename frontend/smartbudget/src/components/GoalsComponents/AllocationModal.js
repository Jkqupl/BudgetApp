import React, { useState, useEffect } from 'react';

const AllocationModal = ({ 
  goal, 
  financialSummary,
  isOpen, 
  onAllocate, 
  onClose 
}) => {
  const [allocationAmount, setAllocationAmount] = useState('');
  const [error, setError] = useState('');

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setAllocationAmount('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen || !goal) return null;

  const maxAllocation = Math.min(
    financialSummary.availableFunds,
    parseFloat(goal.target_amount) - parseFloat(goal.current_amount || 0)
  );

  const handleSubmit = async () => {
    const amount = parseFloat(allocationAmount);
    
    // Validation
    if (!amount || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (amount > financialSummary.availableFunds) {
      setError('Insufficient funds available for allocation');
      return;
    }

    if (amount > maxAllocation) {
      setError('Cannot allocate more than the target amount');
      return;
    }

    // Clear any previous errors
    setError('');
    
    // Call the allocation handler
    const success = await onAllocate(goal.id, amount);
    
    if (success) {
      onClose();
    } else {
      setError('Failed to allocate funds. Please try again.');
    }
  };

  const handleInputChange = (value) => {
    setAllocationAmount(value);
    setError(''); // Clear error when user starts typing
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
        <h2 className="text-xl font-semibold mb-4">Allocate Funds</h2>
        
        <div className="mb-4">
          <p className="text-gray-600 mb-2">
            <span className="font-medium">Goal:</span> {goal.title}
          </p>
          <p className="text-gray-600 mb-2">
            <span className="font-medium">Available:</span> £{financialSummary.availableFunds.toFixed(2)}
          </p>
          <p className="text-gray-600 mb-2">
            <span className="font-medium">Remaining to target:</span> £{(parseFloat(goal.target_amount) - parseFloat(goal.current_amount || 0)).toFixed(2)}
          </p>
        </div>
        
        <div className="mb-4">
          <input
            type="number"
            step="0.01"
            min="0.01"
            max={maxAllocation}
            placeholder="Amount to allocate"
            value={allocationAmount}
            onChange={(e) => handleInputChange(e.target.value)}
            className={`border rounded-md px-3 py-2 w-full ${error ? 'border-red-500' : ''}`}
            autoFocus
          />
          {error && (
            <p className="text-red-500 text-sm mt-1">{error}</p>
          )}
        </div>

        {/* Quick amount buttons */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Quick amounts:</p>
          <div className="flex gap-2 flex-wrap">
            {[25, 50, 100, Math.floor(maxAllocation)].filter(amount => amount > 0 && amount <= maxAllocation).map(amount => (
              <button
                key={amount}
                onClick={() => handleInputChange(amount.toString())}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                £{amount}
              </button>
            ))}
            {maxAllocation > 0 && (
              <button
                onClick={() => handleInputChange(maxAllocation.toFixed(2))}
                className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors"
              >
                Max (£{maxAllocation.toFixed(2)})
              </button>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleSubmit}
            disabled={!allocationAmount || parseFloat(allocationAmount) <= 0}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-md transition-colors"
          >
            Allocate
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-md transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AllocationModal;