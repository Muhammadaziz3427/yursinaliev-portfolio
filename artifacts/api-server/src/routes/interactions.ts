import { Router, type IRouter, type Request, type Response } from "express";
import { rateLimit } from "../lib/rate-limit";
import { bearerToken, responseJson, supabaseRequest } from "../lib/supabase";

const router: IRouter = Router();
const target = (value: unknown): value is "project" | "essay" => value === "project" || value === "essay";
async function authenticated(req: Request, res: Response): Promise<string | undefined> {
  const token = bearerToken(req.get("authorization"));
  if (!token) { res.status(401).json({ error: "A Supabase bearer token is required" }); return undefined; }
  const user = await supabaseRequest("/auth/v1/user", { bearer: token });
  if (!user.ok) { res.status(401).json({ error: "Invalid or expired bearer token" }); return undefined; }
  return token;
}

router.use(rateLimit(30, 60_000));
router.post("/interactions/like", async (req, res): Promise<void> => {
  const token = await authenticated(req, res); if (!token) return;
  const { targetType, targetId } = req.body ?? {};
  if (!target(targetType) || typeof targetId !== "string" || !/^[\w-]{1,128}$/.test(targetId)) {
    res.status(400).json({ error: "targetType and a valid targetId are required" }); return;
  }
  const result = await supabaseRequest("/rest/v1/likes?on_conflict=user_id,target_type,target_id", {
    method: "POST", bearer: token, headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: { target_type: targetType, target_id: targetId },
  });
  if (!result.ok) { res.status(502).json({ error: "Unable to save like" }); return; }
  res.status(200).json({ ok: true });
});

router.post("/interactions/comments", async (req, res): Promise<void> => {
  const token = await authenticated(req, res); if (!token) return;
  const { targetType, targetId, content } = req.body ?? {};
  if (!target(targetType) || typeof targetId !== "string" || !/^[\w-]{1,128}$/.test(targetId) ||
      typeof content !== "string" || content.trim().length < 1 || content.length > 2000) {
    res.status(400).json({ error: "Invalid target or comment; content must be 1–2000 characters" }); return;
  }
  const result = await supabaseRequest("/rest/v1/comments", {
    method: "POST", bearer: token, body: { target_type: targetType, target_id: targetId, content: content.trim() },
  });
  if (!result.ok) { res.status(502).json({ error: "Unable to save comment" }); return; }
  const created = await responseJson<unknown>(result);
  res.status(201).json({ ok: true, comment: created });
});
export default router;