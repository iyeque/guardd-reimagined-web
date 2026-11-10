import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { invoke } from "@tauri-apps/api/core";

function isTauri(): boolean {
  return typeof window !== "undefined" && ("__TAURI__" in window || "__TAURI_INTERNALS__" in window);
}

export function useAutostart() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isTauri()) return;
    invoke<boolean>("plugin:autostart|is_enabled").then((v) => {
      setEnabled(v);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

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

  return { enabled, loading, toggle };
}

export function sendDesktopNotification(title: string, body: string) {
  if (!isTauri()) return;
  invoke("send_notification", { title, body }).catch((e) => {
    console.error("notification failed:", e);
  });
}