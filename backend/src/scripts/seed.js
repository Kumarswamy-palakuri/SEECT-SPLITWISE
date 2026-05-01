import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDatabase } from "../config/db.js";
import { Expense } from "../models/Expense.js";

dotenv.config();

const runSeed = async () => {
  await connectDatabase();
  await Expense.deleteMany({});

  await Expense.create([
    {
      amount: 1000,
      remarks: "Weekend groceries",
      paidBy: "Ajay",
      participants: ["Ajay", "Akshay", "Kumar", "Kinnu"],
      isHidden: false,
      date: new Date()
    },
    {
      amount: 750,
      remarks: "Movie tickets",
      paidBy: "Kumar",
      participants: ["Ajay", "Kumar", "Kinnu"],
      isHidden: false,
      date: new Date()
    },
    {
      amount: 1200,
      remarks: "Dinner",
      paidBy: "Akshay",
      participants: ["Akshay", "Kumar"],
      isHidden: false,
      date: new Date()
    }
  ]);

  console.log("Seed complete.");
  await mongoose.disconnect();
};

runSeed().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
