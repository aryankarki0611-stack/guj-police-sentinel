import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BellRing, CheckCircle2, CircleAlert, Plus, Search, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/StatusBadge";
import { PLATES } from "@/data/mock";

export const Route = createFileRoute("/watchlist")({ component: WatchlistPage });

type WatchEntry = { id: string; plate: string; category: string; reason: string; status: "ACTIVE" | "SUSPENDED"; updated: string };

type AlertRow = { id: string; plate: string; camera: string; time: string; confidence: number; reason: string; state: "OPEN" | "VERIFIED" | "DISMISSED" };

const initialEntries: WatchEntry[] = [
  { id: "WL-001", plate: "GJ18EF4421", category: "STOLEN VEHICLE", reason: "Statewide stolen-vehicle watch", status: "ACTIVE", updated: "2026-09-12 08:10" },
  { id: "WL-002", plate: "GJ05CD7788", category: "WANTED", reason: "Investigation reference plate", status: "ACTIVE", updated: "2026-09-12 09:41" },
  { id: "WL-003", plate: "GJ06XY9123", category: "MISSING / LINKED VEHICLE", reason: "Associated with active case", status: "ACTIVE", updated: "2026-09-11 21:02" },
];

const initialAlerts: AlertRow[] = [
  { id: "ALT-2026-0451", plate: "GJ18EF4421", camera: "CAM-033", time: "2026-09-12 08:21:44", confidence: 0.91, reason: "Plate matched active STOLEN VEHICLE watchlist entry.", state: "OPEN" },
  { id: "ALT-2026-0438", plate: "GJ05CD7788", camera: "CAM-027", time: "2026-09-12 11:25:30", confidence: 0.87, reason: "Plate matched active WANTED entry.", state: "VERIFIED" },
];

function WatchlistPage() {
  const [rows, setRows] = useState(initialEntries);
  const [alerts, setAlerts] = useState(initialAlerts);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => rows.filter((r) => `${r.plate} ${r.category} ${r.reason}`.toLowerCase().includes(query.toLowerCase())), [rows, query]);

  const toggle = (id: string) => setRows((items) => items.map((r) => r.id === id ? { ...r, status: r.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE" } : r));
  const verify = (id: string, state: "VERIFIED" | "DISMISSED") => {
    setAlerts((items) => items.map((a) => a.id === id ? { ...a, state } : a));
    toast.success(`${id} ${state.toLowerCase()}`);
  };

  return (
    <AppShell>
      <PageHeader title="Watchlist & Alerts" description="Manage representative watchlist entries and review explainable detection matches." actions={<Button size="sm" onClick={() => toast.success("Watchlist entry form ready") }><Plus /> Add entry</Button>} />

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Active entries" value={String(rows.filter((r) => r.status === "ACTIVE").length)} icon={ShieldAlert} />
        <Stat label="Open alerts" value={String(alerts.filter((a) => a.state === "OPEN").length)} icon={BellRing} />
        <Stat label="Verified today" value={String(alerts.filter((a) => a.state === "VERIFIED").length)} icon={CheckCircle2} tone="ok" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <section className="space-y-3">
          <div className="panel p-3">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search plate, category or reason..." />
            </div>
          </div>
          <div className="panel overflow-hidden">
            <div className="border-b border-border px-4 py-3"><p className="label-caps">Watchlist</p></div>
            <div className="divide-y divide-border">
              {filtered.map((entry) => (
                <div key={entry.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-sm font-semibold">{entry.plate}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{entry.id} · {entry.category}</p>
                    </div>
                    <StatusBadge tone={entry.status === "ACTIVE" ? "alert" : "neutral"} dot>{entry.status}</StatusBadge>
                  </div>
                  <p className="mt-3 text-xs text-foreground">{entry.reason}</p>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="text-[11px] text-muted-foreground">Updated {entry.updated}</span>
                    <Button size="sm" variant="outline" onClick={() => toggle(entry.id)}>{entry.status === "ACTIVE" ? "Suspend" : "Activate"}</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <p className="label-caps">Match queue</p>
          {alerts.map((alert) => (
            <div key={alert.id} className="panel p-4">
              <div className="flex items-start gap-3">
                <CircleAlert className="mt-0.5 h-5 w-5 text-alert" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div><p className="font-mono text-sm font-semibold">{alert.plate}</p><p className="text-xs text-muted-foreground">{alert.id} · {alert.camera} · {alert.time}</p></div>
                    <StatusBadge tone={alert.state === "OPEN" ? "warn" : alert.state === "VERIFIED" ? "ok" : "neutral"}>{alert.state}</StatusBadge>
                  </div>
                  <div className="mt-3 rounded-sm border border-border bg-surface-raised p-3 text-xs">
                    <p className="label-caps">Why this alert fired</p>
                    <p className="mt-1 text-foreground">{alert.reason}</p>
                    <p className="mt-2 font-mono text-muted-foreground">Match confidence {(alert.confidence * 100).toFixed(0)}%</p>
                  </div>
                  {alert.state === "OPEN" ? (
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" onClick={() => verify(alert.id, "VERIFIED")}>Verify</Button>
                      <Button size="sm" variant="outline" onClick={() => verify(alert.id, "DISMISSED")}>Dismiss</Button>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </section>
      </div>

      <div className="panel p-4 text-xs text-muted-foreground">
        Demo watchlist entries use representative plates only. In the production flow, every detection should be compared against the active watchlist before an alert is created.
      </div>
    </AppShell>
  );
}

function Stat({ label, value, icon: Icon, tone = "default" }: { label: string; value: string; icon: typeof BellRing; tone?: "default" | "ok" }) {
  return <div className="panel flex items-center gap-3 px-4 py-3"><div className={tone === "ok" ? "flex h-9 w-9 items-center justify-center rounded-md bg-ok/10 text-ok" : "flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary"}><Icon className="h-4 w-4" /></div><div><p className="label-caps">{label}</p><p className="text-sm font-semibold">{value}</p></div></div>;
}
