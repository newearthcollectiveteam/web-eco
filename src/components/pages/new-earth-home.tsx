"use client";

import { Card, CardContent } from "~/components/ui/card";

export function NewEarthHomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-gray-50 dark:from-slate-950 dark:via-gray-900 dark:to-slate-900">
      <div className="container mx-auto px-4 py-16">
        <section className="text-center">
          <div className="mx-auto max-w-3xl space-y-8">
            <h1 className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-6xl font-bold text-transparent dark:from-violet-400 dark:to-purple-400">
              New Earth Collective
            </h1>
            <p className="text-muted-foreground text-2xl">Coming Soon</p>

            <Card className="border-violet-200 dark:border-violet-800/50">
              <CardContent className="p-8">
                <p className="text-muted-foreground text-lg leading-relaxed">
                  We&apos;re building something special. This space is currently
                  under development.
                  <br />
                  <br />
                  Check back soon to discover our vision for community and
                  consciousness.
                </p>
              </CardContent>
            </Card>

            <p className="text-muted-foreground text-sm">
              For development and testing, visit{" "}
              <a
                href="http://localhost:3000?domain=test.joinnewearthcollective.com"
                className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
              >
                test.joinnewearthcollective.com
              </a>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
