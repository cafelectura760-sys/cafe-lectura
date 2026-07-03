"use client";

import { useEffect, useMemo, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import {
  ArrowLeft,
  ArrowRight,
  Pause,
  Play,
  Quote,
  UserRound,
} from "lucide-react";

import { BorderGlowSlot } from "@/components/react-bits/border-glow-slot";
import { ScrollRevealText } from "@/components/react-bits/scroll-reveal-text";
import { cn } from "@/lib/utils";

export type MemberVoiceTone = "dune" | "verde" | "teal" | "casa";

export type MemberVoice = {
  id: string;
  name: string;
  role: string;
  focus: string;
  badge: string;
  quote: string;
  highlight?: string;
  clubContext?: string;
  readingContext?: string;
  tone?: MemberVoiceTone;
};

type MemberVoicesCarouselProps = {
  voices: MemberVoice[];
};

export function MemberVoicesCarousel({ voices }: MemberVoicesCarouselProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(true);
  const autoplayPlugins = useMemo(
    () =>
      prefersReducedMotion
        ? []
        : [
            Autoplay({
              delay: 8200,
              stopOnFocusIn: false,
              stopOnInteraction: false,
              stopOnMouseEnter: false,
            }),
          ],
    [prefersReducedMotion],
  );
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      align: "start",
      loop: true,
    },
    autoplayPlugins,
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [isAutoplayPlaying, setIsAutoplayPlaying] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => {
      mediaQuery.removeEventListener("change", updatePreference);
    };
  }, []);

  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    const syncState = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
      setScrollSnaps(emblaApi.scrollSnapList());
      setIsAutoplayPlaying(emblaApi.plugins().autoplay?.isPlaying() ?? false);
    };

    syncState();
    emblaApi.on("reInit", syncState);
    emblaApi.on("select", syncState);
    emblaApi.on("autoplay:play", syncState);
    emblaApi.on("autoplay:stop", syncState);

    return () => {
      emblaApi.off("reInit", syncState);
      emblaApi.off("select", syncState);
      emblaApi.off("autoplay:play", syncState);
      emblaApi.off("autoplay:stop", syncState);
    };
  }, [emblaApi]);

  const currentVoice = voices[selectedIndex] ?? voices[0];

  function scrollPrev() {
    emblaApi?.scrollPrev();
    const autoplay = emblaApi?.plugins().autoplay;
    if (autoplay?.isPlaying()) {
      autoplay.reset();
    }
  }

  function scrollNext() {
    emblaApi?.scrollNext();
    const autoplay = emblaApi?.plugins().autoplay;
    if (autoplay?.isPlaying()) {
      autoplay.reset();
    }
  }

  function scrollTo(index: number) {
    emblaApi?.scrollTo(index);
    const autoplay = emblaApi?.plugins().autoplay;
    if (autoplay?.isPlaying()) {
      autoplay.reset();
    }
  }

  function toggleAutoplay() {
    const autoplay = emblaApi?.plugins().autoplay;

    if (!autoplay) {
      return;
    }

    if (autoplay.isPlaying()) {
      autoplay.stop();
      setIsAutoplayPlaying(false);
      return;
    }

    autoplay.play();
    setIsAutoplayPlaying(true);
  }

  return (
    <BorderGlowSlot className="testimonial-carousel-shell">
      <div className="testimonial-carousel-topbar">
        <div className="space-y-2">
          <p className="eyebrow">Testimonios</p>
          <p className="meta-copy max-w-2xl">
            Navega entre distintas voces del club y mantén el control del
            recorrido en cualquier momento.
          </p>
        </div>

        <div className="testimonial-carousel-status">
          <span className="editorial-pill">
            {isAutoplayPlaying ? "Avance automático activo" : "Avance pausado"}
          </span>
          <span className="editorial-pill">
            {selectedIndex + 1} de {voices.length}
          </span>
        </div>
      </div>

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Mostrando testimonio {selectedIndex + 1} de {voices.length}:{" "}
        {currentVoice?.name}
      </div>

      <div
        className="overflow-hidden"
        ref={emblaRef}
        aria-roledescription="carousel"
        aria-label="Testimonios de miembros de Café Lectura"
      >
        <div className="testimonial-carousel-track">
          {voices.map((voice) => (
            <div
              key={voice.id}
              className="testimonial-carousel-slide"
              role="group"
              aria-roledescription="slide"
              aria-label={`Testimonio de ${voice.name}`}
            >
              <article
                className="testimonial-slide-card"
                data-tone={voice.tone ?? "casa"}
              >
                <div className="flex flex-col justify-between gap-8 md:gap-10">
                  <div className="space-y-6 md:space-y-7">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="testimonial-badge-primary">
                          {voice.focus}
                        </span>
                        <span className="testimonial-badge-secondary">
                          {voice.badge}
                        </span>
                      </div>
                      <div className="testimonial-avatar shrink-0">
                        <Quote className="h-5 w-5" />
                      </div>
                    </div>

                    <ScrollRevealText
                      as="blockquote"
                      className="testimonial-quote text-[var(--text-primary)]"
                    >
                      &quot;{voice.quote}&quot;
                    </ScrollRevealText>
                  </div>

                  <div
                    className="flex flex-col gap-4 border-t pt-5 sm:flex-row sm:items-center sm:justify-between"
                    style={{
                      borderColor:
                        "color-mix(in srgb, var(--color-line) 60%, transparent)",
                    }}
                  >
                    <div className="space-y-1">
                      <p className="testimonial-person-name">{voice.name}</p>
                      <p className="testimonial-person-role">{voice.role}</p>
                    </div>

                    <div className="testimonial-person-chip shrink-0">
                      <UserRound className="h-4 w-4" />
                      <span>Voz del club</span>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>

      <div
        className="testimonial-carousel-controls"
        data-tone={currentVoice?.tone ?? "casa"}
      >
        <div className="testimonial-dots" aria-label="Selector de testimonios">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              type="button"
              className={cn(
                "testimonial-dot",
                index === selectedIndex && "testimonial-dot-active",
              )}
              onClick={() => scrollTo(index)}
              aria-label={`Ir al testimonio ${index + 1}`}
              aria-pressed={index === selectedIndex}
            />
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="testimonial-control-button"
            onClick={scrollPrev}
            aria-label="Ver testimonio anterior"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            className="testimonial-control-button"
            onClick={scrollNext}
            aria-label="Ver testimonio siguiente"
          >
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            type="button"
            className="testimonial-control-button testimonial-control-button-wide"
            onClick={toggleAutoplay}
            aria-label={
              isAutoplayPlaying
                ? "Pausar avance automático"
                : "Reanudar avance automático"
            }
          >
            {isAutoplayPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            <span>{isAutoplayPlaying ? "Pausar" : "Reanudar"}</span>
          </button>
        </div>
      </div>
    </BorderGlowSlot>
  );
}
