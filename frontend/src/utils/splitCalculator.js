import { GROUP_MEMBERS } from "../constants";

export const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount || 0);

const toCents = (amount) => Math.round(Number(amount || 0) * 100);
const fromCents = (cents) => cents / 100;
export const getExpenseCents = (expense) =>
  Number.isFinite(Number(expense.amountCents)) ? Number(expense.amountCents) : toCents(expense.amount);

export const buildSummary = (expenses) => {
  const ledger = Object.fromEntries(
    GROUP_MEMBERS.map((member) => [
      member,
      {
        person: member,
        spentCents: 0,
        shareCents: 0
      }
    ])
  );

  expenses.forEach((expense) => {
    const amountCents = getExpenseCents(expense);
    const participants = (expense.participants || []).filter((name) => ledger[name]);

    if (!ledger[expense.paidBy] || amountCents <= 0 || participants.length === 0) {
      return;
    }

    ledger[expense.paidBy].spentCents += amountCents;

    const baseShare = Math.floor(amountCents / participants.length);
    let remainder = amountCents % participants.length;

    participants.forEach((participant) => {
      ledger[participant].shareCents += baseShare + (remainder > 0 ? 1 : 0);
      remainder -= 1;
    });
  });

  return GROUP_MEMBERS.map((member) => {
    const row = ledger[member];
    const differenceCents = row.spentCents - row.shareCents;

    return {
      person: member,
      spent: fromCents(row.spentCents),
      share: fromCents(row.shareCents),
      difference: fromCents(differenceCents),
      spentCents: row.spentCents,
      shareCents: row.shareCents,
      differenceCents
    };
  });
};

export const buildSettlements = (summaryRows) => {
  const debtors = summaryRows
    .filter((row) => row.differenceCents < 0)
    .map((row) => ({ person: row.person, amountCents: Math.abs(row.differenceCents) }))
    .sort((a, b) => b.amountCents - a.amountCents);

  const creditors = summaryRows
    .filter((row) => row.differenceCents > 0)
    .map((row) => ({ person: row.person, amountCents: row.differenceCents }))
    .sort((a, b) => b.amountCents - a.amountCents);

  const settlements = [];
  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];
    const amountCents = Math.min(debtor.amountCents, creditor.amountCents);

    if (amountCents > 0) {
      settlements.push({
        from: debtor.person,
        to: creditor.person,
        amount: fromCents(amountCents),
        amountCents
      });
    }

    debtor.amountCents -= amountCents;
    creditor.amountCents -= amountCents;

    if (debtor.amountCents === 0) {
      debtorIndex += 1;
    }
    if (creditor.amountCents === 0) {
      creditorIndex += 1;
    }
  }

  return settlements;
};

export const getTotalExpense = (expenses) =>
  fromCents(expenses.reduce((total, expense) => total + getExpenseCents(expense), 0));
