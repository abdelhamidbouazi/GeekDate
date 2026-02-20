import type { Metadata } from "next"
import { Navbar } from "./components/navbar"
import { HeroSection } from "./components/hero-section"
import { HowItWorksSection } from "./components/how-it-works-section"
import { FeaturesSection } from "./components/features-section"
import { TrustSection } from "./components/trust-section"
import { CTASection } from "./components/cta-section"
import { Footer } from "./components/footer"

export const metadata: Metadata = {
  title: "GeekDate - Dating for Geeks",
  description: "Connect with fellow geeks, developers, gamers, and tech enthusiasts. Find someone who speaks your language (literally).",
}

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <TrustSection />
      <CTASection />
      <Footer />
    </main>
  )
}
