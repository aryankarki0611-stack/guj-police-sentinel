import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Cable, CheckCircle2, Database, Network, Plus, RefreshCw, ServerCog, ShieldCheck, Wifi } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/StatusBadge";

export const Route = createFileRoute("/integration")({ component: IntegrationPage });

type Source = { id: string; department: string; vendor: string; protocol: string; cameras: number; status: "Connected" | "Degraded" | "Needs config" };

const initialSources: Source[] = [
  { id: "VMS-01", department: "Traffic Police", vendor: "Milestone XProtect", protocol: "ONVIF / RTSP", cameras: 1240, status: "Connected" },
  { id: "VMS-02", department: "RTO", vendor: "Hikvision HikCentral", protocol: "Vendor SDK", cameras: 486, status: "Connected" },
  { id: "VMS-03", department: "Food & Civil Supplies", vendor: "Dahua DSS", protocol: "API / RTSP", cameras: 214, status: "Degraded" },
  { id: "VMS-04", department: "Municipal Corporation", vendor: "Genetec Security Center", protocol: "API / ONVIF", cameras: 880, status: "Needs config" },
];

function IntegrationPage() {
  const [sources, setSources] = useState(initialSources);
  const [filter, setFilter] = useState("");
  const connected = useMemo(() => sources.reduce((sum, s) => sum + s.cameras, 0), [sources]);
  const filtered = sources.filter((s) => `${s.department} ${s.vendor} ${s.protocol}`.toLowerCase().includes(filter.toLowerCase()));

  const test = (id: string) => {
    setSources((items) => items.map((s) => s.id === id ? { ...s, status: "Connected" } : s));
    toast.success(`${id} connection test passed`, { description: "Federation adapter handshake completed in demo mode." });
  };

  return (
    <AppShell>
      <PageHeader title="Integration Center" description="Model 2 direct viewing plus Model 3 federation adapters for heterogeneous departmental VMS environments." actions={<Button size="sm" onClick={() => toast.success("New adapter form ready") }><Plus /> Add VMS source</Button>} />

      <div className="grid gap-3 sm:grid-cols-4">
        <Metric label="Federated sources" value={String(sources.length)} icon={Network} />
        <Metric label="Cameras represented" value={connected.toLocaleString()} icon={Database} />
        <Metric label="Protocols" value="4" icon={Cable} />
        <Metric label="Vendor-neutral layer" value="READY" icon={ShieldCheck} tone="ok" />
      </div>

      <div className="panel p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Search department, vendor or protocol..." className="max-w-xl" />
          <Button variant="outline" size="sm" onClick={() => toast("Federation health check queued") }><RefreshCw /> Health check</Button>
        </div>
      </div>

      <div className="panel overflow-hidden">
        <div className="border-b border-border px-4 py-3"><p className="label-caps">Departmental VMS federation registry</p></div>
        <div className="divide-y divide-border">
          {filtered.map((s) => (
            <div key={s.id} className="grid gap-3 p-4 lg:grid-cols-[90px_1fr_1fr_1.2fr_100px_130px] lg:items-center">
              <span className="font-mono text-xs font-semibold">{s.id}</span>
              <div><p className="text-sm font-medium">{s.department}</p><p className="text-xs text-muted-foreground">Department source</p></div>
              <div><p className="text-sm">{s.vendor}</p><p className="text-xs text-muted-foreground">{s.cameras.toLocaleString()} cameras</p></div>
              <div className="rounded-sm border border-border bg-surface-raised px-3 py-2"><p className="label-caps">Adapter protocol</p><p className="text-xs text-foreground">{s.protocol}</p></div>
              <StatusBadge tone={s.status === "Connected" ? "ok" : s.status === "Degraded" ? "warn" : "neutral"} dot>{s.status}</StatusBadge>
              <Button size="sm" variant="outline" onClick={() => test(s.id)}><Wifi /> Test</Button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <InfoCard icon={ServerCog} title="Model 2 · Direct Viewing" text="Connect a central interface directly to a departmental VMS using RTSP, ONVIF, vendor SDKs or APIs." />
        <InfoCard icon={Network} title="Model 3 · Federation" text="Normalize vendor-specific APIs and metadata behind a single downstream interface." />
        <InfoCard icon={Database} title="Scale to 80k" text="Keep adapters stateless, partition feeds by region and move persistent metadata into a spatial database." />
      </div>
    </AppShell>
  );
}

function Metric({ label, value, icon: Icon, tone = "default" }: { label: string; value: string; icon: typeof Network; tone?: "default" | "ok" }) {
  return <div className="panel flex items-center gap-3 p-4"><div className={tone === "ok" ? "flex h-9 w-9 items-center justify-center rounded-md bg-ok/10 text-ok" : "flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary"}><Icon className="h-4 w-4" /></div><div><p className="label-caps">{label}</p><p className="text-sm font-semibold">{value}</p></div></div>;
}

function InfoCard({ icon: Icon, title, text }: { icon: typeof Network; title: string; text: string }) {
  return <div className="panel p-4"><Icon className="h-5 w-5 text-primary" /><p className="mt-3 font-semibold text-foreground">{title}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{text}</p></div>;
}
