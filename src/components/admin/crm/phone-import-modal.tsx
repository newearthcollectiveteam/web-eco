"use client";

import { useState, useRef } from "react";
import {
  X,
  Upload,
  Smartphone,
  FileSpreadsheet,
  FileText,
  Check,
  AlertCircle,
} from "lucide-react";
import { api } from "~/trpc/react";

interface ContactEntry {
  name: string;
  email?: string;
  phone?: string;
  selected: boolean;
}

interface PhoneImportModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

// Check if Contact Picker API is available (Android Chrome)
function hasContactPicker(): boolean {
  return "contacts" in navigator && "ContactsManager" in window;
}

export function PhoneImportModal({
  onClose,
  onSuccess,
}: PhoneImportModalProps) {
  const [step, setStep] = useState<"choose" | "review" | "results">("choose");
  const [entries, setEntries] = useState<ContactEntry[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [results, setResults] = useState<{
    created: number;
    skipped: number;
    errors: string[];
  } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const bulkMutation = api.crm.bulkCreateContacts.useMutation({
    onSuccess: (data) => {
      setResults(data);
      setStep("results");
      onSuccess();
    },
  });

  // ─── Contact Picker API ──────────────────────────
  const handlePhonePicker = async () => {
    try {
      const nav = navigator as Navigator & {
        contacts: {
          select: (
            props: string[],
            opts: { multiple: boolean }
          ) => Promise<
            Array<{ name?: string[]; email?: string[]; tel?: string[] }>
          >;
        };
      };

      const picked = await nav.contacts.select(["name", "email", "tel"], {
        multiple: true,
      });

      const mapped: ContactEntry[] = picked
        .filter((c) => c.name?.[0])
        .map((c) => ({
          name: c.name?.[0] ?? "",
          email: c.email?.[0] ?? undefined,
          phone: c.tel?.[0] ?? undefined,
          selected: true,
        }));

      if (mapped.length > 0) {
        setEntries(mapped);
        setStep("review");
      }
    } catch {
      // User cancelled or API not available
    }
  };

  // ─── vCard Parser ───────────────────────────────
  const parseVCard = (text: string): ContactEntry[] => {
    const contacts: ContactEntry[] = [];
    const blocks = text.split("BEGIN:VCARD").slice(1);

    for (const block of blocks) {
      const lines = block.split(/\r?\n/);
      let name = "";
      let email: string | undefined;
      let phone: string | undefined;

      for (const line of lines) {
        const upper = line.toUpperCase();
        if (upper.startsWith("FN:") || upper.startsWith("FN;")) {
          name = line.substring(line.indexOf(":") + 1).trim();
        } else if (upper.startsWith("EMAIL:") || upper.startsWith("EMAIL;")) {
          email = line.substring(line.indexOf(":") + 1).trim();
        } else if (upper.startsWith("TEL:") || upper.startsWith("TEL;")) {
          phone = line.substring(line.indexOf(":") + 1).trim();
        }
      }

      if (name) {
        contacts.push({ name, email, phone, selected: true });
      }
    }

    return contacts;
  };

  // ─── CSV Parser ────────────────────────────────
  const parseCSV = (text: string): ContactEntry[] => {
    const lines = text.split("\n").filter((l) => l.trim());
    if (lines.length < 2) return [];

    const header = lines[0]!
      .toLowerCase()
      .split(",")
      .map((h) => h.trim().replace(/"/g, ""));
    const nameIdx = header.findIndex(
      (h) => h === "name" || h === "full name" || h === "full_name"
    );
    const emailIdx = header.findIndex(
      (h) => h === "email" || h === "e-mail" || h === "email address"
    );
    const phoneIdx = header.findIndex(
      (h) =>
        h === "phone" ||
        h === "tel" ||
        h === "telephone" ||
        h === "phone number"
    );

    if (nameIdx === -1) return [];

    const parsed: ContactEntry[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i]!.split(",").map((c) => c.trim().replace(/"/g, ""));
      const name = cols[nameIdx];
      if (!name) continue;

      parsed.push({
        name,
        email: emailIdx >= 0 ? cols[emailIdx] || undefined : undefined,
        phone: phoneIdx >= 0 ? cols[phoneIdx] || undefined : undefined,
        selected: true,
      });
    }

    return parsed;
  };

  // ─── File Import (CSV or vCard) ────────────────
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const isVCard =
        file.name.toLowerCase().endsWith(".vcf") ||
        text.includes("BEGIN:VCARD");
      const parsed = isVCard ? parseVCard(text) : parseCSV(text);

      if (parsed.length > 0) {
        setEntries(parsed);
        setStep("review");
      }
    };
    reader.readAsText(file);
  };

  // ─── Import ──────────────────────────────────────
  const handleImport = () => {
    const selected = entries.filter((e) => e.selected);
    if (selected.length === 0) return;

    bulkMutation.mutate({
      contacts: selected.map((e) => ({
        name: e.name,
        email: e.email,
        phone: e.phone,
      })),
      tags: tags.length > 0 ? tags : undefined,
    });
  };

  const toggleAll = (checked: boolean) => {
    setEntries(entries.map((e) => ({ ...e, selected: checked })));
  };

  const toggleOne = (idx: number) => {
    setEntries(
      entries.map((e, i) => (i === idx ? { ...e, selected: !e.selected } : e))
    );
  };

  const selectedCount = entries.filter((e) => e.selected).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-neutral-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h2
            className="text-lg font-bold text-white"
            style={{ fontFamily: "Airwaves, sans-serif" }}
          >
            Import Contacts
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Step 1: Choose method */}
          {step === "choose" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-400">
                Choose how to import contacts
              </p>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {/* Phone Contacts */}
                {hasContactPicker() && (
                  <button
                    onClick={handlePhonePicker}
                    className="flex flex-col items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-6 text-center transition-colors hover:border-[#facf39]/30 hover:bg-[#facf39]/5"
                  >
                    <Smartphone className="h-8 w-8 text-[#facf39]" />
                    <div>
                      <p className="font-medium text-white">Phone Contacts</p>
                      <p className="mt-1 text-xs text-gray-400">
                        Select from your phone&apos;s contact list
                      </p>
                    </div>
                  </button>
                )}

                {/* File Upload (CSV or vCard) */}
                <button
                  onClick={() => fileRef.current?.click()}
                  className="flex flex-col items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-6 text-center transition-colors hover:border-[#facf39]/30 hover:bg-[#facf39]/5"
                >
                  <FileSpreadsheet className="h-8 w-8 text-[#facf39]" />
                  <div>
                    <p className="font-medium text-white">Import from File</p>
                    <p className="mt-1 text-xs text-gray-400">
                      CSV or vCard (.vcf) file
                    </p>
                  </div>
                </button>
              </div>

              {!hasContactPicker() && (
                <div className="flex items-start gap-2 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5">
                  <FileText className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" />
                  <p className="text-xs text-gray-500">
                    <span className="font-medium text-gray-400">iOS tip:</span>{" "}
                    Open Contacts app → select contacts → Share → export as
                    vCard → upload here.
                  </p>
                </div>
              )}

              <input
                ref={fileRef}
                type="file"
                accept=".csv,.vcf"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          )}

          {/* Step 2: Review */}
          {step === "review" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">
                  {selectedCount} of {entries.length} selected
                </p>
                <label className="flex items-center gap-2 text-sm text-gray-400">
                  <input
                    type="checkbox"
                    checked={selectedCount === entries.length}
                    onChange={(e) => toggleAll(e.target.checked)}
                    className="rounded border-white/20"
                  />
                  Select All
                </label>
              </div>

              <div className="max-h-64 overflow-y-auto rounded-lg border border-white/10">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-left text-xs text-gray-500 uppercase">
                      <th className="w-8 px-3 py-2"></th>
                      <th className="px-3 py-2">Name</th>
                      <th className="hidden px-3 py-2 sm:table-cell">Email</th>
                      <th className="hidden px-3 py-2 sm:table-cell">Phone</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {entries.map((entry, i) => (
                      <tr
                        key={i}
                        className={`hover:bg-white/5 ${!entry.selected ? "opacity-40" : ""}`}
                      >
                        <td className="px-3 py-2">
                          <input
                            type="checkbox"
                            checked={entry.selected}
                            onChange={() => toggleOne(i)}
                            className="rounded border-white/20"
                          />
                        </td>
                        <td className="px-3 py-2 text-white">{entry.name}</td>
                        <td className="hidden px-3 py-2 text-gray-400 sm:table-cell">
                          {entry.email ?? "—"}
                        </td>
                        <td className="hidden px-3 py-2 text-gray-400 sm:table-cell">
                          {entry.phone ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Tags */}
              <div>
                <label className="mb-1 block text-xs text-gray-400">
                  Tags (optional)
                </label>
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full bg-[#facf39]/10 px-2.5 py-0.5 text-xs text-[#facf39]"
                    >
                      {tag}
                      <button
                        onClick={() => setTags(tags.filter((t) => t !== tag))}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const t = tagInput.trim().toLowerCase();
                        if (t && !tags.includes(t)) setTags([...tags, t]);
                        setTagInput("");
                      }
                    }}
                    placeholder="Add tag..."
                    className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-[#facf39]/50 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setStep("choose");
                    setEntries([]);
                  }}
                  className="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-400 hover:text-white"
                >
                  Back
                </button>
                <button
                  onClick={handleImport}
                  disabled={selectedCount === 0 || bulkMutation.isPending}
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#facf39] to-[#f59e0b] px-5 py-2 text-sm font-medium text-black transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  <Upload className="h-4 w-4" />
                  {bulkMutation.isPending
                    ? "Importing..."
                    : `Import ${selectedCount} Contact${selectedCount !== 1 ? "s" : ""}`}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Results */}
          {step === "results" && results && (
            <div className="space-y-4">
              <div className="rounded-lg border border-white/10 bg-white/5 p-6 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-900/50">
                  <Check className="h-6 w-6 text-green-400" />
                </div>
                <p className="text-lg font-medium text-white">
                  Import Complete
                </p>
                <div className="mt-3 flex justify-center gap-6 text-sm">
                  <div>
                    <span className="text-2xl font-bold text-green-400">
                      {results.created}
                    </span>
                    <p className="text-gray-400">Created</p>
                  </div>
                  <div>
                    <span className="text-2xl font-bold text-yellow-400">
                      {results.skipped}
                    </span>
                    <p className="text-gray-400">Skipped</p>
                  </div>
                </div>
              </div>

              {results.errors.length > 0 && (
                <div className="rounded-lg border border-red-900/50 bg-red-900/20 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm text-red-400">
                    <AlertCircle className="h-4 w-4" />
                    {results.errors.length} error
                    {results.errors.length !== 1 ? "s" : ""}
                  </div>
                  <ul className="space-y-1 text-xs text-red-300">
                    {results.errors.slice(0, 5).map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  className="rounded-lg bg-gradient-to-r from-[#facf39] to-[#f59e0b] px-5 py-2 text-sm font-medium text-black transition-opacity hover:opacity-90"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
