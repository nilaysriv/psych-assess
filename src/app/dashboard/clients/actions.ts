"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/auth";

export type ClientInput = {
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
};

export async function createClient(input: ClientInput): Promise<{ id: string }> {
  const userId = await requireUserId();

  const name = input.name.trim();
  if (!name) {
    throw new Error("Enter a name before saving.");
  }

  const client = await prisma.client.create({
    data: {
      ownerId: userId,
      name,
      phone: input.phone?.trim() || null,
      email: input.email?.trim() || null,
      notes: input.notes?.trim() || null,
    },
  });

  revalidatePath("/dashboard/clients");
  return { id: client.id };
}

export async function updateClient(id: string, input: ClientInput): Promise<void> {
  const userId = await requireUserId();

  const name = input.name.trim();
  if (!name) {
    throw new Error("Enter a name before saving.");
  }

  const existing = await prisma.client.findFirst({ where: { id, ownerId: userId } });
  if (!existing) throw new Error("Client not found.");

  await prisma.client.update({
    where: { id },
    data: {
      name,
      phone: input.phone?.trim() || null,
      email: input.email?.trim() || null,
      notes: input.notes?.trim() || null,
    },
  });

  revalidatePath("/dashboard/clients");
  revalidatePath(`/dashboard/clients/${id}`);
}

export async function archiveClient(id: string): Promise<void> {
  const userId = await requireUserId();
  const existing = await prisma.client.findFirst({ where: { id, ownerId: userId } });
  if (!existing) throw new Error("Client not found.");

  await prisma.client.update({ where: { id }, data: { archivedAt: new Date() } });
  revalidatePath("/dashboard/clients");
  revalidatePath(`/dashboard/clients/${id}`);
}

export async function unarchiveClient(id: string): Promise<void> {
  const userId = await requireUserId();
  const existing = await prisma.client.findFirst({ where: { id, ownerId: userId } });
  if (!existing) throw new Error("Client not found.");

  await prisma.client.update({ where: { id }, data: { archivedAt: null } });
  revalidatePath("/dashboard/clients");
  revalidatePath(`/dashboard/clients/${id}`);
}
