"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/db/prisma";
import { slugify } from "@/lib/utils";

const categorySchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
});

export async function createCategoryAction(formData: FormData) {
  const parsed = categorySchema.parse({
    name: formData.get("name"),
    description: formData.get("description")?.toString() || undefined,
    icon: formData.get("icon")?.toString() || undefined,
    color: formData.get("color")?.toString() || undefined,
  });

  await prisma.category.upsert({
    where: { slug: slugify(parsed.name) },
    create: {
      name: parsed.name,
      slug: slugify(parsed.name),
      description: parsed.description,
      icon: parsed.icon,
      color: parsed.color || "#38bdf8",
    },
    update: {
      description: parsed.description,
      icon: parsed.icon,
      color: parsed.color || "#38bdf8",
    },
  });

  revalidatePath("/admin/categories");
}
