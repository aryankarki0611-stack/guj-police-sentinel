import { Camera as CameraIcon, MapPin } from "lucide-react";
import type { Detection } from "@/data/mock";
import { pct } from "@/lib/format";

export function DetectionCard({ detection, action }: { detection: Detection; action?: React.ReactNode }) {
  return (
    <div className="panel flex items-center justify-between gap-3 px-3 py-2 text-sm">
      <div className="min-w-0">
        <p className="font-mono font-semibold text-foreground">{detection.plate}</p>
        <p className="truncate text-xs text-muted-foreground">
          {detection.color} {detection.vehicleType} · {detection.direction}
        </p>
      </div>
      <div className="hidden shrink-0 items-center gap-4 text-xs text-muted-foreground sm:flex">
        <span className="flex items-center gap-1">
          <CameraIcon className="h-3.5 w-3.5" /> {detection.cameraId}
        </span>
        <span className="flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" /> {detection.location}
        </span>
        <span className="font-mono">{detection.timestamp.slice(11, 19)}</span>
        <span className="font-mono text-foreground">{pct(detection.confidence)}</span>
      </div>
      {action}
    </div>
  );
}
