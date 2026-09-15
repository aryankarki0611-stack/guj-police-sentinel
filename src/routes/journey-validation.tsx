import { useMemo, useState } from "react";
import {
  createFileRoute,
  Link,
} from "@tanstack/react-router";

import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Route as RouteIcon,
  ShieldAlert,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import {
  cameras,
  type Detection,
} from "@/data/mock";
import { GujaratMap } from "@/components/map/GujaratMap";
import { cn } from "@/lib/utils";

export const Route = createFileRoute(
  "/journey-validation"
)({
  component: JourneyValidationPage,
});

type ValidationState =
  | "PASS"
  | "REVIEW";

type Transition = {
  from: Detection;
  to: Detection;
  distanceKm: number;
  expectedMinMinutes: number;
  observedMinutes: number;
  state: ValidationState;
  reason: string;
};

/*
 * Demo journey used for the hackathon UI.
 */
const demoJourney: Detection[] = [
  {
    id: "DET-09001",
    cameraId: "CAM-014",
    location: "Ahmedabad",
    timestamp:
      "2026-09-12 10:00:00",
    plate: "GJ01AB1234",
    vehicleType: "SUV",
    color: "White",
    confidence: 0.97,
    direction: "Northbound",
    frameRef:
      "frame_CAM-014_1000",
  },

  {
    id: "DET-09002",
    cameraId: "CAM-021",
    location: "Gandhinagar",
    timestamp:
      "2026-09-12 10:03:00",
    plate: "GJ01AB1234",
    vehicleType: "SUV",
    color: "White",
    confidence: 0.96,
    direction: "Northbound",
    frameRef:
      "frame_CAM-021_1003",
  },

  {
    id: "DET-09003",
    cameraId: "CAM-033",
    location: "Mehsana",
    timestamp:
      "2026-09-12 10:42:00",
    plate: "GJ01AB1234",
    vehicleType: "SUV",
    color: "White",
    confidence: 0.93,
    direction: "Northbound",
    frameRef:
      "frame_CAM-033_1042",
  },

  {
    id: "DET-09004",
    cameraId: "CAM-041",
    location: "Palanpur",
    timestamp:
      "2026-09-12 12:02:00",
    plate: "GJ01AB1234",
    vehicleType: "SUV",
    color: "White",
    confidence: 0.9,
    direction: "Northbound",
    frameRef:
      "frame_CAM-041_1202",
  },
];

/*
 * Known distances between demo cameras.
 */
const cameraDistanceKm: Record<
  string,
  number
> = {
  "CAM-014|CAM-021": 28.4,
  "CAM-021|CAM-033": 55.1,
  "CAM-033|CAM-041": 73.5,
};

/*
 * Calculate minutes between two timestamps.
 */
function minutes(
  a: string,
  b: string
) {
  const start = Date.parse(
    a.replace(" ", "T")
  );

  const end = Date.parse(
    b.replace(" ", "T")
  );

  return Math.round(
    (end - start) / 60000
  );
}

/*
 * Estimate minimum travel time.
 *
 * 65 km/h average road speed
 * + 4 minute buffer.
 */
function estimateMinutes(
  distanceKm: number
) {
  return Math.ceil(
    (distanceKm / 65) * 60 + 4
  );
}

/*
 * Evaluate every consecutive
 * camera transition.
 */
function evaluateJourney(
  rows: Detection[]
): Transition[] {
  return rows
    .slice(1)
    .map((to, index) => {
      const from = rows[index]!;

      const key =
        `${from.cameraId}|${to.cameraId}`;

      const distanceKm =
        cameraDistanceKm[key] ??
        40;

      const observedMinutes =
        minutes(
          from.timestamp,
          to.timestamp
        );

      const expectedMinMinutes =
        estimateMinutes(
          distanceKm
        );

      const state: ValidationState =
        observedMinutes <
        expectedMinMinutes
          ? "REVIEW"
          : "PASS";

      return {
        from,
        to,
        distanceKm,
        observedMinutes,
        expectedMinMinutes,
        state,

        reason:
          state === "REVIEW"
            ? "Travel time is below the estimated minimum. Review OCR, camera association, or timestamp quality."
            : "This transition is within the expected travel window.",
      };
    });
}

/*
 * Main page.
 */
