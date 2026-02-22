import Link from "next/link";
import Image from "next/image";
import { AlertCircle } from "lucide-react";

export default function AuthCodeErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4">
      <div className="w-full max-w-md">
        <div
          className="rounded-xl border bg-white/5 p-8 backdrop-blur-md"
          style={{ borderColor: "rgba(250, 207, 57, 0.3)" }}
        >
          <div className="text-center">
            <div className="mb-6 inline-flex items-center justify-center">
              <div className="relative h-14 w-14">
                <Image
                  src="/brand/symbol.svg"
                  alt="New Earth Collective"
                  fill
                  className="object-contain drop-shadow-lg"
                />
              </div>
            </div>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-900/20">
              <AlertCircle className="h-8 w-8 text-red-400" />
            </div>
            <h1
              className="mb-2 text-2xl font-bold text-white"
              style={{
                fontFamily: "Airwaves, sans-serif",
                letterSpacing: "0.05em",
              }}
            >
              Authentication Error
            </h1>
            <p className="mb-6 text-sm text-neutral-400">
              There was a problem with your authentication link
            </p>

            <div className="mb-6 space-y-2 text-left text-sm text-neutral-400">
              <p className="text-neutral-300">This could happen if:</p>
              <ul className="ml-6 list-disc space-y-1">
                <li>The link has expired (links are valid for 1 hour)</li>
                <li>The link has already been used</li>
                <li>You opened it on a different device or browser</li>
              </ul>
            </div>

            <Link
              href="/login"
              className="inline-flex w-full items-center justify-center rounded-md bg-[#FACF39] px-4 py-3 text-sm font-semibold text-black shadow-sm transition-all hover:bg-[#ffe067]"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
