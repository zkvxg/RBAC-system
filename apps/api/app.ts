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
// https-only headers stay off over plain http in development: safari
// (unlike chromium) applies them to localhost, upgrades asset requests to
// https and leaves pages such as /api/docs blank
const isProduction = env.NODE_ENV === "production";
app.use(
  helmet({
    hsts: isProduction,
    contentSecurityPolicy: {
      directives: { upgradeInsecureRequests: isProduction ? [] : null },
    },
  }),
);
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
