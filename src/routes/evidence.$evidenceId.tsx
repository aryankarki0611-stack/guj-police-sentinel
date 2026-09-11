import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { SimulatedFeed } from "@/components/camera/SimulatedFeed";
import { EvidenceHash } from "@/components/evidence/EvidenceHash";
import { IntegrityStatus } from "@/components/evidence/IntegrityStatus";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { evidence } from "@/data/mock";
import { evidenceService, type IntegrityResult } from "@/services/evidenceService";
import { pct } from "@/lib/format";

export const Route = createFileRoute("/evidence/$evidenceId")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.evidenceId} — Evidence Record — SENTINEL` },
      {
        name: "description",
        content: `Evidence record ${params.evidenceId}: source footage, capture metadata, SHA-256 digest and integrity verification.`,
      },
      { property: "og:title", content: `${params.evidenceId} — Evidence Record — SENTINEL` },
      { property: "og:description", content: "Evidence integrity and chain-of-custody record." },
    ],
  }),
  component: EvidenceDetail,
});

function EvidenceDetail() {
  const { evidenceId } = Route.useParams();
  const item = evidence.find((e) => e.id === evidenceId);
  const [result, setResult] = useState<IntegrityResult | null>(null);
  const [pending, setPending] = useState(false);

  if (!item) {
    return (
      <AppShell>
        <PageHeader title="Evidence not found" description={`No record matches ${evidenceId}.`} />
        <Button asChild variant="secondary">
          <Link to="/evidence">Back to evidence</Link>
        </Button>
      </AppShell>
    );
  }

  const verify = async () => {
    setPending(true);
    setResult(null);
    const res = await evidenceService.verifyIntegrity(item.id);
    setResult(res ?? null);
    setPending(false);
  };

  return (
    <AppShell>
      <PageHeader
        title={`Evidence ${item.id}`}
        description={`Preserved from ${item.cameraId} · ${item.location}`}
        actions={
          <>
            <StatusBadge tone={item.status === "PRESERVED" ? "ok" : "warn"} dot>
              {item.status}
            </StatusBadge>
            <Button asChild variant="ghost">
              <Link to="/cases/$caseId" params={{ caseId: item.caseId }}>
                {item.caseId}
              </Link>
            </Button>
            <Button
              variant="secondary"
              onClick={async () => {
                await evidenceService.report(item.id);
                toast("Evidence report queued", { description: `${item.id} · PDF · includes hash record` });
              }}
            >
              Generate report
            </Button>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <section className="space-y-3">
          <p className="label-caps">Original footage</p>
          <SimulatedFeed cameraId={item.cameraId} online timestamp={item.captureTime} size="lg" />
          <p className="text-xs text-muted-foreground">
            Preserved copy held in write-once evidence storage. Playback here is a demonstration placeholder.
          </p>
        </section>

        <section className="space-y-3">
          <div className="panel p-3">
            <p className="label-caps mb-2">Metadata</p>
            <dl className="space-y-1.5 text-sm">
              <Row label="Camera" value={item.cameraId} mono />
              <Row label="Location" value={item.location} />
              <Row label="Capture timestamp" value={item.captureTime} mono />
              <Row label="Detection" value={item.detectionId} mono />
              <Row label="AI model" value={item.model} />
              <Row label="Model version" value={item.modelVersion} mono />
              <Row label="AI confidence" value={pct(item.confidence)} mono />
              <Row label="Confirmed by" value={item.confirmedBy} />
              <Row label="Confirmed at" value={item.confirmedAt} mono />
            </dl>
          </div>

          <EvidenceHash hash={item.sha256} />

          <Button onClick={verify} disabled={pending} className="w-full">
            Verify integrity
          </Button>
          <IntegrityStatus result={result} pending={pending} />

          <p className="text-xs text-muted-foreground">
            Verification recomputes the SHA-256 digest of the stored file and compares it with the digest recorded at
            preservation. This supports chain-of-custody review; admissibility remains a matter for the court.
          </p>
        </section>
      </div>
    </AppShell>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="label-caps">{label}</dt>
      <dd className={mono ? "font-mono text-foreground" : "text-foreground"}>{value}</dd>
    </div>
  );
}
