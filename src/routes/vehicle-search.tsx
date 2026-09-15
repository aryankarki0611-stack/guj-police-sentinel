import {
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { GujaratMap } from "@/components/map/GujaratMap";
import { VehicleJourney } from "@/components/VehicleJourney";
import { DetectionCard } from "@/components/DetectionCard";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  cameras,
  DEPARTMENTS,
  GUJARAT_CITIES,
  VEHICLE_COLORS,
  VEHICLE_TYPES,
} from "@/data/mock";

import { detectionService } from "@/services/detectionService";
import { caseService } from "@/services/caseService";

import {
  Clock,
  MapPin,
  Video,
  Search,
  Loader2,
} from "lucide-react";

export const Route = createFileRoute("/vehicle-search")({
  head: () => ({
    meta: [
      {
        title: "Vehicle Search — SENTINEL",
      },
      {
        name: "description",
        content:
          "Search Gujarat CCTV vehicle detections and reconstruct journeys.",
      },
    ],
  }),
  component: VehicleSearch,
});

function VehicleSearch() {
  const [plate, setPlate] = useState("GJ01AB1234");

  const [vehicleType, setVehicleType] =
    useState("all");

  const [color, setColor] =
    useState("all");

  const [location, setLocation] =
    useState("all");

  const [department, setDepartment] =
    useState("all");

  const [from, setFrom] = useState("");

  const [to, setTo] = useState("");

  const [submitted, setSubmitted] =
    useState("GJ01AB1234");

  const [results, setResults] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  /*
   * ========================================
   * LOAD SUPABASE DETECTIONS
   * ========================================
   *
   * IMPORTANT:
   *
   * Your current Supabase detections table
   * contains:
   *
   * id
   * camera_id
   * vehicle_id
   * plate_number
   * detected_at
   *
   * So we load ALL records first.
   *
   * We then safely filter the plate.
   *
   * We intentionally do NOT apply the
   * date/location/type/colour filters yet,
   * because those fields are not currently
   * coming from detectionService.
   */

  useEffect(() => {
    let cancelled = false;

    async function loadDetections() {
      setLoading(true);
      setError(null);

      try {
        const rows =
          await detectionService.list();

        console.log(
          "ALL SUPABASE DETECTIONS:",
          rows
        );

        console.log(
          "SUBMITTED PLATE:",
          submitted
        );

        if (cancelled) {
          return;
        }

        let filtered = [...rows];

        /*
         * ====================================
         * PLATE FILTER
         * ====================================
         */

        const searchPlate =
          submitted
            .trim()
            .toUpperCase()
            .replace(/\s+/g, "");

        if (searchPlate) {
          filtered = filtered.filter(
            (d) => {
              const databasePlate =
                String(
                  d.plate ?? ""
                )
                  .trim()
                  .toUpperCase()
                  .replace(
                    /\s+/g,
                    ""
                  );

              return (
                databasePlate ===
                searchPlate
              );
            }
          );
        }

        /*
         * ====================================
         * DEBUG
         * ====================================
         */

        console.log(
          "ROWS AFTER PLATE FILTER:",
          filtered
        );

        /*
         * ====================================
         * OPTIONAL FILTERS
         * ====================================
         *
         * The current detectionService maps
         * these values to "Unknown" or empty.
         *
         * Therefore we DO NOT remove records
         * when these dropdowns are selected.
         */

        if (vehicleType !== "all") {
          console.log(
            "Vehicle type selected:",
            vehicleType
          );
        }

        if (color !== "all") {
          console.log(
            "Colour selected:",
            color
          );
        }

        if (location !== "all") {
          console.log(
            "Location selected:",
            location
          );
        }

        if (department !== "all") {
          console.log(
            "Department selected:",
            department
          );
        }

        /*
         * ====================================
         * SORT BY DETECTION TIME
         * ====================================
         */

        filtered.sort(
          (a, b) => {
            const timeA =
              new Date(
                String(
                  a.timestamp ?? ""
                ).replace(
                  " ",
                  "T"
                )
              ).getTime();

            const timeB =
              new Date(
                String(
                  b.timestamp ?? ""
                ).replace(
                  " ",
                  "T"
                )
              ).getTime();

            /*
             * If timestamp cannot be parsed,
             * keep the record instead of removing
             * it.
             */
            if (
              Number.isNaN(timeA) &&
              Number.isNaN(timeB)
            ) {
              return 0;
            }

            if (
              Number.isNaN(timeA)
            ) {
              return 1;
            }

            if (
              Number.isNaN(timeB)
            ) {
              return -1;
            }

            return timeA - timeB;
          }
        );

        console.log(
          "FINAL VEHICLE RESULTS:",
          filtered
        );

        setResults(filtered);
      } catch (err: any) {
        console.error(
          "Vehicle search failed:",
          err
        );

        if (!cancelled) {
          setError(
            err?.message ||
              "Could not load vehicle detections."
          );

          setResults([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDetections();

    return () => {
      cancelled = true;
    };
  }, [
    submitted,
    vehicleType,
    color,
    location,
    department,
  ]);

  /*
   * ========================================
   * FIRST / LAST
   * ========================================
   */

  const first =
    results.length > 0
      ? results[0]
      : undefined;

  const last =
    results.length > 0
      ? results[
          results.length - 1
        ]
      : undefined;

  /*
   * ========================================
   * MAP ROUTE
   * ========================================
   */

  const routePoints =
    results.map(
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
            detection.location ||
            detection.cameraId ||
            "Unknown location",
        };
      }
    );

  /*
   * ========================================
   * PAGE
   * ========================================
   */

  return (
    <AppShell>
      <PageHeader
        title="Vehicle Search"
        description="Search and reconstruct a vehicle's journey across Gujarat CCTV detections."
        actions={
          <Button
            disabled={
              loading ||
              !submitted.trim() ||
              results.length === 0
            }
            onClick={async () => {
              if (!submitted.trim()) {
                toast.error(
                  "Enter a vehicle plate first"
                );
                return;
              }

              if (
                results.length === 0
              ) {
                toast.error(
                  "No detections available for this vehicle"
                );
                return;
              }

              try {
                const created =
                  await caseService.create(
                    {
                      title:
                        `Vehicle Movement Investigation — ${submitted
                          .trim()
                          .toUpperCase()}`,

                      officer:
                        "Demo Officer",

                      district:
                        first?.location ||
                        "Gujarat",

                      plates: [
                        submitted
                          .trim()
                          .toUpperCase(),
                      ],

                      detectionIds:
                        results.map(
                          (d) =>
                            d.id
                        ),
                    }
                  );

                toast.success(
                  `${created.id} created`,
                  {
                    description:
                      `${results.length} detections attached`,
                  }
                );
              } catch (err) {
                console.error(
                  "Case creation failed:",
                  err
                );

                toast.error(
                  "Could not create case"
                );
              }
            }}
          >
            Create case
          </Button>
        }
      />

      {/* ==================================
          SEARCH BOX
          ================================== */}

      <form
        onSubmit={(event) => {
          event.preventDefault();

          setSubmitted(
            plate
              .trim()
              .toUpperCase()
          );
        }}
        className="panel p-4"
      >
        <div className="mb-4">
          <p className="label-caps">
            Vehicle investigation
          </p>

          <h2 className="mt-1 text-lg font-semibold">
            Search CCTV detections
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Enter a vehicle
            registration number to
            search live detection
            records.
          </p>
        </div>

        {/* MAIN SEARCH */}

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />

            <Input
              value={plate}
              onChange={(event) =>
                setPlate(
                  event.target.value
                )
              }
              placeholder="Enter vehicle plate e.g. GJ01AB1234"
              className="h-10 bg-surface-raised pl-9 font-mono"
            />
          </div>

          <Button
            type="submit"
            className="h-10 px-6"
          >
            Search
          </Button>
        </div>

        {/* FILTERS */}

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Field label="Vehicle type">
            <Picker
              value={vehicleType}
              onChange={
                setVehicleType
              }
              options={
                VEHICLE_TYPES
              }
            />
          </Field>

          <Field label="Colour">
            <Picker
              value={color}
              onChange={setColor}
              options={
                VEHICLE_COLORS
              }
            />
          </Field>

          <Field label="Location">
            <Picker
              value={location}
              onChange={setLocation}
              options={
                GUJARAT_CITIES.map(
                  (city) =>
                    city.name
                )
              }
            />
          </Field>

          <Field label="Department">
            <Picker
              value={department}
              onChange={
                setDepartment
              }
              options={
                DEPARTMENTS
              }
            />
          </Field>

          <Field label="From">
            <Input
              type="datetime-local"
              value={from}
              onChange={(event) =>
                setFrom(
                  event.target.value
                )
              }
              className="h-9 bg-surface-raised"
            />
          </Field>

          <Field label="To">
            <Input
              type="datetime-local"
              value={to}
              onChange={(event) =>
                setTo(
                  event.target.value
                )
              }
              className="h-9 bg-surface-raised"
            />
          </Field>
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          Vehicle type, colour, location,
          department and date filters are
          displayed but are not yet applied
          to Supabase because those fields
          are not currently available in the
          detection records.
        </p>
      </form>

      {/* ==================================
          LOADING
          ================================== */}

      {loading && (
        <div className="panel flex items-center gap-3 p-6">
          <Loader2
            size={18}
            className="animate-spin"
          />

          <p className="text-sm">
            Searching Supabase
            detection records...
          </p>
        </div>
      )}

      {/* ==================================
          ERROR
          ================================== */}

      {!loading && error && (
        <div className="panel border-destructive/30 p-6">
          <p className="font-medium">
            Search error
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            {error}
          </p>
        </div>
      )}

      {/* ==================================
          RESULTS
          ================================== */}

      {!loading &&
        !error &&
        results.length > 0 && (
          <>
            {/* VEHICLE HEADER */}

            <div className="panel flex flex-wrap items-center justify-between gap-4 p-4">
              <div>
                <p className="label-caps">
                  Vehicle
                </p>

                <p className="mt-1 font-mono text-xl font-semibold">
                  {first?.plate ||
                    submitted}
                </p>

                <p className="text-sm text-muted-foreground">
                  {first?.color ||
                    "Unknown"}{" "}
                  {first?.vehicleType ||
                    "Unknown"}
                </p>
              </div>

              <VehicleJourney
                detections={results}
              />
            </div>

            {/* STATS */}

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Detection count"
                value={
                  results.length
                }
                icon={Video}
              />

              <StatCard
                label="First seen"
                value={
                  first?.timestamp
                    ? formatTime(
                        first.timestamp
                      )
                    : "--"
                }
                {...(first?.location
                  ? {
                      hint: first.location,
                    }
                  : {})}
                icon={Clock}
              />

              <StatCard
                label="Last seen"
                value={
                  last?.timestamp
                    ? formatTime(
                        last.timestamp
                      )
                    : "--"
                }
                {...(last?.location
                  ? {
                      hint: last.location,
                    }
                  : {})}
                icon={Clock}
              />

              <StatCard
                label="Cameras encountered"
                value={
                  new Set(
                    results.map(
                      (d) =>
                        d.cameraId
                    )
                  ).size
                }
                icon={MapPin}
              />
            </div>

            {/* TIMELINE + MAP */}

            <div className="grid gap-4 xl:grid-cols-2">
              {/* TIMELINE */}

              <section className="space-y-2">
                <p className="label-caps">
                  Detection timeline
                </p>

                <div className="max-h-[560px] space-y-2 overflow-y-auto pr-1">
                  {results.map(
                    (detection) => (
                      <DetectionCard
                        key={
                          detection.id
                        }
                        detection={
                          detection
                        }
                        action={
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              toast(
                                `Frame ${
                                  detection.frameRef ||
                                  "not available"
                                }`,
                                {
                                  description:
                                    `${detection.cameraId} · ${detection.timestamp}`,
                                }
                              )
                            }
                          >
                            Frame
                          </Button>
                        }
                      />
                    )
                  )}
                </div>

                {/* CAMERAS */}

                <div className="panel p-3">
                  <p className="label-caps mb-2">
                    Cameras encountered
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {Array.from(
                      new Set(
                        results.map(
                          (d) =>
                            d.cameraId
                        )
                      )
                    ).map(
                      (id) => (
                        <span
                          key={id}
                          className="rounded-sm border border-border bg-surface-raised px-2 py-1 font-mono text-xs"
                        >
                          {id}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </section>

              {/* MAP */}

              <section className="space-y-2">
                <p className="label-caps">
                  Map route
                </p>

                <GujaratMap
                  cameras={cameras.filter(
                    (camera) =>
                      results.some(
                        (d) =>
                          d.cameraId ===
                          camera.id
                      )
                  )}
                  route={routePoints}
                  className="h-[560px]"
                  showCities={false}
                />
              </section>
            </div>
          </>
        )}

      {/* ==================================
          NO RESULTS
          ================================== */}

      {!loading &&
        !error &&
        results.length === 0 && (
          <div className="panel p-6">
            <p className="font-medium">
              No detections found
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              No matching records were
              found for vehicle{" "}
              <span className="font-mono">
                {submitted ||
                  "—"}
              </span>
              .
            </p>

            <p className="mt-3 text-xs text-muted-foreground">
              Check the plate number in
              your Supabase detections
              table.
            </p>
          </div>
        )}
    </AppShell>
  );
}

/* ========================================
   FORMAT TIME
   ======================================== */

function formatTime(
  timestamp: string
) {
  const normalized =
    String(timestamp).replace(
      " ",
      "T"
    );

  const date =
    new Date(normalized);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return String(
      timestamp
    ).slice(11, 16) || "--";
  }

  return date.toLocaleTimeString(
    [],
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

/* ========================================
   FIELD
   ======================================== */

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="label-caps mb-1 block">
        {label}
      </label>

      {children}
    </div>
  );
}

/* ========================================
   PICKER
   ======================================== */

function Picker({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (
    value: string
  ) => void;
  options: string[];
}) {
  return (
    <Select
      value={value}
      onValueChange={onChange}
    >
      <SelectTrigger className="h-9 w-full bg-surface-raised text-sm">
        <SelectValue />
      </SelectTrigger>

      <SelectContent>
        <SelectItem value="all">
          Any
        </SelectItem>

        {options.map(
          (option) => (
            <SelectItem
              key={option}
              value={option}
            >
              {option}
            </SelectItem>
          )
        )}
      </SelectContent>
    </Select>
  );
}