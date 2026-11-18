import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Clock, Search } from "lucide-react";
import { useMemo } from "react";
import { SampleBadge, StatusLegend } from "@/components/StatusLegend";
import { SeatStrip } from "@/components/SeatStrip";
import { Button } from "@/components/ui/button";
import { ROOM_KIND_LABEL, SAMPLE_ROOMS } from "@/data/sample-data";
import { computeStats } from "@/lib/booking";
import { useSeatStore } from "@/lib/seat-store";
import { cn } from "@/lib/utils";
import type { RoomKind } from "@/lib/types";

type Filter = "all" | "free" | RoomKind;
const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All rooms" },
  { id: "free", label: "Has free seats" },
  { id: "quiet", label: "Quiet" },
  { id: "silent", label: "Silent" },
  { id: "group", label: "Group work" },
  { id: "lounge", label: "Lounge" },
];

export const Route = createFileRoute("/dashboard")({
  validateSearch: (search: Record<string, unknown>): { q?: string | undefined; filter?: Filter | undefined } => ({
    q: typeof search["q"] === "string" && search["q"] ? search["q"] : undefined,
    filter: FILTERS.some((f) => f.id === search["filter"]) ? (search["filter"] as Filter) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Study rooms — StudySpot student dashboard" },
      { name: "description", content: "Overview of campus study rooms with free, occupied and unavailable seat counts." },
      { property: "og:title", content: "Study rooms — StudySpot student dashboard" },
      { property: "og:description", content: "Overview of campus study rooms with free, occupied and unavailable seat counts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { q = "", filter = "all" } = Route.useSearch();
  const navigate = useNavigate({ from: "/dashboard" });
  const { state } = useSeatStore();
  const seats = Object.values(state.seats);
  const overall = computeStats(seats);

  const rooms = useMemo(() => {
    const term = q.toLowerCase();
    return SAMPLE_ROOMS.map((room) => {
      const rs = seats.filter((s) => s.roomId === room.id);
      return { room, rs, stats: computeStats(rs) };
    }).filter(({ room, stats }) => {
      const matches = !term || `${room.name} ${room.building} ${room.floor}`.toLowerCase().includes(term);
      const passes = filter === "all" ? true : filter === "free" ? stats.available > 0 : room.kind === filter;
      return matches && passes;
    });
  }, [seats, q, filter]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-4xl font-semibold">Study rooms</h1>
        <SampleBadge />
      </div>
      <p className="mt-2 text-muted-foreground">Pick a room to see its seat map and reserve a seat.</p>

      <div className="mt-8 grid gap-3 sm:grid-cols-4">
        {[
          { label: "Free seats", value: overall.available, cls: "text-seat-available-ink" },
          { label: "Occupied", value: overall.occupied, cls: "text-seat-occupied-ink" },
          { label: "Unavailable", value: overall.unavailable, cls: "text-seat-unavailable-ink" },
          { label: "Campus occupancy", value: `${overall.occupancyRate}%`, cls: "text-primary" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <p className="text-sm font-medium text-muted-foreground">{s.label}</p>
            <p className={cn("mt-1 font-display text-3xl font-semibold", s.cls)}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex h-11 items-center gap-2 rounded-full border border-input bg-card px-4 lg:w-80">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            aria-label="Search rooms"
            value={q}
            onChange={(e) => navigate({ search: (prev) => ({ ...prev, q: e.target.value || undefined }), replace: true })}
            placeholder="Search rooms or buildings"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => navigate({ search: (prev) => ({ ...prev, filter: f.id === "all" ? undefined : f.id }), replace: true })}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors",
                filter === f.id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <StatusLegend className="mt-6" />

      {rooms.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
          No rooms match “{q}”. Try another building name.
        </div>
      ) : (
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {rooms.map(({ room, rs, stats }) => (
            <article key={room.id} className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-primary">{room.building} · {room.floor}</p>
                  <h2 className="mt-1 text-2xl font-semibold">{room.name}</h2>
                </div>
                <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
                  {ROOM_KIND_LABEL[room.kind]}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{room.description}</p>

              <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-seat-available-soft py-2"><p className="text-xl font-bold text-seat-available-ink">{stats.available}</p><p className="text-[11px] font-semibold text-seat-available-ink">Free</p></div>
                <div className="rounded-xl bg-seat-occupied-soft py-2"><p className="text-xl font-bold text-seat-occupied-ink">{stats.occupied}</p><p className="text-[11px] font-semibold text-seat-occupied-ink">Occupied</p></div>
                <div className="rounded-xl bg-seat-unavailable-soft py-2"><p className="text-xl font-bold text-seat-unavailable-ink">{stats.unavailable}</p><p className="text-[11px] font-semibold text-seat-unavailable-ink">Unavailable</p></div>
              </div>
              <div className="mt-4"><SeatStrip seats={rs} /></div>

              <div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-4">
                <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground"><Clock className="h-4 w-4" /> {room.hours}</span>
                <Button variant={stats.available ? "hero" : "outline"} size="sm" className="rounded-full px-4" asChild>
                  <Link to="/rooms/$roomId" params={{ roomId: room.id }}>
                    {stats.available ? "Choose a seat" : "View map"} <ArrowRight />
                  </Link>
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
