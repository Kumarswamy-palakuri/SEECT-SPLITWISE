import dotenv from "dotenv";
import { app } from "./app.js";
import { connectDatabase } from "./config/db.js";

dotenv.config();

const port = process.env.PORT || 5000;

// Only start standalone HTTP server when running locally (not in serverless/Vercel)
if (!process.env.VERCEL) {
  connectDatabase()
    .then(() => {
      app.listen(port, () => {
        console.log(`Expense Splitter API running on http://localhost:${port}`);
      });
    })
    .catch((error) => {
      console.error("Failed to start server:", error.message);
      process.exit(1);
    });
}

export default app;
