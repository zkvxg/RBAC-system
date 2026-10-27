import express from "express";
import cors from "cors";
import helmet from "helmet";
import env from "./config/env";
import { requestLogger } from "./middleware/requestLogger";
import healthRoutes from "./routes/healthRoutes";
import authRoutes from "./routes/authRoutes";
import roleRoutes from "./routes/roleRoutes";
import userRoutes from "./routes/userRoutes";
import docsRoutes from "./routes/docsRoutes";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler";

export const app = express();

app.use(requestLogger);
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) =>
      callback(null, !origin || env.CORS_ORIGINS.includes(origin)),
  }),
);
app.use(express.json({ limit: "100kb" }));

app.use("/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/users", userRoutes);
if (env.API_DOCS) {
  app.use("/api/docs", docsRoutes);
}

app.use(notFoundHandler);
app.use(errorHandler);
