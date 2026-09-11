// GET /system/status
import { systemStatus } from "@/data/mock";
import { respond } from "./api";

export const systemService = {
  async status() {
    return respond(systemStatus);
  },
};
