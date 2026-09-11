import { useEffect, useState } from "react";

/** Client-only ticking timestamp (avoids SSR hydration mismatch). */
export function LiveClock({ className, withDate = false }: { className?: string; withDate?: boolean }) {
  const [now, setNow] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const time = d.toTimeString().slice(0, 8);
      setNow(withDate ? `${d.toISOString().slice(0, 10)} ${time}` : time);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [withDate]);

  return <span className={className}>{now ?? "--:--:--"}</span>;
}
