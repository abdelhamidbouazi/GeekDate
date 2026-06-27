import { ImageResponse } from "next/og"
import { BRAND } from "@/lib/branding"

export const size = { width: 1200, height: 600 }
export const contentType = "image/png"

export default function TwitterImage() {
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
            "linear-gradient(135deg, #100812 0%, #260b1c 60%, #fb7185 100%)",
          color: "#fff",
          fontSize: 78,
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
