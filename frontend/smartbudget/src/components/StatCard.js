
const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border">
    <div className="flex items-center gap-2 mb-2">
      <Icon className={`h-5 w-5 ${color}`} />
      <p className="text-gray-600 text-sm">{label}</p>
    </div>
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
  </div>
);

export default StatCard;