function JourneyValidationPage() {
  const [selected, setSelected] =
    useState<Transition | null>(
      null
    );

  const transitions = useMemo(
    () =>
      evaluateJourney(
        demoJourney
      ),
    []
  );

  const reviewCount =
    transitions.filter(
      (transition) =>
        transition.state ===
        "REVIEW"
    ).length;

  /*
   * Build route for GIS map.
   */
  const route = demoJourney.map(
    (detection) => {
      const camera =
        cameras.find(
          (camera) =>
            camera.id ===
            detection.cameraId
        );

      return {
        coords:
          camera?.coords ?? {
            lat: 23,
            lng: 72,
          },

        label:
          `${detection.cameraId} · ${detection.timestamp.slice(
            11,
            16
          )}`,
      };
    }
  );

  return (
    <AppShell>
      <PageHeader
        title="Journey Validation"
        description="Graph-constrained validation checks whether sequential camera detections are physically plausible."
        actions={
          <Button
            asChild
            variant="outline"
            size="sm"
          >
            <Link to="/vehicle-search">
              Open vehicle search
            </Link>
          </Button>
        }
      />

      {/* ========================= */}
      {/* SUMMARY */}
      {/* ========================= */}

      <div className="grid gap-3 sm:grid-cols-3">
        <Metric
          label="Vehicle"
          value="GJ01AB1234"
          icon={RouteIcon}
        />

        <Metric
          label="Transitions checked"
          value={String(
            transitions.length
          )}
          icon={Clock3}
        />

        <Metric
          label="Needs review"
          value={String(
            reviewCount
          )}
          icon={ShieldAlert}
          tone={
            reviewCount > 0
              ? "warn"
              : "ok"
          }
        />
      </div>

      {/* ========================= */}
      {/* MAIN CONTENT */}
      {/* ========================= */}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        {/* ======================= */}
        {/* TRANSITIONS */}
        {/* ======================= */}

        <section className="space-y-3">
          <div className="panel overflow-hidden">
            <div className="border-b border-border px-4 py-3">
              <p className="label-caps">
                Physical plausibility
                graph
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Sequential camera
                detections are checked
                against estimated
                minimum travel time.
              </p>
            </div>

            <div className="divide-y divide-border">
              {transitions.map(
                (transition) => (
                  <button
                    key={`${transition.from.id}-${transition.to.id}`}
                    type="button"
                    onClick={() =>
                      setSelected(
                        transition
                      )
                    }
                    className={cn(
                      "w-full p-4 text-left transition-colors hover:bg-accent/50",
                      selected?.from
                        .id ===
                        transition.from
                          .id &&
                        "bg-accent/40"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-semibold">
                            {
                              transition
                                .from
                                .cameraId
                            }
                          </span>

                          <span className="text-muted-foreground">
                            →
                          </span>

                          <span className="font-mono text-sm font-semibold">
                            {
                              transition
                                .to
                                .cameraId
                            }
                          </span>
                        </div>

                        <p className="mt-1 text-xs text-muted-foreground">
                          {
                            transition
                              .from
                              .location
                          }{" "}
                          →{" "}
                          {
                            transition
                              .to
                              .location
                          }{" "}
                          ·{" "}
                          {transition.from.timestamp.slice(
                            11,
                            16
                          )}{" "}
                          →{" "}
                          {transition.to.timestamp.slice(
                            11,
                            16
                          )}
                        </p>
                      </div>

                      <StatusBadge
                        tone={
                          transition.state ===
                          "PASS"
                            ? "ok"
                            : "warn"
                        }
                        dot
                      >
                        {
                          transition.state
                        }
                      </StatusBadge>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                      <Value
                        label="Distance"
                        value={`${transition.distanceKm.toFixed(
                          1
                        )} km`}
                      />

                      <Value
                        label="Observed"
                        value={`${transition.observedMinutes} min`}
                      />

                      <Value
                        label="Expected min"
                        value={`${transition.expectedMinMinutes} min`}
                      />
                    </div>
                  </button>
                )
              )}
            </div>
          </div>

          {/* ===================== */}
          {/* SELECTED TRANSITION */}
          {/* ===================== */}

          {selected ? (
            <div
              className={cn(
                "panel p-4",
                selected.state ===
                  "REVIEW"
                  ? "border-warn/40 bg-warn/5"
                  : "border-ok/40 bg-ok/5"
              )}
            >
              <div className="flex items-start gap-3">
                {selected.state ===
                "REVIEW" ? (
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warn" />
                ) : (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-ok" />
                )}

                <div className="min-w-0">
                  <p className="font-semibold text-foreground">
                    {selected.state ===
                    "REVIEW"
                      ? "Review transition"
                      : "Transition passed"}
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {selected.reason}
                  </p>

                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    <Value
                      label="Observed"
                      value={`${selected.observedMinutes} min`}
                    />

                    <Value
                      label="Expected minimum"
                      value={`${selected.expectedMinMinutes} min`}
                    />

                    <Value
                      label="Gap"
                      value={`${Math.max(
                        selected.expectedMinMinutes -
                          selected.observedMinutes,
                        0
                      )} min`}
                    />
                  </div>

                  {selected.state ===
                  "REVIEW" ? (
                    <p className="mt-3 text-xs text-muted-foreground">
                      This is a review
                      signal, not a
                      determination that
                      the vehicle was
                      absent. Possible
                      causes include OCR
                      mismatch, incorrect
                      vehicle association,
                      or timestamp
                      inconsistency.
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          ) : (
            <div className="panel p-4 text-sm text-muted-foreground">
              Select a transition
              above to inspect the
              validation result.
            </div>
          )}
        </section>

        {/* ======================= */}
        {/* GIS MAP */}
        {/* ======================= */}

        <section>
          <p className="label-caps mb-2">
            Journey on GIS
          </p>

          <GujaratMap
            cameras={cameras.filter(
              (camera) =>
                demoJourney.some(
                  (detection) =>
                    detection.cameraId ===
                    camera.id
                )
            )}
            route={route}
            className="h-[590px]"
            showCities={false}
          />
        </section>
      </div>
    </AppShell>
  );
}

/* ============================= */
/* METRIC */
/* ============================= */

function Metric({
  label,
  value,
  icon: Icon,
  tone = "neutral",
}: {
  label: string;
  value: string;
  icon: typeof RouteIcon;
  tone?:
    | "neutral"
    | "ok"
    | "warn";
}) {
  return (
    <div className="panel flex items-center gap-3 px-4 py-3">
      <div
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-md bg-muted",
          tone === "ok" &&
            "bg-ok/10 text-ok",
          tone === "warn" &&
            "bg-warn/10 text-warn"
        )}
      >
        <Icon className="h-4 w-4" />
      </div>

      <div>
        <p className="label-caps">
          {label}
        </p>

        <p className="text-sm font-semibold text-foreground">
          {value}
        </p>
      </div>
    </div>
  );
}

/* ============================= */
/* VALUE */
/* ============================= */

function Value({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-sm border border-border bg-surface-raised px-2.5 py-2">
      <p className="label-caps">
        {label}
      </p>

      <p className="mt-0.5 font-mono text-xs text-foreground">
        {value}
      </p>
    </div>
  );
}