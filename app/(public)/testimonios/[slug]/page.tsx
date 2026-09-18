import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AppHeader } from "@/components/app-header";
import { PageShell } from "@/components/page-shell";
import { getAuthSession } from "@/lib/auth/session";
import { getTestimonialBySlug } from "@/lib/testimonials/data";

type TestimonialPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: TestimonialPageProps): Promise<Metadata> {
  const { slug } = await params;
  const testimonial = getTestimonialBySlug(slug);

  if (!testimonial) {
    return {
      title: "Testimonio no encontrado",
    };
  }

  return {
    title: `${testimonial.name} | Testimonios`,
    description: testimonial.hook,
  };
}

export default async function TestimonialPage({
  params,
}: TestimonialPageProps) {
  const [session, resolvedParams] = await Promise.all([
    getAuthSession(),
    params,
  ]);
  const testimonial = getTestimonialBySlug(resolvedParams.slug);

  if (!testimonial) {
    notFound();
  }

  return (
    <PageShell width="reading">
      <AppHeader
        activeHref="/"
        session={session}
        description="Testimonios de quienes han participado en Café Lectura Barquisimeto."
      />

      <article className="surface-card px-6 py-8 md:px-10 md:py-10 lg:px-14 lg:py-12">
        <Link href="/#testimonios" className="editorial-link">
          Volver a los testimonios
        </Link>

        <header className="mt-8 border-b border-[var(--border-default)] pb-8">
          <p className="eyebrow">Testimonio</p>
          <h1 className="display-title mt-4 text-[var(--text-primary)]">
            {testimonial.name}
          </h1>
          <p className="body-large mt-4 text-[var(--text-secondary)]">
            {testimonial.role}
          </p>
        </header>

        <div className="reader-prose mt-8 max-w-none">
          {testimonial.blocks.map((block, blockIndex) => {
            if (block.type === "list") {
              return (
                <ol
                  key={`list-${blockIndex}`}
                  className="list-decimal space-y-4 pl-6 text-[17px] leading-[1.75] text-[var(--text-primary)] md:text-[18px]"
                >
                  {block.items.map((item) => (
                    <li key={item} className="pl-2">
                      {item}
                    </li>
                  ))}
                </ol>
              );
            }

            return (
              <div key={`paragraphs-${blockIndex}`} className="space-y-5">
                {block.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            );
          })}
        </div>

        <footer className="mt-10 border-t border-[var(--border-default)] pt-6">
          <Link href="/#testimonios" className="btn-secondary">
            Volver a los testimonios
          </Link>
        </footer>
      </article>
    </PageShell>
  );
}
