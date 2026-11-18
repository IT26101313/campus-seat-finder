import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { buildInitialState } from "@/data/sample-data";
import { cancelReservation, reserveSeat, setSeatStatus, type ReserveInput, type ReserveResult } from "./booking";
import type { AppState, SeatStatus } from "./types";

const STORAGE_KEY = "studyspot:v1";

interface SeatStore {
  state: AppState;
  hydrated: boolean;
  reserve: (input: ReserveInput) => ReserveResult;
  cancel: (reservationId: string) => void;
  setStatus: (seatId: string, status: SeatStatus) => void;
  reset: () => void;
}

const Ctx = createContext<SeatStore | null>(null);

export function SeatStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(buildInitialState);
  const [hydrated, setHydrated] = useState(false);
  const ref = useRef(state);

  const commit = useCallback((next: AppState) => {
    ref.current = next;
    setState(next);
  }, []);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AppState;
        if (parsed?.seats && Array.isArray(parsed.reservations)) commit(parsed);
      }
    } catch {
      /* ignore corrupted storage */
    }
    setHydrated(true);
  }, [commit]);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const value = useMemo<SeatStore>(
    () => ({
      state,
      hydrated,
      reserve: (input) => {
        const r = reserveSeat(ref.current, input);
        if (r.ok) commit(r.state);
        return r;
      },
      cancel: (id) => commit(cancelReservation(ref.current, id)),
      setStatus: (seatId, status) => commit(setSeatStatus(ref.current, seatId, status)),
      reset: () => commit(buildInitialState()),
    }),
    [state, hydrated, commit],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSeatStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSeatStore must be used inside SeatStoreProvider");
  return ctx;
}

export function useRoomSeats(roomId: string) {
  const { state } = useSeatStore();
  return useMemo(() => Object.values(state.seats).filter((s) => s.roomId === roomId), [state.seats, roomId]);
}
