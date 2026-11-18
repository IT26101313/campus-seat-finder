import { createFileRoute } from "@tanstack/react-router";
import { Armchair, Cpu, Gauge, MonitorSmartphone, Wifi } from "lucide-react";
import { SampleBadge, StatusPill } from "@/components/StatusLegend";
import type { SeatStatus } from "@/lib/types";

export const Route = createFileRoute("/sensors")({
  head: () => ({
    meta: [
      { title: "Sensor seat detection with ESP32 — StudySpot" },
      { name: "description", content: "How ESP32 boards and pressure sensors can mark study seats as occupied or available automatically." },
      { property: "og:title", content: "Sensor seat detection with ESP32 — StudySpot" },
      { property: "og:description", content: "How ESP32 boards and pressure sensors can mark study seats as occupied or available automatically." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Sensors,
});

const FLOW = [
  { icon: Armchair, title: "Student sits down", text: "An FSR pressure sensor under the seat cushion detects weight." },
  { icon: Cpu, title: "ESP32 reads it", text: "The board samples the sensor and filters out short spikes." },
  { icon: Wifi, title: "Sent over Wi-Fi", text: "Only a confirmed change is sent: seat ID + occupied / free." },
  { icon: MonitorSmartphone, title: "Map updates", text: "The seat turns red. When the student leaves, it turns green again." },
];

const STABILITY = [
  { k: "Sample rate", v: "Every 100 ms" },
  { k: "Smoothing", v: "Average of last 10 readings" },
  { k: "Threshold", v: "Occupied above 1,800 · free below 1,200 (gap avoids flicker)" },
  { k: "Hold time", v: "New state must last 5 s before it is sent" },
];

const LOG: { time: string; seat: string; reading: number; status: SeatStatus; note: string }[] = [
  { time: "10:02:14", seat: "Reading Hall · A1", reading: 2310, status: "occupied", note: "Held 5 s → sent" },
  { time: "10:04:51", seat: "Quiet Zone · B3", reading: 1540, status: "available", note: "In gap — ignored" },
  { time: "10:05:03", seat: "Collab Lab · C2", reading: 2045, status: "occupied", note: "Held 5 s → sent" },
  { time: "10:07:38", seat: "Reading Hall · A1", reading: 320, status: "available", note: "Held 5 s → sent" },
  { time: "10:08:02", seat: "Grad Lounge · A4", reading: 1960, status: "occupied", note: "Spike 0.8 s — ignored" },
];

const CODE = `// ESP32 + FSR seat sensor (Arduino) — reference sketch
#include <WiFi.h>
#include <HTTPClient.h>

const int   FSR_PIN   = 34;
const char* SEAT_ID   = "main-reading-hall-A1";
const int   ON_LEVEL  = 1800, OFF_LEVEL = 1200;  // hysteresis
const unsigned long HOLD_MS = 5000;              // must be stable 5 s

bool reported = false, candidate = false;
unsigned long since = 0;

int readSmoothed() {
  long sum = 0;
  for (int i = 0; i < 10; i++) { sum += analogRead(FSR_PIN); delay(10); }
  return sum / 10;
}

void loop() {
  int v = readSmoothed();
  bool now = reported ? (v > OFF_LEVEL) : (v > ON_LEVEL);
  if (now != candidate) { candidate = now; since = millis(); }
  if (candidate != reported && millis() - since >= HOLD_MS) {
    reported = candidate;
    HTTPClient http;
    http.begin(SERVER_URL);
    http.addHeader("Content-Type", "application/json");
    http.POST(String("{\\"seatId\\":\\"") + SEAT_ID +
              "\\",\\"occupied\\":" + (reported ? "true" : "false") + "}");
    http.end();
  }
  delay(100);
}`;

function Sensors() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Automatic seat detection</p>
        <h1 className="mt-2 text-4xl font-semibold sm:text-5xl">Chairs that report when they're taken</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Each chair has a pressure sensor wired to an ESP32. When someone sits, the seat turns <strong className="text-seat-occupied-ink">red</strong>; when they leave, it turns back to <strong className="text-seat-available-ink">green</strong>.
        </p>
      </div>

      <ol className="mt-10 grid gap-4 md:grid-cols-4">
        {FLOW.map((s, i) => (
          <li key={s.title} className="relative rounded-2xl border border-border bg-card p-6 shadow-card">
            <span className="font-mono text-xs text-muted-foreground">STEP 0{i + 1}</span>
            <span className="mt-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground">
              <s.icon className="h-5 w-5" />
            </span>
            <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
          </li>
        ))}
      </ol>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-border bg-card p-6 shadow-card">
          <div className="flex items-center gap-2">
            <Gauge className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-semibold">Stable readings, no false alarms</h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            A bag on the chair for a second or someone shifting position shouldn't change the map. Readings are smoothed and must stay steady before a change is sent.
          </p>
          <dl className="mt-5 divide-y divide-border">
            {STABILITY.map((s) => (
              <div key={s.k} className="flex flex-col gap-1 py-3 sm:flex-row sm:justify-between">
                <dt className="font-semibold">{s.k}</dt>
                <dd className="text-sm text-muted-foreground sm:text-right">{s.v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="rounded-3xl border border-border bg-card p-6 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-2xl font-semibold">Example sensor log</h2>
            <SampleBadge />
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="py-2 pr-3">Time</th><th className="py-2 pr-3">Seat</th><th className="py-2 pr-3">Reading</th><th className="py-2 pr-3">State</th><th className="py-2">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {LOG.map((l) => (
                  <tr key={l.time + l.seat}>
                    <td className="py-2.5 pr-3 font-mono">{l.time}</td>
                    <td className="py-2.5 pr-3 whitespace-nowrap">{l.seat}</td>
                    <td className="py-2.5 pr-3 font-mono">{l.reading}</td>
                    <td className="py-2.5 pr-3"><StatusPill status={l.status} /></td>
                    <td className="py-2.5 whitespace-nowrap text-muted-foreground">{l.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section className="mt-6 overflow-hidden rounded-3xl bg-navy text-navy-foreground">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-navy-foreground/15 px-6 py-4">
          <h2 className="text-xl font-semibold">ESP32 reference sketch</h2>
          <span className="font-mono text-xs text-navy-muted">sends {"{ seatId, occupied }"} over Wi-Fi</span>
        </div>
        <pre className="overflow-x-auto p-6 font-mono text-[13px] leading-relaxed text-navy-muted"><code>{CODE}</code></pre>
      </section>

      <p className="mt-6 rounded-2xl border border-dashed border-primary/40 bg-accent/60 p-4 text-sm text-accent-foreground">
        In this demo, seat states come from sample data — no live sensors are connected yet.
      </p>
    </div>
  );
}
