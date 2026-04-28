import Image from "next/image"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"

interface ProfileCardProps {
  imageSrc: string
  imageAlt: string
  name: string
  age: number
  title: string
  tags: Array<{ label: string; color: string }>
  bio: string[]
  overlayColors: {
    top: string
    bottom: string
  }
}

export function ProfileCard({
  imageSrc,
  imageAlt,
  name,
  age,
  title,
  tags,
  bio,
  overlayColors,
}: ProfileCardProps) {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <Card className="relative w-full h-full p-0 overflow-hidden rounded-3xl border-0 shadow-2xl bg-card">
        {/* Image Section with Creative Overlay */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 0vw, 50vw"
          />
          
          {/* Creative Diagonal Overlay */}
          <div className="absolute inset-0">
            <div className={`absolute top-0 right-0 w-64 h-64 ${overlayColors.top} rounded-full blur-3xl`} />
            <div className={`absolute bottom-0 left-0 w-48 h-48 ${overlayColors.bottom} rounded-full blur-3xl`} />
          </div>
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
          
          {/* Top Badge */}
          <div className="absolute top-4 right-4">
            <div className="px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
              <span className="text-xs font-semibold text-white">Online</span>
            </div>
          </div>
          
          {/* Profile Info - Creative Layout */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <CardContent className="p-0 space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <CardTitle className="text-4xl font-bold text-white">{name}</CardTitle>
                    <span className="text-xl text-white/70 font-normal">{age}</span>
                  </div>
                  <CardDescription className="text-white/90 text-base font-medium">
                    {title}
                  </CardDescription>
                </div>
              </div>
              
              {/* Tech Stack - Creative Layout */}
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className={`px-3 py-1.5 text-xs font-semibold ${tag.color} text-white rounded-lg`}
                  >
                    {tag.label}
                  </span>
                ))}
              </div>
              
              {/* Bio */}
              <div className="pt-2 space-y-1">
                {bio.map((line, index) => (
                  <p key={index} className="text-sm text-white/80">
                    {line}
                  </p>
                ))}
              </div>
            </CardContent>
          </div>
        </div>
      </Card>
    </div>
  )
}
