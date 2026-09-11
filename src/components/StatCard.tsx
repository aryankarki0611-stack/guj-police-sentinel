import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  tone?: "default" | "ok" | "warn" | "alert";
}

const toneRing: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "text-primary",
  ok: "text-ok",
  warn: "text-warn",
  alert: "text-alert",
};

export function StatCard({ label, value, hint, icon: Icon, tone = "default" }: StatCardProps) {
  return (
    <div className="panel px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="label-caps truncate">{label}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{value}</p>
          {hint ? <p className="mt-0.5 truncate text-xs text-muted-foreground">{hint}</p> : null}
        </div>
        {Icon ? <Icon className={cn("h-4 w-4 shrink-0", toneRing[tone])} strokeWidth={2} /> : null}
      </div>
    </div>
  );
}
