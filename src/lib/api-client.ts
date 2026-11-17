import { fetch as tauriFetch } from "@tauri-apps/plugin-http";

function isTauri(): boolean {
  return (
    typeof window !== "undefined" &&
    ("__TAURI__" in window || "__TAURI_INTERNALS__" in window)
  );
}

/**
 * Cross-origin HTTP client that works in both the web app and the Tauri
 * desktop app.
 *
 * The desktop webview runs on `http://tauri.localhost`, which is a different
 * origin from the API. The browser's fetch enforces CORS and the API sends no
 * Access-Control-Allow-Origin header, so every call failed with
 * "TypeError: Failed to fetch" — the pairing UI then misreported that as an
 * invalid/expired token. Tauri's HTTP plugin performs the request from Rust and
 * is not subject to CORS, so desktop uses it; the browser keeps native fetch.
 */
export function apiFetch(
  url: string,
  init?: { headers?: Record<string, string>; method?: string }
): Promise<Response> {
  if (isTauri()) {
    return tauriFetch(url, init);
  }
  return fetch(url, init);
}
