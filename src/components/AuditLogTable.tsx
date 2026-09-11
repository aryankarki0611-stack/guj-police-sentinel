import { Fragment, useState } from "react";
import { ChevronRight } from "lucide-react";
import type { AuditEntry } from "@/data/mock";
import { shortHash } from "@/lib/format";
import { cn } from "@/lib/utils";

const actionTone: Record<string, string> = {
  SEARCHED: "text-primary",
  AI_RESULT_GENERATED: "text-primary",
  EVIDENCE_CONFIRMED: "text-ok",
  REPORT_GENERATED: "text-foreground",
  INTEGRITY_CHECKED: "text-ok",
  CASE_CREATED: "text-foreground",
  ALERT_VERIFIED: "text-warn",
};

export function AuditLogTable({ entries }: { entries: AuditEntry[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="panel overflow-x-auto">
      <table className="w-full min-w-[880px] text-left text-xs">
        <thead>
          <tr className="border-b border-border">
            {["", "Entry #", "Timestamp", "Actor", "Action", "Case", "Evidence", "Entry hash", "Previous hash"].map(
              (h) => (
                <th key={h} className="label-caps px-3 py-2 font-semibold">
                  {h}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => (
            <Fragment key={e.entry}>
              <tr
                className="cursor-pointer border-b border-border/60 hover:bg-surface-raised"
                onClick={() => setOpen(open === e.entry ? null : e.entry)}
              >
                <td className="px-3 py-2">
                  <ChevronRight
                    className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", open === e.entry && "rotate-90")}
                  />
                </td>
                <td className="px-3 py-2 font-mono text-foreground">#{e.entry}</td>
                <td className="px-3 py-2 font-mono text-muted-foreground">{e.timestamp}</td>
                <td className="px-3 py-2 text-foreground">{e.actor}</td>
                <td className={cn("px-3 py-2 font-semibold", actionTone[e.action] ?? "text-foreground")}>{e.action}</td>
                <td className="px-3 py-2 font-mono text-muted-foreground">{e.caseId ?? "—"}</td>
                <td className="px-3 py-2 font-mono text-muted-foreground">{e.evidenceId ?? "—"}</td>
                <td className="px-3 py-2 font-mono text-muted-foreground">{shortHash(e.entryHash, 8, 6)}</td>
                <td className="px-3 py-2 font-mono text-muted-foreground">{shortHash(e.previousHash, 8, 6)}</td>
              </tr>
              {open === e.entry ? (
                <tr className="border-b border-border/60 bg-surface-raised">
                  <td colSpan={9} className="px-10 py-3">
                    <p className="label-caps mb-2">Entry payload</p>
                    <pre className="mono-hash whitespace-pre-wrap text-foreground">
                      {JSON.stringify(e.payload, null, 2)}
                    </pre>
                    <div className="mt-3 grid gap-1">
                      <p className="mono-hash text-muted-foreground">entry_hash: {e.entryHash}</p>
                      <p className="mono-hash text-muted-foreground">prev_hash:&nbsp; {e.previousHash}</p>
                    </div>
                  </td>
                </tr>
              ) : null}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
