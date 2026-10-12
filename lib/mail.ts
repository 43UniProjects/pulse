import nodemailer from 'nodemailer';

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
                    <div style="display: inline-block; width: 44px; height: 44px; line-height: 44px; border-radius: 8px; background-color: rgba(220, 38, 38, 0.15); border: 1px solid rgba(220, 38, 38, 0.3); text-align: center;">
                      <span style="font-size: 20px; color: #dc2626; font-weight: bold;">P</span>
                    </div>
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
