import { Resend } from "resend";

function getResend(): Resend {
  return new Resend(process.env.RESEND_API_KEY);
}

const FROM = process.env.RESEND_FROM_EMAIL || "ClinTrack <onboarding@resend.dev>";

function wrapEmailHtml(bodyHtml: string): string {
  return `
    <div style="font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #18181b;">
      ${bodyHtml}
      <p style="margin-top: 32px; font-size: 12px; color: #a1a1aa;">
        Sent by ClinTrack. If you weren't expecting this, you can ignore it.
      </p>
    </div>
  `;
}

export async function sendClientReminder(params: {
  to: string;
  clientName: string;
  templateTitle: string;
  link: string;
}): Promise<void> {
  await getResend().emails.send({
    from: FROM,
    to: params.to,
    subject: `Reminder: ${params.templateTitle}`,
    html: wrapEmailHtml(`
      <p>Hi ${params.clientName},</p>
      <p>
        This is a friendly reminder that you have a pending assessment,
        <strong>${params.templateTitle}</strong>, waiting for your response.
      </p>
      <p>
        <a href="${params.link}" style="display: inline-block; background: #4f46e5; color: #fff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          Complete assessment
        </a>
      </p>
      <p>If you've already submitted this, please disregard this email.</p>
    `),
  });
}

export type OverdueEntry = {
  clientName: string;
  templateTitle: string;
  daysPending: number;
};

export async function sendClinicianDigest(params: {
  to: string;
  overdue: OverdueEntry[];
  dashboardUrl: string;
}): Promise<void> {
  const rows = params.overdue
    .map(
      (o) => `
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #e4e4e7;">${o.clientName}</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #e4e4e7; color: #71717a;">${o.templateTitle}</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #e4e4e7; text-align: right; color: #71717a;">${o.daysPending}d</td>
        </tr>
      `,
    )
    .join("");

  await getResend().emails.send({
    from: FROM,
    to: params.to,
    subject: `${params.overdue.length} assessment${params.overdue.length === 1 ? "" : "s"} awaiting response`,
    html: wrapEmailHtml(`
      <p>These assessments are still pending:</p>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <thead>
          <tr>
            <th style="text-align: left; padding-bottom: 8px; border-bottom: 1px solid #d4d4d8; color: #71717a; font-weight: 500;">Client</th>
            <th style="text-align: left; padding-bottom: 8px; border-bottom: 1px solid #d4d4d8; color: #71717a; font-weight: 500;">Assessment</th>
            <th style="text-align: right; padding-bottom: 8px; border-bottom: 1px solid #d4d4d8; color: #71717a; font-weight: 500;">Pending</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p style="margin-top: 20px;">
        <a href="${params.dashboardUrl}" style="display: inline-block; background: #4f46e5; color: #fff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          View Awaiting Response
        </a>
      </p>
    `),
  });
}
