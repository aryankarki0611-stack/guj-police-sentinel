import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  buttonLabel?: string;
  suggestions?: string[];
  onSuggestion?: (value: string) => void;
}

export function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = "Search...",
  buttonLabel = "Search",
  suggestions,
  onSuggestion,
}: SearchBarProps) {
  return (
    <div className="space-y-2">
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit?.();
        }}
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="h-10 bg-surface pl-9 font-mono text-sm"
            aria-label={placeholder}
          />
        </div>
        <Button type="submit" className="h-10 px-6">
          {buttonLabel}
        </Button>
      </form>
      {suggestions?.length ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="label-caps">Examples</span>
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onSuggestion?.(s)}
              className="rounded-sm border border-border bg-surface px-2 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
            >
              {s}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
