import OpenAI from "openai";
import sql from "../configs/db";
import { Request, Response } from "express";
import { getCredits, deductCredit } from "../utils/creditHelper";
import { retryWithBackoff } from "../utils/retryHelper";

/**
 * Controllers expect your auth middleware to set:
 *   req.userId (string) and req.plan ("premium" | "free")
 *
 * If your middleware doesn't do that yet, either:
 * - set them there; or
 * - replace r.userId / r.plan reads here with a different source.
 */

/* local request type so TS knows about userId and plan without global hacks */
type ReqWithUser = Request & { userId?: string; plan?: "premium" | "free" };

/* ---------- OPENROUTER CLIENT ---------- */
const ai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

/* ---------- COMMON CLEANER ---------- */
function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/`/g, "")
    .replace(/#{1,6}\s/g, "")
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function cleanTitle(title: string): string {
  let t = title.trim();

  t = t.replace(/^\d+[\).\-\s]*/, "");
  t = stripMarkdown(t);
  t = t.replace(/^["']|["']$/g, "");
  t = t.replace(/\s+/g, " ");
  t = t.replace(/[,\s]+$/, "");

  const open = (t.match(/\(/g) || []).length;
  const close = (t.match(/\)/g) || []).length;
  if (open > close) t += ")";

  return t.trim();
}

function cleanScript(text: string): string {
  return stripMarkdown(text)
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/* =====================================================
                    TITLE GENERATION
===================================================== */
export const generateTitles = async (req: Request, res: Response) => {
  const r = req as ReqWithUser;

  try {
    const userId = r.userId;
    const plan = r.plan ?? "free";

    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    // Premium users skip helper calls completely
    if (plan !== "premium") {
      const credits = await getCredits(userId);
      if (credits <= 0)
        return res.json({ success: false, message: "No credits left" });
    }

    const { platform, topic, keywords, tone } = req.body;

    if (!topic?.trim())
      return res.json({ success: false, message: "Topic required" });

    const prompt = `
Generate EXACTLY 5 high CTR ${platform} video titles.
Topic: ${topic}
Keywords: ${keywords || "None"}
Tone: ${tone}
Rules:
- One title per line
- No numbering
- No markdown
- No explanations
`;

    const completion = await retryWithBackoff(() =>
      ai.chat.completions.create({
        model: "openai/gpt-oss-20b:free",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 200,
      }),
    );

    const raw = completion.choices[0]?.message?.content || "";

    let titles = raw.split("\n");
    if (titles.length <= 1) titles = raw.split(",");

    titles = titles.map(cleanTitle).filter((t) => t.length > 10);
    titles = [...new Set(titles)];

    if (titles.length < 3)
      return res.json({ success: false, message: "Generation failed" });

    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, ${topic}, ${JSON.stringify(titles)}, 'Generate Title')
    `;

    // Deduct only for non-premium users
    let remainingCredits: number | null = null;
    if (plan !== "premium") {
      remainingCredits = await deductCredit(userId);
    }

    res.json({
      success: true,
      content: titles,
      remainingCredits, // null => unlimited / premium
    });
  } catch (err) {
    console.error("generateTitles error:", err);
    res.json({ success: false, message: "AI busy. Try again." });
  }
};

