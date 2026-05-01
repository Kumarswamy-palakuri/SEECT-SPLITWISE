import { Eye, Pencil, Trash2 } from "lucide-react";
import { formatCurrency } from "../utils/splitCalculator";

const ExpenseTable = ({ expenses, onDelete, onEdit, onView, deletingId }) => (
  <>
    <div className="space-y-3 sm:hidden">
      {expenses.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500 shadow-soft">
          No expenses yet.
        </div>
      ) : (
        expenses.map((expense) => (
          <article
            key={expense._id}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft"
          >
            <button
              type="button"
              onClick={() => onView(expense)}
              className="block w-full text-left"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-base font-bold text-slate-950">
                    {expense.remarks || "Expense"}
                  </h3>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    {new Date(expense.date).toLocaleDateString()} - Paid by {expense.paidBy}
                  </p>
                </div>
                <p className="shrink-0 text-base font-bold text-slate-950">
                  {formatCurrency(expense.amount)}
                </p>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {expense.participants.map((participant) => (
                  <span
                    className="rounded-md bg-sky-50 px-2 py-1 text-xs font-semibold text-sky-700"
                    key={`${expense._id}-mobile-${participant}`}
                  >
                    {participant}
                  </span>
                ))}
              </div>
            </button>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onView(expense)}
                className="focus-ring inline-flex h-11 items-center justify-center gap-1 rounded-md border border-slate-200 text-sm font-bold text-sky-700 transition hover:bg-sky-50"
              >
                <Eye size={17} />
                View
              </button>
              <button
                type="button"
                onClick={() => onEdit(expense)}
                className="focus-ring inline-flex h-11 items-center justify-center gap-1 rounded-md border border-slate-200 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50"
              >
                <Pencil size={17} />
                Edit
              </button>
              <button
                type="button"
                onClick={() => onDelete(expense._id)}
                disabled={deletingId === expense._id}
                className="focus-ring inline-flex h-11 items-center justify-center gap-1 rounded-md border border-slate-200 text-sm font-bold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Trash2 size={17} />
                Delete
              </button>
            </div>
          </article>
        ))
      )}
    </div>

    <div className="hidden overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft sm:block">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="table-cell font-semibold text-slate-600">Date</th>
              <th className="table-cell font-semibold text-slate-600">Remarks</th>
              <th className="table-cell font-semibold text-slate-600">Paid By</th>
              <th className="table-cell font-semibold text-slate-600">Participants</th>
              <th className="table-cell font-semibold text-slate-600">Amount</th>
              <th className="table-cell font-semibold text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {expenses.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-sm text-slate-500" colSpan={6}>
                No expenses yet.
                </td>
              </tr>
            ) : (
              expenses.map((expense) => (
                <tr key={expense._id} className="bg-white">
                  <td className="table-cell text-slate-600">
                    {new Date(expense.date).toLocaleDateString()}
                  </td>
                  <td className="table-cell font-medium text-slate-900">
                    {expense.remarks || "Expense"}
                  </td>
                  <td className="table-cell text-slate-700">{expense.paidBy}</td>
                  <td className="table-cell text-slate-600">
                    <div className="flex min-w-48 flex-wrap gap-1.5">
                      {expense.participants.map((participant) => (
                        <span
                          className="rounded-md bg-sky-50 px-2 py-1 text-xs font-semibold text-sky-700"
                          key={`${expense._id}-${participant}`}
                        >
                          {participant}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="table-cell font-semibold text-slate-950">
                    {formatCurrency(expense.amount)}
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        title="View details"
                        aria-label="View expense details"
                        onClick={() => onView(expense)}
                        className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
                      >
                        <Eye size={17} />
                      </button>
                      <button
                        type="button"
                        title="Edit expense"
                        aria-label="Edit expense"
                        onClick={() => onEdit(expense)}
                        className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                      >
                        <Pencil size={17} />
                      </button>
                      <button
                        type="button"
                        title="Delete expense"
                        aria-label="Delete expense"
                        onClick={() => onDelete(expense._id)}
                        disabled={deletingId === expense._id}
                        className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  </>
);

export default ExpenseTable;
