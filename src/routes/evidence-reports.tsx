import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FileCheck2, FileText, Fingerprint, LockKeyhole, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";

export const Route = createFileRoute("/evidence-reports")({ component: EvidenceReportsPage });

const evidenceRows = [
  { id: "EVD-2026-0017", caseId: "CASE-2026-004", camera: "CAM-033", plate: "GJ18EF4421", captured: "2026-09-12 08:21:44", hash: "9d3fe6e2b46c7e14f4c6c1b9c0b2d1e2a0f5b3f6d8e7c9a1b2c3d4e5f6071829", officer: "Demo Officer", status: "PRESERVED" as const },
  { id: "EVD-2026-0018", caseId: "CASE-2026-004", camera: "CAM-041", plate: "GJ01AB1234", captured: "2026-09-12 12:02:00", hash: "4a8b76dfc18a3d0cde5a4c9217f3f5a1d08b2e9f0c1a4e7b5d6c8f9a0b1c2d3e", officer: "Demo Officer", status: "PRESERVED" as const },
];

function EvidenceReportsPage() {
  const [selected, setSelected] = useState(evidenceRows[0]);
  const [verified, setVerified] = useState(false);

  return (
    <AppShell>
      <PageHeader title="Evidence & Integrity" description="Preserve evidence, review integrity metadata and generate an investigation report from the selected evidence chain." actions={<Button size="sm" onClick={() => toast.success("Report generation queued in demo mode") }><FileText /> Generate report</Button>} />

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat icon={ShieldCheck} label="Preserved evidence" value={String(evidenceRows.length)} />
        <Stat icon={Fingerprint} label="Hash algorithm" value="SHA-256" />
        <Stat icon={LockKeyhole} label="Chain-of-custody" value="AUDITED" tone="ok" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <section className="panel overflow-hidden">
          <div className="border-b border-border px-4 py-3"><p className="label-caps">Preserved evidence</p></div>
          <div className="divide-y divide-border">
            {evidenceRows.map((row) => (
              <button key={row.id} onClick={() => { setSelected(row); setVerified(false); }} className={`w-full p-4 text-left hover:bg-accent/50 ${selected.id === row.id ? "bg-accent/40" : ""}`}>
                <div className="flex items-start justify-between gap-3"><div><p className="font-mono text-sm font-semibold">{row.id}</p><p className="mt-1 text-xs text-muted-foreground">{row.caseId} · {row.camera} · {row.plate}</p></div><StatusBadge tone="ok" dot>{row.status}</StatusBadge></div>
                <p className="mt-3 text-xs text-muted-foreground">Captured {row.captured}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <div className="panel p-4">
            <div className="flex items-start justify-between gap-3"><div><p className="label-caps">Selected evidence</p><h2 className="mt-1 font-mono text-lg font-semibold">{selected.id}</h2></div><FileCheck2 className="h-6 w-6 text-ok" /></div>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <Info label="Case" value={selected.caseId} />
              <Info label="Camera" value={selected.camera} />
              <Info label="Plate" value={selected.plate} />
              <Info label="Captured" value={selected.captured} />
              <Info label="Confirmed by" value={selected.officer} />
              <Info label="Integrity" value={verified ? "Verified" : "Not re-verified"} />
            </dl>
          </div>

          <div className="panel p-4">
            <p className="label-caps">SHA-256 integrity record</p>
            <p className="mono-hash mt-2 rounded-sm border border-border bg-surface-raised p-3 text-foreground">{selected.hash}</p>
            <p className="mt-3 text-xs text-muted-foreground">Hashing is represented here as an integrity/tamper-detection mechanism. It does not by itself establish legal admissibility.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button onClick={() => { setVerified(true); toast.success("Integrity verification completed in demo mode"); }}><Fingerprint /> Verify integrity</Button>
              <Button variant="outline" onClick={() => toast.success("Evidence preservation workflow opened") }><LockKeyhole /> Preserve evidence</Button>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function Stat({ icon: Icon, label, value, tone = "default" }: { icon: typeof ShieldCheck; label: string; value: string; tone?: "default" | "ok" }) {
  return <div className="panel flex items-center gap-3 p-4"><div className={tone === "ok" ? "flex h-9 w-9 items-center justify-center rounded-md bg-ok/10 text-ok" : "flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary"}><Icon className="h-4 w-4" /></div><div><p className="label-caps">{label}</p><p className="text-sm font-semibold">{value}</p></div></div>;
}
function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-sm border border-border bg-surface-raised px-3 py-2"><p className="label-caps">{label}</p><p className="mt-1 text-sm text-foreground">{value}</p></div>; }
