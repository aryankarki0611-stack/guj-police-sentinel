import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge, type Tone } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { caseService } from "@/services/caseService";
import type { CaseRecord } from "@/data/mock";

export const Route = createFileRoute("/cases/")({
  head: () => ({
    meta: [
      { title: "Cases — SENTINEL" },
      {
        name: "description",
        content: "Case management for CCTV investigations: officers, linked detections, evidence and audit history.",
      },
      { property: "og:title", content: "Cases — SENTINEL" },
      { property: "og:description", content: "Investigation case register for Gujarat Police control rooms." },
    ],
  }),
  component: CasesPage,
});

const statusTone: Record<CaseRecord["status"], Tone> = {
  Open: "info",
  "Under Review": "warn",
  Closed: "neutral",
};

function CasesPage() {
  const [rows, setRows] = useState<CaseRecord[]>([]);
  useEffect(() => {
    void caseService.list().then(setRows);
  }, []);

  return (
    <AppShell>
      <PageHeader
        title="Cases"
        description="Investigation files linking detections, alerts and preserved evidence."
        actions={
          <Button
            onClick={async () => {
              const created = await caseService.create({
                title: "New Investigation",
                officer: "Demo Officer",
                district: "Gandhinagar",
                plates: [],
                detectionIds: [],
              });
              setRows(await caseService.list());
              toast.success(`${created.id} created`);
            }}
          >
            Create case
          </Button>
        }
      />

      <div className="panel overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead>
            <tr className="border-b border-border">
              {["Case ID", "Title", "Officer", "Created", "Status", "Detections", "Evidence", ""].map((h) => (
                <th key={h} className="label-caps px-3 py-2">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} className="border-b border-border/60 hover:bg-surface-raised">
                <td className="px-3 py-2.5 font-mono text-foreground">{c.id}</td>
                <td className="px-3 py-2.5 text-foreground">{c.title}</td>
                <td className="px-3 py-2.5 text-muted-foreground">{c.officer}</td>
                <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">{c.createdAt}</td>
                <td className="px-3 py-2.5">
                  <StatusBadge tone={statusTone[c.status]} dot>
                    {c.status}
                  </StatusBadge>
                </td>
                <td className="px-3 py-2.5 font-mono text-muted-foreground">{c.detectionIds.length}</td>
                <td className="px-3 py-2.5 font-mono text-muted-foreground">{c.evidenceIds.length}</td>
                <td className="px-3 py-2.5 text-right">
                  <Button asChild size="sm" variant="secondary">
                    <Link to="/cases/$caseId" params={{ caseId: c.id }}>
                      Open
                    </Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
