import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown, Check, X, FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge, type Tone } from "@/components/StatusBadge";
import type { Alert } from "@/data/mock";
import { pct } from "@/lib/format";
import { cn } from "@/lib/utils";

const severityTone: Record<Alert["severity"], Tone> = {
  critical: "alert",
  high: "warn",
  medium: "info",
};

interface AlertCardProps {
  alert: Alert;
  compact?: boolean;
  onVerify?: (alert: Alert) => void;
  onDismiss?: (alert: Alert) => void;
  onCreateCase?: (alert: Alert) => void;
}

export function AlertCard({ alert, compact = false, onVerify, onDismiss, onCreateCase }: AlertCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <article className="panel p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone={severityTone[alert.severity]} dot>
              {alert.severity}
            </StatusBadge>
            <h3 className="text-sm font-semibold text-foreground">{alert.type}</h3>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            <span className="font-mono text-foreground">{alert.plate}</span> · {alert.cameraId} ·{" "}
            {alert.location} · {alert.timestamp.slice(11, 16)}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="label-caps">Confidence</p>
          <p className="font-mono text-sm text-foreground">{pct(alert.confidence)}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mt-3 flex w-full items-center justify-between rounded-sm border border-border bg-surface-raised px-2.5 py-1.5 text-left"
      >
        <span className="label-caps">Why did this alert fire?</span>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      {open ? (
        <ul className="mt-2 space-y-1.5 rounded-sm border border-border bg-surface-raised p-3 text-xs">
          {alert.reasoning.map((r) => (
            <li key={r} className="flex gap-2 text-foreground">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ok" />
              <span>{r}</span>
            </li>
          ))}
          <li className="pt-1 text-[11px] text-muted-foreground">
            Rule-based match on recorded detections. Confidence reflects plate-read quality only and requires
            officer verification.
          </li>
        </ul>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        <Button asChild size="sm" variant="secondary">
          <Link to="/investigation" search={{ q: alert.plate }}>
            View investigation
          </Link>
        </Button>
        {!compact && alert.state === "open" ? (
          <>
            <Button size="sm" variant="outline" onClick={() => onVerify?.(alert)}>
              <Check className="h-3.5 w-3.5" /> Verify
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onDismiss?.(alert)}>
              <X className="h-3.5 w-3.5" /> Dismiss
            </Button>
          </>
        ) : null}
        {!compact ? (
          <Button size="sm" variant="ghost" onClick={() => onCreateCase?.(alert)}>
            <FolderPlus className="h-3.5 w-3.5" /> Create case
          </Button>
        ) : null}
      </div>
    </article>
  );
}
