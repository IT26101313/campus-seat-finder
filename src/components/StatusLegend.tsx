import { cn } from "@/lib/utils";
import { STATUS_META, STATUS_ORDER } from "@/lib/status";

export function StatusLegend({ className }: { className?: string }) {
  return (
    <ul className={cn("flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground", className)}>
      {STATUS_ORDER.map((s) => (
        <li key={s} className="flex items-center gap-2">
          <span className={cn("h-3.5 w-3.5 rounded-[4px]", STATUS_META[s].dot)} aria-hidden />
          {STATUS_META[s].label}
        </li>
      ))}
    </ul>
  );
}

export function StatusPill({ status }: { status: keyof typeof STATUS_META }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold", STATUS_META[status].soft)}>
      <span className={cn("h-2 w-2 rounded-full", STATUS_META[status].dot)} aria-hidden />
      {STATUS_META[status].label}
    </span>
  );
}

export function SampleBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-dashed border-primary/40 bg-accent px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-accent-foreground",
        className,
      )}
    >
      Sample data
    </span>
  );
}
