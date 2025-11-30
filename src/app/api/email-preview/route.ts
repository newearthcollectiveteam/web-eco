"use server";

import { NextRequest } from "next/server";

// Simple map of demo email bodies keyed by sequence number
const EMAIL_TEMPLATES: Record<number, (name: string) => string> = {
  1: (name) => `
    <h1>Welcome, ${name}!</h1>
    <p>Thanks for joining the New Earth Collective. This is email #1 in the sequence.</p>
    <p>We’re excited to share regenerative tools, community highlights, and upcoming events.</p>
  `,
  2: (name) => `
    <h1>Quick Check-In, ${name}</h1>
    <p>This is email #2 (2.5 minute follow-up). Let us know what you’re building.</p>
  `,
  3: (name) => `
    <h1>Resources For You</h1>
    <p>Email #3 (5 minute follow-up). We’ve curated starter resources to help you get oriented.</p>
  `,
  4: (name) => `
    <h1>Community Spotlight</h1>
    <p>Email #4 (7.5 minute follow-up). Here’s how other members are collaborating.</p>
  `,
  5: (name) => `
    <h1>Day 2 Check-In</h1>
    <p>Email #5 (24 hour follow-up). We’d love your feedback on the onboarding flow.</p>
  `,
  6: (name) => `
    <h1>Day 2.5 Check-In</h1>
    <p>Email #6 (36 hour follow-up). Ready to join a working group? Let’s get you matched.</p>
  `,
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const emailNumber = Number(searchParams.get("emailNumber") || 1);
  const name = searchParams.get("name")?.trim() || "Friend";

  const template = EMAIL_TEMPLATES[emailNumber] || EMAIL_TEMPLATES[1]!;
  const body = template(name);

  const html = `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Email Preview ${emailNumber}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #f9fafb; color: #111827; padding: 24px; }
        .card { max-width: 640px; margin: 0 auto; background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; box-shadow: 0 10px 25px -10px rgba(0,0,0,0.15); }
        h1 { margin: 0 0 12px; font-size: 24px; color: #111827; }
        p { margin: 0 0 12px; font-size: 15px; line-height: 1.6; color: #374151; }
        .footer { margin-top: 24px; font-size: 12px; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="card">
        ${body}
        <div class="footer">
          This is a preview for testing purposes. Sequence email #${emailNumber}.
        </div>
      </div>
    </body>
  </html>`;

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
