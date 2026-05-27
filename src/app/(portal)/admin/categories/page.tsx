import { createCategoryAction } from "./actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/form";
import { prisma } from "@/lib/db/prisma";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { questions: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <Badge variant="warning">Admin</Badge>
        <h1 className="mt-3 text-3xl font-bold text-white">Kategorienverwaltung</h1>
        <p className="mt-2 text-slate-400">Knowledge Areas als IT-Service-Bereiche pflegen.</p>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Kategorie erstellen oder aktualisieren</CardTitle>
            <CardDescription>Der Slug wird automatisch aus dem Namen erzeugt.</CardDescription>
          </div>
        </CardHeader>
        <form action={createCategoryAction} className="grid gap-4 md:grid-cols-[1fr_1fr_160px_140px_auto]">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input name="name" required />
          </div>
          <div className="space-y-2">
            <Label>Beschreibung</Label>
            <Input name="description" />
          </div>
          <div className="space-y-2">
            <Label>Icon</Label>
            <Input name="icon" placeholder="Network" />
          </div>
          <div className="space-y-2">
            <Label>Farbe</Label>
            <Input name="color" placeholder="#38bdf8" />
          </div>
          <Button className="self-end">Speichern</Button>
        </form>
      </Card>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => (
          <Card key={category.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle>{category.name}</CardTitle>
                <p className="mt-2 text-sm text-slate-400">{category.description}</p>
              </div>
              <span className="h-4 w-4 rounded-full" style={{ backgroundColor: category.color ?? "#38bdf8" }} />
            </div>
            <Badge className="mt-4">{category._count.questions} Fragen</Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}
