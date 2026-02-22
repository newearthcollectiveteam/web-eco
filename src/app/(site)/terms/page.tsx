import { type Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | New Earth Collective",
  description:
    "Terms and conditions governing your use of New Earth Collective services, events, and platform.",
};

const EFFECTIVE_DATE = "February 21, 2026";
const CONTACT_EMAIL = "community@joinnewearthcollective.com";

export default function TermsOfServicePage() {
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
              Terms of Service
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
            Welcome to New Earth Collective. These Terms of Service
            (&ldquo;Terms&rdquo;) govern your access to and use of our website
            at{" "}
            <strong className="text-white">joinnewearthcollective.com</strong>,
            our community platform, events, and related services
            (collectively, the &ldquo;Services&rdquo;). By accessing or using
            our Services, you agree to be bound by these Terms.
          </p>

          {/* 1 */}
          <div>
            <h2 className="mb-4 text-xl font-bold text-[#FACF39]">
              1. Eligibility
            </h2>
            <p>
              By creating an account or submitting a questionnaire, you
              represent that you have the legal capacity to enter into these
              Terms.
            </p>
          </div>

          {/* 2 */}
          <div>
            <h2 className="mb-4 text-xl font-bold text-[#FACF39]">
              2. Account Registration
            </h2>
            <ul className="list-disc space-y-1 pl-6">
              <li>
                You may be required to create an account to access certain
                features.
              </li>
              <li>
                You are responsible for maintaining the confidentiality of your
                login credentials.
              </li>
              <li>
                Account access may require approval by our team. We reserve the
                right to approve or decline any account at our discretion.
              </li>
              <li>
                You agree to provide accurate, current, and complete information
                during registration.
              </li>
            </ul>
          </div>

          {/* 3 */}
          <div>
            <h2 className="mb-4 text-xl font-bold text-[#FACF39]">
              3. Community Questionnaire
            </h2>
            <p className="mb-3">
              Our community questionnaire is used to understand your interests,
              skills, and alignment with our collective values. By submitting a
              questionnaire:
            </p>
            <ul className="list-disc space-y-1 pl-6">
              <li>
                You consent to us reviewing and storing your responses as
                described in our{" "}
                <Link
                  href="/privacy"
                  className="text-[#FACF39] underline underline-offset-2 hover:text-[#FACF39]/80"
                >
                  Privacy Policy
                </Link>
                .
              </li>
              <li>
                Submission does not guarantee acceptance into any program, event,
                or community offering.
              </li>
              <li>
                We may use aggregated, anonymized questionnaire data to improve
                our programs.
              </li>
            </ul>
          </div>

          {/* 4 */}
          <div>
            <h2 className="mb-4 text-xl font-bold text-[#FACF39]">
              4. Events &amp; Gatherings
            </h2>
            <h3 className="mb-2 text-base font-semibold text-white">
              a. Registration &amp; Attendance
            </h3>
            <ul className="mb-4 list-disc space-y-1 pl-6">
              <li>
                Event registration may require completing a liability waiver,
                providing emergency contact information, and agreeing to
                event-specific rules.
              </li>
              <li>
                We reserve the right to modify event details (date, location,
                schedule) or cancel events. In case of cancellation, we will
                provide reasonable notice and applicable refunds.
              </li>
              <li>
                Event tickets and registrations are non-transferable unless
                otherwise stated.
              </li>
            </ul>

            <h3 className="mb-2 text-base font-semibold text-white">
              b. Assumption of Risk
            </h3>
            <p className="mb-4">
              Our events may include physical activities (yoga, breathwork,
              movement, outdoor activities). By attending, you acknowledge that
              participation involves inherent risks and agree to assume
              responsibility for your own well-being. Specific risk
              acknowledgments may be required via liability waivers at
              registration.
            </p>

            <h3 className="mb-2 text-base font-semibold text-white">
              c. Code of Conduct
            </h3>
            <p>
              All attendees are expected to treat others with respect, maintain
              personal boundaries, and uphold the values of the community. We
              reserve the right to remove any attendee whose behavior is
              disruptive, harmful, or inconsistent with our values, without
              refund.
            </p>
          </div>

          {/* 5 */}
          <div>
            <h2 className="mb-4 text-xl font-bold text-[#FACF39]">
              5. Impact Missions &amp; Volunteering
            </h2>
            <p className="mb-3">
              Impact Missions are organized volunteer experiences facilitated by
              New Earth Collective in partnership with third-party organizations.
            </p>
            <ul className="list-disc space-y-1 pl-6">
              <li>
                Participation is voluntary. New Earth Collective is not the
                employer or agent of any volunteer.
              </li>
              <li>
                Partner organizations may have their own terms, waivers, and
                requirements which you agree to comply with.
              </li>
              <li>
                We are not liable for injuries, losses, or damages that occur
                during volunteer activities hosted by partner organizations.
              </li>
            </ul>
          </div>

          {/* 6 */}
          <div>
            <h2 className="mb-4 text-xl font-bold text-[#FACF39]">
              6. Intellectual Property
            </h2>
            <ul className="list-disc space-y-1 pl-6">
              <li>
                All content on our website &mdash; including text, graphics,
                logos, visual effects, shaders, and design &mdash; is the
                property of New Earth Collective or its licensors and is
                protected by copyright and intellectual property laws.
              </li>
              <li>
                You may not reproduce, distribute, modify, or create derivative
                works from our content without prior written consent.
              </li>
              <li>
                By submitting content (e.g., testimonials, photos, questionnaire
                responses), you grant us a non-exclusive, royalty-free license
                to use that content for community and promotional purposes.
              </li>
            </ul>
          </div>

          {/* 7 */}
          <div>
            <h2 className="mb-4 text-xl font-bold text-[#FACF39]">
              7. Communications &amp; Email
            </h2>
            <p className="mb-3">
              By providing your email and opting in, you consent to receive:
            </p>
            <ul className="list-disc space-y-1 pl-6">
              <li>
                Transactional emails (confirmations, account updates, event
                details).
              </li>
              <li>
                Marketing emails (community updates, event announcements,
                newsletters).
              </li>
            </ul>
            <p className="mt-3">
              You may unsubscribe from marketing emails at any time via the
              unsubscribe link in each email or by contacting us. Transactional
              emails related to your account or registrations may still be sent
              as necessary.
            </p>
          </div>

          {/* 8 */}
          <div>
            <h2 className="mb-4 text-xl font-bold text-[#FACF39]">
              8. Limitation of Liability
            </h2>
            <p className="mb-3">
              To the maximum extent permitted by law:
            </p>
            <ul className="list-disc space-y-1 pl-6">
              <li>
                Our Services are provided &ldquo;as is&rdquo; and &ldquo;as
                available&rdquo; without warranties of any kind, express or
                implied.
              </li>
              <li>
                New Earth Collective shall not be liable for any indirect,
                incidental, special, consequential, or punitive damages arising
                from your use of our Services, attendance at events, or
                participation in volunteer activities.
              </li>
              <li>
                Our total liability for any claim shall not exceed the amount
                you paid to us in the 12 months preceding the claim.
              </li>
            </ul>
          </div>

          {/* 9 */}
          <div>
            <h2 className="mb-4 text-xl font-bold text-[#FACF39]">
              9. Indemnification
            </h2>
            <p>
              You agree to indemnify and hold harmless New Earth Collective, its
              organizers, volunteers, and partners from any claims, damages,
              losses, or expenses (including reasonable legal fees) arising from
              your use of our Services, violation of these Terms, or
              infringement of any third-party rights.
            </p>
          </div>

          {/* 10 */}
          <div>
            <h2 className="mb-4 text-xl font-bold text-[#FACF39]">
              10. Termination
            </h2>
            <p>
              We may suspend or terminate your access to our Services at any
              time, with or without cause, and with or without notice. Upon
              termination, your right to use the Services ceases immediately.
              Provisions that by their nature should survive termination
              (including intellectual property, limitation of liability, and
              indemnification) will continue to apply.
            </p>
          </div>

          {/* 11 */}
          <div>
            <h2 className="mb-4 text-xl font-bold text-[#FACF39]">
              11. Governing Law
            </h2>
            <p>
              These Terms are governed by and construed in accordance with the
              laws of the State of Colorado, United States, without regard to
              conflict of law principles. Any disputes arising under these Terms
              shall be resolved in the courts located in Denver, Colorado.
            </p>
          </div>

          {/* 12 */}
          <div>
            <h2 className="mb-4 text-xl font-bold text-[#FACF39]">
              12. Changes to These Terms
            </h2>
            <p>
              We reserve the right to modify these Terms at any time. Changes
              will be posted on this page with an updated effective date. Your
              continued use of our Services after changes constitutes acceptance
              of the revised Terms.
            </p>
          </div>

          {/* 13 */}
          <div>
            <h2 className="mb-4 text-xl font-bold text-[#FACF39]">
              13. Contact Us
            </h2>
            <p>
              Questions about these Terms? Contact us at{" "}
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
                href="/privacy"
                className="text-[#FACF39]/70 underline underline-offset-2 hover:text-[#FACF39]"
              >
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
