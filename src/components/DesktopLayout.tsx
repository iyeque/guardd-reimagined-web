import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Shield, Trophy, Users, Settings, LayoutDashboard, X } from "lucide-react";

type DesktopView = "enforcement" | "gamification" | "family" | "settings";

interface DesktopLayoutProps {
  children: (view: DesktopView) => React.ReactNode;
}

export function DesktopLayout({ children }: DesktopLayoutProps) {
  const [view, setView] = useState<DesktopView>("enforcement");

  const navItems: { id: DesktopView; label: string; icon: React.ReactNode }[] = [
    { id: "enforcement", label: "Enforcement", icon: <Shield className="w-5 h-5" /> },
    { id: "gamification", label: "Rewards", icon: <Trophy className="w-5 h-5" /> },
    { id: "family", label: "Family", icon: <Users className="w-5 h-5" /> },
    { id: "settings", label: "Settings", icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-56 border-r border-border bg-card/50 flex flex-col">
        <div className="p-4 border-b border-border">
          <h1 className="text-lg font-black tracking-tight text-foreground">
            Digital <span className="text-teal-500">Guardian</span>
          </h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
            Desktop Companion
          </p>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                view === item.id
                  ? "bg-teal-500/10 text-teal-700 dark:text-teal-300"
                  : "text-muted-foreground hover:bg-muted/50"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-border">
          <p className="text-[9px] text-muted-foreground text-center">
            v0.1.0 · Minimizes to tray
          </p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children(view)}
      </main>
    </div>
  );
}