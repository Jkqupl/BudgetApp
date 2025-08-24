import React from 'react';
import { PoundSterling, Receipt, Sigma } from 'lucide-react';
import StatCard from '../../components/StatCard';

const SpendingStats = ({ totalSpent, transactionCount, avgPerTransaction }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <StatCard
        icon={PoundSterling}
        label="Total Spent"
        value={`£${totalSpent.toFixed(2)}`}
        color="text-red-600"
      />

      <StatCard
        icon={Receipt}
        label="Transactions"
        value={transactionCount}
        color="text-blue-600"
      />

      <StatCard
        icon={Sigma}
        label="Avg per Transaction"
        value={`£${avgPerTransaction.toFixed(2)}`}
        color="text-purple-600"
      />
    </div>
  );
};

export default SpendingStats;