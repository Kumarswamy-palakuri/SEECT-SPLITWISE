import { Hono } from "hono";
import { cors } from "hono/cors";
import { MongoClient, ObjectId } from "mongodb";
import { GROUP_MEMBERS, isGroupMember } from "./config/members.js";

const app = new Hono();

let cachedClient = null;

function isClientClosed(client) {
  if (!client) return true;
  try {
    if (!client.topology) return false;
    if (typeof client.topology.isDestroyed === "function" && client.topology.isDestroyed()) {
      return true;
    }
    if (typeof client.topology.isClosed === "function" && client.topology.isClosed()) {
      return true;
    }
    const state = client.topology.s?.state;
    if (state === "closed" || state === "destroying") {
      return true;
    }
    return false;
  } catch {
    return true;
  }
}

async function createClient(uri) {
  const client = new MongoClient(uri, {
    maxPoolSize: 1,
    minPoolSize: 0,
    serverSelectionTimeoutMS: 8000,
    connectTimeoutMS: 10000,
    maxIdleTimeMS: 15000
  });
  await client.connect();
  return client;
}

async function getCollection(env) {
  const uri = env?.MONGO_URI || env?.MONGODB_URI || process.env?.MONGO_URI;
  if (!uri) {
    throw new Error(
      "MONGO_URI environment variable is missing. Set it via 'npx wrangler secret put MONGO_URI' or in your Cloudflare dashboard."
    );
  }

  if (isClientClosed(cachedClient)) {
    if (cachedClient) {
      try {
        await cachedClient.close();
      } catch {}
    }
    cachedClient = await createClient(uri);
  }

  const dbName = uri.split("/").pop()?.split("?")[0] || "Splitwise";
  return cachedClient.db(dbName).collection("expenses");
}

async function withCollection(env, operation) {
  try {
    const collection = await getCollection(env);
    return await operation(collection);
  } catch (error) {
    const isTopologyOrConnError =
      error?.name === "MongoTopologyClosedError" ||
      error?.name === "MongoServerSelectionError" ||
      error?.name === "MongoNetworkError" ||
      /topology is closed|connection closed|closed topology|timed out/i.test(error?.message || "");

    if (isTopologyOrConnError) {
      console.warn("MongoDB connection dropped or topology closed. Reconnecting fresh client and retrying...");
      if (cachedClient) {
        try {
          await cachedClient.close();
        } catch {}
      }
      cachedClient = null;

      try {
        const collection = await getCollection(env);
        return await operation(collection);
      } catch (retryError) {
        // If it still fails, provide helpful troubleshooting for IP whitelist / Atlas
        if (
          retryError?.name === "MongoServerSelectionError" ||
          /topology is closed|timed out/i.test(retryError?.message || "")
        ) {
          throw new Error(
            `MongoDB connection failed (${retryError.message}). Please ensure '0.0.0.0/0' (Allow access from anywhere) is whitelisted in MongoDB Atlas -> Network Access.`
          );
        }
        throw retryError;
      }
    }
    throw error;
  }
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
    const expenses = await withCollection(c.env, async (collection) => {
      return await collection
        .find({ isHidden: { $ne: true } })
        .sort({ date: -1, createdAt: -1 })
        .toArray();
    });

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

    const createdExpense = await withCollection(c.env, async (collection) => {
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
      return { ...doc, _id: result.insertedId };
    });

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

    const updated = await withCollection(c.env, async (collection) => {
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

      return await collection.findOneAndUpdate(
        { _id: objectId },
        { $set: updates },
        { returnDocument: "after" }
      );
    });

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

    const updated = await withCollection(c.env, async (collection) => {
      return await collection.findOneAndUpdate(
        { _id: objectId },
        { $set: { isHidden: true, updatedAt: new Date() } },
        { returnDocument: "after" }
      );
    });

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
