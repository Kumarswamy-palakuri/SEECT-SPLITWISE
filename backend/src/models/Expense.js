import mongoose from "mongoose";
import { GROUP_MEMBERS } from "../config/members.js";

const expenseSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
      min: 0.01
    },
    remarks: {
      type: String,
      trim: true,
      default: ""
    },
    paidBy: {
      type: String,
      enum: GROUP_MEMBERS,
      required: true
    },
    participants: {
      type: [String],
      required: true,
      validate: [
        {
          validator: (participants) => participants.length > 0,
          message: "At least one participant must be selected."
        },
        {
          validator: (participants) =>
            participants.every((participant) => GROUP_MEMBERS.includes(participant)),
          message: "Participants must be valid group members."
        }
      ]
    },
    isHidden: {
      type: Boolean,
      default: false
    },
    date: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

expenseSchema.index({ date: -1 });

export const Expense = mongoose.model("Expense", expenseSchema);
