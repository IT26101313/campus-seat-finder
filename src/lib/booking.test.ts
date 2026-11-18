import { describe, expect, it } from "vitest";
import { buildInitialState } from "@/data/sample-data";
import { cancelReservation, computeStats, reserveSeat } from "./booking";

const base = { studentName: "Test Student", studentId: "S1", date: "2026-11-18", startTime: "10:00", durationHours: 2 };

describe("seat reservations", () => {
  it("reserving an available seat marks it occupied", () => {
    const state = buildInitialState();
    const r = reserveSeat(state, { ...base, seatId: "main-reading-hall-A1" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.state.seats["main-reading-hall-A1"]?.status).toBe("occupied");
  });

  it("an occupied seat cannot be reserved", () => {
    const state = buildInitialState();
    expect(state.seats["main-reading-hall-A2"]?.status).toBe("occupied");
    expect(reserveSeat(state, { ...base, seatId: "main-reading-hall-A2" }).ok).toBe(false);
  });

  it("an unavailable seat cannot be reserved", () => {
    const state = buildInitialState();
    expect(state.seats["main-reading-hall-B4"]?.status).toBe("unavailable");
    expect(reserveSeat(state, { ...base, seatId: "main-reading-hall-B4" }).ok).toBe(false);
  });

  it("cancelling a reservation makes the seat available again", () => {
    const r = reserveSeat(buildInitialState(), { ...base, seatId: "main-reading-hall-A1" });
    if (!r.ok) throw new Error("expected booking");
    const after = cancelReservation(r.state, r.reservation.id);
    expect(after.seats["main-reading-hall-A1"]?.status).toBe("available");
  });

  it("occupancy ignores unavailable seats", () => {
    expect(computeStats([{ status: "occupied" }, { status: "available" }, { status: "unavailable" }]).occupancyRate).toBe(50);
  });
});
