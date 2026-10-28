import { Hono } from "hono";
import { cors } from "hono/cors";
import { MongoClient, ObjectId } from "mongodb";
import { GROUP_MEMBERS, isGroupMember } from "./config/members.js";

const app = new Hono();

let cachedClient = null;

async function getCollection(env) {
  const uri = env?.MONGO_URI || env?.MONGODB_URI || process.env?.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI is missing. Please set MONGO_URI in Cloudflare Worker secrets or environment variables.");
  }

  if (!cachedClient) {
    cachedClient = new MongoClient(uri);
    await cachedClient.connect();
  }

  const dbName = uri.split("/").pop()?.split("?")[0] || "Splitwise";
  return cachedClient.db(dbName).collection("expenses");
}

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
    paidBy,
    participants: uniqueParticipants,
    date: expenseDate
  };
};

const serializeExpense = (expense) => {
  if (!expense) return expense;
  const plain = { ...expense };
  const id = plain._id ? plain._id.toString() : plain.id;
  const amountCents =
    plain.amountCents ?? Math.round(Number(plain.amount || 0) * 100);

  return {
    ...plain,
    _id: id,
    id,
    amount: amountCents / 100,
    amountCents
  };
};

// CORS configuration supporting localhost, Vercel, and Cloudflare Pages
app.use(
  "*",
  cors({
    origin: (origin) => {
      if (!origin) return "*";
      try {
        const { hostname } = new URL(origin);
        if (
          hostname === "localhost" ||
          hostname === "127.0.0.1" ||
          hostname.endsWith(".vercel.app") ||
          hostname.endsWith(".pages.dev")
        ) {
          return origin;
        }
      } catch {}
      return origin;
    },
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true
  })
);

app.get("/health", (c) => {
  return c.json({
    status: "ok",
    service: "expense-splitter-api",
    runtime: "cloudflare-workers"
  });
});

app.get("/expenses", async (c) => {
  try {
    const collection = await getCollection(c.env);
    const expenses = await collection
      .find({ isHidden: { $ne: true } })
      .sort({ date: -1, createdAt: -1 })
      .toArray();

    return c.json({ expenses: expenses.map(serializeExpense) });
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return c.json({ message: error.message || "Failed to fetch expenses." }, 500);
  }
});

app.post("/expenses", async (c) => {
  try {
    const body = await c.req.json();
    const validation = validateExpenseInput(body);

    if (validation.message) {
      return c.json({ message: validation.message }, 400);
    }

    const collection = await getCollection(c.env);
    const now = new Date();
    const doc = {
      amount: validation.amount,
      amountCents: validation.amountCents,
      remarks: (body.remarks || "").trim(),
      paidBy: validation.paidBy,
      participants: validation.participants,
      date: validation.date || now,
      isHidden: false,
      createdAt: now,
      updatedAt: now
    };

    const result = await collection.insertOne(doc);
    const createdExpense = { ...doc, _id: result.insertedId };

    return c.json({ expense: serializeExpense(createdExpense) }, 201);
  } catch (error) {
    console.error("Error creating expense:", error);
    return c.json({ message: error.message || "Failed to create expense." }, 500);
  }
});

app.put("/expenses/:id", async (c) => {
  try {
    const id = c.req.param("id");
    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch {
      return c.json({ message: "Invalid expense ID format." }, 400);
    }

    const body = await c.req.json();
    const validation = validateExpenseInput(body);

    if (validation.message) {
      return c.json({ message: validation.message }, 400);
    }

    const collection = await getCollection(c.env);
    const now = new Date();
    const updates = {
      amount: validation.amount,
      amountCents: validation.amountCents,
      remarks: (body.remarks || "").trim(),
      paidBy: validation.paidBy,
      participants: validation.participants,
      ...(validation.date ? { date: validation.date } : {}),
      updatedAt: now
    };

    const updated = await collection.findOneAndUpdate(
      { _id: objectId },
      { $set: updates },
      { returnDocument: "after" }
    );

    if (!updated) {
      return c.json({ message: "Expense not found." }, 404);
    }

    return c.json({ expense: serializeExpense(updated) });
  } catch (error) {
    console.error("Error updating expense:", error);
    return c.json({ message: error.message || "Failed to update expense." }, 500);
  }
});

app.patch("/expenses/:id/hide", async (c) => {
  try {
    const id = c.req.param("id");
    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch {
      return c.json({ message: "Invalid expense ID format." }, 400);
    }

    const collection = await getCollection(c.env);
    const updated = await collection.findOneAndUpdate(
      { _id: objectId },
      { $set: { isHidden: true, updatedAt: new Date() } },
      { returnDocument: "after" }
    );

    if (!updated) {
      return c.json({ message: "Expense not found." }, 404);
    }

    return c.json({
      message: "Expense hidden.",
      expense: serializeExpense(updated)
    });
  } catch (error) {
    console.error("Error hiding expense:", error);
    return c.json({ message: error.message || "Failed to hide expense." }, 500);
  }
});

app.notFound((c) => {
  return c.json({ message: "Route not found." }, 404);
});

export default app;
