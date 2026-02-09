export default function FormCard({ title, onSubmit, children, submitText = "Save", isLoading = false }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">{title}</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        {children}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-60"
        >
          {isLoading ? "Saving..." : submitText}
        </button>
      </form>
    </div>
  );
}
