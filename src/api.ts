import { supabase } from "./supabase";

const BASE = (process.env.EXPO_PUBLIC_API_BASE_URL ?? "").replace(/\/+$/, "");

/** Call the backend as the signed-in user (forwards their Supabase JWT). */
export async function api(path: string, init?: RequestInit): Promise<Response> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const headers: Record<string, string> = {
    "content-type": "application/json",
    ...((init?.headers as Record<string, string>) ?? {}),
  };
  if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;
  return fetch(`${BASE}${path}`, { ...init, headers });
}

export async function apiJson<T>(path: string): Promise<T | null> {
  try {
    const res = await api(path);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** Normalise an Indian phone number to E.164 for Supabase auth. */
export function toE164(raw: string): string | null {
  const cleaned = (raw || "").replace(/[^\d+]/g, "");
  if (cleaned.startsWith("+")) return cleaned.length >= 11 ? cleaned : null;
  const digits = cleaned.replace(/\D/g, "");
  if (digits.length === 10) return "+91" + digits;
  if (digits.length === 11 && digits.startsWith("0")) return "+91" + digits.slice(1);
  if (digits.length === 12 && digits.startsWith("91")) return "+" + digits;
  return digits.length >= 10 ? "+" + digits : null;
}
