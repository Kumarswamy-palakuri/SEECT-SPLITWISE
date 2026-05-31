import { Save, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { GROUP_MEMBERS } from "../constants";
import { dateInputToIsoDate, getDateInputValue } from "../utils/monthFilters";
import { formatCurrency, getExpenseCents } from "../utils/splitCalculator";
import StatusMessage from "./StatusMessage";

const ExpenseDetailsModal = ({ expense, mode, onClose, onSave, isSaving }) => {
  const [form, setForm] = useState({
    date: getDateInputValue(),
    amount: "",
    remarks: "",
    paidBy: GROUP_MEMBERS[0],
    participants: []
  });
  const [error, setError] = useState("");
  const isEditing = mode === "edit";

  useEffect(() => {
    if (!expense) {
      return;
    }

    setForm({
      date: getDateInputValue(expense.date),
      amount: String(expense.amount || ""),
      remarks: expense.remarks || "",
      paidBy: expense.paidBy || GROUP_MEMBERS[0],
      participants: expense.participants || []
    });
    setError("");
  }, [expense]);

  const perPersonShare = useMemo(() => {
    if (!expense?.participants?.length) {
      return 0;
    }

    return getExpenseCents(expense) / expense.participants.length / 100;
  }, [expense]);

  if (!expense) {
    return null;
  }

  const toggleParticipant = (member) => {
    setForm((current) => {
      const isSelected = current.participants.includes(member);
      return {
        ...current,
        participants: isSelected
          ? current.participants.filter((participant) => participant !== member)
          : [...current.participants, member]
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (Number(form.amount) <= 0) {
      setError("Amount must be greater than 0.");
      return;
    }

    if (form.participants.length === 0) {
      setError("At least one participant must be selected.");
      return;
    }

    const expenseDate = dateInputToIsoDate(form.date);

    if (!expenseDate) {
      setError("Date must be valid.");
      return;
    }

    await onSave({
      date: expenseDate,
      amount: Number(form.amount),
      remarks: form.remarks,
      paidBy: form.paidBy,
      participants: form.participants
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 px-3 py-3 sm:items-center sm:px-4 sm:py-6">
      <section className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white shadow-soft">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-950">
              {isEditing ? "Edit Expense" : "Expense Details"}
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              {new Date(expense.date).toLocaleString()}
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

        {isEditing ? (
          <form className="space-y-4 p-4 sm:p-5" onSubmit={handleSubmit}>
            <StatusMessage message={error} tone="error" />

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Date</span>
              <input
                className="focus-ring mt-1 h-11 w-full rounded-md border border-slate-300 px-3 text-slate-950"
                type="date"
                value={form.date}
                onChange={(event) =>
                  setForm((current) => ({ ...current, date: event.target.value }))
                }
                required
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Paid By</span>
              <select
                className="focus-ring mt-1 h-11 w-full rounded-md border border-slate-300 px-3 text-slate-950"
                value={form.paidBy}
                onChange={(event) =>
                  setForm((current) => ({ ...current, paidBy: event.target.value }))
                }
              >
                {GROUP_MEMBERS.map((member) => (
                  <option key={member} value={member}>
                    {member}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Remarks</span>
              <textarea
                className="focus-ring mt-1 h-16 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950"
                value={form.remarks}
                onChange={(event) =>
                  setForm((current) => ({ ...current, remarks: event.target.value }))
                }
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Amount</span>
              <input
                className="focus-ring mt-1 h-11 w-full rounded-md border border-slate-300 px-3 text-slate-950"
                type="number"
                min="0.01"
                step="0.01"
                value={form.amount}
                onChange={(event) =>
                  setForm((current) => ({ ...current, amount: event.target.value }))
                }
                required
              />
            </label>

            <fieldset>
              <legend className="text-sm font-semibold text-slate-700">Participants</legend>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {GROUP_MEMBERS.map((member) => (
                  <label
                    key={member}
                    className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold transition ${
                      form.participants.includes(member)
                        ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                        : "border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      checked={form.participants.includes(member)}
                      onChange={() => toggleParticipant(member)}
                    />
                    {member}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="grid grid-cols-2 gap-2 pt-2 sm:flex sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="focus-ring inline-flex h-11 items-center justify-center rounded-md border border-slate-200 px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 sm:h-10"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70 sm:h-10"
              >
                <Save size={18} />
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 p-4 sm:p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Amount</p>
                <p className="mt-1 text-lg font-bold text-slate-950">
                  {formatCurrency(expense.amount)}
                </p>
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Paid By</p>
                <p className="mt-1 text-lg font-bold text-slate-950">{expense.paidBy}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-700">Remarks</p>
              <p className="mt-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                {expense.remarks || "No remarks added."}
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-700">Participants</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {expense.participants.map((participant) => (
                  <span
                    className="rounded-md bg-sky-50 px-2.5 py-1.5 text-sm font-semibold text-sky-700"
                    key={`${expense._id}-detail-${participant}`}
                  >
                    {participant}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
              <p className="text-sm font-semibold text-amber-900">Split Detail</p>
              <p className="mt-1 text-sm text-amber-900">
                {formatCurrency(expense.amount)} split between {expense.participants.length}{" "}
                participant{expense.participants.length === 1 ? "" : "s"} ={" "}
                <span className="font-bold">{formatCurrency(perPersonShare)}</span> each.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default ExpenseDetailsModal;
