import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { AlertCard } from "@/components/AlertCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { alertService } from "@/services/alertService";
import { caseService } from "@/services/caseService";
import type { Alert, AlertState } from "@/data/mock";

export const Route = createFileRoute("/alerts")({
  head: () => ({
    meta: [
      { title: "Alerts — SENTINEL" },
      {
        name: "description",
        content: "Watchlist and movement alerts with an explainable rule chain, verification and dismissal workflow.",
      },
      { property: "og:title", content: "Alerts — SENTINEL" },
      { property: "og:description", content: "Explainable CCTV alerts for officer verification." },
    ],
  }),
  component: AlertsPage,
});

function AlertsPage() {
  const [tab, setTab] = useState<AlertState>("open");
  const [rows, setRows] = useState<Alert[]>([]);

  const load = async () => setRows(await alertService.list("all"));
  useEffect(() => {
    void load();
  }, []);

  const setState = async (alert: Alert, next: AlertState) => {
    await alertService.setState(alert.id, next);
    await load();
    toast.success(`${alert.id} ${next}`);
  };

  const counts = {
    open: rows.filter((a) => a.state === "open").length,
    verified: rows.filter((a) => a.state === "verified").length,
    dismissed: rows.filter((a) => a.state === "dismissed").length,
  };

  return (
    <AppShell>
      <PageHeader
        title="Alerts"
        description="Every alert lists the rule chain that produced it. Officer verification is required before action."
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as AlertState)}>
        <TabsList>
          <TabsTrigger value="open">Open ({counts.open})</TabsTrigger>
          <TabsTrigger value="verified">Verified ({counts.verified})</TabsTrigger>
          <TabsTrigger value="dismissed">Dismissed ({counts.dismissed})</TabsTrigger>
        </TabsList>
        {(["open", "verified", "dismissed"] as AlertState[]).map((state) => (
          <TabsContent key={state} value={state} className="mt-3 space-y-3">
            {rows
              .filter((a) => a.state === state)
              .map((a) => (
                <AlertCard
                  key={a.id}
                  alert={a}
                  onVerify={(al) => void setState(al, "verified")}
                  onDismiss={(al) => void setState(al, "dismissed")}
                  onCreateCase={async (al) => {
                    const created = await caseService.create({
                      title: `${al.type} — ${al.plate}`,
                      officer: "Demo Officer",
                      district: al.location,
                      plates: [al.plate],
                      detectionIds: al.detectionId ? [al.detectionId] : [],
                    });
                    toast.success(`${created.id} created from ${al.id}`);
                  }}
                />
              ))}
            {!rows.filter((a) => a.state === state).length ? (
              <p className="panel p-6 text-sm text-muted-foreground">No {state} alerts.</p>
            ) : null}
          </TabsContent>
        ))}
      </Tabs>
    </AppShell>
  );
}
