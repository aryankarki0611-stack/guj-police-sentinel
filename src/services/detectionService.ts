// GET /detections
import { detections, type Detection } from "@/data/mock";
import { respond } from "./api";

export interface DetectionFilters {
  plate?: string;
  vehicleType?: string;
  color?: string;
  cameraId?: string;
  location?: string;
  from?: string;
  to?: string;
  minConfidence?: number;
}

export function filterDetections(filters: DetectionFilters): Detection[] {
  return detections.filter((d) => {
    if (filters.plate && !d.plate.toLowerCase().includes(filters.plate.trim().toLowerCase())) return false;
    if (filters.vehicleType && filters.vehicleType !== "all" && d.vehicleType !== filters.vehicleType) return false;
    if (filters.color && filters.color !== "all" && d.color !== filters.color) return false;
    if (filters.cameraId && filters.cameraId !== "all" && d.cameraId !== filters.cameraId) return false;
    if (filters.location && filters.location !== "all" && d.location !== filters.location) return false;
    if (filters.from && d.timestamp < filters.from) return false;
    if (filters.to && d.timestamp > filters.to) return false;
    if (filters.minConfidence && d.confidence < filters.minConfidence) return false;
    return true;
  });
}

export const detectionService = {
  async list(filters: DetectionFilters = {}): Promise<Detection[]> {
    return respond(filterDetections(filters));
  },
  async get(id: string) {
    return respond(detections.find((d) => d.id === id));
  },
  async byIds(ids: string[]) {
    return respond(detections.filter((d) => ids.includes(d.id)));
  },
};
