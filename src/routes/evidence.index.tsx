import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { EvidenceCard } from "@/components/evidence/EvidenceCard";
import { StatCard } from "@/components/StatCard";
import { evidenceService } from "@/services/evidenceService";
import type { EvidenceItem } from "@/data/mock";
import { ShieldCheck, Clock, FileLock2 } from "lucide-react";

export const Route = createFileRoute("/evidence/")({
  head: () => ({
    meta: [
      { title: "Evidence Management — SENTINEL" },
      {
        name: "description",
        content:
          "Preserved CCTV evidence with SHA-256 hashes, confirmation records and integrity verification supporting chain of custody.",
      },
      { property: "og:title", content: "Evidence Management — SENTINEL" },
      { property: "og:description", content: "Hash-sealed evidence register with integrity verification." },
    ],
  }),
  component: EvidencePage,
});

function EvidencePage() {
  const [rows, setRows] = useState<EvidenceItem[]>([]);
  useEffect(() => {
    void evidenceService.list().then(setRows);
  }, []);

  return (
    <AppShell>
      <PageHeader
        title="Evidence Management"
        description="Each item records the capture source, confirming officer and a SHA-256 digest taken at preservation time."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Preserved" value={rows.filter((r) => r.status === "PRESERVED").length} icon={ShieldCheck} tone="ok" />
        <StatCard label="Pending confirmation" value={rows.filter((r) => r.status === "PENDING").length} icon={Clock} tone="warn" />
        <StatCard label="Total items" value={rows.length} icon={FileLock2} />
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((item) => (
          <EvidenceCard key={item.id} item={item} />
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        Hashing supports integrity verification and chain-of-custody documentation. It does not by itself determine
        legal admissibility.
      </p>
    </AppShell>
  );
}
