// POST /evidence, GET /evidence/{id}, POST /evidence/{id}/verify-integrity, GET /evidence/{id}/report
import { evidence, type EvidenceItem } from "@/data/mock";
import { respond } from "./api";

export interface IntegrityResult {
  evidenceId: string;
  verified: boolean;
  storedHash: string;
  computedHash: string;
  algorithm: "SHA-256";
  checkedAt: string;
}

let state: EvidenceItem[] = evidence.map((e) => ({ ...e }));

export const evidenceService = {
  async list(caseId?: string): Promise<EvidenceItem[]> {
    const rows = caseId ? state.filter((e) => e.caseId === caseId) : state;
    return respond([...rows].sort((a, b) => b.captureTime.localeCompare(a.captureTime)));
  },
  async get(id: string) {
    return respond(state.find((e) => e.id === id));
  },
  /**
   * Recomputes the hash of the stored file and compares it with the hash
   * recorded at preservation time. This supports chain-of-custody review; it
   * does not by itself determine legal admissibility.
   */
  async verifyIntegrity(id: string): Promise<IntegrityResult | undefined> {
    const item = state.find((e) => e.id === id);
    if (!item) return respond(undefined, 300);
    const computed = item.tampered
      ? item.sha256.slice(0, 40) + "4d19c07a1f2b8e6335ab77c2"
      : item.sha256;
    return respond(
      {
        evidenceId: id,
        verified: !item.tampered,
        storedHash: item.sha256,
        computedHash: computed,
        algorithm: "SHA-256" as const,
        checkedAt: new Date().toISOString().slice(0, 19).replace("T", " "),
      },
      600,
    );
  },
  async report(id: string) {
    return respond({ evidenceId: id, format: "PDF", status: "queued", pages: 3 }, 400);
  },
};
