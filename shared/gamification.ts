// Shared gamification types and pure logic for the Digital Guardian points economy.
// Used by both the web app and the Tauri desktop app.

export type TaskKind = "online" | "offline";

export interface Task {
  id: string;
  title: string;
  kind: TaskKind;
  points: number;
  requiresConfirmation: boolean; // offline tasks need parent confirmation
  completedBy?: string; // member name
  confirmedBy?: string; // parent name
  completedAt?: number;
  confirmedAt?: number;
  status: "pending" | "completed" | "confirmed" | "rejected";
}

export interface PointsLedger {
  balance: number;
  earned: number;
  spent: number;
  transactions: PointsTransaction[];
}

export interface PointsTransaction {
  id: string;
  type: "earn" | "spend" | "redeem";
  amount: number;
  reason: string;
  timestamp: number;
  memberId?: string;
}

export interface Redemption {
  id: string;
  memberId: string;
  pointsSpent: number;
  minutesGranted: number;
  expiresAt: number; // when the extra time runs out
  createdAt: number;
}

// Points per task type
export const TASK_POINTS: Record<string, number> = {
  "commitment-fulfilled": 50,
  "commitment-milestone": 25,
  "online-task": 10,
  "offline-chore": 15,
  "daily-checkin": 5,
  "streak-bonus": 20,
};

// Redemption rate: 10 points = 5 minutes of extra screen time
export const POINTS_PER_MINUTE = 2; // 2 points per minute
export const MIN_REDEMPTION_POINTS = 10; // minimum 10 points = 5 minutes
export const MAX_REDEMPTION_MINUTES = 60; // max 1 hour extra per redemption

export function createLedger(): PointsLedger {
  return { balance: 0, earned: 0, spent: 0, transactions: [] };
}

export function earnPoints(
  ledger: PointsLedger,
  amount: number,
  reason: string,
  memberId?: string
): PointsLedger {
  const tx: PointsTransaction = {
    id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: "earn",
    amount,
    reason,
    timestamp: Date.now(),
    memberId,
  };
  return {
    balance: ledger.balance + amount,
    earned: ledger.earned + amount,
    spent: ledger.spent,
    transactions: [tx, ...ledger.transactions].slice(0, 100),
  };
}

export function spendPoints(
  ledger: PointsLedger,
  amount: number,
  reason: string,
  memberId?: string
): PointsLedger | null {
  if (ledger.balance < amount) return null;
  const tx: PointsTransaction = {
    id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: "spend",
    amount,
    reason,
    timestamp: Date.now(),
    memberId,
  };
  return {
    balance: ledger.balance - amount,
    earned: ledger.earned,
    spent: ledger.spent + amount,
    transactions: [tx, ...ledger.transactions].slice(0, 100),
  };
}

export function redeemPoints(
  ledger: PointsLedger,
  points: number,
  memberId: string
): { ledger: PointsLedger; redemption: Redemption } | null {
  if (points < MIN_REDEMPTION_POINTS) return null;
  if (ledger.balance < points) return null;
  const minutes = Math.min(Math.floor(points / POINTS_PER_MINUTE), MAX_REDEMPTION_MINUTES);
  if (minutes < 1) return null;

  const updated = spendPoints(ledger, points, `Redeemed ${minutes} min extra screen time`, memberId);
  if (!updated) return null;

  const redemption: Redemption = {
    id: `red-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    memberId,
    pointsSpent: points,
    minutesGranted: minutes,
    expiresAt: Date.now() + minutes * 60 * 1000,
    createdAt: Date.now(),
  };

  return { ledger: updated, redemption };
}

export function getActiveRedemptions(redemptions: Redemption[]): Redemption[] {
  const now = Date.now();
  return redemptions.filter((r) => r.expiresAt > now);
}

export function getTotalExtraMinutes(redemptions: Redemption[]): number {
  const now = Date.now();
  return redemptions
    .filter((r) => r.expiresAt > now)
    .reduce((sum, r) => sum + Math.ceil((r.expiresAt - now) / 60000), 0);
}