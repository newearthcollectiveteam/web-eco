import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { render } from "@react-email/components";
import SimpleTestEmail from "../../../../emails/simple-test-email";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const emailNumber = parseInt(searchParams.get("emailNumber") || "1", 10);
  const name = searchParams.get("name") || "Friend";

  try {
    const emailHtml = await render(
      SimpleTestEmail({ recipientName: name, emailNumber }),
      {
        pretty: true,
      }
    );

    return new NextResponse(emailHtml, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Error rendering email:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return new NextResponse(
      `<html><body><h1>Error rendering email</h1><pre>${errorMessage}</pre></body></html>`,
      {
        status: 500,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
        },
      }
    );
  }
}
