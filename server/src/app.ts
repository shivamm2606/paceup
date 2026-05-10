import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import { ZodError } from "zod";
import { globalRateLimiter } from "./middlewares/rateLimiter.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import exerciseRoutes from "./routes/exercise.routes.js";
import workoutTemplateRoutes from "./routes/workoutTemplate.routes.js";
import workoutSessionRoutes from "./routes/workoutSession.routes.js";
import bodyweightRoutes from "./routes/bodyweight.routes.js";

dotenv.config();

const app = express();

app.set("trust proxy", true);

app.use(helmet());
app.use(morgan("dev"));
app.use(globalRateLimiter);

const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",")
  : [];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check
app.get("/api/v1/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/exercises", exerciseRoutes);
app.use("/api/v1/workout-templates", workoutTemplateRoutes);
app.use("/api/v1/workout-session", workoutSessionRoutes);
app.use("/api/v1/bodyweight", bodyweightRoutes);

// catch-all
app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Global error handler
const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof ZodError) {
    const errors = err.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  const status = err.statusCode || 500;
  const message =
    status === 500 && process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err.message;

  res.status(status).json({ success: false, message });
};

app.use(errorHandler);

export default app;
