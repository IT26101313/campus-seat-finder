import { Link } from "@tanstack/react-router";
import { CalendarCheck, CheckCircle2 } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MAX_HOURS, MIN_HOURS } from "@/lib/booking";
import { useSeatStore } from "@/lib/seat-store";
import type { Reservation, Room, Seat } from "@/lib/types";

const START_TIMES = Array.from({ length: 14 }, (_, i) => `${String(8 + i).padStart(2, "0")}:00`);
const DURATIONS = Array.from({ length: MAX_HOURS - MIN_HOURS + 1 }, (_, i) => MIN_HOURS + i);

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function ReservationDialog({
  open,
  onOpenChange,
  room,
  seat,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room: Room;
  seat: Seat | null;
}) {
  const { reserve } = useSeatStore();
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("10:00");
  const [duration, setDuration] = useState("2");
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<Reservation | null>(null);

  useEffect(() => {
    if (open) {
      setDate((d) => d || todayISO());
      setError(null);
      setConfirmed(null);
    }
  }, [open]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!seat) return;
    const r = reserve({ seatId: seat.id, studentName: name, studentId, date, startTime, durationHours: Number(duration) });
    if (!r.ok) {
      setError(r.error);
      return;
    }
    setConfirmed(r.reservation);
    toast.success(`Seat ${r.reservation.seatLabel} reserved`, { description: `${room.name} · ${r.reservation.date} at ${r.reservation.startTime}` });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {confirmed ? (
          <div className="flex flex-col items-center py-4 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-seat-available-soft text-seat-available-ink">
              <CheckCircle2 className="h-8 w-8" />
            </span>
            <DialogTitle className="mt-4 font-display text-2xl">You're booked in!</DialogTitle>
            <DialogDescription className="mt-1">
              Seat <strong className="text-foreground">{confirmed.seatLabel}</strong> in {room.name}, {room.building}
            </DialogDescription>
            <div className="mt-5 w-full rounded-xl border border-dashed border-primary/40 bg-accent/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Booking code</p>
              <p className="mt-1 font-mono text-2xl font-bold tracking-wider text-primary">{confirmed.id}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {confirmed.date} · {confirmed.startTime} for {confirmed.durationHours} h
              </p>
            </div>
            <div className="mt-6 flex w-full flex-col gap-2 sm:flex-row">
              <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                Back to map
              </Button>
              <Button variant="hero" className="flex-1" asChild>
                <Link to="/reservations">My reservations</Link>
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">Reserve seat {seat?.label}</DialogTitle>
              <DialogDescription>
                {room.name} · {room.building}, {room.floor}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="res-name">Full name</Label>
                <Input id="res-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Morgan" required />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="res-id">Student ID</Label>
                <Input id="res-id" value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="S1234567" required />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="res-date">Date</Label>
                <Input id="res-date" type="date" value={date} min={todayISO()} onChange={(e) => setDate(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label>Start time</Label>
                <Select value={startTime} onValueChange={setStartTime}>
                  <SelectTrigger aria-label="Start time"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {START_TIMES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Duration</Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger aria-label="Duration"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DURATIONS.map((d) => <SelectItem key={d} value={String(d)}>{d} hour{d > 1 ? "s" : ""}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {error && <p className="rounded-lg bg-seat-occupied-soft px-3 py-2 text-sm font-medium text-seat-occupied-ink">{error}</p>}

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" variant="hero">
                <CalendarCheck /> Confirm reservation
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
