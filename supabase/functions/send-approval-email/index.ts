// =====================================================
// Send Approval Email - Supabase Edge Function
// =====================================================
// This function sends an approval email via Mailjet when admin approves a user
// =====================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const MAILJET_API_KEY = Deno.env.get("MAILJET_API_KEY");
const MAILJET_SECRET_KEY = Deno.env.get("MAILJET_SECRET_KEY");
const MAILJET_FROM_EMAIL =
  Deno.env.get("MAILJET_FROM_EMAIL") || "noreply@joinnewearthcollective.com";
const MAILJET_FROM_NAME =
  Deno.env.get("MAILJET_FROM_NAME") || "New Earth Collective";
const BASE_URL =
  Deno.env.get("BASE_URL") || "https://joinnewearthcollective.com";

interface RequestBody {
  user_id: string;
  email: string;
  full_name: string;
}

serve(async (req) => {
  try {
    // Only allow POST requests
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse request body
    const body: RequestBody = await req.json();
    const { user_id, email, full_name } = body;

    if (!email || !full_name) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: email, full_name" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Prepare Mailjet API credentials
    const auth = btoa(`${MAILJET_API_KEY}:${MAILJET_SECRET_KEY}`);

    // Send email via Mailjet
    const mailjetResponse = await fetch("https://api.mailjet.com/v3.1/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        Messages: [
          {
            From: {
              Email: MAILJET_FROM_EMAIL,
              Name: MAILJET_FROM_NAME,
            },
            To: [
              {
                Email: email,
                Name: full_name,
              },
            ],
            Subject: "Your New Earth Collective Account Has Been Approved! 🎉",
            TextPart: `
Hello ${full_name},

Great news! Your New Earth Collective account has been approved by our admin team.

You're now ready to complete your profile and start using the platform.

Next Steps:
1. Check your email for a verification link (if you haven't already)
2. Click the verification link to verify your email address
3. Complete your profile onboarding
4. Start exploring the New Earth Collective community!

If you have any questions, feel free to reach out.

Welcome to the community!

The New Earth Collective Team
${BASE_URL}
            `.trim(),
            HTMLPart: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Account Approved</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background-color: #393E46; padding: 40px 20px; text-align: center;">
              <h1 style="color: #FACF39; margin: 0; font-size: 28px; font-weight: bold; letter-spacing: 0.05em;">
                New Earth Collective
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="display: inline-block; background-color: #FACF39; border-radius: 50%; width: 60px; height: 60px; line-height: 60px; font-size: 30px;">
                  🎉
                </div>
              </div>

              <h2 style="color: #393E46; font-size: 24px; margin: 0 0 20px; text-align: center;">
                Account Approved!
              </h2>

              <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                Hello <strong>${full_name}</strong>,
              </p>

              <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                Great news! Your New Earth Collective account has been approved by our admin team. You're now ready to complete your profile and start using the platform.
              </p>

              <div style="background-color: #f9fafb; border-left: 4px solid #FACF39; padding: 20px; margin: 30px 0;">
                <h3 style="color: #393E46; font-size: 18px; margin: 0 0 15px;">Next Steps:</h3>
                <ol style="color: #4a5568; font-size: 15px; line-height: 1.8; margin: 0; padding-left: 20px;">
                  <li>Check your email for a verification link</li>
                  <li>Click the verification link to verify your email address</li>
                  <li>Complete your profile onboarding</li>
                  <li>Start exploring the New Earth Collective community!</li>
                </ol>
              </div>

              <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 30px 0 0;">
                If you have any questions, feel free to reach out.
              </p>

              <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 20px 0 0;">
                Welcome to the community!<br>
                <strong>The New Earth Collective Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 0 0 10px;">
                <strong>New Earth Collective</strong><br>
                Building a Regenerative Future Together
              </p>
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                <a href="${BASE_URL}" style="color: #FACF39; text-decoration: none; font-weight: 600;">Visit Website</a>
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0;">
                © ${new Date().getFullYear()} New Earth Collective. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
            `.trim(),
          },
        ],
      }),
    });

    if (!mailjetResponse.ok) {
      const errorData = await mailjetResponse.text();
      console.error("Mailjet error:", errorData);
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: errorData }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const result = await mailjetResponse.json();
    console.log("Email sent successfully:", result);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Approval email sent successfully",
        email: email,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in send-approval-email function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
