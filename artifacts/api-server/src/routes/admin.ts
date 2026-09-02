import { Router, type IRouter } from "express";
import { bearerToken, responseJson, supabaseRequest } from "../lib/supabase";

const router: IRouter = Router();
router.get("/admin/summary", async (req, res): Promise<void> => {
  const token = bearerToken(req.get("authorization"));
  if (!token) { res.status(401).json({ error: "Authentication required" }); return; }
  const userResponse = await supabaseRequest("/auth/v1/user", { bearer: token });
  const user = await responseJson<{ id?: string }>(userResponse);
  if (!userResponse.ok || !user?.id) { res.status(401).json({ error: "Invalid or expired bearer token" }); return; }
  const profileResponse = await supabaseRequest(`/rest/v1/profiles?id=eq.${encodeURIComponent(user.id)}&select=role`, { bearer: token });
  const profiles = await responseJson<Array<{ role?: string }>>(profileResponse);
  if (!profiles?.[0] || profiles[0].role !== "admin") { res.status(403).json({ error: "Admin access required" }); return; }
  const [projects, essays, comments] = await Promise.all([
    supabaseRequest("/rest/v1/projects?select=id", { bearer: token }),
    supabaseRequest("/rest/v1/essays?select=id", { bearer: token }),
    supabaseRequest("/rest/v1/comments?select=id", { bearer: token }),
  ]);
  res.json({ projects: projects.ok ? (await responseJson<unknown[]>(projects))?.length ?? 0 : 0, essays: essays.ok ? (await responseJson<unknown[]>(essays))?.length ?? 0 : 0, comments: comments.ok ? (await responseJson<unknown[]>(comments))?.length ?? 0 : 0 });
});
export default router;