/* =====================================================
                  DESCRIPTION GENERATION
===================================================== */
export const generateDescription = async (req: Request, res: Response) => {
  const r = req as ReqWithUser;

  try {
    const userId = r.userId;
    const plan = r.plan ?? "free";

    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    if (plan !== "premium") {
      const credits = await getCredits(userId);
      if (credits <= 0)
        return res.json({ success: false, message: "No credits left" });
    }

    const { platform, topic, tone } = req.body;

    if (!topic?.trim())
      return res.json({ success: false, message: "Topic required" });

    const prompt = `
Generate a ${platform} video description.

Topic: ${topic}
Tone: ${tone}

Return format:

ABOUT:
<description>

TIMESTAMPS:
00:00 Intro
00:30 Topic

HASHTAGS:
#tag1 #tag2 #tag3

No markdown.
`;

    const completion = await retryWithBackoff(() =>
      ai.chat.completions.create({
        model: "openai/gpt-oss-20b:free",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 600,
      }),
    );

    const raw = completion.choices[0]?.message?.content || "";

    const aboutMatch = raw.match(/ABOUT:\s*([\s\S]*?)\nTIMESTAMPS:/i);
    const timestampsMatch = raw.match(/TIMESTAMPS:\s*([\s\S]*?)\nHASHTAGS:/i);
    const hashtagsMatch = raw.match(/HASHTAGS:\s*([\s\S]*)/i);

    const description = {
      about: aboutMatch?.[1]?.trim() || "",
      timestamps: timestampsMatch?.[1]?.trim() || "",
      hashtags: hashtagsMatch?.[1]?.trim() || "",
    };

    if (!description.about)
      return res.json({ success: false, message: "Parsing failed" });

    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, ${topic}, ${JSON.stringify(description)}, 'Generate Description')
    `;

    let remainingCredits: number | null = null;
    if (plan !== "premium") {
      remainingCredits = await deductCredit(userId);
    }

    res.json({
      success: true,
      content: description,
      remainingCredits,
    });
  } catch (err) {
    console.error("generateDescription error:", err);
    res.json({ success: false });
  }
};

/* =====================================================
                      SCRIPT
===================================================== */
export const generateScript = async (req: Request, res: Response) => {
  const r = req as ReqWithUser;

  try {
    const userId = r.userId;
    const plan = r.plan ?? "free";

    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    if (plan !== "premium") {
      const credits = await getCredits(userId);
      if (credits <= 0)
        return res.json({ success: false, message: "No credits left" });
    }

    const { platform, topic, audience, tone } = req.body;

    if (!topic?.trim())
      return res.json({ success: false, message: "Topic required" });

    const prompt = `
Create engaging ${platform} video script.
Topic: ${topic}
Audience: ${audience || "General"}
Tone: ${tone}
Structure:
- Hook
- Body
- Engagement prompts
- CTA ending
No markdown.
`;

    const completion = await retryWithBackoff(() =>
      ai.chat.completions.create({
        model: "openai/gpt-oss-20b:free",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 900,
      }),
    );

    const raw = completion.choices[0]?.message?.content || "";
    const script = cleanScript(raw);

    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, ${topic}, ${script}, 'Generate Script')
    `;

    let remainingCredits: number | null = null;
    if (plan !== "premium") {
      remainingCredits = await deductCredit(userId);
    }

    res.json({
      success: true,
      content: script,
      remainingCredits,
    });
  } catch (err) {
    console.error("generateScript error:", err);
    res.json({ success: false });
  }
};

/* =====================================================
                    THUMBNAIL (IMAGE GEN)
===================================================== */

/* eslint-disable @typescript-eslint/no-explicit-any */
declare const FormData: any;

export const generateThumbnail = async (req: Request, res: Response) => {
  const r = req as ReqWithUser;

  try {
    const userId = r.userId;
    const plan = r.plan ?? "free";
    const cost = 5; // Cost for image generation

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    /* ---------- PRE-GENERATION CREDIT CHECK ---------- */
    if (plan !== "premium") {
      const currentCredits = await getCredits(userId);
      // Verify user has enough credits before calling ClipDrop API
      if (currentCredits < cost) {
        return res.json({
          success: false,
          message: `Insufficient credits. Thumbnail generation requires ${cost} credits.`,
        });
      }
    }

    // Destructure platform along with prompt and style from request body
    const { prompt, style, platform } = req.body;

    if (!prompt?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Prompt required",
      });
    }

    /* ---------- DYNAMIC PROMPT CONSTRUCTION ---------- */
    // Platform is no longer hardcoded to 'YouTube'
    const finalPrompt = `
      Professional clickable ${platform || "social media"} thumbnail.
      Concept: ${prompt}
      Style: ${style || "High contrast"}
      High contrast, cinematic lighting, clean subject focus.
    `;

    const formData = new FormData();
    formData.append("prompt", finalPrompt);

    /* ---------- CLIPDROP API CALL ---------- */
    const response = await fetch("https://clipdrop-api.co/text-to-image/v1", {
      method: "POST",
      headers: {
        "x-api-key": process.env.CLIPDROP_API_KEY!,
      },
      body: formData,
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("clipdrop error:", err);
      return res.json({
        success: false,
        message: "ClipDrop generation failed",
      });
    }

    /* ---------- DATA PROCESSING ---------- */
    const buffer = Buffer.from(await response.arrayBuffer());
    const base64 = `data:image/png;base64,${buffer.toString("base64")}`;

    // Store creation in database
    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, ${prompt}, ${base64}, 'Generate Thumbnail')
    `;

    /* ---------- CREDIT DEDUCTION ---------- */
    let remainingCredits: number | null = null;
    if (plan !== "premium") {
      // Deduct the specified cost using the updated helper
      remainingCredits = await deductCredit(userId, cost);
    }

    res.json({
      success: true,
      content: base64,
      remainingCredits,
    });
  } catch (err) {
    console.error("generateThumbnail error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
