import app from "./app.js";
import { env } from "./config/env.js";
import { checkDatabaseConnection } from "./config/database.js";
import { connectRedis } from "./config/redis.js";

async function startServer(): Promise<void> {
  try {
    await checkDatabaseConnection();
    await connectRedis();

    app.listen(env.port, () => {
      console.log(`Server running on http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
