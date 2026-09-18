import { BookOpenText, CalendarDays, MessageCircleMore } from "lucide-react";
import type { CSSProperties } from "react";

const bookSpines = [
  { width: 30, height: 154, color: "var(--color-verde)" },
  { width: 42, height: 184, color: "var(--color-dune)" },
  { width: 28, height: 132, color: "var(--color-teal)" },
  { width: 36, height: 166, color: "var(--color-casa)" },
  { width: 24, height: 146, color: "var(--color-gold)" },
  { width: 38, height: 176, color: "var(--color-fig)" },
  { width: 30, height: 124, color: "var(--color-clay)" },
];

export function ReadingTableau() {
  return (
    <div className="reading-tableau reveal-soft reveal-soft-delay-1">
      <div className="relative z-10 flex h-full min-h-[480px] min-w-0 flex-col justify-between gap-8">
        <div className="flex items-center justify-between gap-3">
          <p className="eyebrow text-[var(--color-casa)]">
            Experiencia compartida
          </p>
          <span className="editorial-pill">Sin prisa</span>
        </div>

        <div className="tableau-book-stage" aria-hidden="true">
          <div className="tableau-book-row">
            {bookSpines.map((book, index) => (
              <span
                key={`${book.color}-${index}`}
                className="book-spine"
                style={
                  {
                    "--book-width": `${book.width}px`,
                    "--book-height": `${book.height}px`,
                    "--book-color": book.color,
                  } as CSSProperties
                }
              />
            ))}
          </div>
          <div className="tableau-shelf tableau-shelf-primary" />
        </div>

        <div className="grid min-w-0 gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] md:items-end">
          <div className="tableau-quote">
            <div className="accent-rule" />
            <p className="mt-5 font-serif text-[30px] leading-[1.18] font-semibold text-[var(--text-primary)] md:text-[34px]">
              Del texto leído al coloquio compartido.
            </p>
            <p className="mt-4 text-[17px] leading-7 text-[var(--text-secondary)]">
              Cada mes se anuncia la obra seleccionada, se comparte la ponencia
              y el chat se abre para conversar.
            </p>
          </div>

          <div className="grid gap-3">
            <div className="tableau-note">
              <div className="flex items-start gap-3">
                <BookOpenText className="mt-1 h-5 w-5 text-[var(--color-casa)]" />
                <div>
                  <p className="text-[16px] font-semibold text-[var(--text-primary)]">
                    Coloquios mensuales
                  </p>
                  <p className="mt-1 text-[15px] leading-6 text-[var(--text-secondary)]">
                    Una obra, una ponencia y una conversación compartida.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
              <div className="tableau-note">
                <div className="flex items-start gap-3">
                  <CalendarDays className="mt-1 h-5 w-5 text-[var(--color-casa)]" />
                  <div>
                    <p className="text-[16px] font-semibold text-[var(--text-primary)]">
                      Participación gratuita
                    </p>
                    <p className="mt-1 text-[15px] leading-6 text-[var(--text-secondary)]">
                      El diálogo se desarrolla en el chat del CCLB.
                    </p>
                  </div>
                </div>
              </div>

              <div className="tableau-note">
                <div className="flex items-start gap-3">
                  <MessageCircleMore className="mt-1 h-5 w-5 text-[var(--color-casa)]" />
                  <div>
                    <p className="text-[16px] font-semibold text-[var(--text-primary)]">
                      Membresía web
                    </p>
                    <p className="mt-1 text-[15px] leading-6 text-[var(--text-secondary)]">
                      US$7 al año para consultar la colección privada.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
