/**
 * Email Sequence Configuration System
 * Define and manage email sequences for different forms/campaigns
 */

export interface EmailInSequence {
  emailNumber: number;
  delayMinutes: number; // Delay from form submission (0 = immediate)
  subject: string;
  templateName: string;
}

export interface EmailSequenceConfig {
  name: string;
  description: string;
  isActive: boolean;
  emails: EmailInSequence[];
}

/**
 * Centralized email sequence definitions
 * Add new sequences here - they'll be auto-synced to the database
 */
export const EMAIL_SEQUENCES: Record<string, EmailSequenceConfig> = {
  /**
   * Test sequence - 6 emails over 36 hours
   * Used by /form-builder page
   * Note: Subjects include timestamp to prevent Gmail threading during testing
   */
  "test-sequence": {
    name: "test-sequence",
    description:
      "Test sequence: 4 emails in 10 minutes, then 2 more at 24h & 36h",
    isActive: true,
    emails: [
      {
        emailNumber: 1,
        delayMinutes: 0, // Immediate
        subject: `Test Email #1 - Immediate [${Date.now()}]`,
        templateName: "test-email",
      },
      {
        emailNumber: 2,
        delayMinutes: 2.5,
        subject: `Test Email #2 - 2.5 Minutes [${Date.now() + 1}]`,
        templateName: "test-email",
      },
      {
        emailNumber: 3,
        delayMinutes: 5,
        subject: `Test Email #3 - 5 Minutes [${Date.now() + 2}]`,
        templateName: "test-email",
      },
      {
        emailNumber: 4,
        delayMinutes: 7.5,
        subject: `Test Email #4 - 7.5 Minutes [${Date.now() + 3}]`,
        templateName: "test-email",
      },
      {
        emailNumber: 5,
        delayMinutes: 24 * 60, // 24 hours
        subject: `Test Email #5 - 24 Hours [${Date.now() + 4}]`,
        templateName: "test-email",
      },
      {
        emailNumber: 6,
        delayMinutes: 36 * 60, // 36 hours
        subject: `Test Email #6 - 36 Hours [${Date.now() + 5}]`,
        templateName: "test-email",
      },
    ],
  },

  /**
   * Welcome series - Standard onboarding
   * Example for future use
   */
  "welcome-series": {
    name: "welcome-series",
    description: "Standard welcome series for new members",
    isActive: false, // Not active yet
    emails: [
      {
        emailNumber: 1,
        delayMinutes: 0,
        subject: "Welcome to New Earth Collective!",
        templateName: "welcome-1",
      },
      {
        emailNumber: 2,
        delayMinutes: 24 * 60, // 1 day
        subject: "Getting Started with New Earth Collective",
        templateName: "welcome-2",
      },
      {
        emailNumber: 3,
        delayMinutes: 3 * 24 * 60, // 3 days
        subject: "Join Our Community Events",
        templateName: "welcome-3",
      },
      {
        emailNumber: 4,
        delayMinutes: 7 * 24 * 60, // 7 days
        subject: "Your Impact: One Week In",
        templateName: "welcome-4",
      },
    ],
  },

  /**
   * Launch countdown - Event promotion
   * Example for future use
   */
  "launch-countdown": {
    name: "launch-countdown",
    description: "Countdown emails for launch events",
    isActive: false, // Not active yet
    emails: [
      {
        emailNumber: 1,
        delayMinutes: 0,
        subject: "You're on the List! Get Ready for Launch",
        templateName: "launch-1",
      },
      {
        emailNumber: 2,
        delayMinutes: 2 * 24 * 60, // 2 days before
        subject: "2 Days Until Launch - Here's What to Expect",
        templateName: "launch-2",
      },
      {
        emailNumber: 3,
        delayMinutes: 24 * 60, // 1 day before
        subject: "Tomorrow's the Day! Final Details Inside",
        templateName: "launch-3",
      },
      {
        emailNumber: 4,
        delayMinutes: 0, // On launch day (manual trigger)
        subject: "🎉 We're Live! Join Us Now",
        templateName: "launch-4",
      },
    ],
  },
};

/**
 * Get a sequence configuration by name
 */
export function getSequenceConfig(
  name: string
): EmailSequenceConfig | undefined {
  return EMAIL_SEQUENCES[name];
}

/**
 * Get all active sequences
 */
export function getActiveSequences(): EmailSequenceConfig[] {
  return Object.values(EMAIL_SEQUENCES).filter((seq) => seq.isActive);
}

/**
 * Validate a sequence configuration
 */
export function validateSequence(config: EmailSequenceConfig): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!config.name || config.name.trim() === "") {
    errors.push("Sequence name is required");
  }

  if (!config.emails || config.emails.length === 0) {
    errors.push("Sequence must have at least one email");
  }

  // Check for duplicate email numbers
  const emailNumbers = config.emails.map((e) => e.emailNumber);
  const duplicates = emailNumbers.filter(
    (num, index) => emailNumbers.indexOf(num) !== index
  );
  if (duplicates.length > 0) {
    errors.push(`Duplicate email numbers found: ${duplicates.join(", ")}`);
  }

  // Validate each email
  config.emails.forEach((email, index) => {
    if (!email.subject || email.subject.trim() === "") {
      errors.push(`Email ${index + 1}: Subject is required`);
    }
    if (!email.templateName || email.templateName.trim() === "") {
      errors.push(`Email ${index + 1}: Template name is required`);
    }
    if (email.delayMinutes < 0) {
      errors.push(`Email ${index + 1}: Delay cannot be negative`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}
