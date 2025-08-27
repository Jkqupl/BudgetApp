import React from 'react';
import { TrendingUp, PoundSterling, Target } from 'lucide-react';
import StatCard from '../../components/StatCard';

const FinancialSummary = ({ financialSummary }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <StatCard
        icon={TrendingUp}
        label="Total Income"
        value={`£${financialSummary.totalIncome.toFixed(2)}`}
        color="text-green-600"
      />

      <StatCard
        icon={PoundSterling}
        label="Total Spending"
        value={`£${financialSummary.totalSpending.toFixed(2)}`}
        color="text-red-600"  
      />

      <StatCard
        icon={Target}
        label="Allocated to Goals"
        value={`£${financialSummary.totalAllocated.toFixed(2)}`}
        color="text-blue-600"
      />

      <StatCard
        icon={PoundSterling}
        label="Available Funds"
        value={`£${financialSummary.availableFunds.toFixed(2)}`}
        color={financialSummary.availableFunds >= 0 ? 'text-purple-600' : 'text-red-600'}
      />
    </div>
  );
};

export default FinancialSummary;