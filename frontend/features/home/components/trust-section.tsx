import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, CheckCircle2, Lock, Globe } from "lucide-react"

const trustItems = [
  {
    icon: Shield,
    title: "Secure Accounts",
    description: "Industry-standard encryption and security measures protect your data",
    gradientFrom: "from-emerald-500/0",
    gradientTo: "to-teal-500/0",
    gradientHoverFrom: "from-emerald-500/10",
    gradientHoverTo: "to-teal-500/10",
    iconBgFrom: "from-emerald-100",
    iconBgTo: "to-teal-100",
    iconBgDarkFrom: "from-emerald-900/30",
    iconBgDarkTo: "to-teal-900/30",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    icon: CheckCircle2,
    title: "Verified Users",
    description: "Profile verification ensures authentic connections with real people",
    gradientFrom: "from-green-500/0",
    gradientTo: "to-emerald-500/0",
    gradientHoverFrom: "from-green-500/10",
    gradientHoverTo: "to-emerald-500/10",
    iconBgFrom: "from-green-100",
    iconBgTo: "to-emerald-100",
    iconBgDarkFrom: "from-green-900/30",
    iconBgDarkTo: "to-emerald-900/30",
    iconColor: "text-green-600 dark:text-green-400",
  },
  {
    icon: Lock,
    title: "GDPR-Friendly",
    description: "Full compliance with data protection regulations and user privacy rights",
    gradientFrom: "from-blue-500/0",
    gradientTo: "to-indigo-500/0",
    gradientHoverFrom: "from-blue-500/10",
    gradientHoverTo: "to-indigo-500/10",
    iconBgFrom: "from-blue-100",
    iconBgTo: "to-indigo-100",
    iconBgDarkFrom: "from-blue-900/30",
    iconBgDarkTo: "to-indigo-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    icon: Globe,
    title: "Location Privacy",
    description: "Control your location visibility with privacy-first location settings",
    gradientFrom: "from-sky-500/0",
    gradientTo: "to-blue-500/0",
    gradientHoverFrom: "from-sky-500/10",
    gradientHoverTo: "to-blue-500/10",
    iconBgFrom: "from-sky-100",
    iconBgTo: "to-blue-100",
    iconBgDarkFrom: "from-sky-900/30",
    iconBgDarkTo: "to-blue-900/30",
    iconColor: "text-sky-600 dark:text-sky-400",
  },
]

export function TrustSection() {
  return (
    <section id="trust" className="py-20 lg:py-32 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="container mx-auto max-w-4xl">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
          Trust & Privacy
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {trustItems.map((item, index) => {
            const Icon = item.icon
            return (
              <Card key={index} className="group relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradientFrom} ${item.gradientTo} group-hover:${item.gradientHoverFrom} group-hover:${item.gradientHoverTo} transition-all duration-300`} />
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${item.iconBgFrom} ${item.iconBgTo} dark:${item.iconBgDarkFrom} dark:${item.iconBgDarkTo} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`size-6 ${item.iconColor}`} />
                  </div>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
