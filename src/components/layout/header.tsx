import { CalendarDays, Flame, Moon, Play } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

type HeaderProps = {
  userName: string;
  lapTargetDate?: Date | null;
  streak: number;
};

export function Header({ userName, lapTargetDate, streak }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-800/80 bg-slate-950/75 px-4 py-3 backdrop-blur-xl md:px-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Apprentice Dashboard</p>
          <h1 className="text-lg font-semibold text-white">Willkommen, {userName}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="info">
            <CalendarDays className="mr-1 h-3.5 w-3.5" />
            LAP-Ziel: {formatDate(lapTargetDate)}
          </Badge>
          <Badge variant="success">
            <Flame className="mr-1 h-3.5 w-3.5" />
            {streak} Tage Streak
          </Badge>
          <Badge variant="default">
            <Moon className="mr-1 h-3.5 w-3.5" />
            Dark
          </Badge>
          <ButtonLink href="/learn" size="sm">
            <Play className="h-4 w-4" />
            Lernen starten
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}
