import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Tag, TrendingUp, MessageCircle, Lock, Shield } from "lucide-react"

const features = [
  {
    icon: Sparkles,
    title: "Smart Matching",
    description: "ML-powered algorithm matches you based on coding languages, tech stack, gaming preferences, and geek interests",
    gradientFrom: "from-yellow-500/0",
    gradientTo: "to-orange-500/0",
    gradientHoverFrom: "from-yellow-500/10",
    gradientHoverTo: "to-orange-500/10",
    iconBgFrom: "from-yellow-100",
    iconBgTo: "to-orange-100",
    iconBgDarkFrom: "from-yellow-900/30",
    iconBgDarkTo: "to-orange-900/30",
    iconColor: "text-yellow-600 dark:text-yellow-400",
  },
  {
    icon: Tag,
    title: "Tech Stack Tags",
    description: "Tag your favorite languages (Python, JavaScript, Rust), frameworks, games, and hobbies. Find your tech twin.",
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
    icon: TrendingUp,
    title: "Fame Rating",
    description: "Build your reputation through positive interactions. Verified GitHub profiles and achievements boost your score.",
    gradientFrom: "from-violet-500/0",
    gradientTo: "to-purple-500/0",
    gradientHoverFrom: "from-violet-500/10",
    gradientHoverTo: "to-purple-500/10",
    iconBgFrom: "from-violet-100",
    iconBgTo: "to-purple-100",
    iconBgDarkFrom: "from-violet-900/30",
    iconBgDarkTo: "to-purple-900/30",
    iconColor: "text-violet-600 dark:text-violet-400",
  },
  {
    icon: MessageCircle,
    title: "Real-Time Chat",
    description: "Code snippets, markdown support, and emoji reactions. Chat like you're on Discord, but for dating.",
    gradientFrom: "from-cyan-500/0",
    gradientTo: "to-blue-500/0",
    gradientHoverFrom: "from-cyan-500/10",
    gradientHoverTo: "to-blue-500/10",
    iconBgFrom: "from-cyan-100",
    iconBgTo: "to-blue-100",
    iconBgDarkFrom: "from-cyan-900/30",
    iconBgDarkTo: "to-blue-900/30",
    iconColor: "text-cyan-600 dark:text-cyan-400",
  },
  {
    icon: Lock,
    title: "Privacy-First",
    description: "Control your visibility. Hide your location, GitHub, or gaming profiles. Your data, your rules.",
    gradientFrom: "from-slate-500/0",
    gradientTo: "to-gray-500/0",
    gradientHoverFrom: "from-slate-500/10",
    gradientHoverTo: "to-gray-500/10",
    iconBgFrom: "from-slate-100",
    iconBgTo: "to-gray-100",
    iconBgDarkFrom: "from-slate-900/30",
    iconBgDarkTo: "to-gray-900/30",
    iconColor: "text-slate-600 dark:text-slate-400",
  },
  {
    icon: Shield,
    title: "Secure Platform",
    description: "End-to-end encryption, 2FA support, and secure authentication. We take security seriously, just like you do.",
    gradientFrom: "from-teal-500/0",
    gradientTo: "to-cyan-500/0",
    gradientHoverFrom: "from-teal-500/10",
    gradientHoverTo: "to-cyan-500/10",
    iconBgFrom: "from-teal-100",
    iconBgTo: "to-cyan-100",
    iconBgDarkFrom: "from-teal-900/30",
    iconBgDarkTo: "to-cyan-900/30",
    iconColor: "text-teal-600 dark:text-teal-400",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 lg:py-32 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
          Key Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card key={index} className="group relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradientFrom} ${feature.gradientTo} group-hover:${feature.gradientHoverFrom} group-hover:${feature.gradientHoverTo} transition-all duration-300`} />
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.iconBgFrom} ${feature.iconBgTo} dark:${feature.iconBgDarkFrom} dark:${feature.iconBgDarkTo} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`size-6 ${feature.iconColor}`} />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
