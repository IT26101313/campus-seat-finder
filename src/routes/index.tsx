import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, CalendarCheck, Cpu, MapPin, Search, Armchair } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import heroImg from "@/assets/hero-library.jpg";
import { SampleBadge, StatusLegend } from "@/components/StatusLegend";
import { SeatStrip } from "@/components/SeatStrip";
import { Button } from "@/components/ui/button";
import { SAMPLE_ROOMS } from "@/data/sample-data";
import { computeStats } from "@/lib/booking";
import { useSeatStore } from "@/lib/seat-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "StudySpot — Find a free study seat on campus" },
      { name: "description", content: "Search campus study rooms, check which seats are free and reserve one before you arrive." },
      { property: "og:title", content: "StudySpot — Find a free study seat on campus" },
      { property: "og:description", content: "Search campus study rooms, check which seats are free and reserve one before you arrive." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const STEPS = [
  { icon: Search, title: "Search", text: "Find a library or study room near you." },
  { icon: MapPin, title: "Pick a seat", text: "Tap a green seat on the floor plan." },
  { icon: CalendarCheck, title: "Reserve", text: "Confirm and get your booking code." },
];

function Index() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const { state } = useSeatStore();
  const seats = Object.values(state.seats);
  const stats = computeStats(seats);

  const topRooms = useMemo(
    () =>
      SAMPLE_ROOMS.map((room) => {
        const rs = seats.filter((s) => s.roomId === room.id);
        return { room, rs, stats: computeStats(rs) };
      })
        .sort((a, b) => b.stats.available - a.stats.available)
        .slice(0, 3),
    [seats],
  );

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    navigate({ to: "/dashboard", search: { q: q.trim() || undefined } });
  };

  return (
    <>
      <section className="relative isolate overflow-hidden bg-navy text-navy-foreground">
        <img src={heroImg} alt="Bright university library with students studying" width={1600} height={1008} className="absolute inset-0 -z-20 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-hero" />
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:py-36">
          <div className="max-w-2xl animate-fade-up">
            <p className="inline-flex items-center gap-2 rounded-full border border-navy-foreground/25 bg-navy-foreground/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] backdrop-blur">
              <Armchair className="h-3.5 w-3.5" /> Campus study seats
            </p>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.05] sm:text-6xl">
              Find your seat before you reach the library.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-navy-muted">
              See which study seats are free across campus and reserve one in seconds.
            </p>

            <form onSubmit={onSearch} className="mt-8 flex flex-col gap-3 rounded-2xl bg-card p-2 shadow-elegant sm:flex-row sm:rounded-full">
              <label htmlFor="hero-search" className="sr-only">Search study spaces</label>
              <div className="flex flex-1 items-center gap-3 px-4">
                <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
                <input
                  id="hero-search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Library, building or room…"
                  className="h-12 w-full bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
                />
              </div>
              <Button type="submit" variant="hero" size="xl">
                Find a study seat <ArrowRight />
              </Button>
            </form>

            <p className="mt-5 text-sm text-navy-muted">
              <strong className="text-navy-foreground">{stats.available} seats free</strong> right now across {SAMPLE_ROOMS.length} rooms
              <span className="ml-2 rounded-full bg-navy-foreground/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider">Sample data</span>
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.title} className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-primary">
                  <s.icon className="h-5 w-5" />
                </span>
                <span className="font-mono text-xs text-muted-foreground">0{i + 1}</span>
              </div>
              <h3 className="mt-4 text-xl font-semibold">{s.title}</h3>
              <p className="mt-1 text-muted-foreground">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-semibold sm:text-4xl">Most seats free now</h2>
            <StatusLegend className="mt-3" />
          </div>
          <Button variant="soft" asChild>
            <Link to="/dashboard">All study rooms <ArrowRight /></Link>
          </Button>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {topRooms.map(({ room, rs, stats: st }) => (
            <Link
              key={room.id}
              to="/rooms/$roomId"
              params={{ roomId: room.id }}
              className="group rounded-2xl border border-border bg-card p-6 shadow-card transition-all hover:-translate-y-1 hover:border-primary/40"
            >
              <p className="text-sm font-semibold text-primary">{room.building}</p>
              <h3 className="mt-1 text-xl font-semibold">{room.name}</h3>
              <p className="mt-3 text-3xl font-bold text-seat-available-ink">
                {st.available}<span className="ml-1 text-base font-medium text-muted-foreground">/ {st.total} free</span>
              </p>
              <div className="mt-4"><SeatStrip seats={rs} /></div>
              <p className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                View seat map <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col gap-6 rounded-3xl bg-navy p-8 text-navy-foreground sm:p-12 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <SampleBadge className="border-navy-foreground/30 bg-navy-foreground/10 text-navy-foreground" />
            <h2 className="mt-4 text-3xl font-semibold">Seats that know when they're taken</h2>
            <p className="mt-3 text-navy-muted">
              Pressure sensors under each chair and an ESP32 board can flip a seat to red when someone sits down — and back to green when they leave.
            </p>
          </div>
          <Button variant="onDark" size="xl" asChild>
            <Link to="/sensors"><Cpu /> How sensing works</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
