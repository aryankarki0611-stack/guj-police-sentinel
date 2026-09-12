import { Link } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Video,
  Search,
  Car,
  Bell,
  FolderKanban,
  ShieldCheck,
  ScrollText,
  Activity,
  ShieldHalf,
  MapPinned,
  Network,
  Route as RouteIcon,
  FileText,
} from "lucide-react";
import { systemStatus } from "@/data/mock";
import { LiveClock } from "./LiveClock";

const NAV = [
  { to: "/", label: "Command Center", icon: LayoutDashboard, exact: true },
  { to: "/cameras", label: "Live Cameras", icon: Video },
  { to: "/camera-onboarding", label: "Camera Onboarding", icon: MapPinned },
  { to: "/integration", label: "Integration Center", icon: Network },
  { to: "/investigation", label: "Investigation", icon: Search },
  { to: "/vehicle-search", label: "Vehicle Search", icon: Car },
  { to: "/journey-validation", label: "Journey Validation", icon: RouteIcon },
  { to: "/watchlist", label: "Watchlist & Alerts", icon: Bell },
  { to: "/cases", label: "Cases", icon: FolderKanban },
  { to: "/evidence", label: "Evidence", icon: ShieldCheck },
  { to: "/evidence-reports", label: "Evidence Reports", icon: FileText },
  { to: "/audit", label: "Audit Trail", icon: ScrollText },
  { to: "/system", label: "System Status", icon: Activity },
] as const;

export function Sidebar() {
  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex items-center gap-2.5 border-b border-sidebar-border px-4 py-3.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-sm border border-primary/40 bg-primary/10">
          <ShieldHalf className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-base font-bold tracking-[0.18em] text-foreground">SENTINEL</p>
          <p className="truncate text-[10px] uppercase tracking-wide text-muted-foreground">
            Gujarat Police Hackathon 2026
          </p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        <p className="label-caps px-2 py-2">Operations</p>
        <ul className="space-y-0.5">
          {NAV.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                activeOptions={{ exact: "exact" in item ? item.exact : false }}
                className="flex items-center gap-2.5 rounded-sm px-2.5 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent data-[status=active]:border-l-2 data-[status=active]:border-primary data-[status=active]:bg-sidebar-accent data-[status=active]:font-semibold data-[status=active]:text-foreground"
              >
                <item.icon className="h-4 w-4 shrink-0" strokeWidth={1.8} />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="space-y-2 border-t border-sidebar-border px-4 py-3 text-xs">
        <div className="flex items-center justify-between">
          <span className="label-caps">System status</span>
          <span className="flex items-center gap-1.5 font-semibold text-ok">
            <span className="h-1.5 w-1.5 rounded-full bg-ok" />
            Operational
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="label-caps">Cameras online</span>
          <span className="font-mono text-foreground">
            {systemStatus.camerasOnline}/{systemStatus.camerasTotal}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="label-caps">Last updated</span>
          <LiveClock className="font-mono text-foreground" />
        </div>
      </div>
    </aside>
  );
}
