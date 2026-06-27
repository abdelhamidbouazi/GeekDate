import { ImageResponse } from "next/og"
import { BRAND } from "@/lib/branding"

export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #170713 0%, #31101f 45%, #e11d48 100%)",
          color: "#fff",
          fontSize: 84,
          fontWeight: 900,
          letterSpacing: "-0.05em",
        }}
      >
        {BRAND.name}
      </div>
    ),
    size
  )
}
