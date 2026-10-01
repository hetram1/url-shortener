import express from "express";
import healthRouter from "./routes/health.js";
import urlRouter from "./routes/url.js";

const app = express();

app.use(express.json());

app.use("/health", healthRouter);
app.use("/urls", urlRouter);

export default app;
