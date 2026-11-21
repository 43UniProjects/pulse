import fs from 'fs';
import path from 'path';
import { transporter } from '@/lib/mail';
import type { BloodGroup } from '@/types/common.type';
import type { RequestUrgency } from '@/types/donor-request.type';

export interface EmailAlertDonor {
  _id?: string | { toString(): string };
  fullName?: string;
  email: string;
}

export interface EmailAlertRequest {
  _id: string | { toString(): string };
  requestId?: string;
  bloodGroup: BloodGroup;
  quantity: number;
  urgency: RequestUrgency;
  notes?: string;
}

export interface EmailAlertHospital {
  name: string;
  address: string;
  hotline?: string;
}

export interface SendEmergencyAlertEmailParams {
  donor: EmailAlertDonor;
  request: EmailAlertRequest;
  hospital: EmailAlertHospital;
  distanceKm: number;
}

export interface DonorWithDistance {
  donor: EmailAlertDonor;
  distanceKm: number;
}

export interface DispatchEmergencyEmailAlertsParams {
  donorsWithDistance: DonorWithDistance[];
  request: EmailAlertRequest;
  hospital: EmailAlertHospital;
}

export interface EmailDispatchResult {
  attempted: number;
  sent: number;
  failed: number;
  skipped?: boolean;
}

const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

let cachedLogoBase64: string | null = null;

/**
 * Escapes HTML special characters to prevent HTML injection in email templates.
 */
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => HTML_ESCAPE_MAP[char] ?? char);
}

function getLogoBase64(): string {
  if (cachedLogoBase64 !== null) {
    return cachedLogoBase64;
  }

  try {
    const logoPath = path.join(process.cwd(), 'public', 'logo', 'logo.png');
    const logoBuffer = fs.readFileSync(logoPath);
    cachedLogoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
  } catch (error) {
    console.warn(
      '[EmailAlert] Failed to read logo file for email template:',
      error instanceof Error ? error.message : 'Unknown error',
    );
    cachedLogoBase64 = '';
  }

  return cachedLogoBase64;
}

function getUrgencyBadgeStyle(urgency: RequestUrgency): {
  label: string;
  bg: string;
  border: string;
  text: string;
} {
  if (urgency === 'critical') {
    return {
      label: 'CRITICAL EMERGENCY',
      bg: 'rgba(220, 38, 38, 0.16)',
      border: 'rgba(220, 38, 38, 0.45)',
      text: '#f87171',
    };
  }
  if (urgency === 'high') {
    return {
      label: 'HIGH PRIORITY',
      bg: 'rgba(245, 158, 11, 0.16)',
      border: 'rgba(245, 158, 11, 0.45)',
      text: '#fbbf24',
    };
  }
  return {
    label: 'BLOOD REQUEST',
    bg: 'rgba(59, 130, 246, 0.16)',
    border: 'rgba(59, 130, 246, 0.45)',
    text: '#60a5fa',
  };
}

function buildRequestUrl(requestObjectId: string): string {
  const baseUrl = (
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  ).replace(/\/$/, '');
  return `${baseUrl}/donor/requests/${encodeURIComponent(requestObjectId)}`;
}

/**
 * Sends a single dark-themed clinical emergency blood alert email to a matched donor
 * using the shared Nodemailer transporter.
 */
