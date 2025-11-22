import { render } from "@react-email/components";
import TestEmail from "../../../emails/test-email";
import { EmailPreviewClient } from "./email-preview-client";

export default async function EmailPreviewPage() {
  // Render the email to HTML
  const emailHtml = await render(<TestEmail recipientName="Preview User" />);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Email Template Preview
          </h1>
          <p className="text-gray-600">
            New Earth Collective Branded Test Email
          </p>
        </div>

        <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Template Information
          </h2>
          <dl className="space-y-2">
            <div className="flex">
              <dt className="w-32 font-medium text-gray-700">Template:</dt>
              <dd className="text-gray-600">test-email.tsx</dd>
            </div>
            <div className="flex">
              <dt className="w-32 font-medium text-gray-700">Location:</dt>
              <dd className="text-gray-600">/emails/test-email.tsx</dd>
            </div>
            <div className="flex">
              <dt className="w-32 font-medium text-gray-700">Brand Colors:</dt>
              <dd className="text-gray-600">
                Golden (#FACF39), Charcoal (#393E46)
              </dd>
            </div>
          </dl>
        </div>

        <EmailPreviewClient emailHtml={emailHtml} />

        <div className="mt-8 rounded-lg bg-blue-50 p-6">
          <h3 className="mb-2 text-lg font-semibold text-blue-900">
            Next Steps
          </h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                To send emails, install Resend:{" "}
                <code className="rounded bg-blue-100 px-2 py-1 text-sm">
                  npm install resend
                </code>
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                Create an API route at{" "}
                <code className="rounded bg-blue-100 px-2 py-1 text-sm">
                  /api/send-email/route.ts
                </code>
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                Add your Resend API key to{" "}
                <code className="rounded bg-blue-100 px-2 py-1 text-sm">
                  .env
                </code>
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Customize the email content in emails/test-email.tsx</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
