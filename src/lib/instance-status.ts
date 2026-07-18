import { InstanceStatus } from "@/generated/prisma/enums";

export { InstanceStatus };

// Expiry is checked at read time rather than via a background job (no
// cron/worker in this MVP) -- a "pending" row past its expiresAt just
// displays and behaves as expired without a DB write.
export function effectiveStatus(status: InstanceStatus, expiresAt: Date): InstanceStatus {
  if (status === InstanceStatus.pending && expiresAt.getTime() < Date.now()) {
    return InstanceStatus.expired;
  }
  return status;
}

export const STATUS_LABELS: Record<InstanceStatus, string> = {
  pending: "Pending",
  completed: "Completed",
  expired: "Expired",
  cancelled: "Cancelled",
};

export const STATUS_TONES: Record<InstanceStatus, "amber" | "green" | "neutral" | "red"> = {
  pending: "amber",
  completed: "green",
  expired: "neutral",
  cancelled: "red",
};
