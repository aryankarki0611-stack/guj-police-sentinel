import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { SearchBar } from "@/components/SearchBar";
import { TimelineEvent } from "@/components/TimelineEvent";
import { GujaratMap } from "@/components/map/GujaratMap";
import { Button } from "@/components/ui/button";
import { cameras, type Detection } from "@/data/mock";
import { searchService, type SearchResult } from "@/services/searchService";
import { caseService } from "@/services/caseService";
import { minutesBetween } from "@/lib/format";

const searchSchema = z.object({ q: z.string().optional() });

export const Route = createFileRoute("/investigation")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Investigation Workspace — SENTINEL" },
      {
        name: "description",
        content:
          "Search recorded CCTV detections by plate, vehicle or location and reconstruct a vehicle's route across Gujarat cameras.",
      },
      { property: "og:title", content: "Investigation Workspace — SENTINEL" },
      { property: "og:description", content: "Reconstruct vehicle movement from recorded camera detections." },
    ],
  }),
  component: Investigation,
});

function Investigation() {
  const { q } = Route.useSearch();
  const navigate = useNavigate();
  const [query, setQuery] = useState(q ?? "");
  const [result, setResult] = useState<SearchResult | null>(null);
  const [busy, setBusy] = useState(false);

  const run = async (value: string) => {
    if (!value.trim()) return;
    setBusy(true);
    const res = await searchService.search(value);
    setResult(res);
    setBusy(false);
  };

  useEffect(() => {
    if (q) {
      setQuery(q);
      void run(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const submit = () => {
    void navigate({ to: "/investigation", search: { q: query } });
    void run(query);
  };

  const routePoints = (result?.detections ?? []).slice(0, 40).map((d) => {
    const cam = cameras.find((c) => c.id === d.cameraId);
    return { coords: cam?.coords ?? { lat: 23, lng: 72 }, label: d.location };
  });

  return (
    <AppShell>
      <PageHeader
        title="Investigation Workspace"
        description="Query recorded detections. Results are filtered from the detection database, not generated text."
      />

      <SearchBar
        value={query}
        onChange={setQuery}
        onSubmit={submit}
        placeholder="Search vehicles, cameras, locations, events..."
        suggestions={searchService.suggestions()}
        onSuggestion={(s) => {
          setQuery(s);
          void navigate({ to: "/investigation", search: { q: s } });
        }}
      />

      {busy ? <p className="text-sm text-muted-foreground">Querying detection index...</p> : null}

      {result && !busy ? (
        <>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Summary label="Detections found" value={String(result.count)} />
            <Summary
              label="Time range"
              value={result.timeRange ? `${result.timeRange.from.slice(11, 16)} – ${result.timeRange.to.slice(11, 16)}` : "—"}
            />
            <Summary label="Locations" value={result.locations.join(", ") || "—"} />
            <Summary label="Cameras involved" value={String(result.cameras.length)} />
          </section>

          <div className="panel p-3 text-xs">
            <p className="label-caps mb-1">Query interpretation</p>
            <ul className="flex flex-wrap gap-2">
              {result.interpretation.map((i) => (
                <li key={i} className="rounded-sm border border-border bg-surface-raised px-2 py-1 text-foreground">
                  {i}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <section>
              <div className="mb-2 flex items-center justify-between">
                <p className="label-caps">Investigation timeline</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    const created = await caseService.create({
                      title: `Investigation — ${result.plates[0] ?? result.query}`,
                      officer: "Demo Officer",
                      district: result.locations[0] ?? "Gujarat",
                      plates: result.plates.slice(0, 3),
                      detectionIds: result.detections.map((d) => d.id),
                    });
                    toast.success(`${created.id} created`, { description: created.title });
                  }}
                >
                  Create case from results
                </Button>
              </div>
              <ol className="max-h-[640px] overflow-y-auto pr-1">
                {result.detections.slice(0, 40).map((d, i, arr) => (
                  <TimelineEvent
                    key={d.id}
                    detection={d}
                    index={i}
                    isLast={i === Math.min(arr.length, 40) - 1}
                    gapMinutes={i > 0 ? minutesBetween(arr[i - 1]!.timestamp, d.timestamp) : null}
                    onViewFrame={(det: Detection) =>
                      toast(`Frame ${det.frameRef}`, {
                        description: `${det.cameraId} · ${det.location} · ${det.timestamp}`,
                      })
                    }
                  />
                ))}
                {!result.detections.length ? (
                  <li className="panel p-4 text-sm text-muted-foreground">
                    No detections matched this query.
                  </li>
                ) : null}
              </ol>
            </section>

            <section className="space-y-2">
              <p className="label-caps">Route reconstruction</p>
              <GujaratMap
                cameras={cameras.filter((c) => result.cameras.includes(c.id))}
                route={routePoints}
                className="h-[640px]"
                showCities={false}
              />
            </section>
          </div>
        </>
      ) : null}

      {!result && !busy ? (
        <div className="panel p-6 text-sm text-muted-foreground">
          Enter a plate, vehicle description or location to query recorded detections.
        </div>
      ) : null}
    </AppShell>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="panel px-3 py-2">
      <p className="label-caps">{label}</p>
      <p className="truncate text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
