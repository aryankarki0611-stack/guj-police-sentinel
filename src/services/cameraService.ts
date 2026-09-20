import { supabase } from "@/lib/supabase";
import type { Camera, CameraStatus } from "@/data/mock";
import { respond } from "./api";

export interface CameraFilters {
  query?: string;
  department?: string;
  district?: string;
  status?: CameraStatus | "all";
  type?: string;
  vmsSource?: string;
}
function mapCamera(row: any): Camera {
  return {
    id: row.camera_code ?? "",
    location: row.location ?? "",
    district: row.district ?? row.location ?? "",
    department: row.department ?? "",
    vmsSource: row.protocol ?? "",
    type: row.camera_type ?? "",
    status: row.status as CameraStatus,

    coords: {
      lat: Number(row.latitude ?? 0),
      lng: Number(row.longitude ?? 0),
    },

    lastDetection: row.last_detection ?? null,
    installedOn: row.installed_on ?? "",
  };
}
export const cameraService = {
  async list(filters: CameraFilters = {}): Promise<Camera[]> {
    let query = supabase
      .from("cameras")
      .select("*")
      .order("created_at", { ascending: false });

    if (filters.department && filters.department !== "all") {
      query = query.eq("department", filters.department);
    }

    if (filters.status && filters.status !== "all") {
      query = query.eq("status", filters.status);
    }

    if (filters.type && filters.type !== "all") {
      query = query.eq("camera_type", filters.type);
    }

    if (filters.vmsSource && filters.vmsSource !== "all") {
      query = query.eq("protocol", filters.vmsSource);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Camera fetch error:", error);
      throw error;
    }

    let result = (data ?? []).map(mapCamera);

    const q = (filters.query ?? "").trim().toLowerCase();

    if (q) {
      result = result.filter((c) =>
        `${c.id} ${c.location} ${c.district}`
          .toLowerCase()
          .includes(q)
      );
    }

    return respond(result);
  },

  async get(id: string): Promise<Camera | undefined> {
    const { data, error } = await supabase
      .from("cameras")
      .select("*")
      .eq("camera_code", id)
      .maybeSingle();

    if (error) {
      console.error("Camera fetch error:", error);
      throw error;
    }

    return respond(data ? mapCamera(data) : undefined);
  },

  async feed(id: string) {
  const response = await fetch(
    `http://127.0.0.1:8000/api/camera-status`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch camera status");
  }

  const data = await response.json();
  const camera = data.cameras?.[id];

  return respond({
    cameraId: id,
    frameUrl: camera?.stream_url ?? "",
    fps: 25,
    status: camera?.status ?? "offline",
    frames: camera?.frames ?? 0,
    detections: camera?.detections ?? 0,
  });
},

  async detectionsFor(id: string, limit = 12) {
    const { data, error } = await supabase
      .from("detections")
      .select("*")
      .eq("camera_id", id)
      .order("detected_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Detection fetch error:", error);
      throw error;
    }

    return respond(data ?? []);
  },

  async stats() {
    const { data, error } = await supabase
      .from("cameras")
      .select("status");

    if (error) {
      console.error("Camera stats error:", error);
      throw error;
    }

    const rows = data ?? [];

    const online = rows.filter(
      (c) => c.status !== "offline"
    ).length;

    return respond({
      total: rows.length,
      online,
      offline: rows.length - online,
      alerting: rows.filter(
        (c) => c.status === "alert"
      ).length,
    });
  },
};