import { type Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | New Earth Collective",
  description:
    "How New Earth Collective collects, uses, and protects your personal information.",
};

const EFFECTIVE_DATE = "February 21, 2026";
const CONTACT_EMAIL = "community@joinnewearthcollective.com";

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-black">
      {/* Header */}
      <section className="border-b border-[#FACF39]/20 px-4 pb-12 pt-28">
        <div className="mx-auto max-w-3xl">
          <h1
            className="mb-4 text-4xl font-bold md:text-5xl"
            style={{
              fontFamily: "Airwaves, sans-serif",
              letterSpacing: "0.05em",
            }}
          >
            <span className="bg-gradient-to-r from-[#f3a51c] via-[#f6c43f] to-[#f6e45b] bg-clip-text text-transparent">
              Privacy Policy
            </span>
          </h1>
          <p className="text-sm text-white/50">
            Effective Date: {EFFECTIVE_DATE}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="px-4 py-16">
        <div className="prose-invert mx-auto max-w-3xl space-y-10 text-white/80">
          {/* Intro */}
          <p className="text-lg leading-relaxed">
            New Earth Collective (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or
            &ldquo;our&rdquo;) respects your privacy. This Privacy Policy
            explains how we collect, use, disclose, and safeguard your
            information when you visit{" "}
            <strong className="text-white">joinnewearthcollective.com</strong>{" "}
            and its subdomains, use our services, attend our events, or interact
            with us in any way.
          </p>

          {/* 1 */}
          <div>
            <h2 className="mb-4 text-xl font-bold text-[#FACF39]">
              1. Information We Collect
            </h2>
            <h3 className="mb-2 text-base font-semibold text-white">
              a. Information You Provide
            </h3>
            <ul className="mb-4 list-disc space-y-1 pl-6">
              <li>
                <strong className="text-white">Account &amp; Profile:</strong>{" "}
                Name, email address, and optional profile details when you
                create an account.
              </li>
              <li>
                <strong className="text-white">Questionnaire Responses:</strong>{" "}
                Answers you submit through our community questionnaire, including
                personal interests, skills, location, and any other information
                you choose to share.
              </li>
              <li>
                <strong className="text-white">Event Registration:</strong>{" "}
                Name, contact information, emergency contacts, dietary needs, and
                liability waiver acknowledgments when you register for events.
              </li>
              <li>
                <strong className="text-white">Communications:</strong> Messages
                you send us via email, contact forms, or social media.
              </li>
            </ul>

            <h3 className="mb-2 text-base font-semibold text-white">
              b. Information Collected Automatically
            </h3>
            <ul className="list-disc space-y-1 pl-6">
              <li>
                <strong className="text-white">Usage Data:</strong> Pages
                visited, time spent, referral source, UTM parameters, and
                interaction events (e.g., form submissions, button clicks).
              </li>
              <li>
                <strong className="text-white">Device Data:</strong> Browser
                type, operating system, screen resolution, and IP address.
              </li>
              <li>
                <strong className="text-white">Cookies &amp; Tracking:</strong>{" "}
                We use session identifiers and anonymous visitor tracking to
                understand site usage. We do not use third-party advertising
                cookies.
              </li>
            </ul>
          </div>

          {/* 2 */}
          <div>
            <h2 className="mb-4 text-xl font-bold text-[#FACF39]">
              2. How We Use Your Information
            </h2>
            <ul className="list-disc space-y-1 pl-6">
              <li>
                To process your community questionnaire and evaluate alignment.
              </li>
              <li>To register you for events and manage event logistics.</li>
              <li>
                To send transactional emails (confirmations, updates, approvals).
              </li>
              <li>
                To send marketing emails about events and community updates, only
                with your explicit consent.
              </li>
              <li>To improve our website, services, and community programs.</li>
              <li>
                To perform analytics and understand how our community engages
                with our platform.
              </li>
              <li>
                To resolve your anonymous browsing session to your identity when
                you later identify yourself (e.g., by submitting a form).
              </li>
              <li>To comply with legal obligations.</li>
            </ul>
          </div>

          {/* 3 */}
          <div>
            <h2 className="mb-4 text-xl font-bold text-[#FACF39]">
              3. Email Communications
            </h2>
            <p className="mb-3">
              We use Resend as our email service provider. When you provide your
              email and consent to communications, your email address and
              relevant profile data are shared with Resend to deliver
              transactional and marketing emails.
            </p>
            <p>
              Every marketing email includes an unsubscribe link. You may also
              unsubscribe at any time by visiting your personalized unsubscribe
              link or emailing us at{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-[#FACF39] underline underline-offset-2 hover:text-[#FACF39]/80"
              >
                {CONTACT_EMAIL}
              </a>
              . Unsubscribe requests are processed immediately.
            </p>
          </div>

          {/* 4 */}
          <div>
            <h2 className="mb-4 text-xl font-bold text-[#FACF39]">
              4. Data Storage &amp; Security
            </h2>
            <p className="mb-3">
              Your data is stored in a PostgreSQL database hosted by Supabase
              (cloud infrastructure). We use industry-standard security measures
              including:
            </p>
            <ul className="list-disc space-y-1 pl-6">
              <li>Encrypted connections (HTTPS/TLS) for all data in transit.</li>
              <li>Row-level security policies on our database.</li>
              <li>
                Authentication via Supabase Auth with approval-based access
                control.
              </li>
              <li>
                Secure, unique unsubscribe tokens for email preference
                management.
              </li>
            </ul>
            <p className="mt-3">
              No method of transmission or storage is 100% secure. While we
              strive to protect your data, we cannot guarantee absolute security.
            </p>
          </div>

          {/* 5 */}
          <div>
            <h2 className="mb-4 text-xl font-bold text-[#FACF39]">
              5. Data Sharing &amp; Third Parties
            </h2>
            <p className="mb-3">
              We do not sell your personal information. We share data only with:
            </p>
            <ul className="list-disc space-y-1 pl-6">
              <li>
                <strong className="text-white">Resend</strong> &mdash; email
                delivery.
              </li>
              <li>
                <strong className="text-white">Supabase</strong> &mdash;
                database hosting and authentication.
              </li>
              <li>
                <strong className="text-white">Vercel</strong> &mdash; website
                hosting and deployment.
              </li>
              <li>
                <strong className="text-white">Legal compliance</strong> &mdash;
                when required by law, regulation, or legal process.
              </li>
            </ul>
          </div>

          {/* 6 */}
          <div>
            <h2 className="mb-4 text-xl font-bold text-[#FACF39]">
              6. Your Rights
            </h2>
            <p className="mb-3">
              Depending on your jurisdiction, you may have the right to:
            </p>
            <ul className="list-disc space-y-1 pl-6">
              <li>
                <strong className="text-white">Access</strong> the personal data
                we hold about you.
              </li>
              <li>
                <strong className="text-white">Correct</strong> inaccurate or
                incomplete data.
              </li>
              <li>
                <strong className="text-white">Delete</strong> your personal
                data (&ldquo;right to be forgotten&rdquo;).
              </li>
              <li>
                <strong className="text-white">Withdraw consent</strong> for
                email or SMS communications at any time.
              </li>
              <li>
                <strong className="text-white">Data portability</strong> &mdash;
                receive your data in a structured, machine-readable format.
              </li>
              <li>
                <strong className="text-white">Object</strong> to processing of
                your data for certain purposes.
              </li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, email{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-[#FACF39] underline underline-offset-2 hover:text-[#FACF39]/80"
              >
                {CONTACT_EMAIL}
              </a>
              . We will respond within 30 days.
            </p>
          </div>

          {/* 7 */}
          <div>
            <h2 className="mb-4 text-xl font-bold text-[#FACF39]">
              7. Consent &amp; Compliance
            </h2>
            <p className="mb-3">
              We track consent for email and SMS communications in compliance
              with CAN-SPAM and GDPR requirements. When you submit a form with
              consent, we record:
            </p>
            <ul className="list-disc space-y-1 pl-6">
              <li>The date and time consent was granted.</li>
              <li>Your IP address at the time of consent.</li>
              <li>The specific communication channels you consented to.</li>
            </ul>
          </div>

          {/* 8 */}
          <div>
            <h2 className="mb-4 text-xl font-bold text-[#FACF39]">
              8. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. Changes will
              be posted on this page with an updated effective date. Your
              continued use of our services after changes constitutes acceptance
              of the revised policy.
            </p>
          </div>

          {/* 9 */}
          <div>
            <h2 className="mb-4 text-xl font-bold text-[#FACF39]">
              9. Contact Us
            </h2>
            <p>
              If you have questions about this Privacy Policy or your personal
              data, contact us at{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-[#FACF39] underline underline-offset-2 hover:text-[#FACF39]/80"
              >
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </div>

          {/* Cross-link */}
          <div className="border-t border-white/10 pt-8">
            <p className="text-sm text-white/50">
              See also:{" "}
              <Link
                href="/terms"
                className="text-[#FACF39]/70 underline underline-offset-2 hover:text-[#FACF39]"
              >
                Terms of Service
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
