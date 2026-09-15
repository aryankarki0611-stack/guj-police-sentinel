import { supabase } from "@/lib/supabase";
import type { Detection } from "@/data/mock";
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

export function parseQuery(query: string) {
  const text = query.toLowerCase();

  const plateMatch = query
    .toUpperCase()
    .match(/GJ\s?\d{2}\s?[A-Z]{2}\s?\d{4}/);

  const plate = plateMatch
    ? plateMatch[0].replace(/\s/g, "")
    : undefined;

  return { plate, vehicleType: undefined, color: undefined };
}

export const searchService = {
  async search(query: string): Promise<SearchResult> {
    const parsed = parseQuery(query);
    const interpretation: string[] = [];

    if (parsed.plate) {
      interpretation.push(`Plate filter: ${parsed.plate}`);
    }

    if (!interpretation.length) {
      interpretation.push("Showing all recorded vehicle detections");
    }

    let dbQuery = supabase
      .from("detections")
      .select(`
        *,
        cameras (
          camera_code,
          location,
          latitude,
          longitude
        )
      `)
      .order("detected_at", { ascending: true });

    if (parsed.plate) {
      dbQuery = dbQuery.eq("vehicle_number", parsed.plate);
    }

    const { data, error } = await dbQuery;

    if (error) {
      console.error("Vehicle search error:", error);
      throw error;
    }

    const rows = data ?? [];

   const detections = rows.map((row: any) => ({
  id: row.id ?? "",
  cameraId: row.cameras?.camera_code ?? row.camera_id ?? "",
  plate: row.vehicle_number ?? "",
  timestamp: row.detected_at ?? "",
  location: row.cameras?.location ?? "",
  confidence: Number(row.confidence ?? 0),

  vehicleType: row.vehicle_type ?? "Unknown",
  color: row.color ?? "Unknown",
  direction: row.direction ?? "Unknown",
  frameRef: row.image_url ?? "",
}));

    return respond({
      query,
      interpretation,
      detections,
      count: detections.length,

      timeRange: detections.length
        ? {
            from: detections[0]!.timestamp,
            to: detections[detections.length - 1]!.timestamp,
          }
        : null,

      locations: Array.from(
        new Set(detections.map((d) => d.location))
      ),

      cameras: Array.from(
        new Set(detections.map((d) => d.cameraId))
      ),

      plates: Array.from(
        new Set(detections.map((d) => d.plate))
      ),
    });
  },

  suggestions(): string[] {
    return [
      "Find GJ01AB1234",
      "Find GJ05CD7788",
      "Track vehicle GJ01AB1234",
      "Show all vehicle detections",
    ];
  },
};