import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";

export const dynamic = "force-dynamic";

export default function PortalLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
