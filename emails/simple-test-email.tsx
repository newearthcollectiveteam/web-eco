/**
 * Simplified Branded Email Template
 *
 * Email Best Practices:
 * - Table-based layout (most compatible)
 * - Inline styles only
 * - Solid colors (no gradients - often stripped)
 * - URL-based images (base64 often blocked)
 * - Simple structure (complex CSS fails)
 * - Mobile-optimized
 */

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Hr,
} from "@react-email/components";
import * as React from "react";

// Asset URL - use localhost in development, production URL otherwise
const EMAIL_ASSET_BASE_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000/email-assets"
    : process.env.NEXT_PUBLIC_EMAIL_ASSET_BASE_URL ||
      "https://joinnewearthcollective.com/email-assets";

// Brand colors - using solid colors for email compatibility
const COLORS = {
  gold: "#FACF39", // Primary brand gold
  black: "#000000", // Pure black
  darkGray: "#1a1a1a", // Dark background
  subtleGray: "#2a2a2a", // Subtle gray for content areas
  mediumGray: "#666666", // Medium gray for secondary text
  lightGray: "#999999", // Light gray for subtle elements
  white: "#ffffff", // Pure white
  textDark: "#333333", // Body text
  textLight: "#e5e5e5", // Light text on dark
  textSubtle: "#b8b8b8", // Subtle text
};

type EmailContent = {
  heading: string;
  subheading?: string;
  paragraphs: string[];
  bullets?: string[];
  buttonText: string;
  buttonUrl: string;
  footer?: string;
};

interface SimpleTestEmailProps {
  recipientName?: string;
  emailNumber?: number;
}

