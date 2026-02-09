export default function Alert({ type = "info", title, message, onClose }) {
  const styles = {
    success:
      "bg-green-50 border border-green-200 text-green-700",
    error: "bg-red-50 border border-red-200 text-red-700",
    warning:
      "bg-yellow-50 border border-yellow-200 text-yellow-700",
    info: "bg-blue-50 border border-blue-200 text-blue-700",
  };

  return (
    <div className={`p-4 rounded-lg ${styles[type]}`}>
      {title && <h3 className="font-semibold mb-1">{title}</h3>}
      <p className="text-sm">{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="text-sm underline mt-2 hover:opacity-80"
        >
          Dismiss
        </button>
      )}
    </div>
  );
}
