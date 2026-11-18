import type { AppState, Reservation, SeatStatus } from "./types";

export const MIN_HOURS = 1;
export const MAX_HOURS = 4;

export interface ReserveInput {
  seatId: string;
  studentName: string;
  studentId: string;
  date: string;
  startTime: string;
  durationHours: number;
}

export type ReserveResult =
  | { ok: true; state: AppState; reservation: Reservation }
  | { ok: false; error: string };

function makeCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "SS-";
  for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

/** Reserve a seat. Only available seats can be booked; a booked seat becomes occupied. */
export function reserveSeat(state: AppState, input: ReserveInput, now: Date = new Date()): ReserveResult {
  const seat = state.seats[input.seatId];
  if (!seat) return { ok: false, error: "That seat doesn't exist." };
  if (seat.status === "occupied") return { ok: false, error: `Seat ${seat.label} is already occupied.` };
  if (seat.status === "unavailable") return { ok: false, error: `Seat ${seat.label} is unavailable.` };
  if (!input.studentName.trim()) return { ok: false, error: "Please enter your name." };
  if (!input.studentId.trim()) return { ok: false, error: "Please enter your student ID." };
  if (!input.date || !input.startTime) return { ok: false, error: "Please choose a date and start time." };
  if (input.durationHours < MIN_HOURS || input.durationHours > MAX_HOURS) {
    return { ok: false, error: `Reservations can last ${MIN_HOURS} to ${MAX_HOURS} hours.` };
  }

  const reservation: Reservation = {
    id: makeCode(),
    seatId: seat.id,
    roomId: seat.roomId,
    seatLabel: seat.label,
    studentName: input.studentName.trim(),
    studentId: input.studentId.trim(),
    date: input.date,
    startTime: input.startTime,
    durationHours: input.durationHours,
    createdAt: now.toISOString(),
  };

  return {
    ok: true,
    reservation,
    state: {
      seats: { ...state.seats, [seat.id]: { ...seat, status: "occupied" } },
      reservations: [reservation, ...state.reservations],
    },
  };
}

/** Cancel a reservation and free its seat again. */
export function cancelReservation(state: AppState, reservationId: string): AppState {
  const res = state.reservations.find((r) => r.id === reservationId);
  if (!res) return state;
  const seat = state.seats[res.seatId];
  return {
    seats: seat && seat.status === "occupied" ? { ...state.seats, [seat.id]: { ...seat, status: "available" } } : state.seats,
    reservations: state.reservations.filter((r) => r.id !== reservationId),
  };
}

export function setSeatStatus(state: AppState, seatId: string, status: SeatStatus): AppState {
  const seat = state.seats[seatId];
  if (!seat || seat.status === status) return state;
  return { ...state, seats: { ...state.seats, [seatId]: { ...seat, status } } };
}

export interface OccupancyStats {
  total: number;
  available: number;
  occupied: number;
  unavailable: number;
  /** Occupied share of usable (not unavailable) seats, 0–100. */
  occupancyRate: number;
}

export function computeStats(seats: { status: SeatStatus }[]): OccupancyStats {
  const s = { total: seats.length, available: 0, occupied: 0, unavailable: 0 };
  for (const seat of seats) s[seat.status] += 1;
  const usable = s.total - s.unavailable;
  return { ...s, occupancyRate: usable ? Math.round((s.occupied / usable) * 100) : 0 };
}
