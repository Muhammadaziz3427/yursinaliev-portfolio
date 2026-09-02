import { ReplitConnectors } from "@replit/connectors-sdk";
import type { Request } from "express";

// Required runtime assumptions: the Supabase connector is attached to the Replit
// environment. APP_URL/CORS_ORIGIN/SUPABASE_OAUTH_REDIRECT_URL are optional
// deployment settings; no Supabase API key is read or stored by this service.

/** Connector requests deliberately create a client per call: connector tokens expire. */
export async function supabaseRequest(
  path: string,
  options: { method?: string; body?: unknown; bearer?: string; headers?: Record<string, string> } = {},
): Promise<Response> {
  const headers: Record<string, string> = { Accept: "application/json", ...options.headers };
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (options.bearer) headers.Authorization = `Bearer ${options.bearer}`;
  return new ReplitConnectors().proxy("supabase", path, {
    method: options.method ?? "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
}

export function bearerToken(header: string | undefined): string | undefined {
  if (!header) return undefined;
  const match = /^Bearer\s+([A-Za-z0-9._~+/=-]+)$/i.exec(header.trim());
  return match?.[1];
}

export function requestToken(req: Request): string | undefined {
  return bearerToken(req.get("authorization")) ?? req.cookies?.portfolio_access_token;
}

export async function responseJson<T>(response: Response): Promise<T | null> {
  if (!response.ok) return null;
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}