// GET /audit-log, GET /audit-log/verify
import { auditEntries, AUDIT_CHAIN_TIP, type AuditEntry } from "@/data/mock";
import { respond } from "./api";

export interface ChainStatus {
  valid: boolean;
  verifiedThrough: number;
  brokenAt: number | null;
  checkedAt: string;
}

export const auditService = {
  async list(): Promise<AuditEntry[]> {
    return respond([...auditEntries].sort((a, b) => b.entry - a.entry));
  },
  async verifyChain(simulateBreak = false): Promise<ChainStatus> {
    return respond(
      {
        valid: !simulateBreak,
        verifiedThrough: simulateBreak ? AUDIT_CHAIN_TIP - 1 : AUDIT_CHAIN_TIP,
        brokenAt: simulateBreak ? AUDIT_CHAIN_TIP : null,
        checkedAt: new Date().toISOString().slice(0, 19).replace("T", " "),
      },
      700,
    );
  },
};
