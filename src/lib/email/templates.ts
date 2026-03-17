const LOGO_URL = "https://joinnewearthcollective.com/email-assets/logo.png";

/** Wraps email body content in a polished, cross-client compatible layout */
function emailLayout(body: string): string {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>New Earth Collective</title>
  <!--[if mso]>
  <style>table,td{font-family:Arial,sans-serif!important;}</style>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background-color:#ffffff;border-radius:8px;overflow:hidden;">
          <!-- Logo -->
          <tr>
            <td align="center" style="padding:32px 32px 16px;">
              <img src="${LOGO_URL}" alt="New Earth Collective" width="56" height="56" style="display:block;border:0;outline:none;" />
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:0 32px 32px;color:#1a1a1a;font-size:15px;line-height:1.6;">
              ${body}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #e5e5e5;color:#999999;font-size:12px;line-height:1.5;text-align:center;">
              New Earth Collective<br/>
              You're receiving this because you interacted with our questionnaire.<br/>
              <a href="https://joinnewearthcollective.com/unsubscribe" style="color:#999999;text-decoration:underline;">Unsubscribe</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Confirmation email sent after successful questionnaire submission */
export function confirmationEmail(displayName: string): string {
  return emailLayout(`
    <h2 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#1a1a1a;">Hey ${displayName}!</h2>
    <p style="margin:0 0 14px;">Thank you for completing the Community Alignment Questionnaire. We've received your responses and are excited to get to know you better.</p>
    <p style="margin:0 0 14px;">Our team will review your answers and reach out soon with next steps. In the meantime, feel free to explore:</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 14px;">
      <tr><td style="padding:4px 0;"><span style="color:#1a1a1a;">&#8226;&nbsp;</span><a href="https://joinnewearthcollective.com/about" style="color:#c9960a;text-decoration:underline;">About the Collective</a></td></tr>
      <tr><td style="padding:4px 0;"><span style="color:#1a1a1a;">&#8226;&nbsp;</span><a href="https://joinnewearthcollective.com/values" style="color:#c9960a;text-decoration:underline;">Our Values</a></td></tr>
      <tr><td style="padding:4px 0;"><span style="color:#1a1a1a;">&#8226;&nbsp;</span><a href="https://joinnewearthcollective.com/pathway" style="color:#c9960a;text-decoration:underline;">The Pathway</a></td></tr>
    </table>
    <p style="margin:0;">With love,<br/>The New Earth Collective Team</p>
  `);
}

/** Reminder email for abandoned questionnaire — includes resume link with referral preserved */
export function reminderEmail(displayName: string, resumeUrl: string): string {
  return emailLayout(`
    <h2 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#1a1a1a;">Hey ${displayName}, you're almost there!</h2>
    <p style="margin:0 0 14px;">We noticed you started the Community Alignment Questionnaire but didn't get a chance to finish. No worries — your spot is saved.</p>
    <p style="margin:0 0 20px;">It only takes a few more minutes, and it helps us connect you with the right people in the collective.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 20px;">
      <tr>
        <td align="center" style="background-color:#1a1a1a;border-radius:6px;">
          <a href="${resumeUrl}" style="display:inline-block;padding:12px 28px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;font-family:Arial,Helvetica,sans-serif;">Continue Questionnaire</a>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 14px;color:#666666;font-size:13px;">If you've already completed it, you can ignore this message.</p>
    <p style="margin:0;">With love,<br/>The New Earth Collective Team</p>
  `);
}
