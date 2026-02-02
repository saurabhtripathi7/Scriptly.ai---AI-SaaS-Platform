// Clerk backend client to fetch/update user data
import { clerkClient } from "@clerk/express";

// Express types for TypeScript safety
import type { Request, Response, NextFunction } from "express";

/*
|--------------------------------------------------------------------------
| Extend Express Request type
|--------------------------------------------------------------------------
|
| Express doesn't know about custom properties we attach to `req`.
| So we extend its type definition.
|
| After this, TypeScript allows:
|   req.free_usage
|   req.plan
|
| without errors.
|
*/
declare global {
  namespace Express {
    interface Request {
      // Number of free requests user has consumed
      free_usage: number;

      // Number of premium features used for free
      free_usage_of_premium_features: number;

      // User subscription type
      plan: "premium" | "free";

      // Added by Clerk middleware
      auth: any;
    }
  }
}

/*
|--------------------------------------------------------------------------
| Auth Middleware
|--------------------------------------------------------------------------
|
| Purpose:
|   1. Get logged-in user from Clerk
|   2. Check user's subscription plan
|   3. Load usage metadata from Clerk
|   4. Attach all info to request object
|
| So later routes don't need to re-fetch user info.
|
*/
export const auth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    /*
    ----------------------------------------------------------
    | Step 1: Get authentication info from Clerk
    ----------------------------------------------------------
    |
    | req.auth() is injected by Clerk middleware earlier.
    |
    | It returns:
    |   userId → logged in user
    |   has()  → helper to check permissions/plans
    |
    */
    const { userId, has } = await req.auth();

    /*
    ----------------------------------------------------------
    | Step 2: Check if user has premium plan
    ----------------------------------------------------------
    */
    const hasPremiumPlan = await has({ plan: "premium" });

    /*
    ----------------------------------------------------------
    | Step 3: Fetch user details from Clerk backend
    ----------------------------------------------------------
    |
    | Needed to read metadata like usage counters.
    |
    */
    const user = await clerkClient.users.getUser(userId);

    /*
    ----------------------------------------------------------
    | Step 4: Read private metadata safely
    ----------------------------------------------------------
    |
    | privateMetadata is server-only storage.
    | If empty, fallback to empty object.
    |
    */
    const privateMetadata = user.privateMetadata || {};

    /*
    ----------------------------------------------------------
    | Step 5: Attach usage info to request
    ----------------------------------------------------------
    |
    | If metadata doesn't exist yet,
    | default usage = 0.
    |
    | Now routes can simply use:
    |   req.free_usage
    |
    */
    req.free_usage = (privateMetadata.free_usage as number) || 0;

    req.free_usage_of_premium_features =
      (privateMetadata.free_usage_of_premium_features as number) || 0;

    /*
    ----------------------------------------------------------
    | Step 6: Attach plan info
    ----------------------------------------------------------
    */
    req.plan = hasPremiumPlan ? "premium" : "free";

    /*
    ----------------------------------------------------------
    | Step 7: Continue request pipeline
    ----------------------------------------------------------
    */
    next();
  } catch (error: any) {
    /*
    ----------------------------------------------------------
    | Error Handling
    ----------------------------------------------------------
    |
    | If Clerk or metadata fetching fails,
    | return safe error response instead of crashing server.
    |
    */
    return res
      .status(500)
      .json({ success: false, message: error.message });
  }
};
