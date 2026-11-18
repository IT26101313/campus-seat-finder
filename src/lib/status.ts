import type { SeatStatus } from "./types";

export const STATUS_META: Record<SeatStatus, { label: string; seat: string; dot: string; soft: string }> = {
  available: {
    label: "Available",
    seat: "bg-seat-available text-seat-foreground hover:brightness-110",
    dot: "bg-seat-available",
    soft: "bg-seat-available-soft text-seat-available-ink",
  },
  occupied: {
    label: "Occupied",
    seat: "bg-seat-occupied text-seat-foreground",
    dot: "bg-seat-occupied",
    soft: "bg-seat-occupied-soft text-seat-occupied-ink",
  },
  unavailable: {
    label: "Unavailable",
    seat: "bg-seat-unavailable text-seat-foreground",
    dot: "bg-seat-unavailable",
    soft: "bg-seat-unavailable-soft text-seat-unavailable-ink",
  },
};

export const STATUS_ORDER: SeatStatus[] = ["available", "occupied", "unavailable"];
