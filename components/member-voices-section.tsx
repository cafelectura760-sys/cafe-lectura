import { ArrowRight } from "lucide-react";

import {
  MemberVoicesCarousel,
  type MemberVoice,
} from "@/components/member-voices-carousel";
import { AnimatedContentSlot } from "@/components/react-bits/animated-content-slot";
import { SectionHeading } from "@/components/section-heading";
import { createWhatsAppHref } from "@/lib/whatsapp";

const memberVoices: MemberVoice[] = [
  {
    id: "federico-arteta",
    name: "Federico Arteta",
    role: "Ponente y participante de los coloquios",
    focus: "Humanismo compartido",
    badge: "Testimonio completo",
    quote:
      "He sido testigo del crecimiento de un espacio de humanismo necesario en Barquisimeto.",
    href: "/testimonios/federico-arteta",
    tone: "verde",
  },
  {
    id: "douglas-jimenez",
    name: "Douglas Jiménez",
    role: "Ponente y participante de los coloquios",
    focus: "Historia cultural",
    badge: "Testimonio completo",
    quote:
      "Si algún día se compila la historia cultural de Barquisimeto, Café Lectura Barquisimeto deberá ocupar un capítulo muy especial.",
    href: "/testimonios/douglas-jimenez",
    tone: "verde",
  },
];

function getMembershipHref() {
  return createWhatsAppHref(
    "Me gustaría recibir información sobre la membresía anual de Café Lectura Barquisimeto.",
  );
}

export function MemberVoicesSection() {
  return (
    <section
      id="testimonios"
      className="surface-card px-6 py-7 md:px-8 md:py-8 lg:px-10 lg:py-10"
    >
      <AnimatedContentSlot delay={0} distance={20}>
        <SectionHeading
          eyebrow="Testimonios del club"
          title="Voces de quienes han participado en los coloquios"
          description="Federico Arteta y Douglas Jiménez comparten cómo han vivido los encuentros de Café Lectura Barquisimeto. Puedes leer una síntesis o abrir cada testimonio completo."
        />
      </AnimatedContentSlot>

      <AnimatedContentSlot className="mt-8" delay={1.5} distance={24}>
        <MemberVoicesCarousel voices={memberVoices} />
      </AnimatedContentSlot>

      <AnimatedContentSlot
        className="surface-card-muted mt-8 flex flex-col gap-5 px-5 py-5 md:px-6 md:py-6 lg:flex-row lg:items-center lg:justify-between"
        delay={3}
        distance={24}
      >
        <div className="max-w-3xl">
          <p className="eyebrow">Conocer el club</p>
          <p className="body-copy mt-3">
            Si esta forma de compartir la lectura encaja contigo, podemos
            contarte con calma cómo funcionan los coloquios por WhatsApp y la
            membresía web anual.
          </p>
        </div>

        <a
          href={getMembershipHref()}
          target="_blank"
          rel="noreferrer"
          className="btn-warm w-full sm:w-auto"
        >
          Consultar membresía web
          <ArrowRight className="h-[18px] w-[18px]" />
        </a>
      </AnimatedContentSlot>
    </section>
  );
}
