import { Router, type IRouter, type Request, type Response } from "express";
import { rateLimit } from "../lib/rate-limit";
import { requestToken, responseJson, supabaseRequest } from "../lib/supabase";

const router: IRouter = Router();
const validTarget = (value: unknown): value is "project" | "essay" =>
  value === "project" || value === "essay";
const idPattern = /^[\w-]{1,128}$/;

type AuthenticatedUser = { token: string; userId: string };

async function authenticated(
  req: Request,
  res: Response,
): Promise<AuthenticatedUser | undefined> {
  const token = requestToken(req);
  if (!token) {
    res.status(401).json({ error: "A Supabase session is required" });
    return undefined;
  }

  const response = await supabaseRequest("/auth/v1/user", { bearer: token });
  const user = await responseJson<{ id?: string }>(response);
  if (!response.ok || !user?.id) {
    res.status(401).json({ error: "Invalid or expired session" });
    return undefined;
  }
  return { token, userId: user.id };
}

async function resolveTarget(
  targetType: "project" | "essay",
  slug: string,
  token: string,
): Promise<{ column: "project_id" | "essay_id"; id: string } | undefined> {
  const table = targetType === "project" ? "projects" : "essays";
  const column = targetType === "project" ? "project_id" : "essay_id";
  const response = await supabaseRequest(
    `/rest/v1/${table}?slug=eq.${encodeURIComponent(slug)}&select=id&limit=1`,
    { bearer: token },
  );
  const rows = await responseJson<Array<{ id?: string }>>(response);
  const id = rows?.[0]?.id;
  return response.ok && id ? { column, id } : undefined;
}

router.use(rateLimit(30, 60_000));

router.post("/interactions/like", async (req, res): Promise<void> => {
  const identity = await authenticated(req, res);
  if (!identity) return;

  const { targetType, targetId } = req.body ?? {};
  if (!validTarget(targetType) || typeof targetId !== "string" || !idPattern.test(targetId)) {
    res.status(400).json({ error: "targetType and a valid targetId are required" });
    return;
  }

  const resolved = await resolveTarget(targetType, targetId, identity.token);
  if (!resolved) {
    res.status(404).json({ error: "That portfolio item does not exist" });
    return;
  }

  const targetFilter = `${resolved.column}=eq.${encodeURIComponent(resolved.id)}`;
  const existingResponse = await supabaseRequest(
    `/rest/v1/likes?user_id=eq.${encodeURIComponent(identity.userId)}&${targetFilter}&select=id&limit=1`,
    { bearer: identity.token },
  );
  const existing = await responseJson<Array<{ id?: string }>>(existingResponse);
  const existingId = existing?.[0]?.id;

  if (existingId) {
    const deleted = await supabaseRequest(
      `/rest/v1/likes?id=eq.${encodeURIComponent(existingId)}`,
      { method: "DELETE", bearer: identity.token },
    );
    if (!deleted.ok) {
      res.status(502).json({ error: "Unable to remove like" });
      return;
    }
  } else {
    const created = await supabaseRequest("/rest/v1/likes", {
      method: "POST",
      bearer: identity.token,
      headers: { Prefer: "return=minimal" },
      body: { user_id: identity.userId, [resolved.column]: resolved.id },
    });
    if (!created.ok) {
      res.status(502).json({ error: "Unable to save like" });
      return;
    }
  }

  const contentTable = targetType === "project" ? "projects" : "essays";
  const refreshed = await supabaseRequest(
    `/rest/v1/${contentTable}?id=eq.${encodeURIComponent(resolved.id)}&select=likes_count&limit=1`,
    { bearer: identity.token },
  );
  const refreshedRows = await responseJson<Array<{ likes_count?: number }>>(refreshed);
  res.json({
    liked: !existingId,
    likesCount: refreshedRows?.[0]?.likes_count ?? null,
  });
});

router.post("/interactions/comments", async (req, res): Promise<void> => {
  const identity = await authenticated(req, res);
  if (!identity) return;

  const { targetType, targetId, content } = req.body ?? {};
  if (
    !validTarget(targetType) ||
    typeof targetId !== "string" ||
    !idPattern.test(targetId) ||
    typeof content !== "string" ||
    content.trim().length < 1 ||
    content.length > 2000
  ) {
    res.status(400).json({ error: "Invalid target or comment; content must be 1–2000 characters" });
    return;
  }

  const resolved = await resolveTarget(targetType, targetId, identity.token);
  if (!resolved) {
    res.status(404).json({ error: "That portfolio item does not exist" });
    return;
  }

  const safeContent = content
    .replace(/<[^>]*>/g, "")
    .replace(/\u0000/g, "")
    .trim();
  if (!safeContent) {
    res.status(400).json({ error: "Comment content is empty" });
    return;
  }

  const result = await supabaseRequest("/rest/v1/comments", {
    method: "POST",
    bearer: identity.token,
    headers: { Prefer: "return=representation" },
    body: {
      user_id: identity.userId,
      [resolved.column]: resolved.id,
      content: safeContent,
    },
  });
  if (!result.ok) {
    res.status(502).json({ error: "Unable to save comment" });
    return;
  }

  const created = await responseJson<unknown>(result);
  res.status(201).json({ ok: true, comment: created });
});

export default router;