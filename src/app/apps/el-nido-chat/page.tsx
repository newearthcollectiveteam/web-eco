"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Send,
  Plus,
  MessageCircle,
  ChevronLeft,
  Menu,
  Trash2,
  X,
} from "lucide-react";
import { EL_NIDO_FAQ_PROMPTS } from "~/lib/microapps/el-nido-chat/system-prompt";

// ── Types ────────────────────────────────────────────────────
interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Thread {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

// ── localStorage helpers ─────────────────────────────────────
const STORAGE_KEY = "el-nido-chat-threads";

function loadThreads(): Thread[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Thread[]) : [];
  } catch {
    return [];
  }
}

function saveThreads(threads: Thread[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
  } catch {
    // Storage full or unavailable
  }
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ── Component ────────────────────────────────────────────────
export default function ElNidoChatPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const loaded = loadThreads();
    setThreads(loaded);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (threads.length > 0) saveThreads(threads);
  }, [threads]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [threads, activeThreadId]);

  const activeThread = threads.find((t) => t.id === activeThreadId) ?? null;

  const createThread = useCallback(() => {
    const thread: Thread = {
      id: generateId(),
      title: "New Chat",
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setThreads((prev) => [thread, ...prev]);
    setActiveThreadId(thread.id);
    setSidebarOpen(false);
    setTimeout(() => inputRef.current?.focus(), 100);
    return thread.id;
  }, []);

  const deleteThread = useCallback(
    (id: string) => {
      setThreads((prev) => {
        const next = prev.filter((t) => t.id !== id);
        saveThreads(next);
        return next;
      });
      if (activeThreadId === id) setActiveThreadId(null);
    },
    [activeThreadId],
  );

  const sendMessage = useCallback(
    async (text: string, threadId?: string) => {
      const content = text.trim();
      if (!content || isStreaming) return;

      // Create thread if needed
      let tid = threadId ?? activeThreadId;
      if (!tid) {
        const newThread: Thread = {
          id: generateId(),
          title: "New Chat",
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        setThreads((prev) => [newThread, ...prev]);
        tid = newThread.id;
        setActiveThreadId(tid);
      }

      const userMsg: Message = { role: "user", content };
      const assistantMsg: Message = { role: "assistant", content: "" };

      // Add user message + empty assistant message for streaming in one update
      setThreads((prev) =>
        prev.map((t) => {
          if (t.id !== tid) return t;
          const title =
            t.messages.length === 0
              ? content.slice(0, 40) + (content.length > 40 ? "..." : "")
              : t.title;
          return {
            ...t,
            title,
            messages: [...t.messages, userMsg, assistantMsg],
            updatedAt: Date.now(),
          };
        }),
      );

      setInput("");
      setIsStreaming(true);

      // Fetch streamed response
      const abort = new AbortController();
      abortRef.current = abort;

      try {
        // Get current messages for API (before adding the empty assistant)
        const currentThread = threads.find((t) => t.id === tid);
        const apiMessages = [
          ...(currentThread?.messages ?? []),
          userMsg,
        ].map((m) => ({ role: m.role, content: m.content }));

        const res = await fetch("/api/chat/el-nido", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: apiMessages }),
          signal: abort.signal,
        });

        if (!res.ok) throw new Error("Chat request failed");

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6);
            if (data === "[DONE]") break;

            try {
              const parsed = JSON.parse(data) as {
                text?: string;
                error?: string;
              };
              if (parsed.error) throw new Error(parsed.error);
              if (parsed.text) {
                accumulated += parsed.text;
                const acc = accumulated;
                setThreads((prev) =>
                  prev.map((t) => {
                    if (t.id !== tid) return t;
                    const msgs = [...t.messages];
                    const last = msgs[msgs.length - 1];
                    if (last?.role === "assistant") {
                      msgs[msgs.length - 1] = { ...last, content: acc };
                    }
                    return { ...t, messages: msgs, updatedAt: Date.now() };
                  }),
                );
              }
            } catch {
              // Skip malformed chunks
            }
          }
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          const errorText =
            "Sorry, I had trouble responding. Please try again.";
          setThreads((prev) =>
            prev.map((t) => {
              if (t.id !== tid) return t;
              const msgs = [...t.messages];
              const last = msgs[msgs.length - 1];
              if (last?.role === "assistant") {
                msgs[msgs.length - 1] = { ...last, content: errorText };
              }
              return { ...t, messages: msgs };
            }),
          );
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [activeThreadId, isStreaming, threads],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage(input);
    }
  };

  // ── Render ───────────────────────────────────────────────
  return (
    <div className="flex h-[100dvh] overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/10 bg-[#0a0a0a] transition-transform md:relative md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <span
            className="text-sm font-bold tracking-wide text-[#facf39]"
            style={{ fontFamily: "Airwaves, sans-serif" }}
          >
            El Nido Chat
          </span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded p-1 text-gray-400 hover:text-white md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <button
          onClick={createThread}
          className="mx-3 mt-3 flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2.5 text-sm text-gray-300 transition-colors hover:border-white/20 hover:bg-white/5 hover:text-white"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </button>

        <div className="mt-3 flex-1 overflow-y-auto px-3">
          {threads.map((t) => (
            <div
              key={t.id}
              className={`group mb-1 flex items-center rounded-lg transition-colors ${
                t.id === activeThreadId
                  ? "bg-white/10 text-white"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <button
                onClick={() => {
                  setActiveThreadId(t.id);
                  setSidebarOpen(false);
                }}
                className="min-w-0 flex-1 px-3 py-2.5 text-left text-sm"
              >
                <span className="block truncate">{t.title}</span>
                <span className="text-[10px] text-gray-600">
                  {new Date(t.updatedAt).toLocaleDateString()}
                </span>
              </button>
              <button
                onClick={() => deleteThread(t.id)}
                className="mr-2 hidden rounded p-1 text-gray-500 hover:text-red-400 group-hover:block"
                title="Delete thread"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Back to Apps */}
        <a
          href="/apps"
          className="flex items-center gap-2 border-t border-white/10 px-4 py-3 text-xs text-gray-500 transition-colors hover:text-gray-300"
        >
          <ChevronLeft className="h-3 w-3" />
          All Apps
        </a>
      </aside>

      {/* Main Chat Area */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded p-1 text-gray-400 hover:text-white md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-sm font-medium text-white">
            {activeThread?.title ?? "El Nido Chat"}
          </h1>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {!activeThread || activeThread.messages.length === 0 ? (
            <WelcomeScreen
              onPromptClick={(p) => {
                setInput(p);
                setTimeout(() => inputRef.current?.focus(), 50);
              }}
            />
          ) : (
            <div className="mx-auto max-w-3xl px-4 py-4">
              {activeThread.messages.map((msg, i) => (
                <div
                  key={i}
                  className={`mb-4 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed sm:max-w-[75%] ${
                      msg.role === "user"
                        ? "bg-[#facf39]/20 text-white"
                        : "bg-white/5 text-gray-200"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <FormattedMessage content={msg.content} />
                    ) : (
                      msg.content
                    )}
                    {msg.role === "assistant" &&
                      msg.content === "" &&
                      isStreaming && (
                        <span className="inline-block animate-pulse text-gray-500">
                          ...
                        </span>
                      )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-white/10 px-4 py-3">
          <form
            onSubmit={handleSubmit}
            className="mx-auto flex max-w-3xl items-end gap-2"
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about El Nido..."
              rows={1}
              className="max-h-32 min-h-[44px] flex-1 resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-[#facf39]/40"
            />
            <button
              type="submit"
              disabled={!input.trim() || isStreaming}
              className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-xl bg-[#facf39] text-black transition-opacity disabled:opacity-30"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
          <div className="mx-auto mt-3 flex max-w-3xl items-center justify-center gap-2">
            <Image
              src="/brand/symbol.svg"
              alt="NEC"
              width={16}
              height={16}
              className="opacity-60"
            />
            <span className="text-xs text-gray-400">
              Powered by <span className="font-medium text-gray-300">New Earth Collective</span>
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}

// ── Welcome Screen with FAQ Prompts ──────────────────────────
function WelcomeScreen({
  onPromptClick,
}: {
  onPromptClick: (prompt: string) => void;
}) {
  return (
    <div className="flex h-full items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#facf39]/20">
            <MessageCircle className="h-7 w-7 text-[#facf39]" />
          </div>
          <h2
            className="mb-1 text-xl font-bold text-white sm:text-2xl"
            style={{ fontFamily: "Airwaves, sans-serif", letterSpacing: "0.05em" }}
          >
            El Nido Chat
          </h2>
          <p className="text-sm text-gray-400">
            Your guide to the El Nido stage at Envision 2026
          </p>
        </div>

        {/* Stage-specific prompts */}
        <div className="mb-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">
            El Nido Stage
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {EL_NIDO_FAQ_PROMPTS.stageSpecific.map((faq) => (
              <button
                key={faq.label}
                onClick={() => onPromptClick(faq.prompt)}
                className="rounded-xl border border-white/10 px-4 py-3 text-left text-sm text-gray-300 transition-colors hover:border-[#facf39]/30 hover:bg-white/5 hover:text-white"
              >
                {faq.label}
              </button>
            ))}
          </div>
        </div>

        {/* General festival prompts */}
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">
            General Festival
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {EL_NIDO_FAQ_PROMPTS.general.map((faq) => (
              <button
                key={faq.label}
                onClick={() => onPromptClick(faq.prompt)}
                className="rounded-xl border border-white/10 px-4 py-3 text-left text-sm text-gray-300 transition-colors hover:border-[#facf39]/30 hover:bg-white/5 hover:text-white"
              >
                {faq.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Simple Markdown-ish Formatter ────────────────────────────
function FormattedMessage({ content }: { content: string }) {
  if (!content) return null;

  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;

    if (line.startsWith("### ")) {
      elements.push(
        <p key={i} className="mb-1 mt-3 text-sm font-semibold text-white first:mt-0">
          {line.slice(4)}
        </p>,
      );
    } else if (line.startsWith("## ")) {
      elements.push(
        <p key={i} className="mb-1 mt-3 text-sm font-bold text-white first:mt-0">
          {line.slice(3)}
        </p>,
      );
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      elements.push(
        <p key={i} className="ml-3 text-sm">
          <span className="mr-1.5 text-[#facf39]">&bull;</span>
          <InlineFormat text={line.slice(2)} />
        </p>,
      );
    } else if (line.trim() === "") {
      elements.push(<div key={i} className="h-2" />);
    } else {
      elements.push(
        <p key={i} className="text-sm">
          <InlineFormat text={line} />
        </p>,
      );
    }
  }

  return <>{elements}</>;
}

function InlineFormat({ text }: { text: string }) {
  // Bold: **text**
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold text-white">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
