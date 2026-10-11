import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_APP_URL ?? "https://aivia.byharsh.com";

/** Crawlers see the public pages; the app behind sign-in is not theirs (TICKET-016). */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/login", "/signup"],
      disallow: [
        "/studio",
        "/library",
        "/edit",
        "/characters",
        "/settings",
        "/api",
        "/get-started",
        "/kit",
      ],
    },
    sitemap: `${SITE}/sitemap.xml`,
  };
}