export async function sendEmergencyAlertEmail({
  donor,
  request,
  hospital,
  distanceKm,
}: SendEmergencyAlertEmailParams): Promise<void> {
  const requestObjectId = request._id.toString();
  const targetUrl = buildRequestUrl(requestObjectId);
  const safeTargetUrl = escapeHtml(targetUrl);

  const donorNameRaw = donor.fullName?.trim() || 'Donor';
  const donorName = escapeHtml(donorNameRaw);
  const hospitalName = escapeHtml(hospital.name);
  const hospitalAddress = escapeHtml(hospital.address);
  const hospitalHotline = hospital.hotline?.trim()
    ? escapeHtml(hospital.hotline.trim())
    : '';
  const bloodGroup = escapeHtml(request.bloodGroup);
  const requestRef = request.requestId?.trim()
    ? escapeHtml(request.requestId.trim())
    : escapeHtml(requestObjectId);
  const clinicalNotes = request.notes?.trim()
    ? escapeHtml(request.notes.trim())
    : '';

  const safeDistanceKm = Number.isFinite(distanceKm)
    ? Math.max(0, distanceKm)
    : 0;
  const formattedDistance = `${safeDistanceKm.toFixed(1)} km away`;
  const unitsLabel = `${request.quantity} Unit${request.quantity === 1 ? '' : 's'}`;

  const badge = getUrgencyBadgeStyle(request.urgency);
  const logoBase64 = getLogoBase64();

  const subjectUrgency =
    request.urgency === 'critical'
      ? 'CRITICAL'
      : request.urgency === 'high'
        ? 'URGENT'
        : 'Blood Request';
  const subject = `[${subjectUrgency}] ${request.bloodGroup} Blood Needed at ${hospital.name}`;

  const textLines = [
    `Hello ${donorNameRaw},`,
    '',
    `${badge.label}: ${hospital.name} urgently needs ${unitsLabel} of ${request.bloodGroup} blood.`,
    `Reference: ${request.requestId?.trim() || requestObjectId}`,
    `Hospital Address: ${hospital.address}`,
    ...(hospital.hotline?.trim()
      ? [`Hospital Hotline: ${hospital.hotline.trim()}`]
      : []),
    `Estimated Distance: ${formattedDistance}`,
    ...(request.notes?.trim()
      ? [`Clinical Notes: ${request.notes.trim()}`]
      : []),
    '',
    `View Request & Accept: ${targetUrl}`,
    '',
    'Thank you for being part of the Pulse Emergency Blood Network.',
  ];

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Pulse Emergency Blood Alert</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f4f4f5;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #09090b; padding: 36px 16px;">
        <tr>
          <td align="center">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #18181b; border: 1px solid #27272a; border-radius: 12px; overflow: hidden; padding: 32px;">
              <tr>
                <td align="center" style="padding-bottom: 20px;">
                  ${
                    logoBase64
                      ? `<img src="${logoBase64}" alt="Pulse Logo" width="44" height="44" style="display: block; width: 44px; height: 44px; margin: 0 auto 14px auto; border-radius: 8px;" />`
                      : `<div style="display: inline-block; width: 44px; height: 44px; line-height: 44px; border-radius: 8px; background-color: rgba(220, 38, 38, 0.15); border: 1px solid rgba(220, 38, 38, 0.3); text-align: center; margin-bottom: 14px;"><span style="font-size: 20px; color: #dc2626; font-weight: bold;">P</span></div>`
                  }
                  <div style="display: inline-block; padding: 4px 12px; border-radius: 999px; background-color: ${badge.bg}; border: 1px solid ${badge.border}; color: ${badge.text}; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;">
                    ${badge.label}
                  </div>
                  <h2 style="margin: 14px 0 4px 0; color: #ffffff; font-size: 22px; font-weight: 600; letter-spacing: -0.025em;">
                    Nearby Donor Match Found
                  </h2>
                  <p style="margin: 0; color: #a1a1aa; font-size: 13px;">
                    Pulse Emergency Blood Network &bull; ${requestRef}
                  </p>
                </td>
              </tr>

              <tr>
                <td style="padding-bottom: 20px;">
                  <p style="margin: 0; color: #e4e4e7; font-size: 15px; line-height: 1.5;">
                    Hello <strong>${donorName}</strong>,
                  </p>
                  <p style="margin: 10px 0 0 0; color: #a1a1aa; font-size: 14px; line-height: 1.6;">
                    A medical facility near your registered location has issued an emergency blood request compatible with your blood group.
                  </p>
                </td>
              </tr>

              <tr>
                <td style="padding-bottom: 20px;">
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #121215; border: 1px solid #27272a; border-radius: 10px; padding: 20px;">
                    <tr>
                      <td width="88" valign="top" style="padding-right: 16px;">
                        <div style="width: 72px; height: 72px; line-height: 72px; text-align: center; border-radius: 10px; background-color: rgba(220, 38, 38, 0.14); border: 1px solid rgba(220, 38, 38, 0.4); color: #f87171; font-size: 24px; font-weight: 700;">
                          ${bloodGroup}
                        </div>
                      </td>
                      <td valign="top">
                        <div style="color: #ffffff; font-size: 16px; font-weight: 600; margin-bottom: 4px;">
                          ${hospitalName}
                        </div>
                        <div style="color: #a1a1aa; font-size: 13px; line-height: 1.5; margin-bottom: 10px;">
                          ${hospitalAddress}
                        </div>
                        <div style="color: #e4e4e7; font-size: 13px; font-variant-numeric: tabular-nums;">
                          <strong>Required:</strong> ${unitsLabel} &nbsp;&bull;&nbsp; <strong>Distance:</strong> ${escapeHtml(formattedDistance)}
                        </div>
                        ${
                          hospitalHotline
                            ? `<div style="color: #a1a1aa; font-size: 12px; margin-top: 6px; font-variant-numeric: tabular-nums;">Hotline: ${hospitalHotline}</div>`
                            : ''
                        }
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              ${
                clinicalNotes
                  ? `<tr>
                <td style="padding-bottom: 22px;">
                  <div style="background-color: #121215; border-left: 3px solid #dc2626; border-radius: 6px; padding: 12px 14px;">
                    <div style="color: #a1a1aa; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px;">
                      Clinical Notes
                    </div>
                    <div style="color: #e4e4e7; font-size: 13px; line-height: 1.5;">
                      ${clinicalNotes}
                    </div>
                  </div>
                </td>
              </tr>`
                  : ''
              }

              <tr>
                <td align="center" style="padding-bottom: 24px;">
                  <a href="${safeTargetUrl}" style="display: inline-block; background-color: #dc2626; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 13px 28px; border-radius: 6px;">
                    View Request &amp; Accept
                  </a>
                </td>
              </tr>

              <tr>
                <td style="border-top: 1px solid #27272a; padding-top: 18px;">
                  <p style="margin: 0 0 6px 0; color: #71717a; font-size: 12px;">
                    If the button does not work, copy and paste this link into your browser:
                  </p>
                  <p style="margin: 0; word-break: break-all;">
                    <a href="${safeTargetUrl}" style="color: #f87171; font-size: 12px; text-decoration: underline;">${safeTargetUrl}</a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from:
      process.env.SMTP_FROM_EMAIL ||
      `"Pulse Network" <${process.env.SMTP_USER}>`,
    to: donor.email.trim(),
    subject,
    text: textLines.join('\n'),
    html,
  });
}

