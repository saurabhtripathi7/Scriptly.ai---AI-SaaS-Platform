import { Request, Response } from "express";
import { clerkClient } from "@clerk/express";
import sql from "../configs/db";

/**
 * 1. FIX: Rename the import to avoid collision with the local function.
 * This resolves the "Import declaration conflicts with local declaration" error.
 */
import { getCredits as getRemainingCredits, INITIAL_FREE_LIMIT } from "../utils/creditHelper";

/* ---------- GET REMAINING CREDITS ---------- */
export const getCredits = async (req: Request, res: Response) => {
  try {
    const { userId } = req.auth();

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Use the aliased helper function
    const credits = await getRemainingCredits(userId);
    const plan = req.plan || "free";

    res.json({
      success: true,
      remaining: credits,
      plan,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ---------- DASHBOARD OVERVIEW ---------- */
export const getDashboardOverview = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const page = Number(req.query.page) || 0;
    const limit = 10;
    const offset = page * limit;

    const [recentCreations, countResult, currentCredits] = await Promise.all([
      sql`SELECT id, prompt, type, created_at AS "createdAt" 
          FROM creations WHERE user_id = ${userId} 
          ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`,
      sql`SELECT COUNT(*) as total FROM creations WHERE user_id = ${userId}`,
      getRemainingCredits(userId as string) // Use the aliased helper here
    ]);

    const totalCreations = Number(countResult[0]?.total ?? 0);
    const plan = req.plan || "free";

    res.json({
      success: true,
      creations: recentCreations,
      totalCreations,
      plan,
      usage: {
        // Correct math using the imported constant
        used: currentCredits === Infinity ? 0 : Math.max(0, INITIAL_FREE_LIMIT - (currentCredits as number)),
        limit: INITIAL_FREE_LIMIT,
        remaining: currentCredits
      },
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ success: false, message: "Failed to load dashboard" });
  }
};

/* ---------- FETCH SINGLE CREATION ---------- */
export const getCreationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.auth();

    const creation = await sql`
      SELECT * FROM creations 
      WHERE id = ${id} AND user_id = ${userId}
    `;

    if (!creation.length) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, creation: creation[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ---------- DELETE CREATION ---------- */
export const deleteCreation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.auth();

    const result = await sql`
      DELETE FROM creations 
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING id
    `;

    if (result.length === 0) return res.status(404).json({ success: false, message: "Unauthorized" });
    res.json({ success: true, message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Deletion failed" });
  }
};

/* ---------- TOGGLE PUBLISH ---------- */
export const togglePublishCreation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.auth();

    const result = await sql`
      UPDATE creations SET publish = NOT publish 
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING publish AS "isPublished"
    `;

    if (result.length === 0) return res.status(404).json({ success: false });
    res.json({ success: true, isPublished: result[0]?.isPublished });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

/* ---------- TOGGLE LIKE ---------- */
export const toggleLikeCreation = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    const { userId } = req.auth();

    const result = await sql`
      UPDATE creations
      SET likes = CASE 
        WHEN ${userId} = ANY(likes) THEN array_remove(likes, ${userId})
        ELSE array_append(likes, ${userId})
      END
      WHERE id = ${id}
      RETURNING likes
    `;

    if (!result[0]) return res.status(404).json({ success: false });
    res.json({ success: true, likes: result[0].likes });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

/* ---------- COMMUNITY FEED ---------- */
export const getPublishedCreations = async (req: Request, res: Response) => {
  try {
    const creations = await sql`
      SELECT id, prompt, content, type, likes, created_at AS "createdAt"
      FROM creations WHERE publish = true ORDER BY created_at DESC
    `;
    res.json({ success: true, creations: creations || [] });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};