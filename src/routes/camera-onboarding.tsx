import { useMemo, useState, type ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, FileUp, MapPin, Plus, Upload, Waypoints } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/StatusBadge";
import { CAMERA_TYPES, DEPARTMENTS, VMS_SOURCES } from "@/data/mock";

export const Route = createFileRoute("/camera-onboarding")({ component: CameraOnboardingPage });

const seedPreview = [
  { id: "CAM-051", department: "RTO", location: "Ahmedabad Checkpoint", type: "Fixed ANPR", vms: "Hikvision HikCentral" },
  { id: "CAM-052", department: "Traffic Police", location: "Ring Road Junction", type: "Junction Overview", vms: "Milestone XProtect" },
  { id: "CAM-053", department: "Food & Civil Supplies", location: "PDS Warehouse", type: "Bullet", vms: "Dahua DSS" },
];

function CameraOnboardingPage() {
  const [records, setRecords] = useState(seedPreview);
  const [form, setForm] = useState(seedPreview[0]);
  const [tab, setTab] = useState<"manual" | "bulk" | "api">("manual");
  const [csvName, setCsvName] = useState("");
  const total = useMemo(() => records.length, [records]);

  const add = () => {
    if (!form.id || !form.location) return toast.error("Camera ID and location are required");
    setRecords((items) => [form, ...items]);
    toast.success(`${form.id} added to demo registry`);
  };

  return (
    <AppShell>
      <PageHeader title="Camera Onboarding" description="Model 1 registry workflow: manual, bulk and API-style onboarding for heterogeneous cameras." />

      <div className="grid gap-3 sm:grid-cols-3">
        <Metric label="Pending preview records" value={String(total)} icon={Waypoints} />
        <Metric label="Onboarding modes" value="3" icon={Upload} />
        <Metric label="GIS-ready metadata" value="100%" icon={MapPin} tone="ok" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <section className="panel p-4">
          <div className="flex gap-1 border-b border-border pb-2">
            {(["manual", "bulk", "api"] as const).map((value) => <button key={value} onClick={() => setTab(value)} className={`rounded-sm px-3 py-2 text-xs font-semibold uppercase tracking-wide ${tab === value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"}`}>{value}</button>)}
          </div>

          {tab === "manual" ? (
            <div className="mt-4 space-y-3">
              <Field label="Camera ID"><Input value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} /></Field>
              <Field label="Department"><select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>{DEPARTMENTS.map((x) => <option key={x}>{x}</option>)}</select></Field>
              <Field label="Location"><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></Field>
              <div className="grid gap-3 sm:grid-cols-2"><Field label="Camera type"><select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>{CAMERA_TYPES.map((x) => <option key={x}>{x}</option>)}</select></Field><Field label="VMS source"><select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.vms} onChange={(e) => setForm({ ...form, vms: e.target.value })}>{VMS_SOURCES.map((x) => <option key={x}>{x}</option>)}</select></Field></div>
              <Button onClick={add}><Plus /> Add to registry</Button>
            </div>
          ) : null}

          {tab === "bulk" ? (
            <div className="mt-4 space-y-4">
              <div className="rounded-md border border-dashed border-border bg-surface-raised p-8 text-center"><FileUp className="mx-auto h-7 w-7 text-primary" /><p className="mt-2 font-medium">Upload CSV</p><p className="mt-1 text-xs text-muted-foreground">camera_id, department, location, latitude, longitude, type, vms_source, status</p><input type="file" accept=".csv" className="mt-4 block w-full text-xs" onChange={(e) => setCsvName(e.target.files?.[0]?.name ?? "")} /><p className="mt-2 text-xs text-muted-foreground">{csvName || "No file selected"}</p></div><Button variant="outline" onClick={() => toast.success("CSV validation complete — demo preview loaded")}><CheckCircle2 /> Validate CSV</Button></div>
          ) : null}

          {tab === "api" ? (
            <div className="mt-4 space-y-3">
              <div className="rounded-md border border-border bg-surface-raised p-4"><p className="label-caps">POST /api/cameras</p><pre className="mt-2 overflow-auto text-xs leading-5 text-foreground">{`{\n  "camera_id": "CAM-054",\n  "department": "RTO",\n  "location": "Vadodara Toll Plaza",\n  "latitude": 22.3072,\n  "longitude": 73.1812,\n  "type": "Fixed ANPR",\n  "vms_source": "Hikvision HikCentral"\n}`}</pre></div>
              <Button onClick={() => toast.success("API onboarding request simulated")}>Send onboarding request</Button>
            </div>
          ) : null}
        </section>

        <section className="panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-4 py-3"><div><p className="label-caps">Registry preview</p><p className="text-xs text-muted-foreground">New records appear here before backend persistence is connected.</p></div><StatusBadge tone="info">DEMO MODE</StatusBadge></div>
          <div className="divide-y divide-border">{records.map((r) => <div key={r.id} className="grid gap-3 p-4 sm:grid-cols-[110px_1fr_120px] sm:items-center"><span className="font-mono text-xs font-semibold">{r.id}</span><div><p className="text-sm font-medium">{r.location}</p><p className="text-xs text-muted-foreground">{r.department} · {r.type}</p></div><p className="text-xs text-muted-foreground">{r.vms}</p></div>)}</div>
        </section>
      </div>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="block"><span className="label-caps mb-1 block">{label}</span>{children}</label>; }
function Metric({ label, value, icon: Icon, tone = "default" }: { label: string; value: string; icon: typeof Waypoints; tone?: "default" | "ok" }) { return <div className="panel flex items-center gap-3 p-4"><div className={tone === "ok" ? "flex h-9 w-9 items-center justify-center rounded-md bg-ok/10 text-ok" : "flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary"}><Icon className="h-4 w-4" /></div><div><p className="label-caps">{label}</p><p className="text-sm font-semibold">{value}</p></div></div>; }
