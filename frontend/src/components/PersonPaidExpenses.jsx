import { formatCurrency, getExpenseCents } from "../utils/splitCalculator";

const PersonPaidExpenses = ({ expenses, person }) => {
  const paidExpenses = expenses.filter((expense) => expense.paidBy === person);
  const totalPaid =
    paidExpenses.reduce((total, expense) => total + getExpenseCents(expense), 0) / 100;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-bold text-slate-950">{person} Paid</h3>
        <p className="text-sm font-bold text-emerald-700">{formatCurrency(totalPaid)}</p>
      </div>

      <div className="mt-3 space-y-2">
        {paidExpenses.length === 0 ? (
          <div className="rounded-md bg-slate-50 px-3 py-4 text-center text-sm font-medium text-slate-500">
            No paid expenses for {person}.
          </div>
        ) : (
          paidExpenses.map((expense) => (
            <article
              key={expense._id}
              className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2"
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
                  {formatCurrency(expense.amount)}
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
  );
};

export default PersonPaidExpenses;
