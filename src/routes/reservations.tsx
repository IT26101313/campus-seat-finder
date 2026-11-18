import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarX, Clock, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getRoom } from "@/data/sample-data";
import { useSeatStore } from "@/lib/seat-store";

export const Route = createFileRoute("/reservations")({
  head: () => ({
    meta: [
      { title: "My reservations — StudySpot" },
      { name: "description", content: "See and cancel the study seats you've reserved on campus." },
      { property: "og:title", content: "My reservations — StudySpot" },
      { property: "og:description", content: "See and cancel the study seats you've reserved on campus." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Reservations,
});

function Reservations() {
  const { state, hydrated, cancel } = useSeatStore();
  const mine = state.reservations.filter((r) => !r.sample);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-4xl font-semibold">My reservations</h1>
      <p className="mt-2 text-muted-foreground">Bookings made on this device.</p>

      {!hydrated ? (
        <div className="mt-8 h-32 animate-pulse rounded-2xl bg-muted" />
      ) : mine.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-border bg-card p-12 text-center">
          <p className="font-display text-2xl font-semibold">No reservations yet</p>
          <p className="mt-1 text-muted-foreground">Find a free seat and book it in a few taps.</p>
          <Button variant="hero" size="xl" className="mt-6" asChild>
            <Link to="/dashboard">Find a study seat</Link>
          </Button>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {mine.map((r) => {
            const room = getRoom(r.roomId);
            return (
              <li key={r.id} className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-card sm:flex-row sm:items-center">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-primary font-mono text-xl font-bold text-primary-foreground">
                  {r.seatLabel}
                </div>
                <div className="flex-1">
                  <p className="font-display text-xl font-semibold">{room?.name}</p>
                  <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" />{room?.building}, {room?.floor}</span>
                    <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" />{r.date} · {r.startTime} · {r.durationHours} h</span>
                  </p>
                  <p className="mt-1 text-sm">Code <span className="font-mono font-bold text-primary">{r.id}</span> · {r.studentName}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="soft" size="sm" asChild>
                    <Link to="/rooms/$roomId" params={{ roomId: r.roomId }}>Seat map</Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      cancel(r.id);
                      toast(`Reservation ${r.id} cancelled`, { description: `Seat ${r.seatLabel} is available again.` });
                    }}
                  >
                    <CalendarX /> Cancel
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
