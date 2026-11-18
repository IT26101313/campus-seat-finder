export type SeatStatus = "available" | "occupied" | "unavailable";
export type SeatFeature = "window" | "power" | "lamp";
export type RoomKind = "quiet" | "silent" | "group" | "lounge";

export interface Room {
  id: string;
  name: string;
  building: string;
  floor: string;
  kind: RoomKind;
  description: string;
  hours: string;
  amenities: string[];
  /** Floor plan rows. o = available seat, x = occupied seat, - = unavailable seat, T = table, space = aisle. */
  layout: string[];
}

export interface Seat {
  id: string;
  roomId: string;
  label: string;
  row: number;
  col: number;
  status: SeatStatus;
  features: SeatFeature[];
}

export interface Reservation {
  id: string;
  seatId: string;
  roomId: string;
  seatLabel: string;
  studentName: string;
  studentId: string;
  date: string;
  startTime: string;
  durationHours: number;
  createdAt: string;
  /** True for the demo bookings that ship with the sample data. */
  sample?: boolean;
}

export interface AppState {
  seats: Record<string, Seat>;
  reservations: Reservation[];
}
