"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/auth";

// Data URLs are stored directly on the row (see schema.prisma), so cap
// the size we'll accept -- client-side resizing keeps real uploads well
// under this, this just guards against a bypassed/huge payload.
const MAX_AVATAR_LENGTH = 700_000;

export async function updateProfile(input: {
  name: string;
  avatarUrl: string | null;
}): Promise<void> {
  const userId = await requireUserId();

  const name = input.name.trim();
  if (!name) {
    throw new Error("Enter a name before saving.");
  }
  if (input.avatarUrl && input.avatarUrl.length > MAX_AVATAR_LENGTH) {
    throw new Error("That image is too large. Try a smaller photo.");
  }
  if (input.avatarUrl && !input.avatarUrl.startsWith("data:image/")) {
    throw new Error("Invalid image data.");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { name, avatarUrl: input.avatarUrl },
  });

  revalidatePath("/dashboard");
}
