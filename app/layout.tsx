import type { Metadata, Viewport } from "next";
import { Literata, Source_Sans_3 } from "next/font/google";

import { NavigationScrollReset } from "@/components/navigation-scroll-reset";
import { getSiteUrl } from "@/lib/seo/site-url";
import "./globals.css";

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
});

const literata = Literata({
  variable: "--font-literata",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: {
    default: "Café Lectura Barquisimeto",
    template: "%s | Café Lectura Barquisimeto",
  },
  description:
    "Club de lectura en Barquisimeto con coloquios por WhatsApp y una colección privada para miembros.",
  applicationName: "Café Lectura Barquisimeto",
  openGraph: {
    type: "website",
    locale: "es_VE",
    siteName: "Café Lectura Barquisimeto",
    title: "Café Lectura Barquisimeto | Club de lectura",
    description:
      "Club de lectura en Barquisimeto con coloquios por WhatsApp y una colección privada para miembros.",
    url: "/",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Café Lectura Barquisimeto, club de lectura y coloquios por WhatsApp",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Café Lectura Barquisimeto | Club de lectura",
    description:
      "Club de lectura en Barquisimeto con coloquios por WhatsApp y una colección privada para miembros.",
    images: ["/opengraph-image.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#f7f3ec",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${sourceSans.variable} ${literata.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <NavigationScrollReset />
        {children}
      </body>
    </html>
  );
}
