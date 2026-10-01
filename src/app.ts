import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { swaggerDocument } from "./config/swagger.js";
import healthRouter from "./routes/health.js";
import urlRouter from "./routes/url.js";
import redirectRouter from "./routes/redirect.js";
import analyticsRouter from "./routes/analytics.js";
import authRouter from "./routes/auth.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

app.use(express.json());

app.use("/docs", swaggerUi.serve);
app.get("/docs", swaggerUi.setup(swaggerDocument));

app.use("/health", healthRouter);
app.use("/auth", authRouter);
app.use("/urls", urlRouter);
app.use("/urls", analyticsRouter);
app.use("/", redirectRouter);

app.use(errorHandler);

export default app;
