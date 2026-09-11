// GET /alerts, POST /alerts/{id}/verify, POST /alerts/{id}/dismiss
import { alerts, type Alert, type AlertState } from "@/data/mock";
import { respond } from "./api";

let state: Alert[] = alerts.map((a) => ({ ...a }));

export const alertService = {
  async list(filter: AlertState | "all" = "all"): Promise<Alert[]> {
    const rows = filter === "all" ? state : state.filter((a) => a.state === filter);
    return respond([...rows].sort((a, b) => b.timestamp.localeCompare(a.timestamp)));
  },
  async get(id: string) {
    return respond(state.find((a) => a.id === id));
  },
  async setState(id: string, next: AlertState) {
    state = state.map((a) => (a.id === id ? { ...a, state: next } : a));
    return respond(state.find((a) => a.id === id), 60);
  },
  async counts() {
    return respond({
      open: state.filter((a) => a.state === "open").length,
      verified: state.filter((a) => a.state === "verified").length,
      dismissed: state.filter((a) => a.state === "dismissed").length,
    });
  },
};
