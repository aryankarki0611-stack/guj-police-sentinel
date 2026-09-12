import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface FilterDef {
  key: string;
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

export function FilterBar({ filters, children }: { filters: FilterDef[]; children?: React.ReactNode }) {
  return (
    <div className="panel flex flex-wrap items-end gap-3 p-3">
      {filters.map((f) => (
        <div key={f.key} className="min-w-[9.5rem] flex-1">
          <label className="label-caps mb-1 block">{f.label}</label>
          <Select value={f.value} onValueChange={f.onChange}>
            <SelectTrigger className="h-9 w-full bg-surface-raised text-sm">
              <SelectValue placeholder={f.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {f.options.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}
      {children}
    </div>
  );
}
