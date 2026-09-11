import { useMemo } from "react";
import type { Camera, GeoPoint } from "@/data/mock";
import { GUJARAT_CITIES } from "@/data/mock";
import { cn } from "@/lib/utils";

const BOUNDS = { minLng: 68.0, maxLng: 74.8, minLat: 20.0, maxLat: 24.9 };
const W = 1000;
const H = 720;

export function project(p: GeoPoint) {
  const x = ((p.lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * W;
  const y = ((BOUNDS.maxLat - p.lat) / (BOUNDS.maxLat - BOUNDS.minLat)) * H;
  return { x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 };
}

// Simplified state silhouette (decorative reference outline).
const OUTLINE: [number, number][] = [
  [68.35, 23.72], [69.1, 24.28], [70.1, 24.2], [70.9, 24.6], [71.9, 24.68],
  [72.6, 24.6], [73.2, 24.4], [73.9, 23.9], [74.45, 23.4], [74.3, 22.7],
  [73.95, 22.1], [73.7, 21.3], [73.1, 20.35], [72.72, 20.12], [72.62, 20.9],
  [72.35, 21.62], [71.95, 21.45], [71.5, 20.95], [70.8, 20.78], [70.1, 20.92],
  [69.5, 21.55], [68.98, 22.05], [68.92, 22.55], [69.9, 22.7], [70.7, 22.95],
  [71.2, 23.15], [70.6, 23.45], [69.6, 23.5], [68.9, 23.5],
];

const statusFill: Record<Camera["status"], string> = {
  online: "var(--color-ok)",
  offline: "var(--color-muted-foreground)",
  alert: "var(--color-alert)",
  attention: "var(--color-warn)",
};

export interface RoutePoint {
  coords: GeoPoint;
  label: string;
}

interface GujaratMapProps {
  cameras: Camera[];
  selectedId?: string | null;
  onSelect?: (camera: Camera) => void;
  route?: RoutePoint[];
  className?: string;
  showCities?: boolean;
}

export function GujaratMap({
  cameras,
  selectedId,
  onSelect,
  route,
  className,
  showCities = true,
}: GujaratMapProps) {
  const outlinePath = useMemo(
    () =>
      OUTLINE.map(([lng, lat], i) => {
        const { x, y } = project({ lat, lng });
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
      }).join(" ") + " Z",
    [],
  );

  const routePath = useMemo(() => {
    if (!route?.length) return "";
    return route
      .map((p, i) => {
        const { x, y } = project(p.coords);
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");
  }, [route]);

  return (
    <div className={cn("relative overflow-hidden rounded-md border border-border bg-[oklch(0.17_0.02_258)]", className)}>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" role="img" aria-label="Gujarat camera map">
        <defs>
          <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M50 0 L0 0 0 50" fill="none" stroke="var(--color-grid-line)" strokeWidth="0.8" />
          </pattern>
        </defs>
        <rect width={W} height={H} fill="url(#grid)" />
        <path d={outlinePath} fill="var(--color-surface)" fillOpacity="0.75" stroke="var(--color-border)" strokeWidth="2" />

        {routePath ? (
          <>
            <path d={routePath} fill="none" stroke="var(--color-primary)" strokeWidth="3" strokeDasharray="10 6" />
            {route!.map((p, i) => {
              const { x, y } = project(p.coords);
              return (
                <g key={`${p.label}-${i}`}>
                  <circle cx={x} cy={y} r="9" fill="var(--color-primary)" fillOpacity="0.25" />
                  <circle cx={x} cy={y} r="4.5" fill="var(--color-primary)" />
                  <text x={x + 12} y={y - 8} fontSize="15" fill="var(--color-foreground)" fontWeight="600">
                    {i + 1}. {p.label}
                  </text>
                </g>
              );
            })}
          </>
        ) : null}

        {showCities
          ? GUJARAT_CITIES.map((c) => {
              const { x, y } = project(c.coords);
              return (
                <text
                  key={c.name}
                  x={x + 10}
                  y={y + 16}
                  fontSize="13"
                  fill="var(--color-muted-foreground)"
                  letterSpacing="0.06em"
                >
                  {c.name.toUpperCase()}
                </text>
              );
            })
          : null}

        {cameras.map((cam) => {
          const { x, y } = project(cam.coords);
          const active = selectedId === cam.id;
          return (
            <g
              key={cam.id}
              transform={`translate(${x} ${y})`}
              className="cursor-pointer"
              onClick={() => onSelect?.(cam)}
              role="button"
              tabIndex={0}
              aria-label={`${cam.id} ${cam.location}`}
            >
              {cam.status === "alert" ? <circle r="13" fill={statusFill.alert} fillOpacity="0.18" /> : null}
              {active ? <circle r="12" fill="none" stroke="var(--color-primary)" strokeWidth="2" /> : null}
              <rect x="-5" y="-5" width="10" height="10" fill={statusFill[cam.status]} stroke="oklch(0.17 0.02 258)" strokeWidth="1.5" />
            </g>
          );
        })}
      </svg>

      <div className="pointer-events-none absolute bottom-3 left-3 flex flex-wrap gap-3 rounded-sm border border-border bg-background/85 px-3 py-2 text-[11px] uppercase tracking-wide text-muted-foreground">
        <Legend color="var(--color-ok)" label="Online" />
        <Legend color="var(--color-muted-foreground)" label="Offline" />
        <Legend color="var(--color-alert)" label="Alert" />
        <Legend color="var(--color-warn)" label="Attention" />
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="inline-block h-2.5 w-2.5" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}
