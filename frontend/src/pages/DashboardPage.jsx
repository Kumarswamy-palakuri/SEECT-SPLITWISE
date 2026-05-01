import { Plus, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ExpenseDetailsModal from "../components/ExpenseDetailsModal";
import ExpenseTable from "../components/ExpenseTable";
import PageShell from "../components/PageShell";
import StatusMessage from "../components/StatusMessage";
import { GROUP_MEMBERS } from "../constants";
import { expenseApi } from "../services/api";
import { formatCurrency, getTotalExpense } from "../utils/splitCalculator";

const DashboardPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({
    amount: "",
    remarks: "",
    paidBy: GROUP_MEMBERS[0],
    participants: [GROUP_MEMBERS[0]]
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [savingId, setSavingId] = useState("");
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [modalMode, setModalMode] = useState("details");

  const totalExpense = useMemo(() => getTotalExpense(expenses), [expenses]);

  const loadExpenses = async () => {
    setIsLoading(true);
    setError("");
    try {
      const payload = await expenseApi.list();
      setExpenses(payload.expenses);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

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
    setSuccess("");

    if (Number(form.amount) <= 0) {
      setError("Amount must be greater than 0.");
      return;
    }

    if (form.participants.length === 0) {
      setError("At least one participant must be selected.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = await expenseApi.create({
        amount: Number(form.amount),
        remarks: form.remarks,
        paidBy: form.paidBy,
        participants: form.participants
      });
      setExpenses((current) => [payload.expense, ...current]);
      setForm({
        amount: "",
        remarks: "",
        paidBy: GROUP_MEMBERS[0],
        participants: [GROUP_MEMBERS[0]]
      });
      setSuccess("Expense added.");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (expenseId) => {
    setDeletingId(expenseId);
    setError("");
    setSuccess("");

    try {
      await expenseApi.remove(expenseId);
      setExpenses((current) => current.filter((expense) => expense._id !== expenseId));
      setSuccess("Expense deleted.");
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId("");
    }
  };

  const openDetails = (expense) => {
    setSelectedExpense(expense);
    setModalMode("details");
  };

  const openEdit = (expense) => {
    setSelectedExpense(expense);
    setModalMode("edit");
  };

  const closeModal = () => {
    setSelectedExpense(null);
    setModalMode("details");
  };

  const handleUpdate = async (updates) => {
    if (!selectedExpense) {
      return;
    }

    setSavingId(selectedExpense._id);
    setError("");
    setSuccess("");

    try {
      const payload = await expenseApi.update(selectedExpense._id, updates);
      setExpenses((current) =>
        current.map((expense) => (expense._id === payload.expense._id ? payload.expense : expense))
      );
      setSuccess("Expense updated.");
      closeModal();
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingId("");
    }
  };

  return (
    <PageShell>
      <div className="mb-4 grid grid-cols-3 gap-2 sm:mb-6 sm:gap-4">
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-soft sm:p-5">
          <p className="text-xs font-semibold text-slate-500 sm:text-sm">Total</p>
          <p className="mt-1 break-words text-base font-bold text-slate-950 sm:mt-2 sm:text-2xl">
            {formatCurrency(totalExpense)}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-soft sm:p-5">
          <p className="text-xs font-semibold text-slate-500 sm:text-sm">Entries</p>
          <p className="mt-1 text-base font-bold text-slate-950 sm:mt-2 sm:text-2xl">
            {expenses.length}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-soft sm:p-5">
          <p className="text-xs font-semibold text-slate-500 sm:text-sm">Members</p>
          <p className="mt-1 flex items-center gap-1 text-base font-bold text-slate-950 sm:mt-2 sm:gap-2 sm:text-2xl">
            <Users size={18} />
            {GROUP_MEMBERS.length}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[390px_1fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft sm:p-5">
          <h2 className="text-lg font-bold text-slate-950">Add Expense</h2>

          <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
            <StatusMessage message={error} tone="error" />
            <StatusMessage message={success} tone="success" />

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
                placeholder="Dinner, groceries, fuel..."
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

            <button
              className="focus-ring inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
              type="submit"
              disabled={isSubmitting}
            >
              <Plus size={18} />
              {isSubmitting ? "Adding..." : "Add Expense"}
            </button>
          </form>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-950">Expenses</h2>
            {isLoading && <span className="text-sm font-semibold text-slate-500">Loading...</span>}
          </div>
          <ExpenseTable
            expenses={expenses}
            onDelete={handleDelete}
            onEdit={openEdit}
            onView={openDetails}
            deletingId={deletingId}
          />
        </section>
      </div>

      <ExpenseDetailsModal
        expense={selectedExpense}
        mode={modalMode}
        onClose={closeModal}
        onSave={handleUpdate}
        isSaving={Boolean(savingId)}
      />
    </PageShell>
  );
};

export default DashboardPage;
