import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { db } from "~/server/db";
import { eventWaivers } from "~/server/db/schema";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    );
  }

  try {
    type WaiverPayload = {
      signerName?: string;
      signerEmail?: string;
      eventName?: string;
      eventDate?: string;
      eventLocation?: string;
      signatureData?: string;
      agreedToTerms?: boolean;
      agreedToPhotoVideo?: boolean;
      waiverVersion?: string;
    };

    const {
      signerName,
      signerEmail,
      eventName,
      eventDate,
      eventLocation,
      signatureData,
      agreedToTerms,
      agreedToPhotoVideo,
      waiverVersion = "1.0",
    } = body as WaiverPayload;

    // Validation
    if (!signerName?.trim()) {
      return NextResponse.json(
        { error: "Participant name is required" },
        { status: 400 }
      );
    }

    if (!signerEmail?.trim()) {
      return NextResponse.json(
        { error: "Email address is required" },
        { status: 400 }
      );
    }

    if (!emailRegex.test(signerEmail)) {
      return NextResponse.json(
        { error: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    if (!signatureData) {
      return NextResponse.json(
        { error: "Signature is required" },
        { status: 400 }
      );
    }

    if (!agreedToTerms) {
      return NextResponse.json(
        { error: "You must agree to the Event Release of Liability & Assumption of Risk" },
        { status: 400 }
      );
    }

    if (!agreedToPhotoVideo) {
      return NextResponse.json(
        { error: "You must agree to the Photo & Video Consent" },
        { status: 400 }
      );
    }

    if (!eventName || !eventDate || !eventLocation) {
      return NextResponse.json(
        { error: "Event details are required" },
        { status: 400 }
      );
    }

    // Get IP address and user agent for legal records
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ipAddress = forwardedFor?.split(",")[0]?.trim() ||
                      request.headers.get("x-real-ip") ||
                      "unknown";
    const userAgent = request.headers.get("user-agent") || undefined;

    // Store waiver in database
    const [entry] = await db
      .insert(eventWaivers)
      .values({
        signerName: signerName.trim(),
        signerEmail: signerEmail.trim().toLowerCase(),
        eventName,
        eventDate,
        eventLocation,
        signatureData,
        waiverVersion,
        agreedToTerms: agreedToTerms ?? false,
        agreedToPhotoVideo: agreedToPhotoVideo ?? false,
        ipAddress,
        userAgent,
        signedAt: new Date(),
      })
      .returning();

    console.log(`Waiver signed: ${signerName} (${signerEmail}) for ${eventName} - ID: ${entry?.id}`);

    return NextResponse.json({
      success: true,
      waiverId: entry?.id,
    });
  } catch (error) {
    console.error("Waiver submission failed:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error details:", errorMessage);
    return NextResponse.json(
      { error: "Failed to submit waiver", details: errorMessage },
      { status: 500 }
    );
  }
}
