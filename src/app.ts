import express from "express";
import healthRouter from "./routes/health.js";
import urlRouter from "./routes/url.js";
import redirectRouter from "./routes/redirect.js";
import analyticsRouter from "./routes/analytics.js";
import authRouter from "./routes/auth.js";

const app = express();

app.use(express.json());

app.use("/health", healthRouter);
app.use("/auth", authRouter);
app.use("/urls", urlRouter);
app.use("/urls", analyticsRouter);
app.use("/", redirectRouter);

export default app;
