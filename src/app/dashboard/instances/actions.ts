"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/auth";
import { randomToken } from "@/lib/token";
import { getPublicBaseUrl } from "@/lib/url";
import { InstanceStatus } from "@/generated/prisma/enums";

const LINK_EXPIRY_DAYS = 14;

export async function sendAssessment(
  clientId: string,
  templateId: string,
): Promise<{ instanceId: string; url: string }> {
  const userId = await requireUserId();

  const client = await prisma.client.findFirst({ where: { id: clientId, ownerId: userId } });
  if (!client) throw new Error("Client not found.");
  if (client.archivedAt) throw new Error("This client is archived. Restore them first.");

  const template = await prisma.assessmentTemplate.findFirst({
    where: { id: templateId, ownerId: userId },
  });
  if (!template) throw new Error("Assessment not found.");

  const expiresAt = new Date(Date.now() + LINK_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
  const instance = await prisma.assessmentInstance.create({
    data: { templateId, clientId, token: randomToken(), expiresAt },
  });

  const baseUrl = await getPublicBaseUrl();

  revalidatePath(`/dashboard/clients/${clientId}`);
  revalidatePath("/dashboard/clients");
  revalidatePath("/dashboard/awaiting-response");

  return { instanceId: instance.id, url: `${baseUrl}/a/${instance.token}` };
}

export async function cancelInstance(instanceId: string): Promise<void> {
  const userId = await requireUserId();

  const instance = await prisma.assessmentInstance.findFirst({
    where: { id: instanceId, template: { ownerId: userId } },
  });
  if (!instance) throw new Error("Not found.");
  if (instance.status !== InstanceStatus.pending) {
    throw new Error("Only pending sends can be cancelled.");
  }

  await prisma.assessmentInstance.update({
    where: { id: instanceId },
    data: { status: InstanceStatus.cancelled },
  });

  revalidatePath(`/dashboard/clients/${instance.clientId}`);
  revalidatePath("/dashboard/clients");
  revalidatePath("/dashboard/awaiting-response");
}
