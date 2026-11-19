import { apiFetch } from "@/lib/api-client";

// Absolute URL + apiFetch so this works in the browser and the Tauri desktop
// webview (different origin) alike, exactly like desktop-enforcement.ts.
const API = "https://digitalguardianwellness.org/api/family/parent-pin";

function headers(token: string, json = false): Record<string, string> {
  const h: Record<string, string> = { Authorization: `Bearer ${token}` };
  if (json) h["Content-Type"] = "application/json";
  return h;
}

async function errorFrom(res: Response, fallback: string): Promise<Error> {
  const body = (await res.json().catch(() => ({}))) as { error?: string; lockedUntil?: string | null };
  const err = new Error(body.error || fallback) as Error & { lockedUntil?: string | null; status?: number };
  err.lockedUntil = body.lockedUntil ?? null;
  err.status = res.status;
  return err;
}

export type PinStatus = { enabled: boolean };
export type PinSetupResult = { enabled: boolean; recoveryCode: string };
export type PinVerifyResult = { ok: boolean; enabled?: boolean; lockedUntil?: string | null };

export const parentPinApi = {
  status: async (token: string): Promise<PinStatus> => {
    const res = await apiFetch(API, { headers: headers(token) });
    if (!res.ok) throw await errorFrom(res, "Could not read parent PIN status");
    return (await res.json()) as PinStatus;
  },

  setup: async (token: string, pin: string): Promise<PinSetupResult> => {
    const res = await apiFetch(`${API}/setup`, {
      method: "POST",
      headers: headers(token, true),
      body: JSON.stringify({ pin }),
    });
    if (!res.ok) throw await errorFrom(res, "Could not set parent PIN");
    return (await res.json()) as PinSetupResult;
  },

  verify: async (token: string, pin: string): Promise<PinVerifyResult> => {
    const res = await apiFetch(`${API}/verify`, {
      method: "POST",
      headers: headers(token, true),
      body: JSON.stringify({ pin }),
    });
    const body = (await res.json().catch(() => ({}))) as PinVerifyResult;
    return { ok: res.ok && !!body.ok, enabled: body.enabled, lockedUntil: body.lockedUntil ?? null };
  },

  reset: async (token: string, recoveryCode: string, pin: string): Promise<PinSetupResult> => {
    const res = await apiFetch(`${API}/reset`, {
      method: "POST",
      headers: headers(token, true),
      body: JSON.stringify({ recoveryCode, pin }),
    });
    if (!res.ok) throw await errorFrom(res, "Could not reset parent PIN");
    return (await res.json()) as PinSetupResult;
  },

  disable: async (token: string, creds: { pin?: string; recoveryCode?: string }): Promise<PinStatus> => {
    const res = await apiFetch(`${API}/disable`, {
      method: "POST",
      headers: headers(token, true),
      body: JSON.stringify(creds),
    });
    if (!res.ok) throw await errorFrom(res, "Could not disable parent PIN");
    return (await res.json()) as PinStatus;
  },
};
