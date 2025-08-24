import React from 'react';
import { PoundSterling, NotebookText, Sigma, Repeat } from 'lucide-react';
import StatCard from '../../components/StatCard';

const IncomeStats = ({ 
  totalIncome, 
  entryCount, 
  avgPerEntry, 
  recurringIncome 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <StatCard
        icon={PoundSterling}
        label="Total Income"
        value={`£${totalIncome.toFixed(2)}`}
        color="text-green-600"
      />

      <StatCard
        icon={NotebookText}
        label="Entries"
        value={entryCount}
        color="text-blue-600" 
      />

      <StatCard
        icon={Sigma}
        label="Avg per Entry"
        value={`£${avgPerEntry.toFixed(2)}`}
        color="text-purple-600"
      />

      <StatCard
        icon={Repeat}
        label="Recurring Income"
        value={`£${recurringIncome.toFixed(2)}`}
        color="text-orange-600"
      />
    </div>
  );
};

export default IncomeStats;