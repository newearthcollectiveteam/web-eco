"use client";

interface EmailPreviewClientProps {
  emailHtml: string;
}

export function EmailPreviewClient({ emailHtml }: EmailPreviewClientProps) {
  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Email Preview</h2>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const win = window.open("", "_blank");
              if (win) {
                win.document.write(emailHtml);
                win.document.close();
              }
            }}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Open in New Tab
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200">
        <iframe
          srcDoc={emailHtml}
          style={{
            width: "100%",
            height: "700px",
            border: "none",
          }}
          title="Email Preview"
        />
      </div>
    </div>
  );
}
