// GET /cameras, GET /cameras/{id}, GET /cameras/{id}/feed
import { cameras, detections, type Camera, type CameraStatus } from "@/data/mock";
import { respond } from "./api";

export interface CameraFilters {
  query?: string;
  department?: string;
  district?: string;
  status?: CameraStatus | "all";
  type?: string;
  vmsSource?: string;
}

export const cameraService = {
  async list(filters: CameraFilters = {}): Promise<Camera[]> {
    const q = (filters.query ?? "").trim().toLowerCase();
    const result = cameras.filter((c) => {
      if (q && !`${c.id} ${c.location} ${c.district}`.toLowerCase().includes(q)) return false;
      if (filters.department && filters.department !== "all" && c.department !== filters.department) return false;
      if (filters.district && filters.district !== "all" && c.district !== filters.district) return false;
      if (filters.status && filters.status !== "all" && c.status !== filters.status) return false;
      if (filters.type && filters.type !== "all" && c.type !== filters.type) return false;
      if (filters.vmsSource && filters.vmsSource !== "all" && c.vmsSource !== filters.vmsSource) return false;
      return true;
    });
    return respond(result);
  },

  async get(id: string): Promise<Camera | undefined> {
    return respond(cameras.find((c) => c.id === id));
  },

  /** GET /cameras/{id}/feed — simulated frame reference only. */
  async feed(id: string): Promise<{ cameraId: string; frameUrl: string; fps: number }> {
    return respond({ cameraId: id, frameUrl: `simulated://${id}/live`, fps: 25 });
  },

  async detectionsFor(id: string, limit = 12) {
    const rows = detections.filter((d) => d.cameraId === id).slice(-limit).reverse();
    return respond(rows);
  },

  async stats() {
    const online = cameras.filter((c) => c.status !== "offline").length;
    return respond({
      total: cameras.length,
      online,
      offline: cameras.length - online,
      alerting: cameras.filter((c) => c.status === "alert").length,
    });
  },
};
