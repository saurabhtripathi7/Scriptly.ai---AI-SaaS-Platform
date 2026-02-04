import { clerkClient } from "@clerk/express";

/**
 * THE SOURCE OF TRUTH
 * This is the only place you need to change the credit limit.
 */
export const INITIAL_FREE_LIMIT = 20;

/* ---------- GET OR INIT USER CREDITS ---------- */
export async function getCredits(userId: string): Promise<number> {
  try {
    const user = await clerkClient.users.getUser(userId);
    const plan = user.privateMetadata?.plan || user.publicMetadata?.plan;

    if (plan === "premium") {
      return Infinity;
    }

    let credits = user.privateMetadata?.credits as number | undefined;

    if (credits === undefined) {
      credits = INITIAL_FREE_LIMIT;

      await clerkClient.users.updateUser(userId, {
        privateMetadata: {
          ...user.privateMetadata,
          credits,
        },
      });
    }

    return credits;
  } catch (error) {
    console.error("Error fetching/initializing credits:", error);
    return INITIAL_FREE_LIMIT;
  }
}

/* ---------- DEDUCT CREDIT (With Dynamic Cost) ---------- */
export async function deductCredit(userId: string, cost: number = 1): Promise<number> {
  try {
    const user = await clerkClient.users.getUser(userId);
    const plan = user.privateMetadata?.plan || user.publicMetadata?.plan;

    if (plan === "premium") {
      return Infinity;
    }

    let currentCredits = user.privateMetadata?.credits !== undefined 
      ? (user.privateMetadata.credits as number) 
      : INITIAL_FREE_LIMIT;

    // Check if user has enough credits for this specific cost
    if (currentCredits < cost) {
      return currentCredits; // Return current balance without deducting
    }

    const newCredits = currentCredits - cost;

    await clerkClient.users.updateUser(userId, {
      privateMetadata: {
        ...user.privateMetadata,
        credits: newCredits,
      },
    });

    return newCredits;
  } catch (error) {
    console.error("Error deducting credits:", error);
    return 0; 
  }
}