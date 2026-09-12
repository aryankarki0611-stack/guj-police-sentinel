import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, ShieldAlert, Loader2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { AuditLogTable } from "@/components/AuditLogTable";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { auditService, type ChainStatus } from "@/services/auditService";
import type { AuditEntry } from "@/data/mock";

export const Route = createFileRoute("/audit")({
  head: () => ({
    meta: [
      { title: "Audit Trail — SENTINEL" },
      {
        name: "description",
        content: "Append-only audit log of searches, AI results, evidence confirmations and integrity checks with hash chaining.",
      },
      { property: "og:title", content: "Audit Trail — SENTINEL" },
      { property: "og:description", content: "Hash-chained audit log for CCTV investigation actions." },
    ],
  }),
  component: AuditPage,
});

function AuditPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [status, setStatus] = useState<ChainStatus | null>(null);
  const [pending, setPending] = useState(false);
  const [simulateBreak, setSimulateBreak] = useState(false);

  useEffect(() => {
    void auditService.list().then(setEntries);
    void auditService.verifyChain(false).then(setStatus);
  }, []);

  const verify = async () => {
    setPending(true);
    setStatus(await auditService.verifyChain(simulateBreak));
    setPending(false);
  };

  return (
    <AppShell>
      <PageHeader
        title="Audit Trail"
        description="Every recorded action is chained to the hash of the previous entry."
        actions={
          <>
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <Switch checked={simulateBreak} onCheckedChange={setSimulateBreak} />
              Simulate chain break
            </label>
            <Button onClick={verify} disabled={pending}>
              Verify entire chain
            </Button>
          </>
        }
      />

      <section
        className={
          status?.valid === false
            ? "rounded-md border border-alert/50 bg-alert/10 p-4"
            : "rounded-md border border-ok/40 bg-ok/10 p-4"
        }
      >
        <p className="label-caps">Chain status</p>
        {pending ? (
          <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Recomputing entry hashes...
          </p>
        ) : status?.valid === false ? (
          <>
            <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-alert">
              <ShieldAlert className="h-4 w-4" /> CHAIN BREAK DETECTED
            </p>
            <p className="mt-1 text-xs text-foreground">
              Integrity verification failed at Entry #{status.brokenAt}. Entries up to #{status.verifiedThrough} remain
              verified.
            </p>
          </>
        ) : (
          <>
            <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-ok">
              <ShieldCheck className="h-4 w-4" /> HASH CHAIN VALID
            </p>
            <p className="mt-1 text-xs text-foreground">
              All recorded entries verified through Entry #{status?.verifiedThrough ?? "—"}.
            </p>
          </>
        )}
      </section>

      <AuditLogTable entries={entries} />
    </AppShell>
  );
}