export const SimpleTestEmail = ({
  recipientName = "Friend",
  emailNumber = 1,
}: SimpleTestEmailProps) => {
  // Email content based on sequence number
  const emailContent: Record<number, EmailContent> = {
    1: {
      heading: "Welcome to the Inner Circle",
      subheading: "You're officially on the waitlist.",
      paragraphs: [
        "You felt the pull. You followed it.",
        "Consider this your confirmation that the universe heard you.",
        "You're now part of the earliest circle of souls gathering around the New Earth Collective before the doors swing open.",
      ],
      buttonText: "Share the Waitlist",
      buttonUrl: "https://joinnewearthcollective.com/join-community-1",
      footer: "First 100 members keep lifetime access. You're in line.",
    },
    2: {
      heading: "A Look Inside",
      subheading: "You asked what the collective actually feels like.",
      paragraphs: [
        "While you wait, we're hosting gatherings every week to keep the energy high.",
        "Inside, you'll find experiences that keep you connected, grounded, and fully expressed.",
      ],
      bullets: [
        "Weekly community calls to connect and co-regulate",
        "Bi-weekly circles for deeper polarity work",
        "Relationship coaching calls",
        "Guided breathwork, meditations, and ceremonies",
        "A living marketplace to offer your gifts",
      ],
      buttonText: "Meet the Collective",
      buttonUrl: "https://joinnewearthcollective.com/join-community-1",
    },
    3: {
      heading: "The Founding Member Offer",
      subheading: "The first 100 humans to step in never pay a cent.",
      paragraphs: [
        "Because you're on the waitlist, you'll be the first to know when the gate opens.",
        "No payment. No upsells. Just a promise to co-create the soul of this container with us.",
        "Once we hit 100 founding members, the membership becomes paid and this window closes for good.",
      ],
      buttonText: "Prepare Your Yes",
      buttonUrl: "https://joinnewearthcollective.com/join-community-1",
      footer: "Founders = lifetime access. You're already first in line.",
    },
    4: {
      heading: "Why You're Here",
      subheading: "Waiting is part of the initiation.",
      paragraphs: [
        "The collective is for awakened souls who crave grounded community, honest mirrors, and activated purpose.",
        "Use this window to clarify what you want to offer, what support you're calling in, and the patterns you're ready to release.",
        "When the door opens, arrive as the version of you that said yes today.",
      ],
      buttonText: "Set Your Intention",
      buttonUrl: "https://joinnewearthcollective.com/join-community-1",
    },
    5: {
      heading: "Your Future Community",
      subheading: "These are the humans gathering beside you.",
      paragraphs: ["You're about to meet:"],
      bullets: [
        "Seekers and mystics who woke up before their cities did",
        "Healers, coaches, and creators ready to be witnessed",
        "Builders and quiet leaders who know they're here for more",
        "Artists reclaiming their voice and offering their medicine",
      ],
      buttonText: "Visualize Day One",
      buttonUrl: "https://joinnewearthcollective.com/join-community-1",
    },
    6: {
      heading: "We'll Be Ready For You",
      subheading: "Your seat is reserved. Stay close.",
      paragraphs: [
        "When the next message hits, it could be your invitation to step inside.",
        "Check that these emails land in your primary inbox so you don't miss the moment.",
        "If you feel someone else belongs here, send them the waitlist—they'll thank you when we open together.",
      ],
      buttonText: "Invite a Friend",
      buttonUrl: "https://joinnewearthcollective.com/join-community-1",
      footer:
        "First 100 through the portal = lifetime access. Watch your inbox.",
    },
  };

  const content = emailContent[emailNumber] ?? emailContent[1]!;

  return (
    <Html>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
        <title>New Earth Collective</title>
        <style>{`
          @font-face {
            font-family: 'Airwaves';
            src: url('${EMAIL_ASSET_BASE_URL}/Airwaves-Regular.ttf') format('truetype'),
                 url('${EMAIL_ASSET_BASE_URL}/Airwaves-Regular.otf') format('opentype');
            font-weight: 400;
            font-style: normal;
            font-display: swap;
          }

          /* Ensure header uses Airwaves */
          .brand-header {
            font-family: 'Airwaves', 'Arial Black', Impact, sans-serif !important;
          }
        `}</style>
      </Head>
      <Preview>{content.heading}</Preview>

      <Body style={bodyStyle}>
        {/* Main Container Table */}
        <table
          width="100%"
          cellPadding="0"
          cellSpacing="0"
          style={{
            backgroundColor: COLORS.darkGray,
            margin: 0,
            padding: 0,
          }}
        >
          <tr>
            <td align="center" style={{ padding: "40px 20px" }}>
              {/* Content Container */}
              <table
                width="600"
                cellPadding="0"
                cellSpacing="0"
                style={{
                  maxWidth: "600px",
                  backgroundColor: COLORS.black,
                  borderRadius: "8px",
                }}
              >
                {/* Header with Symbol */}
                <tr>
                  <td
                    align="center"
                    style={{
                      padding: "40px 20px 30px",
                      backgroundColor: COLORS.black,
                    }}
                  >
                    <Img
                      src={`${EMAIL_ASSET_BASE_URL}/symbol-email.png`}
                      alt="New Earth Collective"
                      width="80"
                      height="80"
                      style={{
                        display: "block",
                        margin: "0 auto 20px",
                        border: "none",
                      }}
                    />
                    <h1
                      className="brand-header"
                      style={{
                        color: COLORS.gold,
                        fontSize: "28px",
                        fontFamily:
                          "'Airwaves', 'Arial Black', Impact, sans-serif",
                        fontWeight: "400",
                        margin: 0,
                        padding: 0,
                        letterSpacing: "0.15em",
                        textAlign: "center",
                        lineHeight: "1.2",
                      }}
                    >
                      NEW EARTH COLLECTIVE
                    </h1>
                  </td>
                </tr>

                {/* Gold Divider */}
                <tr>
                  <td style={{ padding: 0 }}>
                    <table width="100%" cellPadding="0" cellSpacing="0">
                      <tr>
                        <td
                          style={{
                            borderTop: `1px solid ${COLORS.gold}`,
                            fontSize: 0,
                            lineHeight: 0,
                          }}
                        />
                      </tr>
                    </table>
                  </td>
                </tr>

                {/* Main Content */}
                <tr>
                  <td
                    style={{
                      padding: "40px 30px",
                      backgroundColor: COLORS.subtleGray,
                    }}
                  >
                    {/* Heading */}
                    <h2
                      style={{
                        color: COLORS.gold,
                        fontSize: "24px",
                        fontWeight: "bold",
                        margin: "0 0 16px",
                        textAlign: "center",
                        lineHeight: "1.3",
                      }}
                    >
                      {content.heading}
                    </h2>

                    {/* Subheading */}
                    {content.subheading && (
                      <p
                        style={{
                          color: COLORS.textSubtle,
                          fontSize: "16px",
                          fontWeight: "600",
                          margin: "0 0 24px",
                          textAlign: "center",
                          lineHeight: "1.4",
                        }}
                      >
                        {content.subheading}
                      </p>
                    )}

                    {/* Greeting */}
                    <p
                      style={{
                        color: COLORS.textLight,
                        fontSize: "16px",
                        margin: "0 0 20px",
                        lineHeight: "1.6",
                      }}
                    >
                      Hey {recipientName},
                    </p>

                    {/* Paragraphs */}
                    {content.paragraphs.map((paragraph, index) => (
                      <p
                        key={index}
                        style={{
                          color: COLORS.textLight,
                          fontSize: "16px",
                          margin: "0 0 16px",
                          lineHeight: "1.7",
                        }}
                      >
                        {paragraph}
                      </p>
                    ))}

                    {/* Bullets */}
                    {content.bullets && (
                      <table
                        width="100%"
                        cellPadding="0"
                        cellSpacing="0"
                        style={{ margin: "16px 0" }}
                      >
                        {content.bullets.map((bullet, index) => (
                          <tr key={index}>
                            <td
                              style={{
                                color: COLORS.gold,
                                fontSize: "16px",
                                padding: "6px 0",
                                verticalAlign: "top",
                                width: "20px",
                              }}
                            >
                              ✦
                            </td>
                            <td
                              style={{
                                color: COLORS.textLight,
                                fontSize: "16px",
                                padding: "6px 0",
                                lineHeight: "1.6",
                              }}
                            >
                              {bullet}
                            </td>
                          </tr>
                        ))}
                      </table>
                    )}

                    {/* CTA Button */}
                    <table
                      width="100%"
                      cellPadding="0"
                      cellSpacing="0"
                      style={{ margin: "30px 0" }}
                    >
                      <tr>
                        <td align="center">
                          <a
                            href={content.buttonUrl}
                            style={{
                              display: "inline-block",
                              padding: "16px 40px",
                              backgroundColor: COLORS.gold,
                              color: COLORS.black,
                              fontSize: "16px",
                              fontWeight: "bold",
                              textDecoration: "none",
                              borderRadius: "6px",
                              textAlign: "center",
                              letterSpacing: "0.05em",
                            }}
                          >
                            {content.buttonText}
                          </a>
                        </td>
                      </tr>
                    </table>

                    {/* Footer Note */}
                    {content.footer && (
                      <p
                        style={{
                          color: COLORS.gold,
                          fontSize: "14px",
                          fontWeight: "600",
                          margin: "20px 0",
                          textAlign: "center",
                          lineHeight: "1.5",
                        }}
                      >
                        {content.footer}
                      </p>
                    )}

                    {/* Signature */}
                    <p
                      style={{
                        color: COLORS.textLight,
                        fontSize: "16px",
                        margin: "30px 0 0",
                        lineHeight: "1.6",
                      }}
                    >
                      In devotion,
                      <br />
                      <strong>The New Earth Collective Team</strong>
                    </p>
                  </td>
                </tr>

                {/* Gold Divider */}
                <tr>
                  <td style={{ padding: 0 }}>
                    <table width="100%" cellPadding="0" cellSpacing="0">
                      <tr>
                        <td
                          style={{
                            borderTop: `1px solid ${COLORS.gold}`,
                            fontSize: 0,
                            lineHeight: 0,
                          }}
                        />
                      </tr>
                    </table>
                  </td>
                </tr>

                {/* Footer */}
                <tr>
                  <td
                    align="center"
                    style={{
                      padding: "30px 20px",
                      backgroundColor: COLORS.subtleGray,
                    }}
                  >
                    <p
                      style={{
                        color: COLORS.textLight,
                        fontSize: "14px",
                        margin: "0 0 10px",
                        lineHeight: "1.5",
                      }}
                    >
                      <strong>New Earth Collective</strong>
                      <br />A Global Sanctuary for Awakened Souls
                    </p>
                    <p
                      style={{
                        color: COLORS.textLight,
                        fontSize: "13px",
                        margin: "10px 0",
                      }}
                    >
                      <a
                        href="https://joinnewearthcollective.com"
                        style={{
                          color: COLORS.gold,
                          textDecoration: "none",
                          fontWeight: "600",
                        }}
                      >
                        Website
                      </a>
                      {" | "}
                      <a
                        href="https://joinnewearthcollective.com/about"
                        style={{
                          color: COLORS.gold,
                          textDecoration: "none",
                          fontWeight: "600",
                        }}
                      >
                        About
                      </a>
                      {" | "}
                      <a
                        href="https://joinnewearthcollective.com/contact"
                        style={{
                          color: COLORS.gold,
                          textDecoration: "none",
                          fontWeight: "600",
                        }}
                      >
                        Contact
                      </a>
                    </p>
                    <p
                      style={{
                        color: COLORS.mediumGray,
                        fontSize: "12px",
                        margin: "10px 0 0",
                      }}
                    >
                      © {new Date().getFullYear()} New Earth Collective. All
                      rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </Body>
    </Html>
  );
};

export default SimpleTestEmail;

// Base body style
const bodyStyle = {
  margin: 0,
  padding: 0,
  backgroundColor: COLORS.darkGray,
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};
