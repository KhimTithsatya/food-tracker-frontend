export default function StatCard({ title, value, color = "blue", icon = null }) {
  const colorClasses = {
    blue: "border-blue-600 text-blue-600",
    green: "border-green-600 text-green-600",
    purple: "border-purple-600 text-purple-600",
    red: "border-red-600 text-red-600",
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-600 mb-2 uppercase">
            {title}
          </h3>
          <p className={`text-3xl font-bold ${colorClasses[color]}`}>{value}</p>
        </div>
        {icon && <div className="text-4xl">{icon}</div>}
      </div>
    </div>
  );
}
