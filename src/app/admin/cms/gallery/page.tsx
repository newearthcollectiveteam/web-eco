"use client";

import { api } from "~/trpc/react";
import { Images } from "lucide-react";

function CarouselSkeleton() {
  return (
    <div className="space-y-8">
      {[1, 2].map((i) => (
        <div key={i} className="space-y-3">
          <div className="h-6 w-40 animate-pulse rounded bg-white/10" />
          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 6 }).map((_, j) => (
              <div
                key={j}
                className="h-48 w-64 shrink-0 animate-pulse rounded-lg bg-white/5"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function GalleryCarousel({ slug }: { slug: string }) {
  const { data: gallery, isLoading } = api.gallery.getWithImages.useQuery({
    slug,
  });

  if (isLoading) {
    return (
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-48 w-64 shrink-0 animate-pulse rounded-lg bg-white/5"
          />
        ))}
      </div>
    );
  }

  if (!gallery?.images.length) {
    return (
      <div
        className="flex h-48 items-center justify-center rounded-xl border"
        style={{ borderColor: "rgba(250, 207, 57, 0.1)" }}
      >
        <p className="text-sm text-neutral-500">No images</p>
      </div>
    );
  }

  return (
    <div className="group relative">
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">
        {gallery.images.map((img) => (
          <div
            key={img.id}
            className="relative h-48 w-64 shrink-0 overflow-hidden rounded-lg bg-white/5"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.imageUrl}
              alt={img.altText ?? img.caption ?? ""}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function GalleryPage() {
  const { data: galleries, isLoading } = api.gallery.getAll.useQuery();

  if (isLoading) return <CarouselSkeleton />;

  if (!galleries?.length) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Gallery</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Community photo galleries.
          </p>
        </div>
        <div
          className="rounded-xl border py-16 text-center"
          style={{ borderColor: "rgba(250, 207, 57, 0.1)" }}
        >
          <Images className="mx-auto mb-3 h-10 w-10 text-neutral-600" />
          <p className="text-sm text-neutral-400">No galleries yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Gallery</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Community photo galleries.
        </p>
      </div>

      {galleries.map((gallery) => (
        <div key={gallery.id} className="space-y-3">
          <div className="flex items-baseline gap-3">
            <h2 className="text-lg font-semibold text-white">
              {gallery.title}
            </h2>
            {gallery.description && (
              <p className="text-sm text-neutral-500">{gallery.description}</p>
            )}
          </div>
          <GalleryCarousel slug={gallery.slug} />
        </div>
      ))}
    </div>
  );
}
