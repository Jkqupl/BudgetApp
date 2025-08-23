export const FinanceInsights = ({netIncome,savingsRate}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Financial Insights</h3>
          <div className="space-y-3 text-sm">
             {netIncome > 0 ? (
              <p className="text-green-600">✓ You're saving money! Keep up the good work.</p>
            ) : (
              <p className="text-red-600">⚠ You're spending more than you earn. Consider reducing expenses.</p>
            )}
            
            {savingsRate >= 20 ? (
              <p className="text-green-600">✓ Excellent savings rate of {savingsRate.toFixed(1)}%</p>
            ) : savingsRate >= 10 ? (
              <p className="text-yellow-600">○ Good savings rate of {savingsRate.toFixed(1)}%. Consider increasing to 20%+</p>
            ) : (
              <p className="text-red-600">⚠ Low savings rate of {savingsRate.toFixed(1)}%. Try to save at least 10-20%</p>
            )}
          </div>
        </div>
  );
}