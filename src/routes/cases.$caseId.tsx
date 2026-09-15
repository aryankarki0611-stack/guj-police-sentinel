import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { TimelineEvent } from "@/components/TimelineEvent";
import { VehicleJourney } from "@/components/VehicleJourney";
import { AlertCard } from "@/components/AlertCard";
import { EvidenceCard } from "@/components/evidence/EvidenceCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { AuditLogTable } from "@/components/AuditLogTable";

import { alerts, evidence, auditEntries } from "@/data/mock";
import { caseService } from "@/services/caseService";
import type { CaseRecord, Detection } from "@/data/mock";

export const Route = createFileRoute("/cases/$caseId")({
  head: ({ params }) => ({
    meta: [
      {
        title: `${params.caseId} — Case Overview — SENTINEL`,
      },
      {
        name: "description",
        content: `Case overview for ${params.caseId}: investigation timeline, vehicle journey, alerts, evidence and audit history.`,
      },
      {
        property: "og:title",
        content: `${params.caseId} — Case Overview — SENTINEL`,
      },
      {
        property: "og:description",
        content: "Investigation case overview in the SENTINEL platform.",
      },
    ],
  }),
  component: CaseDetail,
});

function CaseDetail() {
  const { caseId } = Route.useParams();

  const [record, setRecord] = useState<CaseRecord | null>(null);
  const [caseDetections, setCaseDetections] = useState<Detection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadCase() {
      try {
        setLoading(true);

        const found = await caseService.get(caseId);

        if (cancelled) return;

        if (!found) {
          setRecord(null);
          setCaseDetections([]);
          return;
        }

        setRecord(found);

        const timeline = await caseService.timeline(caseId);

        if (!cancelled) {
          setCaseDetections(timeline);
        }
      } catch (error) {
        console.error("Case detail load error:", error);

        if (!cancelled) {
          toast.error("Unable to load case");
          setRecord(null);
          setCaseDetections([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadCase();

    return () => {
      cancelled = true;
    };
  }, [caseId]);

  if (loading) {
    return (
      <AppShell>
        <PageHeader
          title="Loading case"
          description={`Loading ${caseId}...`}
        />

        <div className="panel p-6 text-sm text-muted-foreground">
          Loading case information...
        </div>
      </AppShell>
    );
  }

  if (!record) {
    return (
      <AppShell>
        <PageHeader
          title="Case not found"
          description={`No case record matches ${caseId}.`}
        />

        <Button asChild variant="secondary">
          <Link to="/cases">Back to cases</Link>
        </Button>
      </AppShell>
    );
  }

  const caseAlerts = alerts.filter((a) =>
    record.alertIds.includes(a.id)
  );

  const caseEvidence = evidence.filter((e) =>
    record.evidenceIds.includes(e.id)
  );

  const caseAudit = auditEntries
    .filter((a) => a.caseId === record.id)
    .sort((a, b) => b.entry - a.entry);

  return (
    <AppShell>
      <PageHeader
        title={record.title}
        description={record.summary}
        actions={
          <>
            <StatusBadge
              tone={record.status === "Closed" ? "neutral" : "info"}
              dot
            >
              {record.status}
            </StatusBadge>

            <Button
              variant="secondary"
              onClick={() =>
                toast("Case report queued", {
                  description: `${record.id} · PDF`,
                })
              }
            >
              Generate report
            </Button>
          </>
        }
      />

      <section className="panel grid gap-3 p-3 text-sm sm:grid-cols-2 xl:grid-cols-5">
        <Info
          label="Case ID"
          value={record.id}
          mono
        />

        <Info
          label="Officer"
          value={record.officer}
        />

        <Info
          label="Created"
          value={record.createdAt}
          mono
        />

        <Info
          label="District"
          value={record.district}
        />

        <Info
          label="Plates"
          value={record.plates.join(", ") || "—"}
          mono
        />
      </section>

      {caseDetections.length > 0 ? (
        <VehicleJourney detections={caseDetections} />
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section>
          <p className="label-caps mb-2">
            Investigation timeline
          </p>

          <ol>
            {caseDetections.map((d, i) => (
              <TimelineEvent
                key={d.id}
                detection={d}
                index={i}
                isLast={i === caseDetections.length - 1}
              />
            ))}

            {!caseDetections.length ? (
              <li className="panel p-4 text-sm text-muted-foreground">
                No detections linked yet.
              </li>
            ) : null}
          </ol>
        </section>

        <section className="space-y-4">
          <div>
            <p className="label-caps mb-2">
              Alerts
            </p>

            <div className="space-y-3">
              {caseAlerts.map((a) => (
                <AlertCard
                  key={a.id}
                  alert={a}
                  compact
                />
              ))}

              {!caseAlerts.length ? (
                <p className="panel p-4 text-sm text-muted-foreground">
                  No linked alerts.
                </p>
              ) : null}
            </div>
          </div>

          <div>
            <p className="label-caps mb-2">
              Evidence
            </p>

            <div className="space-y-3">
              {caseEvidence.map((e) => (
                <EvidenceCard
                  key={e.id}
                  item={e}
                />
              ))}

              {!caseEvidence.length ? (
                <p className="panel p-4 text-sm text-muted-foreground">
                  No evidence preserved for this case.
                </p>
              ) : null}
            </div>
          </div>
        </section>
      </div>

      <section>
        <p className="label-caps mb-2">
          Audit history
        </p>

        {caseAudit.length ? (
          <AuditLogTable entries={caseAudit} />
        ) : (
          <p className="panel p-4 text-sm text-muted-foreground">
            No audit entries recorded for this case.
          </p>
        )}
      </section>
    </AppShell>
  );
}

function Info({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="label-caps">
        {label}
      </p>

      <p
        className={
          mono
            ? "font-mono text-foreground"
            : "text-foreground"
        }
      >
        {value}
      </p>
    </div>
  );
}