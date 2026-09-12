import { useMemo, useState } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  cameras,
  DEPARTMENTS,
  GUJARAT_CITIES,
  VEHICLE_COLORS,
  VEHICLE_TYPES,
  DEMO_DATE,
} from "@/data/mock";
import { filterDetections } from "@/services/detectionService";
import { caseService } from "@/services/caseService";
import { Clock, MapPin, Video } from "lucide-react";

export const Route = createFileRoute("/vehicle-search")({
  head: () => ({
    meta: [
      { title: "Vehicle Search — SENTINEL" },
      {
        name: "description",
        content: "Structured vehicle search across Gujarat CCTV detections by plate, type, colour, time and department.",
      },
      { property: "og:title", content: "Vehicle Search — SENTINEL" },
      { property: "og:description", content: "Trace a vehicle's journey across recorded camera detections." },
    ],
  }),
  component: VehicleSearch,
});

function VehicleSearch() {
  const [plate, setPlate] = useState("GJ01AB1234");
  const [vehicleType, setVehicleType] = useState("all");
  const [color, setColor] = useState("all");
  const [location, setLocation] = useState("all");
  const [department, setDepartment] = useState("all");
  const [from, setFrom] = useState(`${DEMO_DATE}T00:00`);
  const [to, setTo] = useState(`${DEMO_DATE}T23:59`);
  const [submitted, setSubmitted] = useState({ plate: "GJ01AB1234" });

  const results = useMemo(() => {
    const rows = filterDetections({
      plate: submitted.plate || undefined,
      vehicleType,
      color,
      location: location === "all" ? undefined : location,
      from: from.replace("T", " ") + ":00",
      to: to.replace("T", " ") + ":59",
    }).sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    if (department === "all") return rows;
    const deptCams = new Set(cameras.filter((c) => c.department === department).map((c) => c.id));
    return rows.filter((d) => deptCams.has(d.cameraId));
  }, [submitted, vehicleType, color, location, department, from, to]);

  const first = results[0];
  const last = results[results.length - 1];
  const routePoints = results.map((d) => {
    const cam = cameras.find((c) => c.id === d.cameraId);
    return { coords: cam?.coords ?? { lat: 23, lng: 72 }, label: d.location };
  });

  return (
    <AppShell>
      <PageHeader
        title="Vehicle Search"
        description="Structured search across the detection database with journey reconstruction."
        actions={
          <Button
            onClick={async () => {
              const created = await caseService.create({
                title: `Vehicle Movement Investigation — ${submitted.plate}`,
                officer: "Demo Officer",
                district: results[0]?.location ?? "Gujarat",
                plates: [submitted.plate],
                detectionIds: results.map((d) => d.id),
              });
              toast.success(`${created.id} created`, { description: `${results.length} detections attached` });
            }}
          >
            Create case
          </Button>
        }
      />

      <form
        className="panel grid gap-3 p-3 md:grid-cols-3 xl:grid-cols-4"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted({ plate: plate.trim().toUpperCase() });
        }}
      >
        <Field label="License plate">
          <Input value={plate} onChange={(e) => setPlate(e.target.value)} className="h-9 bg-surface-raised font-mono" placeholder="GJ01AB1234" />
        </Field>
        <Field label="Vehicle type">
          <Picker value={vehicleType} onChange={setVehicleType} options={VEHICLE_TYPES} />
        </Field>
        <Field label="Colour">
          <Picker value={color} onChange={setColor} options={VEHICLE_COLORS} />
        </Field>
        <Field label="Location">
          <Picker value={location} onChange={setLocation} options={GUJARAT_CITIES.map((c) => c.name)} />
        </Field>
        <Field label="Department">
          <Picker value={department} onChange={setDepartment} options={DEPARTMENTS} />
        </Field>
        <Field label="From">
          <Input type="datetime-local" value={from} onChange={(e) => setFrom(e.target.value)} className="h-9 bg-surface-raised" />
        </Field>
        <Field label="To">
          <Input type="datetime-local" value={to} onChange={(e) => setTo(e.target.value)} className="h-9 bg-surface-raised" />
        </Field>
        <div className="flex items-end">
          <Button type="submit" className="h-9 w-full">
            Search detections
          </Button>
        </div>
      </form>

      {results.length ? (
        <>
          <div className="panel flex flex-wrap items-center justify-between gap-3 p-3">
            <div>
              <p className="label-caps">Vehicle</p>
              <p className="font-mono text-lg font-semibold text-foreground">{first!.plate}</p>
              <p className="text-sm text-muted-foreground">
                {first!.color} {first!.vehicleType}
              </p>
            </div>
            <VehicleJourney detections={results} />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Detection count" value={results.length} icon={Video} />
            <StatCard label="First seen" value={first!.timestamp.slice(11, 16)} hint={first!.location} icon={Clock} />
            <StatCard label="Last seen" value={last!.timestamp.slice(11, 16)} hint={last!.location} icon={Clock} />
            <StatCard
              label="Cameras encountered"
              value={new Set(results.map((d) => d.cameraId)).size}
              icon={MapPin}
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <section className="space-y-2">
              <p className="label-caps">Detection timeline</p>
              <div className="max-h-[560px] space-y-2 overflow-y-auto pr-1">
                {results.map((d) => (
                  <DetectionCard
                    key={d.id}
                    detection={d}
                    action={
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toast(`Frame ${d.frameRef}`, { description: `${d.cameraId} · ${d.timestamp}` })}
                      >
                        Frame
                      </Button>
                    }
                  />
                ))}
              </div>
              <div className="panel p-3">
                <p className="label-caps mb-1.5">Cameras encountered</p>
                <div className="flex flex-wrap gap-1.5">
                  {Array.from(new Set(results.map((d) => d.cameraId))).map((id) => (
                    <span key={id} className="rounded-sm border border-border bg-surface-raised px-2 py-1 font-mono text-xs">
                      {id}
                    </span>
                  ))}
                </div>
              </div>
            </section>
            <section className="space-y-2">
              <p className="label-caps">Map route</p>
              <GujaratMap
                cameras={cameras.filter((c) => results.some((d) => d.cameraId === c.id))}
                route={routePoints}
                className="h-[560px]"
                showCities={false}
              />
            </section>
          </div>
        </>
      ) : (
        <div className="panel p-6 text-sm text-muted-foreground">No detections match the current criteria.</div>
      )}
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label-caps mb-1 block">{label}</label>
      {children}
    </div>
  );
}

function Picker({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9 w-full bg-surface-raised text-sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Any</SelectItem>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
