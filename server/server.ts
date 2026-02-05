import express, { type Request, type Response } from "express";
import cors from "cors";
import "dotenv/config";
import { clerkMiddleware, requireAuth } from "@clerk/express";
import aiRouter from "./routes/aiRoutes";
import userRouter from "./routes/userRoutes";

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : [])
  ],
  credentials: true
}));


app.use(express.json());

app.use(clerkMiddleware());

/* Health check */
app.get("/", (_req: Request, res: Response) => {
  res.send("Server is live on port " + (process.env.PORT || 4000));
});

app.head("/", (_req: Request, res: Response) => {
  res.sendStatus(200);
});


/* Health endpoint for uptime monitoring */
app.get("/health", (_req: Request, res: Response) => {
  res.send("OK");
});

app.head("/health", (_req: Request, res: Response) => {
  res.sendStatus(200);
});

/* All routes below require authentication */
app.use(requireAuth());


app.use("/api/user", userRouter);
app.use("/api/ai", aiRouter);

const port = Number(process.env.PORT) || 4000;

app.listen(() => {
  console.log("Scriptly.AI API is running 🚀");
});
