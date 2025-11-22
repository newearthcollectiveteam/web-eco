import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import fs from "fs";
import path from "path";
import * as React from "react";

const DEFAULT_EMAIL_ASSET_BASE =
  "https://joinnewearthcollective.com/email-assets";
const EMAIL_ASSET_BASE_URL =
  process.env.NEXT_PUBLIC_EMAIL_ASSET_BASE_URL?.replace(/\/$/, "") ||
  DEFAULT_EMAIL_ASSET_BASE;

// Font references (loaded via @font-face)
const AIRWAVES_FONT_SRC = `${EMAIL_ASSET_BASE_URL}/Airwaves-Regular.otf`;
const getAssetUrl = (path: string) => `${EMAIL_ASSET_BASE_URL}/${path}`;

// Symbol/Logo Image - Base64 encoded for maximum email client compatibility
// Falls back to URL if base64 fails
const SYMBOL_URL = `${EMAIL_ASSET_BASE_URL}/symbol-email.png`;

// Helper function to get base64 image for symbol
function getSymbolBase64(): string {
  try {
    // Try to read the symbol from public/email-assets
    const symbolPath = path.join(
      process.cwd(),
      "public",
      "email-assets",
      "symbol-email.png"
    );
    if (fs.existsSync(symbolPath)) {
      const imageBuffer = fs.readFileSync(symbolPath);
      const base64Image = imageBuffer.toString("base64");
      return `data:image/png;base64,${base64Image}`;
    }
  } catch (error) {
    console.warn("Failed to load base64 symbol, using URL fallback:", error);
  }
  // Fallback to URL if base64 fails
  return SYMBOL_URL;
}

const SYMBOL_SRC = getSymbolBase64();

const BRAND_COLORS = {
  primary: "#FACF39",
  ink: "#F8F8F2",
  charcoal: "#050505",
  sand: "#0b0b0f",
  slate: "#e0e0e0",
};

type EmailContent = {
  heroTitle?: string;
  heroTagline?: string;
  heading: string;
  subheading?: string;
  emphasis?: string;
  paragraphs: string[];
  bullets?: string[];
  buttonText: string;
  buttonUrl?: string;
  footerNote?: string;
};

interface TestEmailProps {
  recipientName?: string;
  emailNumber?: number;
}

