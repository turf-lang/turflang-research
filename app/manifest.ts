import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: "Research",
    description: site.description,
    start_url: "/",
    display: "browser",
    background_color: "#f4eee2",
    theme_color: "#f4eee2",
    icons: [{ src: "/icon.png", sizes: "any", type: "image/png" }],
  };
}
