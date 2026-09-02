import { Router, type IRouter } from "express";
import { fallbackPortfolio } from "../lib/fallback";
import { responseJson, supabaseRequest } from "../lib/supabase";

const router: IRouter = Router();
async function table(name: string): Promise<unknown[] | null> {
  const response = await supabaseRequest(`/rest/v1/${name}?select=*`);
  const data = await responseJson<unknown>(response);
  return Array.isArray(data) ? data : null;
}

router.get("/portfolio", async (_req, res): Promise<void> => {
  try {
    const [projects, essays, gallery, activity] = await Promise.all([
      table("projects"), table("essays"), table("gallery"), table("activity"),
    ]);
    if (projects && essays && gallery && activity) {
      res.json({ source: "supabase", projects, essays, gallery, activity });
      return;
    }
  } catch {
    // An un-migrated Supabase schema should not take the public site offline.
  }
  res.json({ source: "fallback", ...fallbackPortfolio });
});

export default router;