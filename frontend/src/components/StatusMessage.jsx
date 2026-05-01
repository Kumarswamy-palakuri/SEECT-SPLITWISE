const toneClasses = {
  error: "border-rose-200 bg-rose-50 text-rose-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  info: "border-sky-200 bg-sky-50 text-sky-700"
};

const StatusMessage = ({ message, tone = "info" }) => {
  if (!message) {
    return null;
  }

  return (
    <div className={`rounded-md border px-4 py-3 text-sm font-medium ${toneClasses[tone]}`}>
      {message}
    </div>
  );
};

export default StatusMessage;
