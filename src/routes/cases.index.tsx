import { useCallback, useEffect, useState } from "react";
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
        content:
          "Case management for CCTV investigations: officers, linked detections, evidence and audit history.",
      },
      {
        property: "og:title",
        content: "Cases — SENTINEL",
      },
      {
        property: "og:description",
        content:
          "Investigation case register for Gujarat Police control rooms.",
      },
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
  const [loading, setLoading] = useState(true);

  const loadCases = useCallback(async () => {
    try {
      setLoading(true);

      const data = await caseService.list();

      setRows(data);
    } catch (error) {
      console.error("Failed to load cases:", error);
      toast.error("Failed to load cases");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCases();
  }, [loadCases]);

  const createCase = async () => {
    try {
      const created = await caseService.create({
        title: "New Investigation",
        officer: "Demo Officer",
        district: "Gandhinagar",
        plates: [],
        detectionIds: [],
      });

      await loadCases();

      toast.success(`${created.id} created`);
    } catch (error) {
      console.error("Case creation error:", error);
      toast.error("Unable to create case");
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="Cases"
        description="Investigation files linking detections, alerts and preserved evidence."
        actions={
          <Button onClick={() => void createCase()}>
            Create case
          </Button>
        }
      />

      <div className="panel overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead>
            <tr className="border-b border-border">
              {[
                "Case ID",
                "Title",
                "Officer",
                "Created",
                "Status",
                "Detections",
                "Evidence",
                "",
              ].map((heading) => (
                <th
                  key={heading}
                  className="label-caps px-3 py-2"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-3 py-8 text-center text-sm text-muted-foreground"
                >
                  Loading cases...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-3 py-8 text-center text-sm text-muted-foreground"
                >
                  No cases found.
                </td>
              </tr>
            ) : (
              rows.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-border/60 hover:bg-surface-raised"
                >
                  <td className="px-3 py-2.5 font-mono text-foreground">
                    {c.id}
                  </td>

                  <td className="px-3 py-2.5 text-foreground">
                    {c.title}
                  </td>

                  <td className="px-3 py-2.5 text-muted-foreground">
                    {c.officer}
                  </td>

                  <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">
                    {c.createdAt}
                  </td>

                  <td className="px-3 py-2.5">
                    <StatusBadge
                      tone={statusTone[c.status]}
                      dot
                    >
                      {c.status}
                    </StatusBadge>
                  </td>

                  <td className="px-3 py-2.5 font-mono text-muted-foreground">
                    {c.detectionIds.length}
                  </td>

                  <td className="px-3 py-2.5 font-mono text-muted-foreground">
                    {c.evidenceIds.length}
                  </td>

                  <td className="px-3 py-2.5 text-right">
                    <Button
                      asChild
                      size="sm"
                      variant="secondary"
                    >
                      <Link
                        to="/cases/$caseId"
                        params={{
                          caseId: c.id,
                        }}
                      >
                        Open
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}