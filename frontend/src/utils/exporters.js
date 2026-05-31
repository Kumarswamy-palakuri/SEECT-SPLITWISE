import { formatCurrency, getExpenseCents } from "./splitCalculator";

export const exportSummaryPdf = async (element) => {
  if (!element) {
    return;
  }

  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf")
  ]);

  const canvas = await html2canvas(element, {
    backgroundColor: "#ffffff",
    scale: 2
  });

  const pdf = new jsPDF("p", "mm", "a4");
  const margin = 10;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imageWidth = pageWidth - margin * 2;
  const imageHeight = (canvas.height * imageWidth) / canvas.width;
  const imageData = canvas.toDataURL("image/png");

  let heightLeft = imageHeight;
  let position = margin;

  pdf.addImage(imageData, "PNG", margin, position, imageWidth, imageHeight);
  heightLeft -= pageHeight - margin * 2;

  while (heightLeft > 0) {
    pdf.addPage();
    position = heightLeft - imageHeight + margin;
    pdf.addImage(imageData, "PNG", margin, position, imageWidth, imageHeight);
    heightLeft -= pageHeight - margin * 2;
  }

  pdf.save("expense-summary.pdf");
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const downloadFile = (content, filename, type) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const formatDate = (value) => new Date(value).toLocaleDateString();

const filenameMonth = (monthLabel) =>
  String(monthLabel || "selected-month")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const exportSummaryExcel = ({
  expenses = [],
  summaryRows,
  settlements,
  totalExpense,
  generatedAt,
  monthLabel
}) => {
  const transactionRowsHtml = expenses.length
    ? expenses
        .map(
          (expense) => `
            <tr>
              <td>${escapeHtml(formatDate(expense.date))}</td>
              <td>${escapeHtml(expense.remarks || "Expense")}</td>
              <td>${escapeHtml(expense.paidBy)}</td>
              <td>${escapeHtml((expense.participants || []).join(", "))}</td>
              <td>${escapeHtml(formatCurrency(getExpenseCents(expense) / 100))}</td>
            </tr>`
        )
        .join("")
    : "<tr><td colspan=\"5\">No transactions for this month.</td></tr>";

  const summaryRowsHtml = summaryRows
    .map(
      (row) => `
        <tr>
          <td>${escapeHtml(row.person)}</td>
          <td>${escapeHtml(formatCurrency(row.spent))}</td>
          <td>${escapeHtml(formatCurrency(row.share))}</td>
          <td>${escapeHtml(formatCurrency(row.difference))}</td>
        </tr>`
    )
    .join("");

  const settlementRowsHtml = settlements.length
    ? settlements
        .map(
          (item) => `
            <tr>
              <td>${escapeHtml(item.from)}</td>
              <td>${escapeHtml(item.to)}</td>
              <td>${escapeHtml(formatCurrency(item.amount))}</td>
            </tr>`
        )
        .join("")
    : "<tr><td colspan=\"3\">Everyone is settled.</td></tr>";

  const workbookHtml = `
    <html>
      <head>
        <meta charset="UTF-8" />
      </head>
      <body>
        <h1>Expense Summary Report</h1>
        <p><strong>Month:</strong> ${escapeHtml(monthLabel)}</p>
        <p><strong>Generated At:</strong> ${escapeHtml(generatedAt)}</p>
        <p><strong>Total Group Expense:</strong> ${escapeHtml(formatCurrency(totalExpense))}</p>

        <h2>Transactions</h2>
        <table border="1">
          <thead>
            <tr>
              <th>Date</th>
              <th>Remarks</th>
              <th>Paid By</th>
              <th>Participants</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>${transactionRowsHtml}</tbody>
        </table>

        <h2>Summary</h2>
        <table border="1">
          <thead>
            <tr>
              <th>Person</th>
              <th>Total Spent</th>
              <th>Equal Share</th>
              <th>Difference (Owes/Gets)</th>
            </tr>
          </thead>
          <tbody>${summaryRowsHtml}</tbody>
        </table>

        <h2>Who Pays Whom</h2>
        <table border="1">
          <thead>
            <tr>
              <th>From</th>
              <th>To</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>${settlementRowsHtml}</tbody>
        </table>
      </body>
    </html>`;

  downloadFile(
    workbookHtml,
    `expense-summary-${filenameMonth(monthLabel)}.xls`,
    "application/vnd.ms-excel;charset=utf-8"
  );
};
