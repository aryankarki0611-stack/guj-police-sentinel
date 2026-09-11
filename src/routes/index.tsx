import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Video,
  Wifi,
  Bell,
  Search as SearchIcon,
  ShieldCheck,
  X,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { GujaratMap } from "@/components/map/GujaratMap";
import { AlertCard } from "@/components/AlertCard";
import { StatusBadge, cameraTone } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { cameras, alerts, cases, evidence, recentActivity, type Camera } from "@/data/mock";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Command Center — SENTINEL CCTV Intelligence" },
      {
        name: "description",
        content:
          "SENTINEL command centre: live Gujarat camera map, watchlist alerts and investigation activity for police control rooms.",
      },
      { property: "og:title", content: "Command Center — SENTINEL CCTV Intelligence" },
      {
        property: "og:description",
        content: "Unified CCTV intelligence and investigation platform for Gujarat Police.",
      },
    ],
  }),
  component: CommandCenter,
});

function CommandCenter() {
  const [selected, setSelected] = useState<Camera | null>(null);
  const online = cameras.filter((c) => c.status !== "offline").length;
  const openAlerts = alerts.filter((a) => a.state === "open");

  return (
    <AppShell>
      <PageHeader
        title="Command Center"
        description="State-wide camera health, active alerts and investigation activity."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total cameras" value={cameras.length} icon={Video} hint="Across 8 departments" />
        <StatCard label="Online cameras" value={`${online}/${cameras.length}`} icon={Wifi} tone="ok" hint="3 offline" />
        <StatCard label="Active alerts" value={openAlerts.length} icon={Bell} tone="alert" hint="Awaiting verification" />
        <StatCard
          label="Active investigations"
          value={cases.filter((c) => c.status !== "Closed").length}
          icon={SearchIcon}
          hint="Open + under review"
        />
        <StatCard
          label="Evidence preserved"
          value={evidence.filter((e) => e.status === "PRESERVED").length}
          icon={ShieldCheck}
          tone="ok"
          hint="Hash-sealed items"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section className="space-y-3">
          <div className="relative">
            <GujaratMap
              cameras={cameras}
              selectedId={selected?.id ?? null}
              onSelect={setSelected}
              className="h-[560px]"
            />
            {selected ? (
              <div className="absolute right-3 top-3 w-72 rounded-md border border-border bg-popover p-3 shadow-lg">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-mono text-sm font-semibold text-foreground">{selected.id}</p>
                    <p className="text-xs text-muted-foreground">{selected.location}</p>
                  </div>
                  <button onClick={() => setSelected(null)} aria-label="Close camera panel">
                    <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  </button>
                </div>
                <dl className="mt-3 space-y-1.5 text-xs">
                  <Row label="Department" value={selected.department} />
                  <Row label="VMS source" value={selected.vmsSource} />
                  <Row label="Camera type" value={selected.type} />
                  <Row label="Last detection" value={selected.lastDetection ?? "No signal"} mono />
                </dl>
                <div className="mt-3 flex items-center justify-between">
                  <StatusBadge tone={cameraTone(selected.status)} dot>
                    {selected.status}
                  </StatusBadge>
                  <Button asChild size="sm">
                    <Link to="/cameras" search={{ camera: selected.id }}>
                      View camera
                    </Link>
                  </Button>
                </div>
              </div>
            ) : null}
          </div>

          <div className="panel p-3">
            <p className="label-caps mb-2">Recent activity</p>
            <ol className="space-y-2">
              {recentActivity.map((a) => (
                <li key={a.time + a.text} className="flex items-start gap-3 text-xs">
                  <span className="font-mono text-muted-foreground">{a.time.slice(11, 16)}</span>
                  <span
                    className={cn(
                      "mt-1 h-1.5 w-1.5 shrink-0 rounded-full",
                      a.kind === "ok" && "bg-ok",
                      a.kind === "warn" && "bg-warn",
                      a.kind === "alert" && "bg-alert",
                      a.kind === "info" && "bg-primary",
                    )}
                  />
                  <span className="text-foreground">{a.text}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="label-caps">Live alerts</p>
            <Button asChild size="sm" variant="ghost">
              <Link to="/alerts">All alerts</Link>
            </Button>
          </div>
          {openAlerts.map((a) => (
            <AlertCard key={a.id} alert={a} compact />
          ))}
        </section>
      </div>
    </AppShell>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="label-caps">{label}</dt>
      <dd className={cn("text-right text-foreground", mono && "font-mono")}>{value}</dd>
    </div>
  );
}
