import type { ReactNode } from "react";

import { getCurrentUser } from "@/lib/auth/demo-user";
import { Header } from "@/components/layout/header";
import { LegalNotice } from "@/components/layout/legal-notice";
import { Sidebar } from "@/components/layout/sidebar";

export async function AppShell({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen enterprise-grid">
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header userName={user.name} lapTargetDate={user.lapTargetDate} streak={7} />
          <main className="flex-1 px-4 py-6 md:px-8">{children}</main>
          <footer className="px-4 pb-6 md:px-8">
            <LegalNotice />
            <p className="mt-3 text-xs text-slate-500">
              Privates Lernprojekt zur LAP-Vorbereitung. Nicht offiziell von CANCOM Austria oder der WKO bereitgestellt.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
