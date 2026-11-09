import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useGamification } from "@/lib/gamification";

function isTauri(): boolean {
  return typeof window !== "undefined" && ("__TAURI__" in window || "__TAURI_INTERNALS__" in window);
}

export function GamificationPanel() {
  const {
    ledger,
    tasks,
    extraMinutes,
    addTask,
    completeTask,
    confirmTask,
    rejectTask,
    redeem,
    TASK_POINTS,
  } = useGamification();

  const [taskTitle, setTaskTitle] = useState("");
  const [taskKind, setTaskKind] = useState<"online" | "offline">("offline");
  const [redeemPoints, setRedeemPoints] = useState(10);
  const [memberName, setMemberName] = useState("");

  const pendingTasks = tasks.filter((t) => t.status === "pending");
  const completedTasks = tasks.filter((t) => t.status === "completed");
  const confirmedTasks = tasks.filter((t) => t.status === "confirmed");

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    addTask({
      title: taskTitle.trim(),
      kind: taskKind,
      points: taskKind === "offline" ? TASK_POINTS["offline-chore"] : TASK_POINTS["online-task"],
      requiresConfirmation: taskKind === "offline",
    });
    setTaskTitle("");
  };

  const handleRedeem = () => {
    if (!memberName.trim()) return;
    const result = redeem(redeemPoints, memberName.trim());
    if (result) {
      alert(`Redeemed ${result.minutesGranted} minutes of extra screen time!`);
    } else {
      alert("Not enough points or invalid amount.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Points balance */}
      <div className="rounded-xl border-2 border-border bg-gradient-to-r from-teal-500/10 to-purple-500/10 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Points Balance</p>
            <p className="text-3xl font-black text-foreground">{ledger.balance}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Earned</p>
            <p className="text-lg font-bold text-teal-600">{ledger.earned}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Extra Time</p>
            <p className="text-lg font-bold text-purple-600">{extraMinutes} min</p>
          </div>
        </div>
      </div>

      {/* Redeem points */}
      <div className="rounded-xl border-2 border-border bg-white/50 dark:bg-white/5 p-4 space-y-3">
        <h3 className="text-sm font-black uppercase tracking-widest text-foreground">
          Redeem Points for Extra Screen Time
        </h3>
        <p className="text-[11px] text-muted-foreground">
          2 points = 1 minute. Min 10 points (5 min). Max 60 min per redemption.
        </p>
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Member</label>
            <input
              type="text"
              value={memberName}
              onChange={(e) => setMemberName(e.target.value)}
              placeholder="Child's name"
              className="w-full rounded-xl border-2 border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="w-24">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Points</label>
            <input
              type="number"
              value={redeemPoints}
              onChange={(e) => setRedeemPoints(Number(e.target.value))}
              min={10}
              max={ledger.balance}
              className="w-full rounded-xl border-2 border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          <Button
            type="button"
            onClick={handleRedeem}
            disabled={!memberName.trim() || redeemPoints < 10 || redeemPoints > ledger.balance}
            className="shrink-0 rounded-xl text-xs font-black uppercase tracking-widest"
          >
            Redeem
          </Button>
        </div>
      </div>

      {/* Add task */}
      <div className="rounded-xl border-2 border-border bg-white/50 dark:bg-white/5 p-4 space-y-3">
        <h3 className="text-sm font-black uppercase tracking-widest text-foreground">
          Create Task (Carrot)
        </h3>
        <form onSubmit={handleAddTask} className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="Task title (e.g., 'Clean room', 'Finish homework')"
              className="flex-1 rounded-xl border-2 border-border bg-background px-3 py-2 text-sm"
            />
            <select
              value={taskKind}
              onChange={(e) => setTaskKind(e.target.value as "online" | "offline")}
              className="rounded-xl border-2 border-border bg-background px-3 py-2 text-sm"
            >
              <option value="offline">Offline (chore)</option>
              <option value="online">Online task</option>
            </select>
            <Button type="submit" disabled={!taskTitle.trim()} className="shrink-0 rounded-xl text-xs font-black uppercase tracking-widest">
              Add
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Offline tasks require parent confirmation before points are awarded.
          </p>
        </form>
      </div>

      {/* Pending tasks (child completes) */}
      {pendingTasks.length > 0 && (
        <div className="rounded-xl border-2 border-border bg-white/50 dark:bg-white/5 p-4 space-y-2">
          <h3 className="text-sm font-black uppercase tracking-widest text-foreground">
            Pending Tasks
          </h3>
          {pendingTasks.map((task) => (
            <div key={task.id} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
              <div>
                <p className="text-sm font-medium text-foreground">{task.title}</p>
                <p className="text-[10px] text-muted-foreground">
                  {task.kind === "offline" ? "Offline chore" : "Online task"} · {task.points} pts
                  {task.requiresConfirmation ? " · needs parent approval" : ""}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => completeTask(task.id, memberName || "Child")}
                className="rounded-xl text-xs font-black uppercase tracking-widest"
              >
                Done
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Completed tasks (parent confirms) */}
      {completedTasks.length > 0 && (
        <div className="rounded-xl border-2 border-border bg-amber-500/5 p-4 space-y-2">
          <h3 className="text-sm font-black uppercase tracking-widest text-foreground">
            Awaiting Parent Confirmation
          </h3>
          {completedTasks.map((task) => (
            <div key={task.id} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
              <div>
                <p className="text-sm font-medium text-foreground">{task.title}</p>
                <p className="text-[10px] text-muted-foreground">
                  Completed by {task.completedBy} · {task.points} pts
                </p>
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  onClick={() => confirmTask(task.id, "Parent")}
                  className="rounded-xl text-xs font-black uppercase tracking-widest bg-teal-600 text-white"
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => rejectTask(task.id)}
                  className="rounded-xl text-xs font-black uppercase tracking-widest"
                >
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmed tasks */}
      {confirmedTasks.length > 0 && (
        <div className="rounded-xl border-2 border-border bg-teal-500/5 p-4 space-y-2">
          <h3 className="text-sm font-black uppercase tracking-widest text-foreground">
            Completed ({confirmedTasks.length})
          </h3>
          {confirmedTasks.slice(0, 5).map((task) => (
            <div key={task.id} className="flex items-center justify-between py-1">
              <p className="text-sm text-foreground">{task.title}</p>
              <span className="text-xs font-bold text-teal-600">+{task.points} pts</span>
            </div>
          ))}
        </div>
      )}

      {/* Recent transactions */}
      {ledger.transactions.length > 0 && (
        <div className="rounded-xl border-2 border-border bg-white/50 dark:bg-white/5 p-4 space-y-1">
          <h3 className="text-sm font-black uppercase tracking-widest text-foreground mb-2">
            Recent Transactions
          </h3>
          {ledger.transactions.slice(0, 8).map((tx) => (
            <div key={tx.id} className="flex items-center justify-between py-1 text-xs">
              <span className="text-muted-foreground">{tx.reason}</span>
              <span className={tx.type === "earn" ? "text-teal-600 font-bold" : "text-rose-600 font-bold"}>
                {tx.type === "earn" ? "+" : "-"}{tx.amount}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}