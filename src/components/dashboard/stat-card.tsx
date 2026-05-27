import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: ReactNode;
}) {
  return (
    <Card className="min-h-32">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <div className="mt-3 text-3xl font-bold text-white">{value}</div>
        </div>
        <div className="rounded-md border border-sky-400/20 bg-sky-400/10 p-2 text-sky-200">{icon}</div>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-400">{detail}</p>
    </Card>
  );
}
