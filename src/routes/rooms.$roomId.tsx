import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, CalendarCheck, Lamp, PanelTop, Plug, Wifi } from "lucide-react";
import { useState } from "react";
import { FloorPlan } from "@/components/FloorPlan";
import { ReservationDialog } from "@/components/ReservationDialog";
import { SampleBadge, StatusLegend, StatusPill } from "@/components/StatusLegend";
import { Button } from "@/components/ui/button";
import { getRoom, ROOM_KIND_LABEL } from "@/data/sample-data";
import { computeStats } from "@/lib/booking";
import { useRoomSeats, useSeatStore } from "@/lib/seat-store";
import type { SeatFeature } from "@/lib/types";

const FEATURE: Record<SeatFeature, { label: string; icon: typeof Plug }> = {
  window: { label: "Window seat", icon: PanelTop },
  power: { label: "Power socket", icon: Plug },
  lamp: { label: "Desk lamp", icon: Lamp },
};

export const Route = createFileRoute("/rooms/$roomId")({
  loader: ({ params }) => {
    const room = getRoom(params.roomId);
    if (!room) throw notFound();
    return { room };
  },
  head: ({ loaderData }) => {
    const title = loaderData ? `${loaderData.room.name}, ${loaderData.room.building} — Seat map | StudySpot` : "Room not found | StudySpot";
    const description = loaderData
      ? `Pick and reserve a study seat in ${loaderData.room.name} at ${loaderData.room.building}.`
      : "This study room could not be found.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
        ...(loaderData ? [] : [{ name: "robots", content: "noindex" }]),
      ],
    };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-3xl font-semibold">Room not found</h1>
      <Button variant="hero" className="mt-6" asChild><Link to="/dashboard">See all study rooms</Link></Button>
    </div>
  ),
  component: RoomPage,
});

function RoomPage() {
  const { room } = Route.useLoaderData();
  const seats = useRoomSeats(room.id);
  const { state } = useSeatStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const stats = computeStats(seats);
  const selected = (selectedId ? state.seats[selectedId] : null) ?? null;
  const canReserve = selected?.status === "available";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> All study rooms
      </Link>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-primary">{room.building} · {room.floor} · {ROOM_KIND_LABEL[room.kind]}</p>
          <h1 className="mt-1 text-4xl font-semibold sm:text-5xl">{room.name}</h1>
          <p className="mt-2 max-w-xl text-muted-foreground">{room.description}</p>
        </div>
        <div className="flex items-center gap-3">
          <SampleBadge />
          <span className="rounded-full bg-seat-available-soft px-3 py-1 text-sm font-bold text-seat-available-ink">{stats.available} free of {stats.total}</span>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
        <section className="min-w-0 rounded-3xl border border-border bg-card p-4 shadow-card sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">Floor plan</h2>
            <StatusLegend />
          </div>
          <FloorPlan room={room} seats={seats} selectedId={selectedId} onSelect={(s) => setSelectedId(s.id)} />
          <p className="mt-3 text-center text-sm text-muted-foreground">Tap a green seat to select it.</p>
        </section>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
            {selected ? (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-muted-foreground">Selected seat</p>
                  <StatusPill status={selected.status} />
                </div>
                <p className="mt-2 font-mono text-5xl font-bold text-primary">{selected.label}</p>
                <ul className="mt-4 space-y-2 text-sm">
                  {selected.features.map((f) => {
                    const Icon = FEATURE[f].icon;
                    return <li key={f} className="flex items-center gap-2 text-foreground"><Icon className="h-4 w-4 text-primary" /> {FEATURE[f].label}</li>;
                  })}
                  <li className="flex items-center gap-2"><Wifi className="h-4 w-4 text-primary" /> Campus Wi-Fi</li>
                </ul>
                <Button variant="hero" size="xl" className="mt-6 w-full" disabled={!canReserve} onClick={() => setOpen(true)}>
                  <CalendarCheck /> {canReserve ? "Reserve this seat" : "Seat taken"}
                </Button>
                {!canReserve && (
                  <Button variant="link" className="mt-1 w-full" asChild>
                    <Link to="/reservations">View my reservations</Link>
                  </Button>
                )}
              </>
            ) : (
              <div className="py-6 text-center">
                <p className="font-display text-xl font-semibold">No seat selected</p>
                <p className="mt-1 text-sm text-muted-foreground">Choose a green seat on the map to reserve it.</p>
              </div>
            )}
          </div>
          <div className="rounded-3xl border border-border bg-secondary/60 p-6 text-sm">
            <p className="font-semibold">Opening hours</p>
            <p className="text-muted-foreground">{room.hours}</p>
            <p className="mt-3 font-semibold">Amenities</p>
            <p className="text-muted-foreground">{room.amenities.join(" · ")}</p>
          </div>
        </aside>
      </div>

      <ReservationDialog open={open} onOpenChange={setOpen} room={room} seat={selected} />
    </div>
  );
}
