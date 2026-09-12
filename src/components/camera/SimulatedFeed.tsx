import { Video, VideoOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface SimulatedFeedProps {
  cameraId: string;
  online: boolean;
  timestamp?: string | null;
  size?: "sm" | "lg";
  className?: string;
}

/** Placeholder for a real VMS stream. No live video is used in this prototype. */
export function SimulatedFeed({ cameraId, online, timestamp, size = "sm", className }: SimulatedFeedProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden border border-border bg-[oklch(0.15_0.015_258)]",
        size === "sm" ? "aspect-video" : "aspect-[16/9]",
        className,
      )}
    >
      <div className="scanlines absolute inset-0" />
      <div className="absolute inset-0 flex items-center justify-center">
        {online ? (
          <div className="flex flex-col items-center gap-1 text-muted-foreground">
            <Video className={size === "lg" ? "h-10 w-10" : "h-6 w-6"} strokeWidth={1.5} />
            <span className="text-[10px] uppercase tracking-widest">Simulated feed</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1 text-muted-foreground">
            <VideoOff className={size === "lg" ? "h-10 w-10" : "h-6 w-6"} strokeWidth={1.5} />
            <span className="text-[10px] uppercase tracking-widest">No signal</span>
          </div>
        )}
      </div>
      <div className="absolute left-2 top-2 flex items-center gap-1.5 bg-background/80 px-1.5 py-0.5 font-mono text-[10px] text-foreground">
        {online ? <span className="h-1.5 w-1.5 rounded-full bg-alert" /> : null}
        {online ? "LIVE" : "OFFLINE"} · {cameraId}
      </div>
      {timestamp ? (
        <div className="absolute bottom-2 right-2 bg-background/80 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
          {timestamp}
        </div>
      ) : null}
    </div>
  );
}
