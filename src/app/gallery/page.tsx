"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "~/trpc/react";
import { Images } from "lucide-react";
import { BackButton } from "~/components/back-button";

function GalleriesPageContent() {
  const { data: galleries, isLoading } = api.gallery.getAll.useQuery();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [redirecting, setRedirecting] = useState(false);

  // If there's only one gallery, skip the intermediary grid and go straight to it
  useEffect(() => {
    if (isLoading) return;
    if (!galleries || galleries.length !== 1) return;

    const queryString = searchParams.toString();
    const target = `/gallery/${galleries[0]!.slug}${
      queryString ? `?${queryString}` : ""
    }`;
    setRedirecting(true);
    router.replace(target);
  }, [galleries, isLoading, router, searchParams]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-emerald-500 border-r-transparent" />
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Loading galleries...
          </p>
        </div>
      </div>
    );
  }

  if (redirecting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-emerald-500 border-r-transparent" />
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Opening gallery...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-slate-100 dark:from-slate-950 dark:via-emerald-950/20 dark:to-slate-900">
      {/* Header */}
      <div className="relative bg-white/80 backdrop-blur-md dark:bg-slate-900/80">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Back Button */}
          <div className="mb-6">
            <BackButton label="Back to Hub" />
          </div>

          <div className="text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
              <Images className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
              Photo Galleries
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-slate-600 dark:text-slate-400">
              Explore moments of connection, celebration, and transformation from
              the New Earth Collective community
            </p>
          </div>
        </div>
      </div>

      {/* Galleries Grid */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {galleries && galleries.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {galleries.map((gallery) => {
              const slugPath = gallery.slug.startsWith("gallery-")
                ? gallery.slug
                : `gallery-${gallery.slug}`;

              return (
                <Link
                  key={gallery.id}
                  href={`/${slugPath}`}
                  className="group relative overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl dark:bg-slate-900"
                >
                  {/* Gallery Cover Image */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-200 dark:bg-slate-800">
                    {gallery.coverImageUrl ? (
                      <Image
                        src={gallery.coverImageUrl}
                      alt={gallery.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Images className="h-16 w-16 text-slate-400" />
                    </div>
                  )}
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>

                {/* Gallery Info */}
                <div className="p-6">
                  <h2 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
                    {gallery.title}
                  </h2>
                  {gallery.description && (
                    <p className="line-clamp-2 text-slate-600 dark:text-slate-400">
                      {gallery.description}
                    </p>
                  )}
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      View Gallery →
                    </span>
                  </div>
                </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center">
            <Images className="mx-auto mb-4 h-16 w-16 text-slate-300 dark:text-slate-700" />
            <p className="text-lg text-slate-600 dark:text-slate-400">
              No galleries available yet
            </p>
          </div>
        )}
      </div>

      {/* Footer Space */}
      <div className="h-24" />
    </div>
  );
}

export default function GalleriesPage() {
  return (
    <Suspense fallback={null}>
      <GalleriesPageContent />
    </Suspense>
  );
}
