"use client";

import {
  BarChart3,
  BookOpenCheck,
  ClipboardList,
  GraduationCap,
  Import,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/learn", label: "Lernmodus", icon: BookOpenCheck },
  { href: "/exam", label: "Prüfungsmodus", icon: GraduationCap },
  { href: "/questions", label: "Fragenkatalog", icon: ClipboardList },
  { href: "/progress", label: "Schwächenanalyse", icon: BarChart3 },
  { href: "/settings", label: "Lernplan", icon: Settings },
  { href: "/admin", label: "Admin", icon: Wrench },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden min-h-screen w-72 shrink-0 border-r border-slate-800/80 bg-slate-950/80 px-4 py-5 lg:block">
      <Link href="/" className="mb-8 flex items-center gap-3 rounded-lg px-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-sky-400/30 bg-sky-400/10">
          <ShieldCheck className="h-6 w-6 text-sky-300" />
        </div>
        <div>
          <div className="text-sm font-bold uppercase tracking-[0.18em] text-sky-200">LAP Academy</div>
          <div className="text-xs text-slate-400">Systemtechnik Track</div>
        </div>
      </Link>

      <nav className="space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-400 transition",
                active
                  ? "border border-sky-400/30 bg-sky-400/10 text-sky-100"
                  : "hover:bg-slate-900 hover:text-white",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 rounded-lg border border-emerald-400/20 bg-emerald-400/10 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-200">
          <Import className="h-4 w-4" />
          Private Quellen
        </div>
        <p className="mt-2 text-xs leading-5 text-slate-400">
          Offizielle Unterlagen nur importieren, wenn du sie nutzen darfst. Demo-Fragen sind nicht offiziell.
        </p>
      </div>
    </aside>
  );
}
