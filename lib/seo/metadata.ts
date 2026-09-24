import type { Metadata } from "next";

const SITE_NAME = "Café Lectura Barquisimeto";
const DEFAULT_SOCIAL_IMAGE = {
  url: "/opengraph-image.png",
  width: 1200,
  height: 630,
  alt: "Café Lectura Barquisimeto, club de lectura y coloquios por WhatsApp",
};

type PublicMetadataInput = {
  title: string;
  description: string;
  path: string;
};

export function createPublicMetadata({
  title,
  description,
  path,
}: PublicMetadataInput): Metadata {
  const socialTitle = title.includes(SITE_NAME)
    ? title
    : `${title} | ${SITE_NAME}`;

  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      type: "website",
      locale: "es_VE",
      siteName: SITE_NAME,
      title: socialTitle,
      description,
      url: path,
      images: [DEFAULT_SOCIAL_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [DEFAULT_SOCIAL_IMAGE.url],
    },
  };
}
