import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { InstanceStatus, effectiveStatus } from "@/lib/instance-status";
import { getPublicBaseUrl } from "@/lib/url";
import { sendClientReminder, sendClinicianDigest, OverdueEntry } from "@/lib/email";

// PRD 5.7 promoted into scope. Vercel Hobby cron can't run more often
// than daily, so this runs once a day and each instance's own
// lastReminderSentAt tracks whether it's actually due for a nudge --
// the cadence below is independent of how often the cron itself fires.
const FIRST_REMINDER_DAYS = 7;
const REPEAT_INTERVAL_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

function daysSince(date: Date, now: Date): number {
  return Math.floor((now.getTime() - date.getTime()) / DAY_MS);
}

export async function GET(request: NextRequest) {
  if (process.env.CRON_SECRET) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const now = new Date();
  const baseUrl = await getPublicBaseUrl();
  const users = await prisma.user.findMany({ select: { id: true, email: true } });

  let remindersSent = 0;
  let digestsSent = 0;

  for (const user of users) {
    const pendingInstances = await prisma.assessmentInstance.findMany({
      where: { status: InstanceStatus.pending, template: { ownerId: user.id } },
      include: {
        client: { select: { name: true, email: true } },
        template: { select: { title: true } },
      },
    });

    const overdueForDigest: OverdueEntry[] = [];
    const dueInstanceIds: string[] = [];

    for (const instance of pendingInstances) {
      if (effectiveStatus(instance.status, instance.expiresAt) !== InstanceStatus.pending) continue;

      const pendingDays = daysSince(instance.sentAt, now);
      if (pendingDays < FIRST_REMINDER_DAYS) continue;

      const dueThisRun = instance.lastReminderSentAt
        ? daysSince(instance.lastReminderSentAt, now) >= REPEAT_INTERVAL_DAYS
        : true;
      if (!dueThisRun) continue;

      overdueForDigest.push({
        clientName: instance.client.name,
        templateTitle: instance.template.title,
        daysPending: pendingDays,
      });
      dueInstanceIds.push(instance.id);

      if (instance.client.email) {
        try {
          await sendClientReminder({
            to: instance.client.email,
            clientName: instance.client.name,
            templateTitle: instance.template.title,
            link: `${baseUrl}/a/${instance.token}`,
          });
          remindersSent += 1;
        } catch (err) {
          console.error(`Reminder email failed for instance ${instance.id}`, err);
        }
      }
    }

    if (dueInstanceIds.length > 0) {
      await prisma.assessmentInstance.updateMany({
        where: { id: { in: dueInstanceIds } },
        data: { lastReminderSentAt: now },
      });
    }

    if (overdueForDigest.length > 0) {
      try {
        await sendClinicianDigest({
          to: user.email,
          overdue: overdueForDigest,
          dashboardUrl: `${baseUrl}/dashboard/awaiting-response`,
        });
        digestsSent += 1;
      } catch (err) {
        console.error(`Digest email failed for ${user.email}`, err);
      }
    }
  }

  return NextResponse.json({ ok: true, remindersSent, digestsSent });
}
