import express from "express";
import { GROUP_MEMBERS, isGroupMember } from "../config/members.js";
import { Expense } from "../models/Expense.js";

const router = express.Router();

const validateExpenseInput = ({ amount, paidBy, participants, date }) => {
  const numericAmount = Number(amount);
  const uniqueParticipants = [...new Set(participants || [])];
  const hasDate = date !== undefined && date !== null && date !== "";

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    return { message: "Amount must be greater than 0." };
  }

  if (!paidBy || !isGroupMember(paidBy)) {
    return {
      message: `Paid By must be one of: ${GROUP_MEMBERS.join(", ")}.`
    };
  }

  if (uniqueParticipants.length === 0) {
    return { message: "At least one participant must be selected." };
  }

  const invalidParticipants = uniqueParticipants.filter((name) => !isGroupMember(name));
  if (invalidParticipants.length > 0) {
    return {
      message: `Invalid participants: ${invalidParticipants.join(", ")}.`
    };
  }

  const amountCents = Math.round(numericAmount * 100);
  const expenseDate = hasDate ? new Date(date) : undefined;

  if (hasDate && Number.isNaN(expenseDate.getTime())) {
    return { message: "Date must be valid." };
  }

  return {
    amount: amountCents / 100,
    amountCents,
    participants: uniqueParticipants,
    date: expenseDate
  };
};

const serializeExpense = (expense) => {
  const plainExpense = expense.toObject ? expense.toObject() : expense;
  const amountCents =
    plainExpense.amountCents ?? Math.round(Number(plainExpense.amount || 0) * 100);

  return {
    ...plainExpense,
    amount: amountCents / 100,
    amountCents
  };
};

router.get("/", async (req, res, next) => {
  try {
    const expenses = await Expense.find({ isHidden: { $ne: true } })
      .sort({ date: -1, createdAt: -1 });

    res.json({ expenses: expenses.map(serializeExpense) });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { amount, remarks, paidBy, participants, date } = req.body;
    const validation = validateExpenseInput({ amount, paidBy, participants, date });

    if (validation.message) {
      return res.status(400).json({ message: validation.message });
    }

    const expense = await Expense.create({
      amount: validation.amount,
      amountCents: validation.amountCents,
      remarks,
      paidBy,
      participants: validation.participants,
      ...(validation.date ? { date: validation.date } : {})
    });

    res.status(201).json({ expense: serializeExpense(expense) });
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const { amount, remarks, paidBy, participants, date } = req.body;
    const validation = validateExpenseInput({ amount, paidBy, participants, date });

    if (validation.message) {
      return res.status(400).json({ message: validation.message });
    }

    const updates = {
      amount: validation.amount,
      amountCents: validation.amountCents,
      remarks,
      paidBy,
      participants: validation.participants,
      ...(validation.date ? { date: validation.date } : {})
    };

    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!expense) {
      return res.status(404).json({ message: "Expense not found." });
    }

    res.json({ expense: serializeExpense(expense) });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id/hide", async (req, res, next) => {
  try {
    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      { isHidden: true },
      { new: true }
    );

    if (!expense) {
      return res.status(404).json({ message: "Expense not found." });
    }

    res.json({ message: "Expense hidden.", expense: serializeExpense(expense) });
  } catch (error) {
    next(error);
  }
});

export default router;
