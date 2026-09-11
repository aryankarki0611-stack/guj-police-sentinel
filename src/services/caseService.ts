// GET /cases, POST /cases, GET /cases/{id}/timeline
import { cases, detections, type CaseRecord } from "@/data/mock";
import { respond } from "./api";

let state: CaseRecord[] = cases.map((c) => ({ ...c }));

export const caseService = {
  async list(): Promise<CaseRecord[]> {
    return respond([...state].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  },
  async get(id: string) {
    return respond(state.find((c) => c.id === id));
  },
  async timeline(id: string) {
    const record = state.find((c) => c.id === id);
    const rows = record ? detections.filter((d) => record.detectionIds.includes(d.id)) : [];
    return respond([...rows].sort((a, b) => a.timestamp.localeCompare(b.timestamp)));
  },
  async create(input: { title: string; officer: string; district: string; plates: string[]; detectionIds: string[] }) {
    const next: CaseRecord = {
      id: `CASE-2026-0${143 + state.length}`,
      title: input.title,
      officer: input.officer,
      createdAt: new Date().toISOString().slice(0, 19).replace("T", " "),
      status: "Open",
      district: input.district,
      summary: `Case opened from the investigation workspace covering ${input.detectionIds.length} detection(s).`,
      plates: input.plates,
      detectionIds: input.detectionIds,
      evidenceIds: [],
      alertIds: [],
    };
    state = [next, ...state];
    return respond(next, 80);
  },
};
