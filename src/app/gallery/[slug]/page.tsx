"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";
import { api as trpc } from "~/trpc/react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselDots,
  type CarouselApi,
} from "~/components/ui/carousel";
import { BackButton } from "~/components/back-button";

export default function GalleryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [, setCurrent] = useState(0);

  const { data: gallery, isLoading } = trpc.gallery.getWithImages.useQuery({
    slug,
  });

  useEffect(() => {
    if (!carouselApi) return;

    const updateSlideClasses = () => {
      const selectedIndex = carouselApi.selectedScrollSnap();
      setCurrent(selectedIndex);

      // Remove all classes first
      carouselApi.slideNodes().forEach((node) => {
        node.classList.remove("is-center", "is-prev", "is-next");
      });

      // Add classes to current, previous, and next slides
      const slides = carouselApi.slideNodes();
      const totalSlides = slides.length;

      if (slides[selectedIndex]) {
        slides[selectedIndex].classList.add("is-center");
      }

      // Previous slide (handles wrapping)
      const prevIndex = (selectedIndex - 1 + totalSlides) % totalSlides;
      if (slides[prevIndex]) {
        slides[prevIndex].classList.add("is-prev");
      }

      // Next slide (handles wrapping)
      const nextIndex = (selectedIndex + 1) % totalSlides;
      if (slides[nextIndex]) {
        slides[nextIndex].classList.add("is-next");
      }
    };

    updateSlideClasses();
    carouselApi.on("select", updateSlideClasses);
    carouselApi.on("reInit", updateSlideClasses);

    return () => {
      carouselApi.off("select", updateSlideClasses);
      carouselApi.off("reInit", updateSlideClasses);
    };
  }, [carouselApi]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-emerald-500 border-r-transparent" />
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Loading gallery...
          </p>
        </div>
      </div>
    );
  }

  if (!gallery) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="text-center">
          <h1 className="mb-2 text-3xl font-bold text-slate-900 dark:text-white">
            Gallery Not Found
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            The gallery you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-neutral-50 to-white dark:from-black dark:via-neutral-950 dark:to-black">
      {/* Header */}
      <div className="relative z-20 border-b border-[#facf39]/20 bg-white/80 backdrop-blur-md dark:border-[#facf39]/20 dark:bg-black/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-8 sm:px-6 lg:px-8">
          <BackButton label="Back to Hub" />
          <div className="flex-1 text-center">
            <h1
              className="mb-2 text-4xl font-bold tracking-tight text-black sm:text-5xl dark:text-white"
              style={{
                fontFamily: "Airwaves, sans-serif",
                letterSpacing: "0.05em",
              }}
            >
              {gallery.title}
            </h1>
            {gallery.description && (
              <p className="mx-auto max-w-2xl text-lg text-neutral-600 dark:text-neutral-400">
                {gallery.description}
              </p>
            )}
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-500">
              {gallery.images.length} photos
            </p>
          </div>
          <div className="hidden w-[116px] sm:block" />{" "}
          {/* spacer to balance BackButton width */}
        </div>
      </div>

      {/* Carousel Section */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <style jsx>{`
          .carousel-3d .embla__slide {
            opacity: 0.4;
            transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
            transform: scale(0.75) translateX(0);
          }

          .carousel-3d .embla__slide.is-center {
            opacity: 1;
            transform: scale(1) translateX(0);
            z-index: 10;
          }

          .carousel-3d .embla__slide:not(.is-center) {
            filter: brightness(0.7);
          }

          @media (min-width: 768px) {
            .carousel-3d .embla__slide {
              transform: scale(0.7) rotateY(15deg);
            }

            .carousel-3d .embla__slide.is-center {
              transform: scale(1) rotateY(0deg);
            }

            .carousel-3d .embla__slide.is-prev {
              transform: scale(0.8) rotateY(20deg) translateX(10%);
              z-index: 5;
            }

            .carousel-3d .embla__slide.is-next {
              transform: scale(0.8) rotateY(-20deg) translateX(-10%);
              z-index: 5;
            }
          }

          .image-container {
            position: relative;
            width: 100%;
            max-height: 400px;
          }
          @media (min-width: 640px) {
            .image-container {
              max-height: 600px;
            }
          }

          .image-container img {
            width: 100%;
            height: 100%;
            object-fit: contain !important;
          }
        `}</style>

        <div className="relative overflow-visible rounded-2xl border-2 border-[#facf39]/20 bg-white/70 shadow-xl backdrop-blur-sm dark:border-[#facf39]/20 dark:bg-neutral-900/60">
          <div style={{ perspective: "2000px", perspectiveOrigin: "center" }}>
            <Carousel
              setApi={setCarouselApi}
              opts={{
                align: "center",
                loop: true,
                dragFree: true,
                containScroll: false,
                duration: 30,
              }}
              autoScroll={true}
              autoScrollSpeed={0.8}
              className="carousel-3d w-full"
            >
              <CarouselContent className="-ml-4">
                {gallery.images.map((image, index) => (
                  <CarouselItem
                    key={image.id}
                    className="basis-full pl-4 sm:basis-4/5 md:basis-3/4 lg:basis-2/3"
                  >
                    <div className="rounded-xl bg-white/80 p-2 shadow-2xl backdrop-blur-sm dark:bg-neutral-900/80">
                      <div className="image-container overflow-hidden rounded-lg">
                        <Image
                          src={image.imageUrl}
                          alt={image.altText || `Gallery image ${index + 1}`}
                          width={image.width || 1200}
                          height={image.height || 800}
                          className="transition-transform duration-700"
                          priority={index < 5}
                          style={{
                            width: "100%",
                            height: "auto",
                            maxHeight: "600px",
                            objectFit: "contain",
                          }}
                        />
                      </div>

                      {/* Caption if available */}
                      {image.caption && (
                        <div className="p-4">
                          <p className="text-center text-sm font-medium text-neutral-700 dark:text-neutral-300">
                            {image.caption}
                          </p>
                        </div>
                      )}
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>

              {/* Navigation Controls */}
              <CarouselPrevious className="left-2 sm:left-4" />
              <CarouselNext className="right-2 sm:right-4" />
              <CarouselDots />
            </Carousel>
          </div>
        </div>

        {/* Gallery Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Continuously scrolling with smooth motion • Hover to pause • Click
            arrows or drag to navigate
          </p>
        </div>
      </div>

      {/* Footer Space */}
      <div className="h-24" />
    </div>
  );
}
