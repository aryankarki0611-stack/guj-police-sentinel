import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { SearchBar } from "@/components/SearchBar";
import { FilterBar } from "@/components/FilterBar";
import { CameraCard } from "@/components/camera/CameraCard";
import { SimulatedFeed } from "@/components/camera/SimulatedFeed";
import { StatusBadge, cameraTone } from "@/components/StatusBadge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  cameras as allCameras,
  detections,
  alerts,
  DEPARTMENTS,
  VMS_SOURCES,
  CAMERA_TYPES,
  GUJARAT_CITIES,
  type Camera,
} from "@/data/mock";
import { pct } from "@/lib/format";

const searchSchema = z.object({ camera: z.string().optional() });

export const Route = createFileRoute("/cameras")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Live Cameras — SENTINEL" },
      {
        name: "description",
        content: "Monitor 50 simulated CCTV feeds across Gujarat with department, location, status and VMS filters.",
      },
      { property: "og:title", content: "Live Cameras — SENTINEL" },
      { property: "og:description", content: "Camera monitoring wall for the SENTINEL CCTV intelligence platform." },
    ],
  }),
  component: LiveCameras,
});

function LiveCameras() {
  const { camera: cameraParam } = Route.useSearch();
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState("all");
  const [district, setDistrict] = useState("all");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [vms, setVms] = useState("all");
  const [active, setActive] = useState<Camera | null>(null);

  useEffect(() => {
    if (cameraParam) setActive(allCameras.find((c) => c.id === cameraParam) ?? null);
  }, [cameraParam]);

  const list = useMemo(
    () =>
      allCameras.filter((c) => {
        const q = query.trim().toLowerCase();
        if (q && !`${c.id} ${c.location}`.toLowerCase().includes(q)) return false;
        if (department !== "all" && c.department !== department) return false;
        if (district !== "all" && c.district !== district) return false;
        if (status !== "all" && c.status !== status) return false;
        if (type !== "all" && c.type !== type) return false;
        if (vms !== "all" && c.vmsSource !== vms) return false;
        return true;
      }),
    [query, department, district, status, type, vms],
  );

  const lastDetectionFor = (id: string) => [...detections].reverse().find((d) => d.cameraId === id);

  return (
    <AppShell>
      <PageHeader
        title="Live Cameras"
        description={`${list.length} of ${allCameras.length} cameras matching current filters.`}
      />

      <SearchBar
        value={query}
        onChange={setQuery}
        placeholder="Search by Camera ID or location..."
        buttonLabel="Filter"
      />

      <FilterBar
        filters={[
          { key: "dept", label: "Department", options: DEPARTMENTS, value: department, onChange: setDepartment },
          {
            key: "loc",
            label: "Location",
            options: GUJARAT_CITIES.map((c) => c.district),
            value: district,
            onChange: setDistrict,
          },
          { key: "status", label: "Status", options: ["online", "offline", "alert", "attention"], value: status, onChange: setStatus },
          { key: "type", label: "Camera type", options: CAMERA_TYPES, value: type, onChange: setType },
          { key: "vms", label: "VMS source", options: VMS_SOURCES, value: vms, onChange: setVms },
        ]}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {list.map((c) => (
          <CameraCard key={c.id} camera={c} lastDetection={lastDetectionFor(c.id)} onView={setActive} />
        ))}
      </div>

      <CameraDetailDialog camera={active} onClose={() => setActive(null)} />
    </AppShell>
  );
}

function CameraDetailDialog({ camera, onClose }: { camera: Camera | null; onClose: () => void }) {
  if (!camera) return null;
  const cameraDetections = detections.filter((d) => d.cameraId === camera.id).slice(-8).reverse();
  const cameraAlerts = alerts.filter((a) => a.cameraId === camera.id);

  return (
    <Dialog open={!!camera} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 font-mono">
            {camera.id}
            <StatusBadge tone={cameraTone(camera.status)} dot>
              {camera.status}
            </StatusBadge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <div className="space-y-3">
            <SimulatedFeed
              cameraId={camera.id}
              online={camera.status !== "offline"}
              timestamp={camera.lastDetection}
              size="lg"
            />
            <div className="panel p-3">
              <p className="label-caps mb-2">Detection timeline</p>
              <ol className="space-y-1.5 text-xs">
                {cameraDetections.map((d) => (
                  <li key={d.id} className="flex items-center justify-between gap-3 border-b border-border/60 pb-1.5">
                    <span className="font-mono text-muted-foreground">{d.timestamp.slice(11, 19)}</span>
                    <span className="font-mono text-foreground">{d.plate}</span>
                    <span className="text-muted-foreground">
                      {d.color} {d.vehicleType}
                    </span>
                    <span className="font-mono text-foreground">{pct(d.confidence)}</span>
                  </li>
                ))}
                {!cameraDetections.length ? <li className="text-muted-foreground">No detections recorded.</li> : null}
              </ol>
            </div>
          </div>

          <div className="space-y-3">
            <div className="panel p-3">
              <p className="label-caps mb-2">Camera information</p>
              <dl className="space-y-1.5 text-xs">
                <Info label="Location" value={camera.location} />
                <Info label="District" value={camera.district} />
                <Info label="Department" value={camera.department} />
                <Info label="VMS source" value={camera.vmsSource} />
                <Info label="Camera type" value={camera.type} />
                <Info label="Installed" value={camera.installedOn} />
                <Info label="Last detection" value={camera.lastDetection ?? "—"} />
              </dl>
            </div>

            <div className="panel p-3">
              <p className="label-caps mb-2">Detected vehicles</p>
              <div className="flex flex-wrap gap-1.5">
                {Array.from(new Set(cameraDetections.map((d) => d.plate))).map((p) => (
                  <span key={p} className="rounded-sm border border-border bg-surface-raised px-2 py-1 font-mono text-xs">
                    {p}
                  </span>
                ))}
                {!cameraDetections.length ? <span className="text-xs text-muted-foreground">None</span> : null}
              </div>
            </div>

            <div className="panel p-3">
              <p className="label-caps mb-2">Associated alerts</p>
              {cameraAlerts.length ? (
                <ul className="space-y-1.5 text-xs">
                  {cameraAlerts.map((a) => (
                    <li key={a.id} className="flex items-center justify-between">
                      <span className="text-foreground">{a.type}</span>
                      <span className="font-mono text-muted-foreground">{a.timestamp.slice(11, 16)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground">No alerts recorded for this camera.</p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="label-caps">{label}</dt>
      <dd className="text-right text-foreground">{value}</dd>
    </div>
  );
}
