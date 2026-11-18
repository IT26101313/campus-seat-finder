/**
 * SAMPLE DATA — every room, seat, occupancy figure and booking below is made up
 * for the hackathon demo. Nothing here comes from real pressure sensors.
 */
import type { AppState, Reservation, Room, Seat, SeatFeature, SeatStatus } from "@/lib/types";

export const SAMPLE_ROOMS: Room[] = [
  {
    id: "main-reading-hall",
    name: "Reading Hall",
    building: "Hartley Main Library",
    floor: "Floor 2",
    kind: "quiet",
    description: "Bright, high-ceiling hall with long shared desks along the windows.",
    hours: "07:00 – 23:00",
    amenities: ["Wi-Fi", "Power sockets", "Printing nearby"],
    layout: [
      "oxo ooo xoo",
      "TTT TTT TTT",
      "ooo -ox ooo",
      "           ",
      "xoo oxo o-o",
      "TTT TTT TTT",
      "oox ooo xxo",
    ],
  },
  {
    id: "science-quiet-zone",
    name: "Quiet Zone",
    building: "Newton Science Library",
    floor: "Floor 1",
    kind: "silent",
    description: "Single desks in rows. Phones on silent, no conversations.",
    hours: "08:00 – 22:00",
    amenities: ["Wi-Fi", "Desk lamps", "Lockers"],
    layout: [
      "o x o o x o",
      "T T T T T T",
      "           ",
      "o o - o o x",
      "T T T T T T",
      "           ",
      "x o o o - o",
      "T T T T T T",
    ],
  },
  {
    id: "engineering-collab-lab",
    name: "Collaboration Lab",
    building: "Engineering Hub",
    floor: "Floor 3",
    kind: "group",
    description: "Pod tables for group projects, with screens and whiteboards.",
    hours: "08:00 – 21:00",
    amenities: ["Wi-Fi", "Whiteboards", "Screen sharing"],
    layout: [
      "oo  xo  oo",
      "TT  TT  TT",
      "xo  oo  -o",
      "          ",
      "oo  ox  xx",
      "TT  TT  TT",
      "oo  oo  ox",
    ],
  },
  {
    id: "graduate-lounge",
    name: "Graduate Study Lounge",
    building: "Whitmore Hall",
    floor: "Floor 3",
    kind: "lounge",
    description: "Relaxed space for postgraduates with long communal tables.",
    hours: "09:00 – 20:00",
    amenities: ["Wi-Fi", "Kitchenette", "Power sockets"],
    layout: [
      "o o o o o",
      "TTTTTTTTT",
      "x o x o o",
      "         ",
      "o - o x o",
      "TTTTTTTTT",
      "o o o o x",
    ],
  },
  {
    id: "student-centre-silent",
    name: "Silent Study",
    building: "Student Centre",
    floor: "Floor 1",
    kind: "silent",
    description: "Central and popular — fills up quickly around exam season.",
    hours: "06:00 – 00:00",
    amenities: ["Wi-Fi", "Café downstairs", "Power sockets"],
    layout: [
      "xxo xxx oxx",
      "TTT TTT TTT",
      "xxx xox xxo",
      "           ",
      "xox xxx -xx",
      "TTT TTT TTT",
      "oxx xxo xxx",
    ],
  },
  {
    id: "law-carrels",
    name: "Study Carrels",
    building: "Law Library",
    floor: "Lower Ground",
    kind: "quiet",
    description: "Private carrels. Some are closed for maintenance this week.",
    hours: "08:00 – 22:00",
    amenities: ["Wi-Fi", "Desk lamps", "Reference books"],
    layout: [
      "o o - - o x",
      "T T T T T T",
      "           ",
      "o x - - o o",
      "T T T T T T",
    ],
  },
];

const CHAR_STATUS: Record<string, SeatStatus> = {
  o: "available",
  x: "occupied",
  "-": "unavailable",
};

export function buildSeats(room: Room): Seat[] {
  const seats: Seat[] = [];
  let seatRow = 0;
  room.layout.forEach((line, row) => {
    const chars = line.split("");
    if (!chars.some((c) => c in CHAR_STATUS)) return;
    const letter = String.fromCharCode(65 + seatRow);
    seatRow += 1;
    let n = 0;
    chars.forEach((c, col) => {
      const status = CHAR_STATUS[c];
      if (!status) return;
      n += 1;
      const features: SeatFeature[] = [];
      if (row === 0) features.push("window");
      if (col % 3 === 0) features.push("power");
      if (room.amenities.includes("Desk lamps")) features.push("lamp");
      seats.push({
        id: `${room.id}-${letter}${n}`,
        roomId: room.id,
        label: `${letter}${n}`,
        row,
        col,
        status,
        features,
      });
    });
  });
  return seats;
}

const SAMPLE_BOOKINGS: Array<Omit<Reservation, "roomId" | "seatLabel" | "createdAt" | "sample">> = [
  { id: "SS-DEMO1", seatId: "main-reading-hall-A2", studentName: "Priya N. (sample)", studentId: "S1020431", date: "2026-11-18", startTime: "10:00", durationHours: 2 },
  { id: "SS-DEMO2", seatId: "engineering-collab-lab-A3", studentName: "Daniel K. (sample)", studentId: "S1018877", date: "2026-11-18", startTime: "11:00", durationHours: 3 },
  { id: "SS-DEMO3", seatId: "science-quiet-zone-A2", studentName: "Amara O. (sample)", studentId: "S1031264", date: "2026-11-18", startTime: "09:00", durationHours: 4 },
];

export function buildInitialState(): AppState {
  const seats: Record<string, Seat> = {};
  for (const room of SAMPLE_ROOMS) {
    for (const seat of buildSeats(room)) seats[seat.id] = seat;
  }
  const reservations: Reservation[] = [];
  for (const b of SAMPLE_BOOKINGS) {
    const seat = seats[b.seatId];
    if (!seat) continue;
    reservations.push({ ...b, roomId: seat.roomId, seatLabel: seat.label, createdAt: `${b.date}T08:00:00.000Z`, sample: true });
  }
  return { seats, reservations };
}

export function getRoom(id: string): Room | undefined {
  return SAMPLE_ROOMS.find((r) => r.id === id);
}

export const ROOM_KIND_LABEL: Record<Room["kind"], string> = {
  quiet: "Quiet study",
  silent: "Silent study",
  group: "Group work",
  lounge: "Lounge",
};
