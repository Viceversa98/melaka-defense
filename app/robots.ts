import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: "https://alifasraf.asia/sitemap.xml",
    host: "https://alifasraf.asia",
  };
}
