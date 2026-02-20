import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserPlus, UserCheck, Heart, MessageCircle } from "lucide-react"

const steps = [
  {
    icon: UserPlus,
    title: "1. Register",
    description: "Sign up with your email. Quick setup, no BS. Just like a good API.",
    gradientFrom: "from-pink-500/0",
    gradientTo: "to-rose-500/0",
    gradientHoverFrom: "from-pink-500/10",
    gradientHoverTo: "to-rose-500/10",
    iconBgFrom: "from-pink-100",
    iconBgTo: "to-rose-100",
    iconBgDarkFrom: "from-pink-900/30",
    iconBgDarkTo: "to-rose-900/30",
    iconColor: "text-pink-600 dark:text-pink-400",
  },
  {
    icon: UserCheck,
    title: "2. Complete Profile",
    description: "Add your favorite languages, frameworks, games, and tech stack. Show off your GitHub.",
    gradientFrom: "from-blue-500/0",
    gradientTo: "to-cyan-500/0",
    gradientHoverFrom: "from-blue-500/10",
    gradientHoverTo: "to-cyan-500/10",
    iconBgFrom: "from-blue-100",
    iconBgTo: "to-cyan-100",
    iconBgDarkFrom: "from-blue-900/30",
    iconBgDarkTo: "to-cyan-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    icon: Heart,
    title: "3. Match",
    description: "Our ML algorithm matches you with geeks who share your tech stack, gaming preferences, and interests",
    gradientFrom: "from-rose-500/0",
    gradientTo: "to-pink-500/0",
    gradientHoverFrom: "from-rose-500/10",
    gradientHoverTo: "to-pink-500/10",
    iconBgFrom: "from-rose-100",
    iconBgTo: "to-pink-100",
    iconBgDarkFrom: "from-rose-900/30",
    iconBgDarkTo: "to-pink-900/30",
    iconColor: "text-rose-600 dark:text-rose-400",
  },
  {
    icon: MessageCircle,
    title: "4. Chat",
    description: "Discuss code, share memes, plan gaming sessions. Real-time chat with markdown support.",
    gradientFrom: "from-purple-500/0",
    gradientTo: "to-indigo-500/0",
    gradientHoverFrom: "from-purple-500/10",
    gradientHoverTo: "to-indigo-500/10",
    iconBgFrom: "from-purple-100",
    iconBgTo: "to-indigo-100",
    iconBgDarkFrom: "from-purple-900/30",
    iconBgDarkTo: "to-indigo-900/30",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 lg:py-32 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <Card key={index} className="group relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className={`absolute inset-0 bg-gradient-to-br ${step.gradientFrom} ${step.gradientTo} group-hover:${step.gradientHoverFrom} group-hover:${step.gradientHoverTo} transition-all duration-300`} />
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${step.iconBgFrom} ${step.iconBgTo} dark:${step.iconBgDarkFrom} dark:${step.iconBgDarkTo} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`size-6 ${step.iconColor}`} />
                  </div>
                  <CardTitle>{step.title}</CardTitle>
                  <CardDescription>{step.description}</CardDescription>
                </CardHeader>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
