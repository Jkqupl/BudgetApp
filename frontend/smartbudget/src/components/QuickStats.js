export const QuickStats = ({ incomeEntries, expenseEntries, totalIncome, totalExpenses }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Income Entries:</span>
              <span className="font-medium">{incomeEntries}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Expense Entries:</span>
              <span className="font-medium">{expenseEntries}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg Income per Entry:</span>
              <span className="font-medium text-green-600">
                £{incomeEntries > 0 ? (totalIncome / incomeEntries).toFixed(0) : '0'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg Expense per Entry:</span>
              <span className="font-medium text-red-600">
                £{expenseEntries > 0 ? (totalExpenses / expenseEntries).toFixed(0) : '0'}
              </span>
            </div>
          </div>
        </div>
    );
    }