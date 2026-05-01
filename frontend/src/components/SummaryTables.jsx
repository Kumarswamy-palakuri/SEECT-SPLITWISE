import { ArrowRight } from "lucide-react";
import { formatCurrency } from "../utils/splitCalculator";

export const SummaryTable = ({ rows }) => (
  <>
    <div className="grid grid-cols-2 gap-2 sm:hidden">
      {rows.map((row) => (
        <article key={row.person} className="rounded-lg border border-slate-200 bg-white p-3">
          <div>
            <h4 className="text-sm font-bold text-slate-950">{row.person}</h4>
            <p
              className={`mt-1 text-base font-bold ${
                row.difference > 0
                  ? "text-emerald-700"
                  : row.difference < 0
                    ? "text-rose-700"
                    : "text-slate-600"
              }`}
            >
              {formatCurrency(row.difference)}
            </p>
          </div>

          <div className="mt-2 space-y-1 text-xs font-semibold text-slate-500">
            <p>Spent: <span className="text-slate-800">{formatCurrency(row.spent)}</span></p>
            <p>Share: <span className="text-slate-800">{formatCurrency(row.share)}</span></p>
          </div>
        </article>
      ))}
    </div>

    <div className="hidden overflow-hidden rounded-lg border border-slate-200 bg-white sm:block">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="table-cell font-semibold text-slate-600">Person</th>
              <th className="table-cell font-semibold text-slate-600">Total Spent</th>
              <th className="table-cell font-semibold text-slate-600">Equal Share</th>
              <th className="table-cell font-semibold text-slate-600">Difference (Owes/Gets)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.person}>
                <td className="px-4 py-2 text-left text-sm font-semibold text-slate-950">
                  {row.person}
                </td>
                <td className="px-4 py-2 text-left text-sm text-slate-700">
                  {formatCurrency(row.spent)}
                </td>
                <td className="px-4 py-2 text-left text-sm text-slate-700">
                  {formatCurrency(row.share)}
                </td>
                <td
                  className={`px-4 py-2 text-left text-sm font-semibold ${
                    row.difference > 0
                      ? "text-emerald-700"
                      : row.difference < 0
                        ? "text-rose-700"
                        : "text-slate-600"
                  }`}
                >
                  {formatCurrency(row.difference)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </>
);

export const SettlementTable = ({ settlements }) => (
  <>
    <div className="space-y-3 sm:hidden">
      {settlements.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
          Everyone is settled.
        </div>
      ) : (
        settlements.map((settlement) => (
          <article
            key={`${settlement.from}-${settlement.to}-${settlement.amountCents}`}
            className="rounded-lg border border-slate-200 bg-white p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-base font-bold text-rose-700">{settlement.from}</p>
                <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-600">
                  <ArrowRight size={16} />
                  {settlement.to}
                </p>
              </div>
              <p className="shrink-0 text-base font-bold text-slate-950">
                {formatCurrency(settlement.amount)}
              </p>
            </div>
          </article>
        ))
      )}
    </div>

    <div className="hidden overflow-hidden rounded-lg border border-slate-200 bg-white sm:block">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="table-cell font-semibold text-slate-600">From</th>
              <th className="table-cell font-semibold text-slate-600">To</th>
              <th className="table-cell font-semibold text-slate-600">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {settlements.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-sm text-slate-500" colSpan={3}>
                  Everyone is settled.
                </td>
              </tr>
            ) : (
              settlements.map((settlement) => (
                <tr key={`${settlement.from}-${settlement.to}-${settlement.amountCents}`}>
                  <td className="table-cell font-semibold text-rose-700">{settlement.from}</td>
                  <td className="table-cell text-slate-700">
                    <span className="inline-flex items-center gap-2">
                      <ArrowRight size={16} />
                      {settlement.to}
                    </span>
                  </td>
                  <td className="table-cell font-semibold text-slate-950">
                    {formatCurrency(settlement.amount)}
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
