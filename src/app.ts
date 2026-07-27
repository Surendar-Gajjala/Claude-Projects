import express, { Express } from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env";
import { swaggerSpec } from "./config/swagger";
import routes from "./routes";
import { requestLogger } from "./middleware/request-logger.middleware";
import { globalRateLimiter } from "./middleware/rate-limit.middleware";
import { notFoundHandler } from "./middleware/not-found.middleware";
import { errorHandler } from "./middleware/error.middleware";
import { successResponse } from "./utils/api-response";

export function createApp(): Express {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.allowedOrigins }));
  app.use(compression());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(requestLogger);
  app.use(globalRateLimiter);

  app.get("/health", (_req, res) => {
    res.status(200).json(successResponse("Service is healthy", { status: "up" }));
  });

  app.get("/api-docs.json", (_req, res) => {
    res.status(200).json(swaggerSpec);
  });
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.use("/api", routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
