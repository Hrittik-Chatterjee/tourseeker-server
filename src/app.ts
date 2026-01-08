import express, { Application } from "express";
import cors from "cors";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import notFound from "./app/middlewares/notFound";
import router from "./app/routes";
import config from "./config";

const app: Application = express();

// CORS configuration
app.use(
  cors({
    origin: config.frontend_url,
    credentials: true,
  })
);

// Stripe webhook endpoint (requires raw body)
// MUST be before express.json() middleware
app.use(
  "/api/v1/payments/webhook",
  express.raw({ type: "application/json" })
);

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/", (req, res) => {
  res.send({
    message: "TourSeeker Server is running...",
    environment: config.node_env,
    uptime: process.uptime().toFixed(2) + " sec",
    timestamp: new Date().toISOString(),
  });
});

// Application routes
app.use("/api/v1", router);

// Error handlers
app.use(globalErrorHandler);
app.use(notFound);

export default app;
