import { clerkClient } from "@clerk/express";
import { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      free_usage: number;
      free_usage_of_premium_features: number;
      plan: "premium" | "free";
      userId: string;
      auth: any;
    }
  }
}

export const auth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, has } = await req.auth();

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    req.userId = userId;

    const hasPremiumPlan = await has({ plan: "premium" });

    const user = await clerkClient.users.getUser(userId);
    const metadata = user.privateMetadata ?? {};

    req.free_usage = Number(metadata.free_usage ?? 0);
    req.free_usage_of_premium_features = Number(
      metadata.free_usage_of_premium_features ?? 0
    );

    req.plan = hasPremiumPlan ? "premium" : "free";
    

    next();
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
