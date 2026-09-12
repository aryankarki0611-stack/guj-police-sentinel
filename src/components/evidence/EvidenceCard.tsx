import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { StatusBadge, type Tone } from "@/components/StatusBadge";
import type { EvidenceItem } from "@/data/mock";
import { shortHash } from "@/lib/format";

const tones: Record<EvidenceItem["status"], Tone> = {
  PRESERVED: "ok",
  PENDING: "warn",
  RELEASED: "neutral",
};

export function EvidenceCard({ item }: { item: EvidenceItem }) {
  return (
    <article className="panel p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-sm font-semibold text-foreground">{item.id}</p>
          <p className="text-xs text-muted-foreground">
            {item.caseId} · {item.cameraId} · {item.location}
          </p>
        </div>
        <StatusBadge tone={tones[item.status]} dot>
          {item.status}
        </StatusBadge>
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
        <div>
          <dt className="label-caps">Capture time</dt>
          <dd className="font-mono text-foreground">{item.captureTime}</dd>
        </div>
        <div>
          <dt className="label-caps">SHA-256</dt>
          <dd className="font-mono text-foreground">{shortHash(item.sha256)}</dd>
        </div>
        <div>
          <dt className="label-caps">Confirmed by</dt>
          <dd className="text-foreground">{item.confirmedBy}</dd>
        </div>
        <div>
          <dt className="label-caps">Confirmed at</dt>
          <dd className="font-mono text-foreground">{item.confirmedAt}</dd>
        </div>
      </dl>
      <Button asChild size="sm" variant="secondary" className="mt-3 w-full">
        <Link to="/evidence/$evidenceId" params={{ evidenceId: item.id }}>
          Open evidence record
        </Link>
      </Button>
    </article>
  );
}
