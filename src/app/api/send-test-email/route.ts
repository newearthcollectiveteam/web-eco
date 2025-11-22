/**
 * Send Test Email API
 * Sends a single test email immediately for testing email rendering
 */

import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { getEmailProvider } from "~/lib/email/provider-factory";
import { render } from "@react-email/components";
import SimpleTestEmail from "../../../../emails/simple-test-email";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, emailNumber = 1 } = body;

    // Validate email
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Valid email address is required" },
        { status: 400 }
      );
    }

    // Validate email number (1-6)
    const validEmailNumber = Math.min(
      Math.max(parseInt(String(emailNumber)), 1),
      6
    );

    console.log(`📧 Sending test email #${validEmailNumber} to ${email}...`);

    // Get email provider
    const provider = getEmailProvider();

    // Render email template (using simplified template for better compatibility)
    const emailHtml = await render(
      SimpleTestEmail({
        recipientName: "Friend",
        emailNumber: validEmailNumber,
      }),
      { pretty: false }
    );

    // Ensure HTML is a string
    const htmlString = String(emailHtml);

    // Send email
    const result = await provider.send({
      to: String(email).trim(),
      subject: `Test Email #${validEmailNumber} - Quick Test [${Date.now()}]`,
      html: htmlString,
    });

    if (result.success) {
      console.log(
        `✅ Test email #${validEmailNumber} sent successfully to ${email}`
      );
      return NextResponse.json({
        success: true,
        message: `Test email #${validEmailNumber} sent to ${email}`,
        messageId: result.messageId,
      });
    } else {
      console.error(`❌ Failed to send test email:`, {
        error: result.error,
        rateLimited: result.rateLimited,
        email,
        emailNumber: validEmailNumber,
      });
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to send email",
          details: `Email: ${email}, Number: ${validEmailNumber}`,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in send-test-email API:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
