// backend/src/mailers/templates/reset.password.ts

const appName = process.env.BETTER_AUTH_APP_NAME ?? "Finora AI";
const frontendURL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export function resetPasswordEmailTemplate(url: string) {
  return `
  <html>
    <body style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #0b1020; color: #f9fafb; padding: 32px;">
      <table width="100%" cellspacing="0" cellpadding="0" style="max-width: 520px; margin: 0 auto; background-color: #020617; border-radius: 12px; border: 1px solid rgba(148,163,184,0.35);">
        <tr>
          <td style="padding: 24px 24px 8px;">
            <h1 style="margin: 0; font-size: 24px; color: #e2e8f0;">Reset your password</h1>
          </td>
        </tr>
        <tr>
          <td style="padding: 0 24px 16px;">
            <p style="margin: 0; font-size: 14px; color: #94a3b8;">
              We received a request to reset your ${appName} password.
              Click the button below to choose a new password.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding: 0 24px 24px; text-align: center;">
            <a href="${url}" style="display: inline-block; background: linear-gradient(135deg,#22c55e,#16a34a); color: #0b1120; text-decoration: none; font-weight: 600; font-size: 14px; padding: 10px 24px; border-radius: 999px;">
              Reset password
            </a>
          </td>
        </tr>
        <tr>
          <td style="padding: 0 24px 24px;">
            <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #64748b;">
              This link will expire after a short time for your security.
              If you didn’t request this, you can safely ignore this email — your password will not change.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding: 0 24px 24px;">
            <p style="margin: 0; font-size: 12px; color: #475569;">
              If the button above doesn’t work, copy and paste this URL into your browser:
              <br />
              <a href="${url}" style="color:#22c55e; word-break: break-all;">${url}</a>
            </p>
          </td>
        </tr>
      </table>
      <p style="margin-top: 16px; font-size: 11px; text-align: center; color: #64748b;">
        © ${new Date().getFullYear()} ${appName}. All rights reserved.
      </p>
    </body>
  </html>
  `;
}

export function passwordResetSuccessTemplate() {
  return `
  <html>
    <body style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #0b1020; color: #f9fafb; padding: 32px;">
      <table width="100%" cellspacing="0" cellpadding="0" style="max-width: 520px; margin: 0 auto; background-color: #020617; border-radius: 12px; border: 1px solid rgba(148,163,184,0.35);">
        <tr>
          <td style="padding: 24px 24px 8px;">
            <h1 style="margin: 0; font-size: 22px; color: #e2e8f0;">Your password was updated</h1>
          </td>
        </tr>
        <tr>
          <td style="padding: 0 24px 20px;">
            <p style="margin: 0; font-size: 14px; color: #94a3b8;">
              The password for your ${appName} account was changed successfully.
              If this was you, no further action is needed.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding: 0 24px 24px;">
            <p style="margin: 0; font-size: 12px; color: #f97373;">
              If you didn’t make this change, we recommend resetting your password again
              and reviewing your recent activity.
            </p>
          </td>
        </tr>
      </table>
      <p style="margin-top: 16px; font-size: 11px; text-align: center; color: #64748b;">
        © ${new Date().getFullYear()} ${appName}. All rights reserved.
      </p>
    </body>
  </html>
  `;
}

export function verifyEmailTemplate(url: string) {
  return `
  <html>
    <body style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #0b1020; color: #f9fafb; padding: 32px;">
      <table width="100%" cellspacing="0" cellpadding="0" style="max-width: 520px; margin: 0 auto; background-color: #020617; border-radius: 12px; border: 1px solid rgba(148,163,184,0.35);">
        <tr>
          <td style="padding: 24px 24px 8px;">
            <h1 style="margin: 0; font-size: 24px; color: #e2e8f0;">Verify your email</h1>
          </td>
        </tr>
        <tr>
          <td style="padding: 0 24px 16px;">
            <p style="margin: 0; font-size: 14px; color: #94a3b8;">
              Welcome to ${appName}! Please confirm your email address so we can secure your account and keep you updated about your finances.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding: 0 24px 24px; text-align: center;">
            <a href="${url}" style="display: inline-block; background: linear-gradient(135deg,#22c55e,#16a34a); color: #0b1120; text-decoration: none; font-weight: 600; font-size: 14px; padding: 10px 24px; border-radius: 999px;">
              Verify email
            </a>
          </td>
        </tr>
        <tr>
          <td style="padding: 0 24px 24px;">
            <p style="margin: 0; font-size: 12px; color: #64748b;">
              If you didn’t sign up for ${appName}, you can safely ignore this email.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding: 0 24px 24px;">
            <p style="margin: 0; font-size: 12px; color: #475569;">
              If the button above doesn’t work, copy and paste this URL into your browser:
              <br />
              <a href="${url}" style="color:#22c55e; word-break: break-all;">${url}</a>
            </p>
          </td>
        </tr>
      </table>
      <p style="margin-top: 16px; font-size: 11px; text-align: center; color: #64748b;">
        © ${new Date().getFullYear()} ${appName}. All rights reserved.
      </p>
    </body>
  </html>
  `;
}

export function deleteAccountEmailTemplate(verificationUrl: string) {
  return `
  <html>
    <body style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #0b1020; color: #f9fafb; padding: 32px;">
      <table width="100%" cellspacing="0" cellpadding="0" style="max-width: 520px; margin: 0 auto; background-color: #020617; border-radius: 12px; border: 1px solid rgba(248,113,113,0.45);">
        <tr>
          <td style="padding: 24px 24px 8px;">
            <h1 style="margin: 0; font-size: 22px; color: #fecaca;">Confirm account deletion</h1>
          </td>
        </tr>
        <tr>
          <td style="padding: 0 24px 16px;">
            <p style="margin: 0; font-size: 14px; color: #fecaca;">
              You requested to permanently delete your ${appName} account.
              This action cannot be undone and all of your data will be removed.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding: 0 24px 20px; text-align: center;">
            <a href="${verificationUrl}" style="display: inline-block; background-color:#b91c1c; color:#fef2f2; text-decoration:none; font-weight:600; font-size:14px; padding:10px 24px; border-radius:999px;">
              Yes, delete my account
            </a>
          </td>
        </tr>
        <tr>
          <td style="padding: 0 24px 24px;">
            <p style="margin: 0; font-size: 12px; color:#64748b;">
              If you did not request this, please ignore this email — your account will remain active.
            </p>
          </td>
        </tr>
      </table>
      <p style="margin-top: 16px; font-size: 11px; text-align: center; color: #64748b;">
        © ${new Date().getFullYear()} ${appName}. All rights reserved.
      </p>
    </body>
  </html>
  `;
}