/**
 * Dispatches emergency alert emails to the provided list of donors using `Promise.allSettled`
 * so a single failed recipient never blocks delivery to other donors.
 *
 * Recipient selection/filtering (such as `emailAlertsEnabled` policy) is intentionally kept
 * outside this dispatcher.
 */
export async function dispatchEmergencyEmailAlerts({
  donorsWithDistance,
  request,
  hospital,
}: DispatchEmergencyEmailAlertsParams): Promise<EmailDispatchResult> {
  const validRecipients = donorsWithDistance.filter((entry) =>
    Boolean(entry.donor.email?.trim()),
  );

  if (validRecipients.length === 0) {
    return { attempted: 0, sent: 0, failed: 0 };
  }

  if (!process.env.SMTP_USER?.trim() || !process.env.SMTP_PASSWORD?.trim()) {
    console.warn(
      '[EmailAlert] SMTP credentials are not configured; skipping emergency email dispatch.',
    );
    return { attempted: 0, sent: 0, failed: 0, skipped: true };
  }

  const results = await Promise.allSettled(
    validRecipients.map(({ donor, distanceKm }) =>
      sendEmergencyAlertEmail({ donor, request, hospital, distanceKm }),
    ),
  );

  let sent = 0;
  let failed = 0;

  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      sent += 1;
      return;
    }

    failed += 1;
    console.error(
      '[EmailAlert] Failed to send emergency alert email:',
      result.reason instanceof Error ? result.reason.message : 'Unknown error',
    );
  });

  return {
    attempted: validRecipients.length,
    sent,
    failed,
  };
}
