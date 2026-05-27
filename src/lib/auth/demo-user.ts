import { UserRole } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";

export async function getCurrentUser() {
  const existing = await prisma.user.findFirst({
    where: { role: UserRole.ADMIN },
    orderBy: { createdAt: "asc" },
  });

  if (existing) return existing;

  return prisma.user.create({
    data: {
      name: "Demo Admin",
      email: "admin@lap-academy.local",
      role: UserRole.ADMIN,
      dailyGoal: 30,
    },
  });
}
