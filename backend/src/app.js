import cors from "cors";
import express from "express";
import morgan from "morgan";
import { connectDatabase } from "./config/db.js";
import expenseRoutes from "./routes/expenses.js";

export const app = express();

const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (!origin) {
    return true;
  }

  if (allowedOrigins.includes(origin)) {
    return true;
  }

  try {
    const { hostname, protocol } = new URL(origin);
    return protocol === "https:" && (hostname.endsWith(".vercel.app") || hostname.endsWith(".pages.dev"));
  } catch {
    return false;
  }
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Expense Splitter API is running." });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "expense-splitter-api" });
});

// Ensure database connection for API routes in serverless environments (Vercel)
app.use(async (req, res, next) => {
  try {
    await connectDatabase();
    next();
  } catch (error) {
    console.error("Database connection error:", error.message);
    res.status(500).json({
      message: "Database connection failed. Please ensure MONGO_URI is configured in Vercel and MongoDB Atlas allows 0.0.0.0/0.",
      error: error.message
    });
  }
});

app.use("/expenses", expenseRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});

app.use((error, req, res, next) => {
  console.error(error);

  if (error.name === "ValidationError") {
    const messages = Object.values(error.errors).map((item) => item.message);
    return res.status(400).json({ message: messages.join(" ") });
  }

  if (error.code === 11000) {
    return res.status(409).json({ message: "A record with this value already exists." });
  }

  res.status(500).json({ message: "Something went wrong on the server." });
});

export default app;
