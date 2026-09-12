import { createFileRoute } from "@tanstack/react-router";
import { Activity, Database, Server, Radio, Cpu, HardDrive } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { systemStatus } from "@/data/mock";

export const Route = createFileRoute("/system")({
  head: () => ({
    meta: [
      { title: "System Status — SENTINEL" },
      {
        name: "description",
        content: "Camera infrastructure health, connected departments, VMS sources and platform service status.",
      },
      { property: "og:title", content: "System Status — SENTINEL" },
      { property: "og:description", content: "Technical monitoring view for the SENTINEL platform." },
    ],
  }),
  component: SystemPage,
});

const icons = [Cpu, Database, Server, Radio, HardDrive, Activity];

function SystemPage() {
  return (
    <AppShell>
      <PageHeader title="System Status" description="Demonstration monitoring view. All values are simulated." />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Camera infrastructure"
          value={`${systemStatus.camerasOnline}/${systemStatus.camerasTotal}`}
          hint="Cameras online"
          icon={Activity}
          tone="ok"
        />
        <StatCard label="Departments connected" value={systemStatus.departmentsConnected} icon={Server} />
        <StatCard label="VMS sources" value={systemStatus.vmsSources} icon={HardDrive} />
        <StatCard label="AI processing" value="Operational" icon={Cpu} tone="ok" />
      </div>

      <section>
        <p className="label-caps mb-2">Platform services</p>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {systemStatus.services.map((s, i) => {
            const Icon = icons[i % icons.length]!;
            return (
              <div key={s.name} className="panel flex items-start justify-between gap-3 p-3">
                <div>
                  <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Icon className="h-4 w-4 text-primary" /> {s.name}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{s.detail}</p>
                </div>
                <StatusBadge tone="ok" dot>
                  {s.state}
                </StatusBadge>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <p className="label-caps mb-2">Department integrations</p>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {systemStatus.departments.map((d) => (
            <div key={d.name} className="panel p-3">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-foreground">{d.name}</p>
                <StatusBadge tone={d.status === "Connected" ? "ok" : "warn"} dot>
                  {d.status}
                </StatusBadge>
              </div>
              <dl className="mt-3 grid grid-cols-3 gap-2 text-xs">
                <div>
                  <dt className="label-caps">Cameras</dt>
                  <dd className="font-mono text-foreground">{d.cameras}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="label-caps">VMS</dt>
                  <dd className="truncate text-foreground">{d.vms}</dd>
                </div>
                <div className="col-span-3">
                  <dt className="label-caps">Last sync</dt>
                  <dd className="text-foreground">{d.sync}</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
