import { AlertTriangle, EyeOff, X } from "lucide-react";
import { formatCurrency } from "../utils/splitCalculator";
import StatusMessage from "./StatusMessage";

const ConfirmHideModal = ({ expense, onCancel, onConfirm, isHiding, error }) => {
  if (!expense) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 px-3 py-3 sm:items-center sm:px-4 sm:py-6">
      <section className="w-full max-w-md rounded-lg bg-white shadow-soft">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div className="flex gap-3">
            <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-rose-50 text-rose-700">
              <AlertTriangle size={18} />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-950">Hide Expense?</h2>
              <p className="mt-1 text-sm font-medium text-slate-500">
                {expense.remarks || "Expense"} - {formatCurrency(expense.amount)}
              </p>
            </div>
          </div>
          <button
            type="button"
            title="Close"
            aria-label="Close"
            onClick={onCancel}
            disabled={isHiding}
            className="focus-ring inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 p-4 sm:p-5">
          <StatusMessage message={error} tone="error" />
          <p className="text-sm font-medium text-slate-700">
            Are you sure you want to hide this expense? It will no longer appear in the expenses
            list or be included in calculations.
          </p>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={onCancel}
              disabled={isHiding}
              className="focus-ring inline-flex h-11 items-center justify-center rounded-md border border-slate-200 px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              No
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isHiding}
              className="focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-md bg-rose-600 px-4 text-sm font-bold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <EyeOff size={18} />
              {isHiding ? "Hiding..." : "Yes, Hide"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ConfirmHideModal;
