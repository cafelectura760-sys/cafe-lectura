import { ArrowRight } from "lucide-react";

import {
  MemberVoicesCarousel,
  type MemberVoice,
} from "@/components/member-voices-carousel";
import { AnimatedContentSlot } from "@/components/react-bits/animated-content-slot";
import { MagneticSlot } from "@/components/react-bits/magnetic-slot";
import { SectionHeading } from "@/components/section-heading";
import { createWhatsAppHref } from "@/lib/whatsapp";

const memberVoices: MemberVoice[] = [
  {
    id: "maria-elena",
    name: "María Elena R.",
    role: "Miembro del club · Participa en los coloquios privados",
    focus: "Lectura acompañada",
    badge: "Espacio privado",
    quote:
      "Volví a leer sin sentir que tenía que correr. Todo está dispuesto para entrar con calma, comprender el libro y disfrutar la conversación.",
    tone: "verde",
  },
  {
    id: "jose-ramon",
    name: "José Ramón C.",
    role: "Participante de coloquios · Lector habitual del club",
    focus: "Coloquios guiados",
    badge: "Audios claros",
    quote:
      "Me ayuda mucho encontrar una presentación ordenada. Puedo leer, escuchar y volver a una idea importante sin sentirme perdido dentro del contenido.",
    tone: "verde",
  },
  {
    id: "carmen-lucia",
    name: "Carmen Lucía P.",
    role: "Miembro del club · Consulta la biblioteca antes de cada coloquio",
    focus: "Biblioteca visible",
    badge: "Decisión tranquila",
    quote:
      "Antes de preguntar por un libro me gusta poder leer la ficha con calma. Saber que todo está visible me da confianza para decidir qué quiero explorar.",
    tone: "verde",
  },
  {
    id: "ana-teresa",
    name: "Ana Teresa M.",
    role: "Miembro del club · Busca una experiencia simple y confiable",
    focus: "Ritmo sereno",
    badge: "Navegación clara",
    quote:
      "Aquí todo se siente próximo: la membresía, los libros y el acceso al espacio privado tienen un ritmo amable y comprensible.",
    tone: "verde",
  },
];

function getMembershipHref() {
  return createWhatsAppHref(
    "Me gustaría recibir información sobre la membresía anual de Café Lectura.",
  );
}

export function MemberVoicesSection() {
  return (
    <AnimatedContentSlot
      as="section"
      className="surface-card px-6 py-7 md:px-8 md:py-8 lg:px-10 lg:py-10"
    >
      <SectionHeading
        eyebrow="Voces del club"
        title="Una experiencia de lectura que se siente cercana desde dentro"
        description="Estas voces muestran cómo se vive Café Lectura desde dentro: una navegación legible, una biblioteca clara y coloquios privados preparados para leer con calma."
      />

      <AnimatedContentSlot as="div" className="mt-8" delay={1}>
        <MemberVoicesCarousel voices={memberVoices} />
      </AnimatedContentSlot>

      <AnimatedContentSlot
        as="div"
        className="surface-card-muted mt-8 flex flex-col gap-5 px-5 py-5 md:px-6 md:py-6 lg:flex-row lg:items-center lg:justify-between"
        delay={2}
      >
        <div className="max-w-3xl">
          <p className="eyebrow">Conocer el club</p>
          <p className="body-copy mt-3">
            Si esta forma de leer encaja contigo, podemos contarte con calma
            cómo funciona la membresía anual, qué tipo de acompañamiento ofrece
            el club y cómo se organiza el acceso a los coloquios privados.
          </p>
        </div>

        <MagneticSlot className="w-full sm:w-auto">
          <a
            href={getMembershipHref()}
            target="_blank"
            rel="noreferrer"
            className="btn-warm w-full sm:w-auto"
          >
            Consultar membresía
            <ArrowRight className="h-[18px] w-[18px]" />
          </a>
        </MagneticSlot>
      </AnimatedContentSlot>
    </AnimatedContentSlot>
  );
}
