import { FileDown, Sheet } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import ExpenseTable from "../components/ExpenseTable";
import MonthSelector from "../components/MonthSelector";
import PageShell from "../components/PageShell";
import PersonPaidExpenses from "../components/PersonPaidExpenses";
import StatusMessage from "../components/StatusMessage";
import { SettlementTable, SummaryTable } from "../components/SummaryTables";
import { expenseApi } from "../services/api";
import { exportSummaryExcel, exportSummaryPdf } from "../utils/exporters";
import {
  buildMonthOptions,
  filterExpensesByMonth,
  formatMonthLabel,
  getCurrentMonthKey
} from "../utils/monthFilters";
import {
  buildSettlements,
  buildSummary,
  formatCurrency,
  getTotalExpense
} from "../utils/splitCalculator";

const SummaryPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey());
  const reportRef = useRef(null);

  const monthOptions = useMemo(
    () => buildMonthOptions(expenses, selectedMonth),
    [expenses, selectedMonth]
  );
  const filteredExpenses = useMemo(
    () => filterExpensesByMonth(expenses, selectedMonth),
    [expenses, selectedMonth]
  );
  const selectedMonthLabel = useMemo(() => formatMonthLabel(selectedMonth), [selectedMonth]);
  const summaryRows = useMemo(() => buildSummary(filteredExpenses), [filteredExpenses]);
  const settlements = useMemo(() => buildSettlements(summaryRows), [summaryRows]);
  const totalExpense = useMemo(() => getTotalExpense(filteredExpenses), [filteredExpenses]);
  const generatedAt = useMemo(
    () => new Date().toLocaleString(),
    [filteredExpenses.length, selectedMonth]
  );

  useEffect(() => {
    const loadExpenses = async () => {
      try {
        const payload = await expenseApi.list();
        setExpenses(payload.expenses);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadExpenses();
  }, []);

  useEffect(() => {
    setSelectedPerson(null);
  }, [selectedMonth]);

  const handlePdfExport = async () => {
    setIsExportingPdf(true);
    try {
      await exportSummaryPdf(reportRef.current);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleExcelExport = () => {
    exportSummaryExcel({
      expenses: filteredExpenses,
      summaryRows,
      settlements,
      totalExpense,
      generatedAt,
      monthLabel: selectedMonthLabel
    });
  };

  return (
    <PageShell>
      <div className="mb-4 flex items-center justify-between gap-3 sm:mb-5 sm:items-end">
        <h2 className="text-xl font-bold text-slate-950 sm:text-2xl">Summary</h2>
        <MonthSelector
          id="summary-month"
          label=""
          value={selectedMonth}
          options={monthOptions}
          onChange={setSelectedMonth}
          className="w-44 shrink-0 sm:w-64"
        />
      </div>

      <StatusMessage message={error} tone="error" />
      {isLoading ? (
        <div className="mt-4 rounded-lg border border-slate-200 bg-white p-8 text-center text-sm font-semibold text-slate-500 shadow-soft">
          Loading summary...
        </div>
      ) : (
        <section
          ref={reportRef}
          className="mt-4 space-y-5 rounded-lg border border-slate-200 bg-white p-3 shadow-soft sm:space-y-6 sm:p-5"
        >
          <div className="flex flex-col gap-2 border-b border-slate-200 pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-950 sm:text-2xl">
                Expense Summary Report
              </h1>
              <p className="mt-1 text-sm font-medium text-slate-500">
                {selectedMonthLabel} - Generated: {generatedAt}
              </p>
            </div>
            <div className="rounded-md bg-amber-50 px-3 py-2 text-sm font-bold text-amber-800">
              Total: {formatCurrency(totalExpense)}
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-base font-bold text-slate-950 sm:mb-3 sm:text-lg">
              Summary
            </h3>
            <SummaryTable
              rows={summaryRows}
              selectedPerson={selectedPerson}
              onSelectPerson={setSelectedPerson}
            />
          </div>

          <div>
            <h3 className="mb-2 text-base font-bold text-slate-950 sm:mb-3 sm:text-lg">
              Who Pays Whom
            </h3>
            <SettlementTable settlements={settlements} />
          </div>

          <div className="grid grid-cols-2 gap-2 border-t border-slate-200 pt-4 sm:flex sm:flex-wrap sm:justify-end">
            <button
              type="button"
              onClick={handlePdfExport}
              disabled={isExportingPdf}
              className="focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-md bg-slate-950 px-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70 sm:h-10"
            >
              <FileDown size={18} />
              {isExportingPdf ? "Preparing..." : "PDF"}
            </button>
            <button
              type="button"
              onClick={handleExcelExport}
              className="focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-md bg-emerald-600 px-3 text-sm font-bold text-white transition hover:bg-emerald-700 sm:h-10"
            >
              <Sheet size={18} />
              Excel
            </button>
          </div>

          <div>
            <h3 className="mb-2 text-base font-bold text-slate-950 sm:mb-3 sm:text-lg">
              Transactions
            </h3>
            <ExpenseTable
              expenses={filteredExpenses}
              isReadOnly
              emptyMessage={`No transactions for ${selectedMonthLabel}.`}
            />
          </div>
        </section>
      )}
      <PersonPaidExpenses
        expenses={filteredExpenses}
        person={selectedPerson}
        onClose={() => setSelectedPerson(null)}
      />
    </PageShell>
  );
};

export default SummaryPage;
