import winston from "winston";
import { env } from "./env";

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

const consoleFormat = combine(
  colorize(),
  timestamp(),
  errors({ stack: true }),
  printf(({ level, message, timestamp: ts, stack }) => {
    return `${ts} [${level}] ${stack ?? message}`;
  })
);

export const logger = winston.createLogger({
  level: env.isProduction ? "info" : "debug",
  format: combine(timestamp(), errors({ stack: true }), json()),
  defaultMeta: { service: "employee-management-api" },
  transports: [
    new winston.transports.Console({ format: consoleFormat }),
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" })
  ]
});
