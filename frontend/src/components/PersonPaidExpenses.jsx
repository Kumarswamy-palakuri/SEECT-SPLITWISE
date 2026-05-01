import { X } from "lucide-react";
import { formatCurrency, getExpenseCents } from "../utils/splitCalculator";

const PersonPaidExpenses = ({ expenses, person, onClose }) => {
  if (!person) {
    return null;
  }

  const paidExpenses = expenses.filter((expense) => expense.paidBy === person);
  const totalPaid =
    paidExpenses.reduce((total, expense) => total + getExpenseCents(expense), 0) / 100;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 px-3 py-3 sm:items-center sm:px-4 sm:py-6">
      <section className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white shadow-soft">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-4 py-4 sm:px-5">
          <div>
            <h3 className="text-lg font-bold text-slate-950">{person} Paid</h3>
            <p className="mt-1 text-sm font-bold text-emerald-700">
              {formatCurrency(totalPaid)} total
            </p>
          </div>
          <button
            type="button"
            title="Close"
            aria-label="Close"
            onClick={onClose}
            className="focus-ring inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-slate-50"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-2 p-4 sm:p-5">
          {paidExpenses.length === 0 ? (
            <div className="rounded-md bg-slate-50 px-3 py-6 text-center text-sm font-medium text-slate-500">
              No paid expenses for {person}.
            </div>
          ) : (
            paidExpenses.map((expense) => (
              <article
                key={expense._id}
                className="rounded-md border border-slate-200 bg-slate-50 px-3 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-950">
                      {expense.remarks || "Expense"}
                    </p>
                    <p className="mt-0.5 text-xs font-semibold text-slate-500">
                      {new Date(expense.date).toLocaleDateString()} -{" "}
                      {expense.participants.length} participant
                      {expense.participants.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-bold text-slate-950">
                    {formatCurrency(getExpenseCents(expense) / 100)}
                  </p>
                </div>

                <div className="mt-2 flex flex-wrap gap-1">
                  {expense.participants.map((participant) => (
                    <span
                      key={`${expense._id}-${participant}`}
                      className="rounded bg-white px-2 py-1 text-xs font-semibold text-slate-600"
                    >
                      {participant}
                    </span>
                  ))}
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default PersonPaidExpenses;
