// POST /search
import { cameras, PLATES, VEHICLE_COLORS, VEHICLE_TYPES, type Detection } from "@/data/mock";
import { filterDetections } from "./detectionService";
import { respond } from "./api";

export interface SearchResult {
  query: string;
  interpretation: string[];
  detections: Detection[];
  count: number;
  timeRange: { from: string; to: string } | null;
  locations: string[];
  cameras: string[];
  plates: string[];
}

/**
 * Free-text query parsing. Terms are extracted from the query and applied as
 * filters against the detection records — no query string is mapped directly
 * to a canned answer.
 */
export function parseQuery(query: string) {
  const text = query.toLowerCase();
  const plateMatch = query.toUpperCase().match(/GJ\s?\d{2}\s?[A-Z]{2}\s?\d{4}/);
  const plate = plateMatch ? plateMatch[0].replace(/\s/g, "") : undefined;
  const vehicleType = VEHICLE_TYPES.find((t) => text.includes(t.toLowerCase()));
  const color = VEHICLE_COLORS.find((c) => text.includes(c.toLowerCase()));
  const locationNames = Array.from(new Set(cameras.map((c) => c.location.split(" — ")[0]!)));
  const locations = locationNames.filter((l) => text.includes(l.toLowerCase()));
  return { plate, vehicleType, color, locations };
}

export const searchService = {
  async search(query: string): Promise<SearchResult> {
    const parsed = parseQuery(query);
    const interpretation: string[] = [];
    if (parsed.plate) interpretation.push(`Plate filter: ${parsed.plate}`);
    if (parsed.vehicleType) interpretation.push(`Vehicle type: ${parsed.vehicleType}`);
    if (parsed.color) interpretation.push(`Colour: ${parsed.color}`);
    if (parsed.locations.length) interpretation.push(`Locations: ${parsed.locations.join(", ")}`);
    if (!interpretation.length) interpretation.push("No structured filters detected — showing all recorded detections");

    let rows = filterDetections({
      plate: parsed.plate,
      vehicleType: parsed.vehicleType,
      color: parsed.color,
    });
    if (parsed.locations.length) rows = rows.filter((d) => parsed.locations.includes(d.location));
    rows = rows.sort((a, b) => a.timestamp.localeCompare(b.timestamp));

    return respond({
      query,
      interpretation,
      detections: rows,
      count: rows.length,
      timeRange: rows.length ? { from: rows[0]!.timestamp, to: rows[rows.length - 1]!.timestamp } : null,
      locations: Array.from(new Set(rows.map((d) => d.location))),
      cameras: Array.from(new Set(rows.map((d) => d.cameraId))),
      plates: Array.from(new Set(rows.map((d) => d.plate))),
    });
  },

  suggestions(): string[] {
    return [
      `Find ${PLATES[0]}`,
      "Show white SUVs near Ahmedabad",
      `Track vehicle ${PLATES[1]}`,
      "Show all detections between Ahmedabad and Gandhinagar",
    ];
  },
};
