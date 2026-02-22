"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Checkbox } from "~/components/ui/checkbox";
import Image from "next/image";
import {
  ArrowRight,
  Users,
  Heart,
  Sparkles,
  Star,
  Zap,
  Images as ImagesIcon,
  Instagram,
  Mail,
  Loader2,
} from "lucide-react";
import { api as trpc } from "~/trpc/react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "~/components/ui/carousel";

export function CommunityLandingContent() {
  const [questionnaireBaseUrl, setQuestionnaireBaseUrl] =
    useState("/questionnaire");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    willingToFillQuestionnaire: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();

  const primaryAuroraClass =
    "btn-aurora relative overflow-hidden bg-gradient-to-r from-[#f3a51c] via-[#f6c43f] to-[#f6e45b] text-black shadow-[0_10px_40px_rgba(246,196,63,0.25)]";

  // Set correct questionnaire URL based on environment
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hostname = window.location.hostname;
    const isLocal = hostname === "localhost" || hostname === "127.0.0.1";

    if (isLocal) {
      setQuestionnaireBaseUrl(
        "/questionnaire?domain=launch.joinnewearthcollective.com"
      );
    } else {
      setQuestionnaireBaseUrl("/questionnaire");
    }
  }, []);

  // Fetch gallery data
  const { data: gallery, isLoading: galleryLoading } =
    trpc.gallery.getWithImages.useQuery({
      slug: "gallery-1",
    });

  // Carousel slide tracking for 3D effect
  useEffect(() => {
    if (!carouselApi) return;

    const updateSlideClasses = () => {
      const selectedIndex = carouselApi.selectedScrollSnap();

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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
          willingToFillQuestionnaire: formData.willingToFillQuestionnaire,
          emailConsent: true, // Implicit consent via disclaimer
          smsConsent: true, // Implicit consent via disclaimer
          source: "community-landing",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to questionnaire with user data in URL parameters
        const params = new URLSearchParams({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          source: "waitlist",
          contactId: String((data as { contactId?: number }).contactId ?? ""),
        });

        // Redirect to questionnaire page
        const separator = questionnaireBaseUrl.includes("?") ? "&" : "?";
        window.location.href = `${questionnaireBaseUrl}${separator}${params.toString()}`;
      } else {
        setSubmitStatus({
          type: "error",
          message: data.error || "Something went wrong. Please try again.",
        });
      }
    } catch (error) {
      console.error("Waitlist submission failed", error);
      setSubmitStatus({
        type: "error",
        message:
          "Failed to submit. Please check your connection and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToForm = () => {
    document.getElementById("waitlist-form")?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  return (
    <>
      <style jsx>{`
        .btn-aurora::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            120deg,
            transparent 0%,
            rgba(255, 255, 255, 0.28) 35%,
            transparent 65%
          );
          transform: translateX(-120%);
          transition: transform 0.8s ease;
        }
        .btn-aurora:hover::after {
          transform: translateX(120%);
        }
        .btn-aurora {
          animation: pulseGlow 3.2s ease-in-out infinite;
        }
        @keyframes pulseGlow {
          0%,
          100% {
            box-shadow: 0 10px 40px rgba(246, 196, 63, 0.25);
          }
          50% {
            box-shadow: 0 10px 55px rgba(246, 196, 63, 0.38);
          }
        }
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
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
        /* Hover feedback: subtle glow on center image */
        .carousel-3d:hover .embla__slide.is-center {
          filter: drop-shadow(0 0 20px rgba(246, 196, 63, 0.3));
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
          height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border-radius: 0.75rem;
        }
        .image-container img {
          width: 100%;
          height: 100%;
          object-fit: contain !important;
          object-position: center !important;
        }
      `}</style>
      <style jsx global>{`
        [data-hero-cta] {
          position: relative;
          overflow: hidden;
          isolation: isolate;
        }
        [data-hero-cta] > * {
          position: relative;
          z-index: 2;
        }
        [data-hero-cta]::before {
          content: "";
          position: absolute;
          inset: -8px;
          border-radius: 9999px;
          background: radial-gradient(
            circle,
            rgba(246, 196, 63, 0.4),
            transparent 55%
          );
          opacity: 0.7;
          filter: blur(6px);
          z-index: 1;
          animation: heroPulse 3s ease-in-out infinite;
        }
        @keyframes heroPulse {
          0% {
            transform: scale(0.95);
            opacity: 0.55;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.9;
          }
          100% {
            transform: scale(0.95);
            opacity: 0.55;
          }
        }
        [data-hero-cta]::after {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.65),
            transparent
          );
          animation: buttonShimmer 10s ease-in-out infinite;
          z-index: 3;
          pointer-events: none;
        }
        @keyframes buttonShimmer {
          0% {
            left: -100%;
          }
          50% {
            left: 100%;
          }
          100% {
            left: -100%;
          }
        }
        .hero-text-shimmer {
          position: relative;
          color: #0b0b0b;
          display: inline-block;
          overflow: hidden;
        }
        .hero-text-shimmer::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.8) 45%,
            transparent 65%
          );
          transform: translateX(-120%);
          animation: heroTextSheen 10s linear infinite;
          mix-blend-mode: screen;
          pointer-events: none;
        }
        @keyframes heroTextSheen {
          0% {
            transform: translateX(-120%);
          }
          20% {
            transform: translateX(120%);
          }
          40% {
            transform: translateX(120%);
          }
          60% {
            transform: translateX(-120%);
          }
          80% {
            transform: translateX(-120%);
          }
          100% {
            transform: translateX(-120%);
          }
        }
      `}</style>
      {/* Header Navigation */}
      <header className="fixed top-0 right-0 left-0 z-50 border-b border-[#facf39]/10 bg-black/80 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10">
              <Image
                src="/brand/symbol.svg"
                alt="New Earth Collective"
                fill
                className="object-contain"
              />
            </div>
            <span
              className="bg-gradient-to-r from-[#f3a51c] via-[#f6c43f] to-[#f6e45b] bg-clip-text text-xl font-bold text-transparent"
              style={{
                fontFamily: "Airwaves, sans-serif",
                letterSpacing: "0.05em",
              }}
            >
              NEW EARTH COLLECTIVE
            </span>
          </div>
          <nav className="flex items-center gap-6">
            <Button
              size="sm"
              onClick={scrollToForm}
              className={`${primaryAuroraClass} font-bold text-black transition-all hover:scale-105`}
              style={{
                fontFamily: "Airwaves, sans-serif",
                letterSpacing: "0.05em",
              }}
            >
              Join Waitlist
            </Button>
          </nav>
        </div>
      </header>

      <div className="px-4 py-16">
        <div className="container mx-auto max-w-4xl">
          {/* Hero Section */}
          <section className="mb-20 flex min-h-[90vh] flex-col items-center justify-center pt-20 text-center md:pt-24">
            <div className="mb-8 inline-flex items-center justify-center">
              <div className="relative h-20 w-20 drop-shadow-2xl">
                <Image
                  src="/brand/symbol.svg"
                  alt="New Earth Collective"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
            <h1
              className="mb-4 text-6xl font-bold drop-shadow-2xl md:text-7xl"
              style={{
                fontFamily: "Airwaves, sans-serif",
                letterSpacing: "0.05em",
              }}
            >
              <span className="bg-gradient-to-r from-[#f3a51c] via-[#f6c43f] to-[#f6e45b] bg-clip-text text-transparent">
                THE NEW EARTH
                <br />
                COLLECTIVE
              </span>
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-2xl text-neutral-300 italic dark:text-neutral-300">
              A global sanctuary for awakened souls ready to connect, co-create,
              and rise together.
            </p>
            <Button
              size="lg"
              onClick={scrollToForm}
              data-hero-cta
              className={`${primaryAuroraClass} group px-8 py-6 text-lg font-bold shadow-2xl transition-all hover:scale-105 hover:shadow-[#facf39]/50`}
              style={{
                fontFamily: "Airwaves, sans-serif",
                letterSpacing: "0.05em",
              }}
            >
              <span>Join the Waitlist</span>
              <ArrowRight className="ml-2 h-5 w-5 text-black transition-transform group-hover:translate-x-1" />
            </Button>
          </section>

          {/* Video Section */}
          <section className="mb-20">
            <Card className="overflow-hidden border-2 border-[#facf39]/20 bg-black/60 shadow-2xl backdrop-blur-md dark:bg-black/80">
              <CardContent className="p-0">
                <div className="relative aspect-video w-full bg-black">
                  <video
                    controls
                    className="h-full w-full bg-black object-contain"
                    poster="/brand/symbol.png"
                    preload="metadata"
                    playsInline
                    style={{
                      objectFit: "contain",
                      objectPosition: "center",
                    }}
                  >
                    <source
                      src="https://www.dropbox.com/scl/fi/r59jhwqf191x25epoy7so/Join-the-New-Earth-Collective.mp4?rlkey=6100f1oere6mipjwk6t5au3p6&raw=1"
                      type="video/mp4"
                    />
                    Your browser does not support the video tag.
                  </video>
                </div>
                <div className="p-6">
                  <h3
                    className="mb-2 text-xl font-bold text-white"
                    style={{ fontFamily: "Bourton, sans-serif" }}
                  >
                    Join the New Earth Collective
                  </h3>
                  <p className="text-sm text-neutral-300 dark:text-neutral-300">
                    Discover the vision behind our community and what we&apos;re
                    building together.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* You're Not Alone Section */}
          <section className="mb-20">
            <Card className="border-2 border-[#facf39]/20 bg-black/60 shadow-2xl backdrop-blur-md dark:bg-black/80">
              <CardContent className="p-8 md:p-12">
                <div className="mb-6 flex items-center gap-3">
                  <Heart className="h-8 w-8 text-[#facf39]" />
                  <h2
                    className="text-3xl font-bold text-white md:text-4xl"
                    style={{ fontFamily: "Bourton, sans-serif" }}
                  >
                    You&apos;re Not Alone. You&apos;re Early.
                  </h2>
                </div>
                <div className="space-y-4 text-lg leading-relaxed text-neutral-300 dark:text-neutral-300">
                  <p>The world has changed. You feel it.</p>
                  <p>
                    You&apos;ve started waking up. You see through the old
                    systems. You crave real connection and a place to belong.
                  </p>
                  <p className="font-semibold text-white">
                    This is that place.
                  </p>
                  <p>
                    The{" "}
                    <span className="text-[#facf39]">New Earth Collective</span>{" "}
                    is a grounded, heart-led digital community built for people
                    on the path of awakening. A space to meet others who get it,
                    share your truth, and be supported while stepping into the
                    next version of you.
                  </p>
                </div>
                <div className="mt-8">
                  <Button
                    size="lg"
                    onClick={scrollToForm}
                    className={`${primaryAuroraClass} w-full font-bold text-black transition-all hover:scale-105 md:w-auto`}
                    style={{
                      fontFamily: "Airwaves, sans-serif",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Be First In Line
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* What Is Section */}
          <section className="mb-20">
            <Card className="border-2 border-[#facf39]/20 bg-black/60 shadow-2xl backdrop-blur-md dark:bg-black/80">
              <CardContent className="p-8 md:p-12">
                <div className="mb-6 flex items-center gap-3">
                  <Users className="h-8 w-8 text-[#facf39]" />
                  <h2
                    className="text-3xl font-bold text-white md:text-4xl"
                    style={{ fontFamily: "Bourton, sans-serif" }}
                  >
                    What Is the New Earth Collective?
                  </h2>
                </div>
                <p className="mb-6 text-lg leading-relaxed text-neutral-300 dark:text-neutral-300">
                  An online Skool community where seekers, healers, creatives,
                  and conscious humans gather to grow and serve—together.
                </p>
                <div className="mb-6">
                  <p className="mb-4 text-lg font-semibold text-white">
                    Inside, you&apos;ll find:
                  </p>
                  <ul className="space-y-3">
                    {[
                      "Weekly community calls to connect and be seen",
                      "Bi-weekly men's and women's circles",
                      "Relationship coaching calls for real partnership",
                      "Guided breathwork, meditations, astrology & more",
                      "A space to offer your gifts and receive others'",
                    ].map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Sparkles className="mt-1 h-5 w-5 shrink-0 text-[#facf39]" />
                        <span className="text-lg text-neutral-300 dark:text-neutral-300">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="mb-8 text-lg font-semibold text-white italic">
                  It&apos;s not just content. It&apos;s connection.
                </p>
                <Button
                  size="lg"
                  onClick={scrollToForm}
                  className={`${primaryAuroraClass} w-full font-bold text-black transition-all hover:scale-105 md:w-auto`}
                  style={{
                    fontFamily: "Airwaves, sans-serif",
                    letterSpacing: "0.05em",
                  }}
                >
                  Save Your Spot
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          </section>

          {/* Community Gallery Section */}
          <section className="mb-20">
            <Card className="border-2 border-[#facf39]/30 bg-gradient-to-br from-[#facf39]/10 via-black/60 to-black/60 shadow-2xl backdrop-blur-md dark:from-[#facf39]/10 dark:via-black/80 dark:to-black/80">
              <CardContent className="p-8 md:p-12">
                <div className="mb-6 flex items-center gap-3">
                  <ImagesIcon className="h-8 w-8 text-[#facf39]" />
                  <h2
                    className="text-3xl font-bold text-white md:text-4xl"
                    style={{ fontFamily: "Bourton, sans-serif" }}
                  >
                    Community Moments
                  </h2>
                </div>
                <p className="mb-8 text-lg leading-relaxed text-neutral-200 dark:text-neutral-200">
                  Glimpses of connection, celebration, and transformation from
                  our gatherings
                </p>

                {galleryLoading ? (
                  <div className="space-y-4">
                    <div className="relative animate-pulse overflow-hidden rounded-xl bg-gradient-to-r from-neutral-800/50 via-neutral-700/50 to-neutral-800/50">
                      <div className="aspect-video w-full" />
                      <div
                        className="animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                        style={{
                          backgroundSize: "200% 100%",
                          animation: "shimmer 2s infinite",
                        }}
                      />
                    </div>
                    <div className="text-center">
                      <div className="mx-auto h-4 w-48 animate-pulse rounded bg-neutral-800/50" />
                    </div>
                  </div>
                ) : gallery?.images?.length ? (
                  <>
                    <div className="relative overflow-visible rounded-xl">
                      <div
                        style={{
                          perspective: "2000px",
                          perspectiveOrigin: "center",
                        }}
                      >
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
                          autoScrollSpeed={0.5}
                          className="carousel-3d group w-full"
                        >
                          <CarouselContent className="-ml-4">
                            {gallery.images.map((image, index) => (
                              <CarouselItem
                                key={image.id}
                                className="basis-full pl-4 sm:basis-4/5 md:basis-3/4 lg:basis-2/3"
                              >
                                <div className="rounded-lg bg-black/50 p-2 shadow-xl">
                                  <div className="image-container">
                                    <Image
                                      src={image.imageUrl}
                                      alt={
                                        image.altText ||
                                        `Community photo ${index + 1}`
                                      }
                                      width={600}
                                      height={400}
                                      className="transition-transform duration-700"
                                      loading={index < 3 ? "eager" : "lazy"}
                                      priority={index < 3}
                                      quality={85}
                                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 66vw"
                                      style={{
                                        width: "100%",
                                        height: "auto",
                                        maxHeight: "400px",
                                        objectFit: "contain",
                                      }}
                                    />
                                  </div>
                                </div>
                              </CarouselItem>
                            ))}
                          </CarouselContent>
                        </Carousel>
                      </div>
                    </div>

                    <div className="mt-6 text-center text-sm text-neutral-400">
                      <p className="mb-1">
                        Hover to pause • Click and drag to explore
                      </p>
                      <p className="text-xs opacity-75">
                        Explore more moments inside the community after you join
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="py-12 text-center text-neutral-400">
                    <ImagesIcon className="mx-auto mb-4 h-16 w-16 opacity-50" />
                    <p>No gallery images available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Founding Member Section */}
          <section className="mb-20">
            <Card className="border-2 border-[#facf39]/40 bg-gradient-to-br from-[#facf39]/10 to-[#f59e0b]/10 shadow-2xl backdrop-blur-md">
              <CardContent className="p-8 md:p-12">
                <div className="mb-6 flex items-center gap-3">
                  <Star className="h-8 w-8 text-[#facf39]" />
                  <h2
                    className="text-3xl font-bold text-white md:text-4xl"
                    style={{ fontFamily: "Bourton, sans-serif" }}
                  >
                    Become a Founding Member
                  </h2>
                </div>
                <div className="mb-6 space-y-4 text-lg leading-relaxed text-neutral-200 dark:text-neutral-200">
                  <p className="text-2xl font-bold text-[#facf39]">
                    The first 100 members get free lifetime access to
                    everything.
                  </p>
                  <p>
                    After that, it becomes $20/month, and will rise as the
                    community grows.
                  </p>
                  <p className="font-semibold text-white">
                    Act now, and you become a foundational part of something
                    designed to last.
                  </p>
                </div>
                <Button
                  size="lg"
                  onClick={scrollToForm}
                  className={`${primaryAuroraClass} w-full font-bold text-black shadow-lg transition-all hover:scale-105`}
                  style={{
                    fontFamily: "Airwaves, sans-serif",
                    letterSpacing: "0.05em",
                  }}
                >
                  Claim Lifetime Access
                  <Star className="ml-2 h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          </section>

          {/* Why This, Why Now Section */}
          <section className="mb-20">
            <Card className="border-2 border-[#facf39]/20 bg-black/60 shadow-2xl backdrop-blur-md dark:bg-black/80">
              <CardContent className="p-8 md:p-12">
                <div className="mb-6 flex items-center gap-3">
                  <Zap className="h-8 w-8 text-[#facf39]" />
                  <h2
                    className="text-3xl font-bold text-white md:text-4xl"
                    style={{ fontFamily: "Bourton, sans-serif" }}
                  >
                    Why This, Why Now?
                  </h2>
                </div>
                <div className="space-y-4 text-lg leading-relaxed text-neutral-300 dark:text-neutral-300">
                  <p>Because awakening alone is hard.</p>
                  <p>Because your voice, gifts, and presence matter.</p>
                  <p>
                    Because the world needs communities built on truth,
                    connection, and mutual support.
                  </p>
                  <p className="text-xl font-bold text-white">
                    This isn&apos;t just a group. It&apos;s a movement.
                  </p>
                </div>
                <div className="mt-8">
                  <Button
                    size="lg"
                    onClick={scrollToForm}
                    className={`${primaryAuroraClass} w-full font-bold text-black transition-all hover:scale-105 md:w-auto`}
                    style={{
                      fontFamily: "Airwaves, sans-serif",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Join the Movement
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Who Is This For Section */}
          <section className="mb-20">
            <Card className="border-2 border-[#facf39]/20 bg-black/60 shadow-2xl backdrop-blur-md dark:bg-black/80">
              <CardContent className="p-8 md:p-12">
                <h2
                  className="mb-6 text-3xl font-bold text-white md:text-4xl"
                  style={{ fontFamily: "Bourton, sans-serif" }}
                >
                  Who Is This For?
                </h2>
                <ul className="mb-8 space-y-3">
                  {[
                    "The seekers who feel like outsiders",
                    "The newly awakened looking for direction",
                    "The empaths and artists ready to be seen",
                    "The quiet leaders who know they came here for more",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Sparkles className="mt-1 h-5 w-5 shrink-0 text-[#facf39]" />
                      <span className="text-lg text-neutral-300 dark:text-neutral-300">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mb-8 text-lg font-semibold text-white">
                  If that&apos;s you, this is your space.
                </p>
                <Button
                  size="lg"
                  onClick={scrollToForm}
                  className={`${primaryAuroraClass} w-full font-bold text-black transition-all hover:scale-105 md:w-auto`}
                  style={{
                    fontFamily: "Airwaves, sans-serif",
                    letterSpacing: "0.05em",
                  }}
                >
                  Enter the Portal
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          </section>

          {/* Waitlist Form Section */}
          <section id="waitlist-form" className="mb-20 scroll-mt-20">
            <Card className="border-2 border-[#facf39]/30 bg-gradient-to-br from-[#facf39]/5 via-black/70 to-black/70 shadow-2xl backdrop-blur-md dark:from-[#facf39]/5 dark:via-black/90 dark:to-black/90">
              <CardContent className="p-8 md:p-12">
                <div className="mb-6 text-center">
                  <h2
                    className="mb-4 text-3xl font-bold text-white md:text-4xl"
                    style={{ fontFamily: "Bourton, sans-serif" }}
                  >
                    Join the Waitlist
                  </h2>
                  <p className="text-lg text-neutral-300 dark:text-neutral-300">
                    Be among the first 100 founding members to receive lifetime
                    free access.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="mb-2 block text-sm font-semibold text-white"
                    >
                      Full Name *
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="border-[#facf39]/30 bg-black/40 text-white placeholder:text-neutral-500 focus:border-[#facf39] dark:bg-black/60"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-semibold text-white"
                    >
                      Email Address *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="border-[#facf39]/30 bg-black/40 text-white placeholder:text-neutral-500 focus:border-[#facf39] dark:bg-black/60"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="mb-2 block text-sm font-semibold text-white"
                    >
                      Phone Number *
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="border-[#facf39]/30 bg-black/40 text-white placeholder:text-neutral-500 focus:border-[#facf39] dark:bg-black/60"
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="mb-2 block text-sm font-semibold text-white"
                    >
                      Why do you want to join the New Earth Collective?
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleInputChange}
                      className="border-[#facf39]/30 bg-black/40 text-white placeholder:text-neutral-500 focus:border-[#facf39] dark:bg-black/60"
                      placeholder="Share what brings you here..."
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="questionnaire"
                        required
                        checked={formData.willingToFillQuestionnaire}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            willingToFillQuestionnaire: checked as boolean,
                          })
                        }
                        className="mt-0.5 h-5 w-5 border-2 border-[#facf39]/70 bg-black/40 shadow-[0_0_0_4px_rgba(250,207,57,0.15)] data-[state=checked]:border-[#facf39] data-[state=checked]:bg-[#facf39]"
                      />
                      <label
                        htmlFor="questionnaire"
                        className="cursor-pointer text-sm leading-relaxed text-neutral-300 dark:text-neutral-300"
                      >
                        I am willing to fill out an extensive questionnaire as
                        part of the community acceptance process to help us
                        build the most aligned and supportive space possible. *
                      </label>
                    </div>

                    <div className="rounded-lg border border-[#facf39]/20 bg-black/30 p-4">
                      <p className="text-xs leading-relaxed text-neutral-300 dark:text-neutral-300">
                        By submitting this form, you consent to receive emails
                        and text messages from New Earth Collective about
                        community updates, events, and questionnaire reminders.
                        Standard messaging rates may apply. You can unsubscribe
                        at any time. We respect your privacy and will handle
                        your information in accordance with our privacy policy.
                      </p>
                    </div>
                  </div>

                  {submitStatus.type && (
                    <div
                      className={`rounded-lg p-4 ${
                        submitStatus.type === "success"
                          ? "border border-green-500/30 bg-green-500/20 text-green-200"
                          : "border border-red-500/30 bg-red-500/20 text-red-200"
                      }`}
                    >
                      {submitStatus.message}
                    </div>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    className={`${primaryAuroraClass} w-full font-bold text-black shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100`}
                    style={{
                      fontFamily: "Airwaves, sans-serif",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Joining...
                      </>
                    ) : (
                      <>
                        Secure My Spot
                        <Star className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </section>

          {/* Final CTA */}
          <section className="mb-20 text-center">
            <p
              className="mb-6 text-2xl text-neutral-300 italic dark:text-neutral-300"
              style={{ fontFamily: "Bourton, sans-serif" }}
            >
              The New Earth is here. Let&apos;s build it together.
            </p>
            <Badge className="border-[#facf39]/40 bg-[#facf39]/10 px-4 py-2 text-sm text-[#facf39]">
              <Sparkles className="mr-2 h-4 w-4" />
              First 100 Members Get Lifetime Free Access
            </Badge>
          </section>

          {/* Sticky mobile CTA */}
          <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#facf39]/20 bg-black/80 p-4 backdrop-blur md:hidden">
            <div className="mx-auto max-w-3xl">
              <Button
                onClick={scrollToForm}
                className={`${primaryAuroraClass} w-full font-bold text-black`}
                size="lg"
                style={{
                  fontFamily: "Airwaves, sans-serif",
                  letterSpacing: "0.05em",
                }}
              >
                Join the Waitlist
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Footer */}
          <footer className="border-t border-[#facf39]/20 pt-12 pb-8">
            <div className="flex flex-col items-center justify-center gap-6 text-center">
              <div className="flex items-center gap-6">
                <a
                  href="https://instagram.com/newearthcollectiveco"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-neutral-300 transition-colors hover:text-[#facf39] dark:text-neutral-300"
                >
                  <Instagram className="h-5 w-5" />
                  <span>@newearthcollectiveco</span>
                </a>
                <a
                  href="mailto:community@joinnewearthcollective.com"
                  className="flex items-center gap-2 text-neutral-300 transition-colors hover:text-[#facf39] dark:text-neutral-300"
                >
                  <Mail className="h-5 w-5" />
                  <span>community@joinnewearthcollective.com</span>
                </a>
              </div>
              <p className="text-sm text-neutral-500 dark:text-neutral-500">
                © {new Date().getFullYear()} New Earth Collective. All rights
                reserved.
              </p>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}
