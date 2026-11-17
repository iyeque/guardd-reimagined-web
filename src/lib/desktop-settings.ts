import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";

function isTauri(): boolean {
  return typeof window !== "undefined" && ("__TAURI__" in window || "__TAURI_INTERNALS__" in window);
}

export function useAutostart() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!isTauri()) {
      setLoading(false);
      return;
    }
    try {
      const v = await invoke<boolean>("plugin:autostart|is_enabled");
      setEnabled(v);
    } catch (e) {
      console.error("autostart load failed:", e);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggle = async () => {
    if (!isTauri()) return;
    setLoading(true);
    try {
      if (enabled) {
        await invoke("plugin:autostart|disable");
        setEnabled(false);
      } else {
        await invoke("plugin:autostart|enable");
        setEnabled(true);
      }
    } catch (e) {
      console.error("autostart toggle failed:", e);
    }
    setLoading(false);
  };

  return { enabled, loading, toggle, refresh: load };
}

export function sendDesktopNotification(title: string, body: string) {
  if (!isTauri()) return;
  invoke("send_notification", { title, body }).catch((e) => {
    console.error("notification failed:", e);
  });
}