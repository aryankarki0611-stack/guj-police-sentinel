import { supabase } from "@/lib/supabase";

export interface DetectionFilters {
  plate?: string;
  cameraId?: string;
  from?: string;
  to?: string;
}

export interface Detection {
  id: string;
  cameraId: string;
  plate: string;
  timestamp: string;
  location: string;
  confidence: number;
  vehicleType: string;
  color: string;
  direction: string;
  frameRef: string;
}

function mapDetection(row: any): Detection {
  return {
    id: row.id ?? "",
    cameraId: row.camera_id ?? "",
    plate: row.plate_number ?? "",
    timestamp: row.detected_at ?? "",
    location: "",
    confidence: 0,
    vehicleType: "Unknown",
    color: "Unknown",
    direction: "Unknown",
    frameRef: "",
  };
}

export const detectionService = {
  async list(filters: DetectionFilters = {}) {
    let query = supabase
      .from("detections")
      .select(
        "id, camera_id, vehicle_id, plate_number, detected_at"
      );

    // Plate search
    if (filters.plate?.trim()) {
      query = query.eq(
        "plate_number",
        filters.plate.trim().toUpperCase()
      );
    }

    // Camera filter
    if (filters.cameraId) {
      query = query.eq(
        "camera_id",
        filters.cameraId
      );
    }

    // Date/time filters
    if (filters.from) {
      query = query.gte(
        "detected_at",
        filters.from
      );
    }

    if (filters.to) {
      query = query.lte(
        "detected_at",
        filters.to
      );
    }

    const { data, error } = await query.order(
      "detected_at",
      {
        ascending: true,
      }
    );

    if (error) {
      console.error(
        "SUPABASE DETECTION ERROR:",
        error
      );

      throw error;
    }

    return (data ?? []).map(mapDetection);
  },

  async get(id: string) {
    const { data, error } = await supabase
      .from("detections")
      .select(
        "id, camera_id, vehicle_id, plate_number, detected_at"
      )
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error(
        "SUPABASE DETECTION ERROR:",
        error
      );

      throw error;
    }

    return data
      ? mapDetection(data)
      : undefined;
  },

  async forCamera(
    cameraId: string,
    limit = 12
  ) {
    const { data, error } =
      await supabase
        .from("detections")
        .select(
          "id, camera_id, vehicle_id, plate_number, detected_at"
        )
        .eq("camera_id", cameraId)
        .order("detected_at", {
          ascending: false,
        })
        .limit(limit);

    if (error) {
      console.error(
        "SUPABASE CAMERA DETECTION ERROR:",
        error
      );

      throw error;
    }

    return (data ?? []).map(mapDetection);
  },
};