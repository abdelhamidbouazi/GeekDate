import type { MetadataRoute } from "next"
import { BRAND } from "@/lib/branding"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BRAND.name,
    short_name: BRAND.shortName,
    description: BRAND.description,
    start_url: "/home",
    scope: "/",
    display: "standalone",
    background_color: "#100812",
    theme_color: "#100812",
    icons: [
      {
        src: "/sparkdates-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  }
}
