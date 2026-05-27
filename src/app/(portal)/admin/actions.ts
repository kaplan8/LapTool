"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db/prisma";

export async function hideDemoQuestionsAction() {
  await prisma.question.updateMany({
    where: { isDemo: true },
    data: { isActive: false },
  });
  revalidatePath("/admin");
  revalidatePath("/questions");
  revalidatePath("/learn");
  revalidatePath("/exam");
}

export async function showDemoQuestionsAction() {
  await prisma.question.updateMany({
    where: { isDemo: true },
    data: { isActive: true },
  });
  revalidatePath("/admin");
  revalidatePath("/questions");
  revalidatePath("/learn");
  revalidatePath("/exam");
}

export async function deleteDemoQuestionsAction() {
  await prisma.question.deleteMany({
    where: { isDemo: true },
  });
  revalidatePath("/admin");
  revalidatePath("/questions");
  revalidatePath("/learn");
  revalidatePath("/exam");
}