export const TestEmail = ({
  recipientName = "Friend",
  emailNumber = 1,
}: TestEmailProps) => {
  // Different content for each email in the sequence
  const emailContent: Record<number, EmailContent> = {
    1: {
      heroTitle: "You're In",
      heroTagline: "You just joined the waitlist — welcome home.",
      heading: "Welcome to the Inner Circle",
      subheading: "You're officially on the waitlist.",
      emphasis: "You felt the pull. You followed it.",
      paragraphs: [
        "Consider this your confirmation that the universe heard you.",
        "You’re now part of the earliest circle of souls gathering around the New Earth Collective before the doors swing open.",
        "Over the next few days you’ll get a glimpse of what’s waiting inside: the rituals, the community rhythms, and the founding-member path.",
        "Keep an eye on your inbox—these emails are how you stay close to the fire until we welcome you into the space.",
      ],
      buttonText: "Share the Waitlist",
      buttonUrl: "https://joinnewearthcollective.com/join-community-1",
      footerNote: "First 100 members keep lifetime access. You’re in line.",
    },
    2: {
      heroTitle: "While You Wait",
      heroTagline:
        "Here’s what’s unfolding inside the container you’re about to enter.",
      heading: "A Look Inside",
      subheading: "You asked what the collective actually feels like.",
      paragraphs: [
        "While you waitlist, we’re hosting gatherings every week to keep the energy high.",
        "Inside, you'll find experiences that keep you connected, grounded, and fully expressed:",
      ],
      bullets: [
        "Weekly community calls to connect, be witnessed, and co-regulate",
        "Bi-weekly men's and women's circles for deeper polarity work",
        "Relationship coaching calls to move from codependency into conscious partnership",
        "Guided breathwork, meditations, astrology drops, and seasonal ceremonies",
        "A living marketplace to offer your gifts and receive others’ medicine",
      ],
      emphasis: "And soon, you’ll be inside with us.",
      buttonText: "Meet the Collective",
      buttonUrl: "https://joinnewearthcollective.com/join-community-1",
    },
    3: {
      heroTitle: "Founders Window",
      heroTagline: "Waitlisters get first dibs on lifetime access.",
      heading: "The Founding Member Offer",
      subheading: "The first 100 humans to step in never pay a cent.",
      paragraphs: [
        "Because you’re on the waitlist, you’ll be the first to know when the gate opens.",
        "No payment. No upsells. Just a promise to co-create the soul of this container with us.",
        "Once we hit 100 founding members, the membership becomes paid and this window closes for good.",
        "Take a breath and feel into it now so when the invite lands, your answer is ready.",
      ],
      buttonText: "Prepare Your Yes",
      buttonUrl: "https://joinnewearthcollective.com/join-community-1",
      footerNote: "Founders = lifetime access. You’re already first in line.",
    },
    4: {
      heroTitle: "Orientation",
      heroTagline: "Use this moment to align your intentions.",
      heading: "Why You’re Here",
      subheading: "Waiting is part of the initiation.",
      paragraphs: [
        "The collective is for awakened souls who crave grounded community, honest mirrors, and activated purpose.",
        "Use this window to clarify what you want to offer, what support you’re calling in, and the patterns you’re ready to release.",
        "When the door opens, arrive as the version of you that said yes today.",
      ],
      emphasis: "You’re not waiting. You’re attuning.",
      buttonText: "Set Your Intention",
      buttonUrl: "https://joinnewearthcollective.com/join-community-1",
    },
    5: {
      heroTitle: "Who You’ll Meet",
      heroTagline: "The energy inside mirrors the souls on this list.",
      heading: "Your Future Community",
      subheading: "These are the humans gathering beside you.",
      paragraphs: ["You’re about to meet:"],
      bullets: [
        "Seekers and mystics who woke up before their cities did",
        "Healers, coaches, and creators ready to be truly witnessed",
        "Builders, bridgewalkers, and quiet leaders who know they’re here for more",
        "Artists reclaiming their voice and offering their medicine",
      ],
      emphasis: "You’re already one of them.",
      buttonText: "Visualize Day One",
      buttonUrl: "https://joinnewearthcollective.com/join-community-1",
    },
    6: {
      heroTitle: "Final Touch In",
      heroTagline: "Consider this the breath before the doors open.",
      heading: "We’ll Be Ready For You",
      subheading: "Your seat is reserved. Stay close.",
      paragraphs: [
        "When the next message hits, it could be your invitation to step inside.",
        "Check that these emails land in your primary inbox so you don’t miss the moment.",
        "If you feel someone else belongs here, send them the waitlist—they’ll thank you when we open together.",
      ],
      emphasis: "We’re almost home.",
      buttonText: "Invite a Friend",
      buttonUrl: "https://joinnewearthcollective.com/join-community-1",
      footerNote:
        "First 100 through the portal = lifetime access. Watch your inbox.",
    },
  };

  const content = emailContent[emailNumber] ?? emailContent[1]!;

  return (
    <Html>
      <Head>
        <style>{`
          @font-face {
            font-family: 'Airwaves';
            src: url('${AIRWAVES_FONT_SRC}') format('opentype');
            font-weight: 400;
            font-style: normal;
            font-display: swap;
          }
          @font-face {
            font-family: 'Bourton';
            src: url('${getAssetUrl("bourtonlinebold.ttf")}') format('truetype');
            font-weight: 700;
            font-style: normal;
            font-display: swap;
          }
          @media only screen and (max-width: 600px) {
            .email-container {
              width: 100% !important;
              border-radius: 14px !important;
              margin: 0 !important;
            }
            .email-content {
              padding: 28px 20px !important;
            }
            .email-button {
              width: 100% !important;
              display: block !important;
            }
            .email-header-title {
              font-size: 30px !important;
              letter-spacing: 0.08em !important;
            }
          }
        `}</style>
      </Head>
      <Preview>
        {content.heading} - New Earth Collective Email Sequence Test
      </Preview>
      <Body style={main}>
        <Container style={container} className="email-container">
          {/* Header */}
          <Section style={header}>
            <Img
              src={SYMBOL_SRC}
              alt="New Earth Collective Symbol"
              width={76}
              height={76}
              style={{
                display: "block",
                margin: "0 auto 20px",
                borderRadius: "50%",
                backgroundColor: "#000",
                maxWidth: "76px",
                border: "none",
              }}
            />
            <Heading style={headerTitle} className="email-header-title">
              NEW EARTH COLLECTIVE
            </Heading>
          </Section>

          {/* Main Content */}
          <Section style={contentSection} className="email-content">
            {content.heroTitle && (
              <Text style={eyebrow}>{content.heroTitle.toUpperCase()}</Text>
            )}
            <Heading style={h1}>{content.heading}</Heading>

            {content.subheading && (
              <Text style={subheadingStyle}>{content.subheading}</Text>
            )}

            {content.heroTagline && (
              <Text style={taglineStyle}>{content.heroTagline}</Text>
            )}

            <Text style={greeting}>Hey {recipientName},</Text>

            {content.emphasis && (
              <Text style={emphasisStyle}>{content.emphasis}</Text>
            )}

            {content.paragraphs.map((paragraph, index) => (
              <Text
                key={index}
                style={paragraph === "" ? emptyParagraph : text}
              >
                {paragraph}
              </Text>
            ))}

            {content.bullets && (
              <Section style={bulletSection}>
                {content.bullets.map((item, index) => (
                  <Text key={index} style={bulletRow}>
                    <span style={bulletIcon}>✦</span>
                    {item}
                  </Text>
                ))}
              </Section>
            )}

            {/* Call to Action */}
            <Section style={buttonContainer}>
              <Button
                style={button}
                className="email-button"
                href={content.buttonUrl || "https://joinnewearthcollective.com"}
                target="_blank"
                rel="noreferrer"
              >
                {content.buttonText}
              </Button>
            </Section>

            {content.footerNote && (
              <Text style={footerNoteStyle}>{content.footerNote}</Text>
            )}

            <Text style={signature}>
              In devotion,
              <br />
              <strong>The New Earth Collective Team</strong>
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              <strong>New Earth Collective</strong>
              <br />A Global Sanctuary for Awakened Souls
            </Text>

            <Text style={footerLinks}>
              <Link
                href="https://joinnewearthcollective.com"
                style={link}
                target="_blank"
                rel="noreferrer"
              >
                Website
              </Link>
              {" | "}
              <Link
                href="https://joinnewearthcollective.com/about"
                style={link}
                target="_blank"
                rel="noreferrer"
              >
                About
              </Link>
              {" | "}
              <Link
                href="https://joinnewearthcollective.com/contact"
                style={link}
                target="_blank"
                rel="noreferrer"
              >
                Contact
              </Link>
            </Text>

            <Text style={footerCopyright}>
              © {new Date().getFullYear()} New Earth Collective. All rights
              reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default TestEmail;

// Styles
const main = {
  background: `radial-gradient(circle at top, rgba(250, 207, 57, 0.2), transparent 55%), linear-gradient(180deg, #050505 0%, #0a0a0e 100%)`,
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
  color: BRAND_COLORS.ink,
  margin: 0,
  padding: "24px 12px",
};

const container = {
  background: "linear-gradient(180deg, #111113 0%, #0c0c10 55%, #070709 100%)",
  margin: "0 auto",
  padding: "0",
  width: "100%",
  maxWidth: "600px",
  border: `1px solid ${BRAND_COLORS.primary}22`,
  borderRadius: "18px",
  boxShadow:
    "0 20px 60px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.05)",
  overflow: "hidden" as const,
};

const header = {
  background:
    "linear-gradient(135deg, rgba(5, 5, 5, 0.95), rgba(12, 12, 12, 0.85))",
  padding: "40px 20px 35px",
  textAlign: "center" as const,
  borderBottom: `1px solid ${BRAND_COLORS.primary}33`,
  borderTopLeftRadius: "18px",
  borderTopRightRadius: "18px",
};

const logoImage = {
  display: "block",
  margin: "0 auto 20px",
  borderRadius: "50%",
  backgroundColor: "#000",
};

const headerTitle = {
  color: BRAND_COLORS.primary,
  fontSize: "36px",
  fontWeight: "400",
  fontFamily: "'Airwaves', 'Arial Black', 'Impact', sans-serif",
  letterSpacing: "0.15em",
  margin: "0",
  textAlign: "center" as const,
  lineHeight: "1.2",
};

const contentSection = {
  padding: "48px 36px",
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(0,0,0,0.18))",
  borderTop: `1px solid ${BRAND_COLORS.primary}1f`,
  borderBottom: `1px solid ${BRAND_COLORS.primary}0d`,
  boxShadow: "inset 0 0 20px rgba(0,0,0,0.4)",
};

const eyebrow = {
  color: BRAND_COLORS.primary,
  fontSize: "12px",
  letterSpacing: "0.4em",
  textTransform: "uppercase" as const,
  textAlign: "center" as const,
  margin: "0 0 12px",
};

const h1 = {
  color: BRAND_COLORS.primary,
  fontSize: "32px",
  fontWeight: "400",
  fontFamily: "'Airwaves', 'Arial Black', sans-serif",
  letterSpacing: "0.05em",
  lineHeight: "1.3",
  margin: "0 0 16px",
  textAlign: "center" as const,
};

const subheadingStyle = {
  color: "#f5f5f4",
  fontSize: "17px",
  fontWeight: "600",
  fontFamily: "'Bourton', 'Impact', sans-serif",
  lineHeight: "1.4",
  margin: "0 0 28px",
  textAlign: "center" as const,
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
};

const taglineStyle = {
  color: "#dcdcdc",
  fontSize: "18px",
  fontStyle: "italic",
  lineHeight: "1.5",
  margin: "0 0 24px",
  textAlign: "center" as const,
};

const greeting = {
  color: "#f5f5f4",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "0 0 24px",
};

const emphasisStyle = {
  color: "#e4e4e4",
  fontSize: "18px",
  fontFamily: "'Bourton', 'Impact', sans-serif",
  textTransform: "uppercase" as const,
  textAlign: "center" as const,
  letterSpacing: "0.08em",
  margin: "0 0 20px",
};

const text = {
  color: BRAND_COLORS.slate,
  fontSize: "16px",
  lineHeight: "1.8",
  margin: "0 0 16px",
};

const emptyParagraph = {
  margin: "0 0 8px",
  fontSize: "1px",
  lineHeight: "1px",
};

const signature = {
  color: BRAND_COLORS.slate,
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "40px 0 0",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "30px 0",
};

const bulletSection = {
  margin: "10px 0 20px",
};

const bulletRow = {
  color: BRAND_COLORS.slate,
  fontSize: "16px",
  lineHeight: "1.7",
  display: "flex",
  alignItems: "flex-start",
  gap: "10px",
  margin: "0 0 10px",
};

const bulletIcon = {
  color: BRAND_COLORS.primary,
  fontSize: "16px",
  lineHeight: "1.5",
  display: "inline-block",
  marginTop: "2px",
};

const button = {
  backgroundColor: BRAND_COLORS.primary,
  borderRadius: "8px",
  color: BRAND_COLORS.charcoal,
  fontSize: "18px",
  fontWeight: "700",
  fontFamily: "'Bourton', 'Impact', sans-serif",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "16px 48px",
  border: "none",
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
};

const footer = {
  background: "linear-gradient(180deg, #060606 0%, #030303 100%)",
  padding: "30px 20px",
  textAlign: "center" as const,
  borderBottomLeftRadius: "18px",
  borderBottomRightRadius: "18px",
  borderTop: `1px solid ${BRAND_COLORS.primary}22`,
};

const footerNoteStyle = {
  color: "#fde68a",
  fontSize: "14px",
  fontFamily: "'Bourton', 'Impact', sans-serif",
  textAlign: "center" as const,
  margin: "0 0 20px",
  letterSpacing: "0.05em",
};

const footerText = {
  color: "#d1d5db",
  fontSize: "14px",
  lineHeight: "1.5",
  margin: "0 0 15px",
};

const footerLinks = {
  color: "#d1d5db",
  fontSize: "14px",
  margin: "0 0 10px",
};

const link = {
  color: BRAND_COLORS.primary,
  textDecoration: "none",
  fontWeight: "600",
};

const footerCopyright = {
  color: "#9ca3af",
  fontSize: "12px",
  margin: "10px 0 0",
};
