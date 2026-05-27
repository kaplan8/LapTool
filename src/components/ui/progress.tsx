import { cn, clamp } from "@/lib/utils";

export function Progress({
  value,
  className,
  indicatorClassName,
}: {
  value: number;
  className?: string;
  indicatorClassName?: string;
}) {
  const width = clamp(value, 0, 100);

  return (
    <div className={cn("h-2 overflow-hidden rounded-full bg-slate-800", className)}>
      <div
        className={cn("h-full rounded-full bg-sky-400 transition-all", indicatorClassName)}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
