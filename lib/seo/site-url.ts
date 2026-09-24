const LOCAL_SITE_URL = "http://localhost:3000";

export function getSiteUrl(): URL {
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const vercelProductionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  const rawSiteUrl = configuredSiteUrl
    ? configuredSiteUrl
    : vercelProductionUrl
      ? `https://${vercelProductionUrl}`
      : LOCAL_SITE_URL;

  let siteUrl: URL;

  try {
    siteUrl = new URL(rawSiteUrl);
  } catch {
    throw new Error("NEXT_PUBLIC_SITE_URL must be a valid absolute URL.");
  }

  if (
    !["http:", "https:"].includes(siteUrl.protocol) ||
    siteUrl.username ||
    siteUrl.password ||
    siteUrl.pathname !== "/" ||
    siteUrl.search ||
    siteUrl.hash
  ) {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL must contain only the site's HTTP or HTTPS origin.",
    );
  }

  return siteUrl;
}
