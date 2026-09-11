import type { ReactNode } from "react";
import { CircleUser, Radio } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { LiveClock } from "./LiveClock";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface px-5 py-2.5">
          <div>
            <p className="text-sm font-semibold tracking-[0.16em] text-foreground">SENTINEL</p>
            <p className="text-xs text-muted-foreground">Unified CCTV Intelligence &amp; Investigation Platform</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-ok">
              <Radio className="h-3.5 w-3.5" /> Realtime connected
            </span>
            <LiveClock withDate className="font-mono text-muted-foreground" />
            <span className="flex items-center gap-1.5 rounded-sm border border-border bg-surface-raised px-2 py-1 text-foreground">
              <CircleUser className="h-3.5 w-3.5" /> Demo Officer · Gandhinagar Control Room
            </span>
          </div>
        </header>
        <main className="min-w-0 flex-1 space-y-5 p-5">{children}</main>
      </div>
    </div>
  );
}
