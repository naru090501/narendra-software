import type { MetadataRoute } from "next";
import { resolveSiteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = resolveSiteUrl("http://localhost:3000");
  if (!siteUrl) {
    return [];
  }

  const routes = [
    "",
    "/products",
    "/projects",
    "/about",
    "/contact",
    "/docs/developer-toolbox",
  ];

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date("2026-11-11T00:00:00.000Z"),
    changeFrequency: route === "/products" ? "weekly" : "monthly",
    priority: route === "" ? 1.0 : 0.8,
  }));
}
