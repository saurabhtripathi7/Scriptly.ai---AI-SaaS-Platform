import express, { type Request, type Response } from "express";
import cors from "cors";
import "dotenv/config";
import { clerkMiddleware, requireAuth } from "@clerk/express";
import aiRouter from "./routes/aiRoutes";
import userRouter from "./routes/userRoutes";

const app = express();

/* ---------------- Health endpoints (no auth, no middleware) ---------------- */
app.get("/", (_req: Request, res: Response) => {
  res.send("Server is live on port " + (process.env.PORT || 4000));
});

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).send("OK");
});


/* ---------------- Middleware ---------------- */
app.use(cors({
  origin: [
    "http://localhost:5173",
    ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : [])
  ],
  credentials: true
}));

app.use(express.json());

app.use(clerkMiddleware());

/* ---------------- Protected routes ---------------- */
app.use(requireAuth());

app.use("/api/user", userRouter);
app.use("/api/ai", aiRouter);

/* ---------------- Server start ---------------- */
const port = parseInt(process.env.PORT || "4000", 10);

app.listen(port, "0.0.0.0", () => {
  console.log(`App is running on port ${port}`);
});
