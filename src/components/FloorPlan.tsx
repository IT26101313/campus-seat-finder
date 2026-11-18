import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { STATUS_META } from "@/lib/status";
import type { Room, Seat } from "@/lib/types";

interface FloorPlanProps {
  room: Room;
  seats: Seat[];
  selectedId: string | null;
  onSelect: (seat: Seat) => void;
  /** Students can only pick available seats; admins can pick any seat. */
  mode?: "student" | "admin";
}

export function FloorPlan({ room, seats, selectedId, onSelect, mode = "student" }: FloorPlanProps) {
  const byPos = useMemo(() => {
    const m = new Map<string, Seat>();
    for (const s of seats) m.set(`${s.row}-${s.col}`, s);
    return m;
  }, [seats]);
  const width = Math.max(...room.layout.map((l) => l.length));

  return (
    <div className="min-w-0 rounded-2xl border-2 border-navy/15 bg-blueprint p-3 sm:p-5">
      <div className="mb-3 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        <span className="whitespace-nowrap">▲ Windows</span>
        <span className="truncate pl-3 font-mono normal-case tracking-normal">{room.building} · {room.floor}</span>
      </div>
      <div className="overflow-x-auto pb-1">
        <div
          className="mx-auto grid w-max gap-1.5 sm:gap-2"
          style={{ gridTemplateColumns: `repeat(${width}, minmax(1.75rem, 2.4rem))` }}
          role="grid"
          aria-label={`Seat map for ${room.name}`}
        >
          {room.layout.flatMap((line, row) =>
            Array.from({ length: width }).map((_, col) => {
              const ch = line[col] ?? " ";
              const key = `${row}-${col}`;
              if (ch === "T") {
                return <div key={key} className="h-4 self-center rounded-sm bg-table sm:h-5" aria-hidden />;
              }
              const seat = byPos.get(key);
              if (!seat) return <div key={key} className="h-8 sm:h-9" aria-hidden />;
              const selectable = mode === "admin" || seat.status === "available";
              const selected = seat.id === selectedId;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => selectable && onSelect(seat)}
                  disabled={!selectable}
                  aria-pressed={selected}
                  aria-label={`Seat ${seat.label}, ${STATUS_META[seat.status].label}`}
                  title={`Seat ${seat.label} — ${STATUS_META[seat.status].label}`}
                  className={cn(
                    "flex h-8 items-center justify-center rounded-lg font-mono text-[10px] font-semibold transition-all sm:h-9 sm:text-[11px]",
                    STATUS_META[seat.status].seat,
                    selectable ? "cursor-pointer" : "cursor-not-allowed opacity-90",
                    selected && "animate-seat-pop scale-110 ring-[3px] ring-primary ring-offset-2 ring-offset-card",
                  )}
                >
                  {seat.label}
                </button>
              );
            }),
          )}
        </div>
      </div>
      <div className="mt-4 flex justify-center">
        <span className="rounded-t-md border-x-2 border-t-2 border-navy/25 px-6 pt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Entrance
        </span>
      </div>
    </div>
  );
}
