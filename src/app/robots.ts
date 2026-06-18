import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/reservation/success", "/reservation/cancel"],
    },
    sitemap: new URL("/sitemap.xml", env.siteUrl).toString(),
  };
}
