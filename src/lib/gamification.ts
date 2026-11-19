import { useState, useEffect, useCallback } from "react";
import type { PointsLedger, Task, Redemption } from "@shared/gamification";
import {
  createLedger,
  earnPoints,
  spendPoints,
  redeemPoints,
  getActiveRedemptions,
  getTotalExtraMinutes,
  TASK_POINTS,
} from "@shared/gamification";
import { syncAndEnforce, publishRedemption } from "@/lib/desktop-enforcement";

const LEDGER_KEY = "dg_gamification_ledger";
const TASKS_KEY = "dg_gamification_tasks";
const REDEMPTIONS_KEY = "dg_gamification_redemptions";

function loadLedger(): PointsLedger {
  try {
    const raw = localStorage.getItem(LEDGER_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // Corrupt or unavailable storage — fall back to a fresh ledger.
  }
  return createLedger();
}

function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // Corrupt or unavailable storage — start with no tasks.
  }
  return [];
}

function loadRedemptions(): Redemption[] {
  try {
    const raw = localStorage.getItem(REDEMPTIONS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // Corrupt or unavailable storage — start with no redemptions.
  }
  return [];
}

export function useGamification() {
  const [ledger, setLedger] = useState<PointsLedger>(loadLedger);
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [redemptions, setRedemptions] = useState<Redemption[]>(loadRedemptions);

  useEffect(() => {
    localStorage.setItem(LEDGER_KEY, JSON.stringify(ledger));
  }, [ledger]);

  useEffect(() => {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(REDEMPTIONS_KEY, JSON.stringify(redemptions));
    // Re-evaluate enforcement AFTER the redemption is persisted, so a fresh
    // redemption immediately lifts the hosts block (and an expired one lets the
    // next sync re-apply it). No-op outside the desktop app.
    void syncAndEnforce();
  }, [redemptions]);

  const addTask = useCallback((task: Omit<Task, "id" | "status">) => {
    const newTask: Task = {
      ...task,
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      status: "pending",
    };
    setTasks((prev) => [newTask, ...prev]);
    return newTask;
  }, []);

  const completeTask = useCallback((taskId: string, memberName: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, status: "completed", completedBy: memberName, completedAt: Date.now() } : t
      )
    );
  }, []);

  const confirmTask = useCallback((taskId: string, parentName: string) => {
    setTasks((prev) => {
      const task = prev.find((t) => t.id === taskId);
      if (!task || task.status !== "completed") return prev;
      const points = task.points;
      setLedger((l) => earnPoints(l, points, `Task completed: ${task.title}`, task.completedBy));
      return prev.map((t) =>
        t.id === taskId ? { ...t, status: "confirmed", confirmedBy: parentName, confirmedAt: Date.now() } : t
      );
    });
  }, []);

  const rejectTask = useCallback((taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: "rejected" } : t))
    );
  }, []);

  const redeem = useCallback((points: number, memberId: string, pin?: string) => {
    // memberId may name several people ("Elise, Ben"). Spend the points once and
    // grant the same extra time to each — one redemption row per member, which is
    // exactly what the member-scoped extension lift consumes.
    const members = memberId.split(",").map((m) => m.trim()).filter(Boolean);
    if (members.length === 0) return null;
    const result = redeemPoints(ledger, points, members[0]);
    if (!result) return null;
    const grants = [result.redemption];
    for (let i = 1; i < members.length; i++) {
      grants.push({
        ...result.redemption,
        id: `red-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 8)}`,
        memberId: members[i],
        pointsSpent: 0, // the single spend is recorded on the first grant
      });
    }
    setLedger(result.ledger);
    setRedemptions((prev) => [...grants, ...prev]);
    // Record server-side so the browser extension lifts each member's block too,
    // not just the desktop hosts block. The optional PIN satisfies the parent gate.
    for (const g of grants) void publishRedemption(g, pin);
    return result.redemption;
  }, [ledger]);

  const activeRedemptions = getActiveRedemptions(redemptions);
  const extraMinutes = getTotalExtraMinutes(redemptions);

  return {
    ledger,
    tasks,
    redemptions: activeRedemptions,
    extraMinutes,
    addTask,
    completeTask,
    confirmTask,
    rejectTask,
    redeem,
    TASK_POINTS,
  };
}