import { updateSettingsAction } from "./actions";
import { getCurrentUser } from "@/lib/auth/demo-user";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/form";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  const target = user.lapTargetDate ? user.lapTargetDate.toISOString().slice(0, 10) : "";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Badge variant="info">Profil & Lernplan</Badge>
        <h1 className="mt-3 text-3xl font-bold text-white">Einstellungen</h1>
        <p className="mt-2 text-slate-400">Demo-Profil, LAP-Zieldatum, Tagesziel und Theme-Vorbereitung.</p>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Profil</CardTitle>
            <CardDescription>Ein einfacher Demo-Login ist im MVP vorbereitet.</CardDescription>
          </div>
        </CardHeader>
        <form action={updateSettingsAction} className="grid gap-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input name="name" defaultValue={user.name} required />
          </div>
          <div className="space-y-2">
            <Label>LAP-Zieldatum</Label>
            <Input name="lapTargetDate" type="date" defaultValue={target} />
          </div>
          <div className="space-y-2">
            <Label>Tagesziel Fragen</Label>
            <Input name="dailyGoal" type="number" min={1} max={200} defaultValue={user.dailyGoal} />
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-950/45 p-4 text-sm text-slate-400">
            Theme Toggle ist UI-seitig vorbereitet; Dark Mode ist im MVP der Standard.
          </div>
          <Button type="submit">Einstellungen speichern</Button>
        </form>
      </Card>
    </div>
  );
}
