import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

const port = Number(process.env.SMTP_PORT) || 465;

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port,
  secure: port === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

interface SendVerificationEmailParams {
  to: string;
  name: string;
  url: string;
}

export async function sendVerificationEmail({
  to,
  name,
  url,
}: SendVerificationEmailParams): Promise<void> {
  const logoPath = path.join(process.cwd(), 'public', 'logo', 'logo.png');
  let logoBase64 = '';
  try {
    const logoBuffer = fs.readFileSync(logoPath);
    logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
  } catch (err) {
    console.error('[Auth] Failed to read logo file for email:', err);
  }

  const mailOptions = {
    from:
      process.env.SMTP_FROM_EMAIL ||
      `"Pulse Network" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Verify your Pulse Emergency Blood Network Account',
    text: `Hi ${name},\n\nPlease verify your email address by visiting this link: ${url}\n\nIf you did not create this account, please disregard this email.`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Email</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f4f4f5;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #09090b; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 500px; background-color: #18181b; border: 1px solid #27272a; border-radius: 12px; overflow: hidden; padding: 32px;">
                <tr>
                  <td align="center" style="padding-bottom: 24px;">
                    ${
                      logoBase64
                        ? `<img 
                            src="${logoBase64}" 
                            alt="Pulse Logo" 
                            width="44" 
                            height="44" 
                            style="display: block; width: 44px; height: 44px; margin: 0 auto; border-radius: 8px;" 
                          />`
                        : `<div style="display: inline-block; width: 44px; height: 44px; line-height: 44px; border-radius: 8px; background-color: rgba(220, 38, 38, 0.15); border: 1px solid rgba(220, 38, 38, 0.3); text-align: center;">
                            <span style="font-size: 20px; color: #dc2626; font-weight: bold;">P</span>
                          </div>`
                    }
                    <h2 style="margin: 16px 0 4px 0; color: #ffffff; font-size: 22px; font-weight: 600; letter-spacing: -0.025em;">Confirm your email</h2>
                    <p style="margin: 0; color: #a1a1aa; font-size: 14px;">Pulse Emergency Blood Network</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 24px;">
                    <p style="margin: 0 0 16px 0; color: #e4e4e7; font-size: 15px; line-height: 1.5;">
                      Hello <strong>${name}</strong>,
                    </p>
                    <p style="margin: 0; color: #a1a1aa; font-size: 14px; line-height: 1.6;">
                      Thank you for registering on Pulse. Click the link below to verify your email address and activate your account.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom: 28px;">
                    <a href="${url}" style="display: inline-block; background-color: #dc2626; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 28px; border-radius: 6px; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);">
                      Verify Account
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="border-top: 1px solid #27272a; padding-top: 20px;">
                    <p style="margin: 0 0 8px 0; color: #71717a; font-size: 12px;">
                      If the button doesn&apos;t work, copy and paste this link into your browser:
                    </p>
                    <p style="margin: 0; word-break: break-all;">
                      <a href="${url}" style="color: #dc2626; font-size: 12px; text-decoration: underline;">${url}</a>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 24px; text-align: center;">
                    <p style="margin: 0; color: #52525b; font-size: 12px;">
                      If you did not sign up for Pulse, you can safely ignore this email.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export interface SendDonationThankYouEmailParams {
  to: string;
  name: string;
  hospitalName: string;
  bloodGroup: string;
  units?: number;
  donationDate: string;
  nextEligibleDate: string;
}

export async function sendDonationThankYouEmail({
  to,
  name,
  hospitalName,
  bloodGroup,
  units = 1,
  donationDate,
  nextEligibleDate,
}: SendDonationThankYouEmailParams): Promise<void> {
  const logoPath = path.join(process.cwd(), 'public', 'logo', 'logo.png');
  let logoBase64 = '';
  try {
    const logoBuffer = fs.readFileSync(logoPath);
    logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
  } catch (err) {
    console.error('[Mail] Failed to read logo file for thank-you email:', err);
  }

  const fromEmail =
    process.env.SMTP_FROM_EMAIL ||
    `"Pulse Network" <${process.env.SMTP_USER || 'no-reply@pulse.lk'}>`;

  const mailOptions = {
    from: fromEmail,
    to,
    subject: 'Thank You for Your Blood Donation — Post-Donation Guidelines',
    text: `Dear ${name},\n\nThank you for your generous blood donation at ${hospitalName} on ${donationDate}. Your single contribution of ${units} unit(s) (${bloodGroup}) has directly assisted a patient in critical medical need.\n\nMandatory Medical Lockout Notice:\nTo allow your hemoglobin and iron stores to replenish safely, a clinical 120-day rest period is in effect. Your next eligible donation date is: ${nextEligibleDate}.\n\nRecovery Guidelines:\n- Drink plenty of fluids (an extra 4-6 glasses today)\n- Avoid strenuous physical exertion or heavy lifting for 24 hours\n- Keep the bandage on for at least 4-6 hours\n- If feeling lightheaded, sit or lie down immediately\n\nPulse Emergency Blood Network`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Thank You for Your Donation</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f4f4f5;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #09090b; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #18181b; border: 1px solid #27272a; border-radius: 12px; overflow: hidden; padding: 36px;">
                <tr>
                  <td align="center" style="padding-bottom: 24px;">
                    ${
                      logoBase64
                        ? `<img 
                            src="${logoBase64}" 
                            alt="Pulse Logo" 
                            width="48" 
                            height="48" 
                            style="display: block; width: 48px; height: 48px; margin: 0 auto; border-radius: 10px;" 
                          />`
                        : `<div style="display: inline-block; width: 48px; height: 48px; line-height: 48px; border-radius: 10px; background-color: rgba(220, 38, 38, 0.15); border: 1px solid rgba(220, 38, 38, 0.3); text-align: center;">
                            <span style="font-size: 22px; color: #dc2626; font-weight: bold;">P</span>
                          </div>`
                    }
                    <h1 style="margin: 20px 0 6px 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.025em;">
                      Thank You for Saving a Life
                    </h1>
                    <p style="margin: 0; color: #a1a1aa; font-size: 14px;">
                      Pulse Emergency Blood Network
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding-bottom: 24px; border-top: 1px solid #27272a; padding-top: 24px;">
                    <p style="margin: 0 0 16px 0; color: #e4e4e7; font-size: 15px; line-height: 1.6;">
                      Dear <strong>${name}</strong>,
                    </p>
                    <p style="margin: 0 0 20px 0; color: #a1a1aa; font-size: 14px; line-height: 1.6;">
                      On behalf of <strong>${hospitalName}</strong> and the Pulse Network, we extend our deepest gratitude for your blood donation. Your selfless act provides an immediate, life-saving lifeline to patients in emergency care.
                    </p>
                    
                    <!-- Clinical Summary Table -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #27272a/40; border: 1px solid #3f3f46; border-radius: 8px; margin-bottom: 24px;">
                      <tr>
                        <td style="padding: 12px 16px; border-bottom: 1px solid #3f3f46; color: #a1a1aa; font-size: 13px;">Facility</td>
                        <td style="padding: 12px 16px; border-bottom: 1px solid #3f3f46; color: #ffffff; font-size: 13px; font-weight: 600; text-align: right;">${hospitalName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 16px; border-bottom: 1px solid #3f3f46; color: #a1a1aa; font-size: 13px;">Blood Group Donated</td>
                        <td style="padding: 12px 16px; border-bottom: 1px solid #3f3f46; color: #ef4444; font-size: 13px; font-weight: 700; text-align: right;">${bloodGroup}</td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 16px; border-bottom: 1px solid #3f3f46; color: #a1a1aa; font-size: 13px;">Units Collected</td>
                        <td style="padding: 12px 16px; border-bottom: 1px solid #3f3f46; color: #ffffff; font-size: 13px; font-weight: 600; text-align: right;">${units} Unit (${units * 450} mL)</td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 16px; color: #a1a1aa; font-size: 13px;">Donation Date</td>
                        <td style="padding: 12px 16px; color: #ffffff; font-size: 13px; font-weight: 600; text-align: right;">${donationDate}</td>
                      </tr>
                    </table>

                    <!-- Medical Lockout Notice -->
                    <div style="background-color: rgba(30, 58, 138, 0.25); border: 1px solid rgba(59, 130, 246, 0.4); border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                      <p style="margin: 0 0 6px 0; color: #93c5fd; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">
                        120-Day Medical Recovery Period
                      </p>
                      <p style="margin: 0; color: #dbeafe; font-size: 13px; line-height: 1.5;">
                        To allow full physiological recovery of your red blood cells and iron reserves, our system has placed a 120-day medical hold on your donor profile.
                      </p>
                      <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 14px; font-weight: 600;">
                        Next Eligible Donation Date: <span style="color: #60a5fa;">${nextEligibleDate}</span>
                      </p>
                    </div>

                    <!-- Clinical Recovery Advice -->
                    <h3 style="margin: 0 0 12px 0; color: #ffffff; font-size: 15px; font-weight: 600;">
                      Essential Post-Donation Care
                    </h3>
                    <ul style="margin: 0; padding-left: 20px; color: #a1a1aa; font-size: 13px; line-height: 1.7;">
                      <li><strong style="color: #e4e4e7;">Hydrate:</strong> Drink an extra 4 to 6 glasses of water or fruit juice today.</li>
                      <li><strong style="color: #e4e4e7;">Avoid Strenuous Activity:</strong> Do not engage in heavy lifting or intense exercise for the next 24 hours.</li>
                      <li><strong style="color: #e4e4e7;">Venipuncture Dressing:</strong> Keep the bandage secure, dry, and clean for at least 4 to 6 hours.</li>
                      <li><strong style="color: #e4e4e7;">Dizziness Protocol:</strong> If feeling faint or lightheaded, stop what you are doing, sit or lie down immediately with legs elevated, and rest.</li>
                    </ul>
                  </td>
                </tr>

                <tr>
                  <td style="border-top: 1px solid #27272a; padding-top: 24px; text-align: center;">
                    <p style="margin: 0 0 6px 0; color: #71717a; font-size: 12px;">
                      This notification confirms verified clinical intake via the Pulse Emergency Network.
                    </p>
                    <p style="margin: 0; color: #52525b; font-size: 11px;">
                      Pulse Network &bull; Operating in accordance with National Blood Transfusion Standards
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
}
