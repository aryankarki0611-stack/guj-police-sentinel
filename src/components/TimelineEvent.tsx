import { Button } from "@/components/ui/button";
import type { Detection } from "@/data/mock";
import { pct } from "@/lib/format";

interface TimelineEventProps {
  detection: Detection;
  index: number;
  isLast: boolean;
  gapMinutes?: number | null;
  onViewFrame?: (detection: Detection) => void;
  onPreserve?: (detection: Detection) => void;
}

export function TimelineEvent({
  detection,
  index,
  isLast,
  gapMinutes,
  onViewFrame,
  onPreserve,
}: TimelineEventProps) {
  return (
    <li className="relative pl-8">
      {!isLast ? <span className="absolute left-[11px] top-6 h-full w-px bg-border" /> : null}
      <span className="absolute left-1.5 top-2 flex h-4 w-4 items-center justify-center rounded-full border border-primary bg-background text-[9px] font-bold text-primary">
        {index + 1}
      </span>
      <div className="panel mb-3 p-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="font-mono text-sm font-semibold text-foreground">
            {detection.timestamp.slice(11, 16)} — {detection.cameraId} — {detection.location}
          </p>
          <span className="font-mono text-xs text-muted-foreground">
            Confidence {pct(detection.confidence)}
          </span>
        </div>
        <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-4">
          <Field label="Plate" value={detection.plate} mono />
          <Field label="Type" value={detection.vehicleType} />
          <Field label="Colour" value={detection.color} />
          <Field label="Heading" value={detection.direction} />
        </dl>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button size="sm" variant="secondary" onClick={() => onViewFrame?.(detection)}>
            View frame
          </Button>
          {onPreserve ? (
            <Button size="sm" variant="outline" onClick={() => onPreserve(detection)}>
              Preserve as evidence
            </Button>
          ) : null}
          {typeof gapMinutes === "number" ? (
            <span className="text-xs text-muted-foreground">+{gapMinutes} min since previous detection</span>
          ) : null}
        </div>
      </div>
    </li>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="label-caps">{label}</dt>
      <dd className={mono ? "font-mono text-foreground" : "text-foreground"}>{value}</dd>
    </div>
  );
}
