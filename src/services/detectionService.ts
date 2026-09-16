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
  latitude?: number;
  longitude?: number;
  imageUrl?: string;
  snapshotUrl?: string;
  vehicleId?: string;
  vehicleNumber?: string;
}

function mapDetection(row: any): Detection {
  const detection: Detection = {
    id: row.id ?? "",
    cameraId: row.camera_id ?? "",
    plate: row.plate_number ?? row.vehicle_number ?? "",
    timestamp: row.detected_at ?? "",
    location:
      row.latitude != null && row.longitude != null
        ? `${row.latitude}, ${row.longitude}`
        : "",
    confidence: Number(row.confidence ?? 0),
    vehicleType: row.vehicle_type ?? "Unknown",
    color: "Unknown",
    direction: "Unknown",
    frameRef: row.image_url ?? row.snapshot_url ?? "",
  };

  // Only add optional properties when they actually exist.
  if (row.latitude != null) {
    detection.latitude = Number(row.latitude);
  }

  if (row.longitude != null) {
    detection.longitude = Number(row.longitude);
  }

  if (row.image_url) {
    detection.imageUrl = row.image_url;
  }

  if (row.snapshot_url) {
    detection.snapshotUrl = row.snapshot_url;
  }

  if (row.vehicle_id) {
    detection.vehicleId = row.vehicle_id;
  }

  if (row.vehicle_number) {
    detection.vehicleNumber = row.vehicle_number;
  }

  return detection;
}

const detectionSelect = `
  id,
  camera_id,
  vehicle_id,
  plate_number,
  detected_at,
  confidence,
  vehicle_type,
  snapshot_url,
  created_at,
  vehicle_number,
  latitude,
  longitude,
  image_url
`;

export const detectionService = {
  async list(filters: DetectionFilters = {}) {
    let query = supabase
      .from("detections")
      .select(detectionSelect);

    if (filters.plate?.trim()) {
      const plate = filters.plate
        .trim()
        .toUpperCase()
        .replace(/\s+/g, "");

      query = query.or(
        `plate_number.eq.${plate},vehicle_number.eq.${plate}`
      );
    }

    if (filters.cameraId) {
      query = query.eq("camera_id", filters.cameraId);
    }

    if (filters.from) {
      query = query.gte("detected_at", filters.from);
    }

    if (filters.to) {
      query = query.lte("detected_at", filters.to);
    }

    const { data, error } = await query.order(
      "detected_at",
      {
        ascending: false,
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
      .select(detectionSelect)
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
        .select(detectionSelect)
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