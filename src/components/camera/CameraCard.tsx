import { Button } from "@/components/ui/button";
import { StatusBadge, cameraTone } from "@/components/StatusBadge";
import { SimulatedFeed } from "./SimulatedFeed";
import type { Camera, Detection } from "@/data/mock";

interface CameraCardProps {
  camera: Camera;
  lastDetection?: Detection | undefined;
  onView: (camera: Camera) => void;
}

export function CameraCard({ camera, lastDetection, onView }: CameraCardProps) {
  return (
    <article className="panel flex flex-col">
      <SimulatedFeed
        cameraId={camera.id}
        online={camera.status !== "offline"}
        timestamp={camera.lastDetection}
      />
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-mono text-sm font-semibold text-foreground">{camera.id}</p>
            <p className="truncate text-xs text-muted-foreground">{camera.location}</p>
          </div>
          <StatusBadge tone={cameraTone(camera.status)} dot>
            {camera.status}
          </StatusBadge>
        </div>
        <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
          <div>
            <dt className="label-caps">Department</dt>
            <dd className="truncate text-foreground">{camera.department}</dd>
          </div>
          <div>
            <dt className="label-caps">VMS</dt>
            <dd className="truncate text-foreground">{camera.vmsSource}</dd>
          </div>
        </dl>
        <div className="rounded-sm border border-border bg-surface-raised px-2 py-1.5 text-xs">
          <p className="label-caps">Last detected</p>
          {lastDetection ? (
            <p className="text-foreground">
              <span className="font-mono">{lastDetection.plate}</span> · {lastDetection.color}{" "}
              {lastDetection.vehicleType}{" "}
              <span className="text-muted-foreground">· {lastDetection.timestamp.slice(11, 19)}</span>
            </p>
          ) : (
            <p className="text-muted-foreground">No detections recorded</p>
          )}
        </div>
        <Button variant="secondary" size="sm" className="mt-auto" onClick={() => onView(camera)}>
          View camera
        </Button>
      </div>
    </article>
  );
}
