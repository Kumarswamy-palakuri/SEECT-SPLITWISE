const pad2 = (value) => String(value).padStart(2, "0");

const parseDateValue = (value) => {
  const date = value ? new Date(value) : new Date();
  return Number.isNaN(date.getTime()) ? null : date;
};

export const getMonthKey = (value = new Date()) => {
  const date = parseDateValue(value);

  if (!date) {
    return "";
  }

  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}`;
};

export const getCurrentMonthKey = () => getMonthKey(new Date());

export const getDateInputValue = (value = new Date()) => {
  const date = parseDateValue(value);

  if (!date) {
    return "";
  }

  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
};

export const dateInputToIsoDate = (value) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || "");

  if (!match) {
    return "";
  }

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(year, month - 1, day, 12);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return "";
  }

  return date.toISOString();
};

export const getExpenseMonthKey = (expense) => getMonthKey(expense?.date);

export const formatMonthLabel = (monthKey) => {
  const match = /^(\d{4})-(\d{2})$/.exec(monthKey || "");

  if (!match) {
    return "Selected month";
  }

  const [, yearText, monthText] = match;
  const date = new Date(Number(yearText), Number(monthText) - 1, 1);

  return new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric"
  }).format(date);
};

export const buildMonthOptions = (expenses, selectedMonth = getCurrentMonthKey()) => {
  const keys = new Set([getCurrentMonthKey(), selectedMonth].filter(Boolean));

  expenses.forEach((expense) => {
    const monthKey = getExpenseMonthKey(expense);

    if (monthKey) {
      keys.add(monthKey);
    }
  });

  return [...keys]
    .sort((first, second) => second.localeCompare(first))
    .map((value) => ({
      value,
      label: formatMonthLabel(value)
    }));
};

export const filterExpensesByMonth = (expenses, monthKey) =>
  expenses.filter((expense) => getExpenseMonthKey(expense) === monthKey);
