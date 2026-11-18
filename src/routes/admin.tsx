import { createFileRoute } from "@tanstack/react-router";
import { RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { FloorPlan } from "@/components/FloorPlan";
import { SampleBadge, StatusLegend, StatusPill } from "@/components/StatusLegend";
import { Button } from "@/components/ui/button";
import { getRoom, SAMPLE_ROOMS } from "@/data/sample-data";
import { computeStats } from "@/lib/booking";
import { useSeatStore } from "@/lib/seat-store";
import { STATUS_META, STATUS_ORDER } from "@/lib/status";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin dashboard — StudySpot occupancy" },
      { name: "description", content: "Track occupancy across campus study rooms and manage seat status." },
      { property: "og:title", content: "Admin dashboard — StudySpot occupancy" },
      { property: "og:description", content: "Track occupancy across campus study rooms and manage seat status." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Admin,
});

function Admin() {
  const { state, setStatus, reset } = useSeatStore();
  const [roomId, setRoomId] = useState(SAMPLE_ROOMS[0]!.id);
  const [seatId, setSeatId] = useState<string | null>(null);
  const seats = Object.values(state.seats);
  const overall = computeStats(seats);
  const room = getRoom(roomId)!;

  const perRoom = useMemo(
    () => SAMPLE_ROOMS.map((r) => ({ room: r, stats: computeStats(seats.filter((s) => s.roomId === r.id)) })),
    [seats],
  );
  const roomSeats = seats.filter((s) => s.roomId === roomId);
  const seat = seatId ? state.seats[seatId] : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-4xl font-semibold">Admin dashboard</h1>
            <SampleBadge />
          </div>
          <p className="mt-2 text-muted-foreground">Occupancy across all study rooms.</p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            reset();
            setSeatId(null);
            toast("Sample data restored");
          }}
        >
          <RotateCcw /> Reset sample data
        </Button>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Total seats", value: overall.total, cls: "text-foreground" },
          { label: "Available", value: overall.available, cls: "text-seat-available-ink" },
          { label: "Occupied", value: overall.occupied, cls: "text-seat-occupied-ink" },
          { label: "Unavailable", value: overall.unavailable, cls: "text-seat-unavailable-ink" },
          { label: "Occupancy", value: `${overall.occupancyRate}%`, cls: "text-primary" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <p className="text-sm font-medium text-muted-foreground">{s.label}</p>
            <p className={cn("mt-1 font-display text-3xl font-semibold", s.cls)}>{s.value}</p>
          </div>
        ))}
      </div>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold">Occupancy by room</h2>
          <StatusLegend />
        </div>
        <ul className="mt-5 space-y-4">
          {perRoom.map(({ room: r, stats }) => (
            <li key={r.id} className="grid gap-2 sm:grid-cols-[220px_1fr_60px] sm:items-center">
              <div>
                <p className="font-semibold">{r.name}</p>
                <p className="text-xs text-muted-foreground">{r.building}</p>
              </div>
              <div className="flex h-4 overflow-hidden rounded-full bg-muted" role="img" aria-label={`${stats.available} available, ${stats.occupied} occupied, ${stats.unavailable} unavailable`}>
                {STATUS_ORDER.map((st) => (
                  <div key={st} className={STATUS_META[st].dot} style={{ width: `${(stats[st] / stats.total) * 100}%` }} />
                ))}
              </div>
              <p className="font-mono text-sm font-bold sm:text-right">{stats.occupancyRate}%</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 rounded-3xl border border-border bg-card p-4 shadow-card sm:p-6">
          <h2 className="text-2xl font-semibold">Seat status</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {SAMPLE_ROOMS.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => { setRoomId(r.id); setSeatId(null); }}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors",
                  r.id === roomId ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {r.name}
              </button>
            ))}
          </div>
          <div className="mt-5">
            <FloorPlan room={room} seats={roomSeats} selectedId={seatId} onSelect={(s) => setSeatId(s.id)} mode="admin" />
          </div>
        </div>

        <aside className="rounded-3xl border border-border bg-card p-6 shadow-card lg:self-start">
          {seat ? (
            <>
              <p className="text-sm font-semibold text-muted-foreground">{room.name}</p>
              <div className="mt-1 flex items-center justify-between">
                <p className="font-mono text-4xl font-bold text-primary">{seat.label}</p>
                <StatusPill status={seat.status} />
              </div>
              <p className="mt-4 text-sm font-semibold">Set status</p>
              <div className="mt-2 grid gap-2">
                {STATUS_ORDER.map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatus(seat.id, st)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors",
                      seat.status === st ? "border-primary bg-accent" : "border-border hover:bg-secondary",
                    )}
                  >
                    <span className={cn("h-3.5 w-3.5 rounded", STATUS_META[st].dot)} /> {STATUS_META[st].label}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">Click any seat to change its status — e.g. mark it unavailable for maintenance.</p>
          )}
        </aside>
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-card">
        <h2 className="text-2xl font-semibold">Reservations</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="py-2 pr-3">Code</th><th className="py-2 pr-3">Student</th><th className="py-2 pr-3">Room</th><th className="py-2 pr-3">Seat</th><th className="py-2 pr-3">When</th><th className="py-2">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {state.reservations.map((r) => (
                <tr key={r.id}>
                  <td className="py-2.5 pr-3 font-mono font-bold text-primary">{r.id}</td>
                  <td className="py-2.5 pr-3">{r.studentName}<span className="block text-xs text-muted-foreground">{r.studentId}</span></td>
                  <td className="py-2.5 pr-3">{getRoom(r.roomId)?.name}</td>
                  <td className="py-2.5 pr-3 font-mono">{r.seatLabel}</td>
                  <td className="py-2.5 pr-3 whitespace-nowrap">{r.date} · {r.startTime} · {r.durationHours} h</td>
                  <td className="py-2.5">{r.sample ? <SampleBadge /> : <span className="text-xs font-semibold text-seat-available-ink">Student booking</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
