import type { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { PAGE_META } from "@/lib/content/meta";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return Object.values(PAGE_META).map((m) => ({
    url: new URL(m.path, env.siteUrl).toString(),
    lastModified: now,
    changeFrequency: m.path === "/" ? "weekly" : "monthly",
    priority: m.path === "/" ? 1 : 0.8,
  }));
}
