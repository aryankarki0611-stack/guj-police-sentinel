import { cn } from "@/lib/utils";

export type Tone = "ok" | "warn" | "alert" | "neutral" | "info";

const styles: Record<Tone, string> = {
  ok: "border-ok/40 bg-ok/10 text-ok",
  warn: "border-warn/40 bg-warn/10 text-warn",
  alert: "border-alert/50 bg-alert/15 text-alert",
  info: "border-primary/40 bg-primary/10 text-primary",
  neutral: "border-border bg-muted text-muted-foreground",
};

export function StatusBadge({
  tone = "neutral",
  children,
  dot = false,
  className,
}: {
  tone?: Tone;
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        styles[tone],
        className,
      )}
    >
      {dot ? <span className="h-1.5 w-1.5 rounded-full bg-current" /> : null}
      {children}
    </span>
  );
}

export function cameraTone(status: string): Tone {
  if (status === "online") return "ok";
  if (status === "offline") return "neutral";
  if (status === "alert") return "alert";
  return "warn";
}
