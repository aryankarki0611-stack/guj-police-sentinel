import { ArrowRight } from "lucide-react";
import type { Detection } from "@/data/mock";

export function VehicleJourney({ detections }: { detections: Detection[] }) {
  const legs = detections.map((d) => ({ location: d.location, time: d.timestamp.slice(11, 16), camera: d.cameraId }));
  if (!legs.length) return null;
  return (
    <div className="panel p-3">
      <p className="label-caps mb-2">Journey</p>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-3">
        {legs.map((leg, i) => (
          <div key={`${leg.camera}-${i}`} className="flex items-center gap-2">
            <div className="rounded-sm border border-border bg-surface-raised px-2.5 py-1.5">
              <p className="text-sm font-medium text-foreground">{leg.location}</p>
              <p className="font-mono text-[11px] text-muted-foreground">
                {leg.time} · {leg.camera}
              </p>
            </div>
            {i < legs.length - 1 ? <ArrowRight className="h-4 w-4 text-muted-foreground" /> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
