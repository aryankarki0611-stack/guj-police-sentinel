import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function EvidenceHash({ hash, label = "SHA-256" }: { hash: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="rounded-sm border border-border bg-surface-raised p-3">
      <div className="mb-1 flex items-center justify-between">
        <span className="label-caps">{label}</span>
        <button
          type="button"
          className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
          onClick={() => {
            void navigator.clipboard?.writeText(hash);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
        >
          {copied ? <Check className="h-3 w-3 text-ok" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p className="mono-hash text-foreground">{hash}</p>
    </div>
  );
}
