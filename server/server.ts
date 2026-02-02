import express, { type Request, type Response } from "express";
import cors from "cors";
import "dotenv/config";
import { clerkMiddleware, requireAuth } from "@clerk/express";

// import connectCloudinary from "./config/cloudinary";
// import userRouter from "./routes/userRoutes";

const app = express();

// connectCloudinary();

app.use(cors());
app.use(express.json());

// Clerk adds req.auth()
app.use(clerkMiddleware());

/*
|--------------------------------------------------------------------------
| Health check route
|--------------------------------------------------------------------------
*/
app.get("/", (_req: Request, res: Response) => {
  res.send("Server is live on port " + (process.env.PORT || 4000));
});

/*
|--------------------------------------------------------------------------
| All routes below require authentication
|--------------------------------------------------------------------------
*/
app.use(requireAuth());

// app.use("/api/user", userRouter);

/*
|--------------------------------------------------------------------------
| Start server
|--------------------------------------------------------------------------
*/
const port = Number(process.env.PORT) || 4000;

app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});
