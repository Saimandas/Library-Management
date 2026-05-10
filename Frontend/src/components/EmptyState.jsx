const EmptyState = ({ icon = "📭", title = "No data found", description = "", action = null }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <span className="text-6xl mb-4">{icon}</span>
      <h3 className="text-xl font-semibold text-gray-700 mb-2">{title}</h3>
      {description && <p className="text-gray-500 text-center mb-6 max-w-md">{description}</p>}
      {action && <button onClick={action.onClick} className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
        {action.label}
      </button>}
    </div>
  );
};

export default EmptyState;