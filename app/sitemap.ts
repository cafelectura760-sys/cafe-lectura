import type { MetadataRoute } from "next";

import { getPublicBooks } from "@/lib/books/data";
import { getSiteUrl } from "@/lib/seo/site-url";
import { testimonials } from "@/lib/testimonials/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const books = await getPublicBooks();
  const siteUrl = getSiteUrl();
  const publicPaths = [
    "/",
    "/library",
    ...testimonials.map(({ slug }) => `/testimonios/${slug}`),
    ...books.map(({ id }) => `/library/${id}`),
  ];

  return publicPaths.map((path) => ({
    url: new URL(path, siteUrl).toString(),
  }));
}
