import express from "express";
import { GROUP_MEMBERS, isGroupMember } from "../config/members.js";
import { Expense } from "../models/Expense.js";

const router = express.Router();

const validateExpenseInput = ({ amount, paidBy, participants }) => {
  const numericAmount = Number(amount);
  const uniqueParticipants = [...new Set(participants || [])];

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

  return {
    amount: Math.round(numericAmount * 100) / 100,
    participants: uniqueParticipants
  };
};

router.get("/", async (req, res, next) => {
  try {
    const expenses = await Expense.find({ isHidden: { $ne: true } })
      .sort({ date: -1, createdAt: -1 });

    res.json({ expenses });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { amount, remarks, paidBy, participants } = req.body;
    const validation = validateExpenseInput({ amount, paidBy, participants });

    if (validation.message) {
      return res.status(400).json({ message: validation.message });
    }

    const expense = await Expense.create({
      amount: validation.amount,
      remarks,
      paidBy,
      participants: validation.participants
    });

    res.status(201).json({ expense });
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const { amount, remarks, paidBy, participants } = req.body;
    const validation = validateExpenseInput({ amount, paidBy, participants });

    if (validation.message) {
      return res.status(400).json({ message: validation.message });
    }

    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      {
        amount: validation.amount,
        remarks,
        paidBy,
        participants: validation.participants
      },
      { new: true, runValidators: true }
    );

    if (!expense) {
      return res.status(404).json({ message: "Expense not found." });
    }

    res.json({ expense });
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

    res.json({ message: "Expense hidden.", expense });
  } catch (error) {
    next(error);
  }
});

export default router;
