"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth/demo-user";
import { prisma } from "@/lib/db/prisma";

const settingsSchema = z.object({
  name: z.string().min(2),
  dailyGoal: z.coerce.number().int().min(1).max(200),
  lapTargetDate: z.string().optional(),
});

export async function updateSettingsAction(formData: FormData) {
  const user = await getCurrentUser();
  const parsed = settingsSchema.parse({
    name: formData.get("name"),
    dailyGoal: formData.get("dailyGoal"),
    lapTargetDate: formData.get("lapTargetDate")?.toString() || undefined,
  });

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: parsed.name,
      dailyGoal: parsed.dailyGoal,
      lapTargetDate: parsed.lapTargetDate ? new Date(`${parsed.lapTargetDate}T08:00:00.000Z`) : null,
    },
  });

  revalidatePath("/settings");
  revalidatePath("/dashboard");
}
