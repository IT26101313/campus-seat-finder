import { cn } from "@/lib/utils";
import { STATUS_META } from "@/lib/status";
import type { Seat } from "@/lib/types";

/** Compact row of dots — one per seat — for quick visual availability. */
export function SeatStrip({ seats }: { seats: Seat[] }) {
  return (
    <div className="flex flex-wrap gap-1" aria-hidden>
      {seats.map((s) => (
        <span key={s.id} className={cn("h-2.5 w-2.5 rounded-[3px]", STATUS_META[s.status].dot)} />
      ))}
    </div>
  );
}
