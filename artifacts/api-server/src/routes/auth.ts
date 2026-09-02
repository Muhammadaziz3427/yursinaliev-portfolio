import { Router, type IRouter } from "express";
import { rateLimit } from "../lib/rate-limit";
import { bearerToken, responseJson, supabaseRequest } from "../lib/supabase";

const router: IRouter = Router();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const callbackUrl = () => process.env.SUPABASE_OAUTH_REDIRECT_URL ?? `${process.env.APP_URL ?? ""}/api/auth/callback`;

router.get("/auth/status", async (req, res): Promise<void> => {
  const token = bearerToken(req.get("authorization"));
  if (!token) { res.json({ authenticated: false }); return; }
  const response = await supabaseRequest("/auth/v1/user", { bearer: token });
  const user = await responseJson<unknown>(response);
  res.json({ authenticated: response.ok, user: response.ok ? user : null });
});

router.post("/auth/magic-link", rateLimit(5, 15 * 60_000), async (req, res): Promise<void> => {
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  if (!emailPattern.test(email) || email.length > 254) {
    res.status(400).json({ error: "A valid email address is required" }); return;
  }
  const response = await supabaseRequest("/auth/v1/otp", {
    method: "POST", body: { email, create_user: true, email_redirect_to: callbackUrl() },
  });
  if (!response.ok) { res.status(502).json({ error: "Unable to send magic link" }); return; }
  res.json({ ok: true });
});

router.get("/auth/google", async (_req, res): Promise<void> => {
  const params = new URLSearchParams({ provider: "google", redirect_to: callbackUrl() });
  const response = await supabaseRequest(`/auth/v1/authorize?${params.toString()}`);
  const location = response.headers.get("location");
  if (location) { res.redirect(location); return; }
  res.status(502).json({ error: "Unable to start Google authentication" });
});

router.get("/auth/callback", async (req, res): Promise<void> => {
  const { code, token_hash: tokenHash, type } = req.query;
  let session: { access_token?: string; refresh_token?: string } | null = null;
  if (typeof code === "string") {
    session = await responseJson<{ access_token?: string; refresh_token?: string }>(
      await supabaseRequest("/auth/v1/token?grant_type=pkce", { method: "POST", body: { auth_code: code } }),
    );
  } else if (typeof tokenHash === "string" && typeof type === "string") {
    session = await responseJson<{ access_token?: string; refresh_token?: string }>(
      await supabaseRequest("/auth/v1/verify", { method: "POST", body: { token_hash: tokenHash, type } }),
    );
  }
  if (!session?.access_token) { res.status(400).json({ error: "Invalid or incomplete authentication callback" }); return; }
  const secure = process.env.NODE_ENV === "production";
  res.cookie("portfolio_access_token", session.access_token, { httpOnly: true, secure, sameSite: "lax", maxAge: 3600_000, path: "/" });
  if (session.refresh_token) res.cookie("portfolio_refresh_token", session.refresh_token, { httpOnly: true, secure, sameSite: "lax", maxAge: 30 * 24 * 3600_000, path: "/" });
  res.redirect(process.env.AUTH_SUCCESS_REDIRECT ?? "/");
});
export default router;