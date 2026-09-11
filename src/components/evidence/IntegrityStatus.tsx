import { ShieldCheck, ShieldAlert, Loader2 } from "lucide-react";
import type { IntegrityResult } from "@/services/evidenceService";

export function IntegrityStatus({ result, pending }: { result?: IntegrityResult | null; pending?: boolean }) {
  if (pending) {
    return (
      <div className="flex items-center gap-2 rounded-sm border border-border bg-surface-raised px-3 py-2.5 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Recomputing SHA-256 digest of the stored file...
      </div>
    );
  }
  if (!result) return null;

  if (result.verified) {
    return (
      <div className="rounded-sm border border-ok/40 bg-ok/10 p-3">
        <p className="flex items-center gap-2 text-sm font-semibold text-ok">
          <ShieldCheck className="h-4 w-4" /> INTEGRITY VERIFIED
        </p>
        <p className="mt-1 text-xs text-foreground">
          Current file hash matches the preserved SHA-256 hash.
        </p>
        <p className="mt-2 text-[11px] text-muted-foreground">
          Checked {result.checkedAt} · supports chain-of-custody review; admissibility remains a matter for the
          court.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-sm border border-alert/50 bg-alert/10 p-3">
      <p className="flex items-center gap-2 text-sm font-semibold text-alert">
        <ShieldAlert className="h-4 w-4" /> INTEGRITY CHECK FAILED
      </p>
      <p className="mt-1 text-xs text-foreground">
        Current file hash does not match the preserved hash.
      </p>
      <div className="mt-2 space-y-1">
        <p className="mono-hash text-muted-foreground">stored:&nbsp;&nbsp;{result.storedHash}</p>
        <p className="mono-hash text-alert">current: {result.computedHash}</p>
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">
        Escalate to the evidence custodian. This item should not be relied upon until reviewed.
      </p>
    </div>
  );
}
