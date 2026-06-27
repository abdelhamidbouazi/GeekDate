import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  CalendarHeart,
  Check,
  Heart,
  LockKeyhole,
  MapPin,
  MessageCircleHeart,
  ShieldCheck,
  Sparkles,
  Star,
  UsersRound,
  Video,
  Zap,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { BRAND } from "@/lib/branding"

export const metadata: Metadata = {
  title: BRAND.name,
  description:
    "A modern dating platform that helps people discover meaningful connections through shared interests, compatibility, and authentic interactions.",
}

const featuredProfiles = [
  {
    name: "Maya",
    age: 26,
    city: "Paris",
    match: "96%",
    gradient: "from-fuchsia-500 via-rose-500 to-orange-400",
    interests: ["Live music", "Coffee dates", "Travel"],
  },
  {
    name: "Noah",
    age: 29,
    city: "Lyon",
    match: "93%",
    gradient: "from-sky-500 via-indigo-500 to-violet-500",
    interests: ["Design", "Running", "Movies"],
  },
  {
    name: "Lina",
    age: 24,
    city: "Casablanca",
    match: "91%",
    gradient: "from-emerald-400 via-teal-500 to-cyan-500",
    interests: ["Food spots", "Art", "Books"],
  },
]

const stats = [
  { value: "2.8M", label: "meaningful matches" },
  { value: "74%", label: "chat after matching" },
  { value: "4.9/5", label: "first-date confidence" },
]

const steps = [
  {
    icon: Sparkles,
    title: "Create your vibe",
    description:
      "Build a profile that feels like you with prompts, photos, values, and the type of connection you want.",
  },
  {
    icon: Zap,
    title: "Swipe with intent",
    description:
      "A fast, beautiful discovery flow helps you like, pass, and save the people who actually fit.",
  },
  {
    icon: MessageCircleHeart,
    title: "Start naturally",
    description:
      "Smart openers and shared-interest highlights make the first message easier and less awkward.",
  },
]

const features = [
  {
    icon: BadgeCheck,
    title: "Verified-first profiles",
    description:
      "SparkDates highlights real people with trust signals, fresh photos, and profile completeness.",
  },
  {
    icon: MapPin,
    title: "Nearby chemistry",
    description:
      "Discover people around you with elegant distance controls and privacy-respecting location hints.",
  },
  {
    icon: CalendarHeart,
    title: "Date-ready planning",
    description:
      "Move from chat to a real plan with date ideas, availability cues, and low-pressure suggestions.",
  },
  {
    icon: Video,
    title: "Video vibe check",
    description:
      "Preview chemistry safely before meeting with a simple, private video check-in experience.",
  },
]

const safetyItems = [
  "Photo and email verification before deeper discovery",
  "Block, report, and visibility controls always one tap away",
  "Private-by-default location and profile preference settings",
]

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#100812] text-white">
      <section className="relative isolate min-h-screen px-4 pb-20 pt-5 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_18%,rgba(255,77,126,0.35),transparent_34%),radial-gradient(circle_at_82%_12%,rgba(255,184,77,0.22),transparent_26%),radial-gradient(circle_at_50%_88%,rgba(128,90,255,0.28),transparent_35%),linear-gradient(135deg,#180818_0%,#120713_42%,#250b18_100%)]" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-size-[72px_72px] mask-[radial-gradient(circle_at_center,black,transparent_78%)]" />
        <div className="absolute left-1/2 top-24 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-rose-500/20 blur-3xl" />

        <header className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/10 bg-white/[0.07] px-4 py-3 shadow-2xl shadow-black/20 backdrop-blur-2xl sm:px-5">
          <Link href="/home" className="flex items-center gap-3" aria-label={`${BRAND.name} home`}>
            <span className="grid size-11 place-items-center rounded-full bg-linear-to-br from-rose-500 via-pink-500 to-orange-400 shadow-lg shadow-rose-500/30">
              <Heart className="size-5 fill-white text-white" />
            </span>
            <span>
              <span className="block text-lg font-black tracking-tight">{BRAND.name}</span>
              <span className="hidden text-[11px] font-semibold uppercase tracking-[0.32em] text-white/45 sm:block">
                Real sparks
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-medium text-white/68 md:flex">
            <a className="transition hover:text-white" href="#experience">
              Experience
            </a>
            <a className="transition hover:text-white" href="#features">
              Features
            </a>
            <a className="transition hover:text-white" href="#safety">
              Safety
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="hidden rounded-full text-white/80 hover:bg-white/10 hover:text-white sm:inline-flex"
              asChild
            >
              <Link href="/login">Log in</Link>
            </Button>
            <Button
              className="rounded-full bg-white px-5 font-bold text-[#160714] shadow-xl shadow-rose-500/20 hover:bg-rose-50"
              asChild
            >
              <Link href="/signup">Join now</Link>
            </Button>
          </div>
        </header>

        <div className="mx-auto grid max-w-7xl items-center gap-14 py-20 lg:grid-cols-[1fr_0.9fr] lg:py-24">
          <div className="max-w-3xl">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 py-2 text-sm font-semibold text-white/78 shadow-xl shadow-black/10 backdrop-blur-xl">
              <span className="relative flex size-2.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-rose-300 opacity-75" />
                <span className="relative inline-flex size-2.5 rounded-full bg-rose-300" />
              </span>
              New people nearby are matching tonight
            </div>

            <h1 className="max-w-4xl text-5xl font-black tracking-[-0.06em] text-white sm:text-7xl lg:text-8xl">
              Dating that feels
              <span className="block bg-linear-to-r from-rose-300 via-pink-400 to-orange-300 bg-clip-text text-transparent">
                electric again.
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/68 sm:text-xl">
              SparkDates turns casual swipes into confident connections with beautiful profiles,
              real compatibility cues, and conversations designed to become first dates.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                className="h-14 rounded-full bg-linear-to-r from-rose-500 via-pink-500 to-orange-400 px-7 text-base font-black text-white shadow-2xl shadow-rose-600/30 hover:scale-[1.02] hover:from-rose-400 hover:to-orange-300"
                asChild
              >
                <Link href="/signup">
                  Start matching <ArrowRight className="size-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 rounded-full border-white/15 bg-white/6 px-7 text-base font-bold text-white hover:bg-white/12 hover:text-white"
                asChild
              >
                <Link href="/login">I already have an account</Link>
              </Button>
            </div>

            <div className="mt-10 grid max-w-2xl grid-cols-3 gap-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-3xl border border-white/10 bg-white/6 p-4 backdrop-blur-xl"
                >
                  <div className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-xs font-medium leading-5 text-white/50 sm:text-sm">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[440px]">
            <div className="absolute -left-8 top-10 hidden rotate-[-13deg] rounded-[2rem] border border-white/10 bg-white/8 p-4 shadow-2xl shadow-black/30 backdrop-blur-2xl sm:block">
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-2xl bg-emerald-400/20 text-emerald-200">
                  <BadgeCheck className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-bold">Verified</p>
                  <p className="text-xs text-white/50">Fresh profile</p>
                </div>
              </div>
            </div>

            <div className="absolute -right-6 bottom-28 hidden rotate-6 rounded-[2rem] border border-white/10 bg-white/8 p-4 shadow-2xl shadow-black/30 backdrop-blur-2xl sm:block">
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-2xl bg-rose-400/20 text-rose-200">
                  <Bell className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-bold">It&apos;s a match</p>
                  <p className="text-xs text-white/50">Maya liked you back</p>
                </div>
              </div>
            </div>

            <div className="relative rounded-[3.25rem] border border-white/15 bg-white/9 p-3 shadow-[0_35px_120px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
              <div className="overflow-hidden rounded-[2.6rem] border border-white/10 bg-[#1a0b17]">
                <div className="flex items-center justify-between px-6 py-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/38">
                      Discover
                    </p>
                    <p className="text-2xl font-black">Tonight</p>
                  </div>
                  <div className="flex -space-x-2">
                    {["bg-rose-300", "bg-amber-200", "bg-sky-300"].map((color) => (
                      <span
                        key={color}
                        className={`size-8 rounded-full border-2 border-[#1a0b17] ${color}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="relative h-[560px] px-4 pb-4">
                  {featuredProfiles.map((profile, index) => (
                    <article
                      key={profile.name}
                      className={`absolute inset-x-4 bottom-20 top-0 overflow-hidden rounded-[2.25rem] border border-white/15 bg-linear-to-br ${profile.gradient} p-5 shadow-2xl shadow-black/35`}
                      style={{
                        transform:
                          index === 0
                            ? "rotate(-1deg) translateY(0)"
                            : `rotate(${index === 1 ? 5 : -7}deg) translateY(${index * 18}px) scale(${1 - index * 0.055})`,
                        zIndex: featuredProfiles.length - index,
                      }}
                    >
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_20%,rgba(255,255,255,0.34),transparent_24%),linear-gradient(to_top,rgba(0,0,0,0.82),transparent_58%)]" />
                      <div className="absolute right-5 top-5 rounded-full bg-black/24 px-3 py-1.5 text-xs font-black backdrop-blur-md">
                        {profile.match} match
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <div className="mb-4 flex flex-wrap gap-2">
                          {profile.interests.map((interest) => (
                            <span
                              key={interest}
                              className="rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur-md"
                            >
                              {interest}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-end justify-between gap-4">
                          <div>
                            <h2 className="text-5xl font-black tracking-tight">
                              {profile.name}, {profile.age}
                            </h2>
                            <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-white/78">
                              <MapPin className="size-4" />
                              {profile.city} · 4 km away
                            </p>
                          </div>
                          <span className="grid size-12 place-items-center rounded-full bg-white text-rose-500">
                            <Heart className="size-5 fill-rose-500" />
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}

                  <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-4">
                    <button className="grid size-16 place-items-center rounded-full border border-white/10 bg-white text-[#24111d] shadow-xl transition hover:scale-105" aria-label="Pass">
                      <X className="size-7" />
                    </button>
                    <button className="grid size-20 place-items-center rounded-full bg-linear-to-br from-rose-500 to-orange-400 text-white shadow-2xl shadow-rose-500/40 transition hover:scale-105" aria-label="Like">
                      <Heart className="size-8 fill-white" />
                    </button>
                    <button className="grid size-16 place-items-center rounded-full border border-white/10 bg-white text-[#24111d] shadow-xl transition hover:scale-105" aria-label="Super like">
                      <Star className="size-7 fill-amber-300 text-amber-300" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="experience" className="relative bg-white px-4 py-24 text-[#170713] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-black uppercase tracking-[0.32em] text-rose-500">
              The SparkDates flow
            </p>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.04em] sm:text-6xl">
              Swipe less randomly. Meet more intentionally.
            </h2>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <article
                  key={step.title}
                  className="group relative overflow-hidden rounded-[2rem] border border-rose-100 bg-linear-to-br from-white to-rose-50/70 p-7 shadow-xl shadow-rose-950/6"
                >
                  <div className="absolute -right-12 -top-12 size-36 rounded-full bg-rose-200/50 transition group-hover:scale-125" />
                  <div className="relative">
                    <div className="mb-8 flex items-center justify-between">
                      <span className="grid size-14 place-items-center rounded-2xl bg-[#170713] text-white">
                        <Icon className="size-6" />
                      </span>
                      <span className="text-6xl font-black tracking-tighter text-rose-100">
                        0{index + 1}
                      </span>
                    </div>
                    <h3 className="text-2xl font-black">{step.title}</h3>
                    <p className="mt-3 leading-7 text-[#6d5a66]">{step.description}</p>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section id="features" className="bg-[#fff7f8] px-4 py-24 text-[#170713] sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1fr] lg:items-start">
          <div className="lg:sticky lg:top-24">
            <p className="text-sm font-black uppercase tracking-[0.32em] text-rose-500">
              Built for chemistry
            </p>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.04em] sm:text-6xl">
              A dating app that looks alive because it is.
            </h2>
            <p className="mt-5 text-lg leading-8 text-[#6d5a66]">
              The interface keeps the energy high while giving people enough context to
              choose with confidence, not fatigue.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <article
                  key={feature.title}
                  className={`rounded-[2rem] border border-white bg-white p-7 shadow-xl shadow-rose-950/[0.07] ${
                    index === 1 ? "sm:translate-y-8" : ""
                  } ${index === 2 ? "sm:-translate-y-2" : ""}`}
                >
                  <span className="grid size-13 place-items-center rounded-2xl bg-linear-to-br from-rose-500 to-orange-400 text-white shadow-lg shadow-rose-500/25">
                    <Icon className="size-6" />
                  </span>
                  <h3 className="mt-8 text-2xl font-black">{feature.title}</h3>
                  <p className="mt-3 leading-7 text-[#6d5a66]">{feature.description}</p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section id="safety" className="relative isolate px-4 py-24 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(255,77,126,0.22),transparent_30%),linear-gradient(135deg,#150714,#260b1c)]" />
        <div className="mx-auto grid max-w-7xl gap-10 rounded-[2.5rem] border border-white/10 bg-white/6 p-7 shadow-2xl shadow-black/25 backdrop-blur-2xl md:grid-cols-[0.9fr_1fr] md:p-10 lg:p-14">
          <div>
            <span className="grid size-16 place-items-center rounded-3xl bg-white text-rose-500 shadow-xl shadow-rose-500/15">
              <ShieldCheck className="size-8" />
            </span>
            <h2 className="mt-8 text-4xl font-black tracking-[-0.04em] sm:text-6xl">
              Feel safe enough to be yourself.
            </h2>
          </div>

          <div className="space-y-5">
            <p className="text-lg leading-8 text-white/68">
              Great dating UI is not only beautiful. It also helps people trust the
              experience. SparkDates brings safety into the product without making the app
              feel cold or bureaucratic.
            </p>
            <div className="grid gap-3">
              {safetyItems.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.07] p-4"
                >
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-emerald-400 text-[#0e281c]">
                    <Check className="size-4" />
                  </span>
                  <span className="font-semibold text-white/82">{item}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-black/20 p-4 text-sm font-semibold text-white/55">
              <LockKeyhole className="size-5 text-rose-200" />
              You control what is public, who can reach you, and when the conversation ends.
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-24 text-[#170713] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] bg-linear-to-br from-[#170713] via-[#32101f] to-rose-600 p-8 text-center text-white shadow-2xl shadow-rose-950/20 sm:p-14">
          <div className="mx-auto mb-7 flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold text-white/75">
            <UsersRound className="size-4" />
            Your next favorite person may be one swipe away
          </div>
          <h2 className="mx-auto max-w-3xl text-4xl font-black tracking-[-0.04em] sm:text-6xl">
            Make dating feel exciting, premium, and human.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/68">
            Join SparkDates and discover a warmer way to meet people who want the same
            kind of spark you do.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              className="h-14 rounded-full bg-white px-8 text-base font-black text-[#170713] hover:bg-rose-50"
              asChild
            >
              <Link href="/signup">Create your profile</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-14 rounded-full border-white/20 bg-white/10 px-8 text-base font-bold text-white hover:bg-white/15 hover:text-white"
              asChild
            >
              <Link href="/login">Log in</Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-[#100812] px-4 py-10 text-white/55 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/home" className="flex items-center gap-3 text-white">
            <span className="grid size-10 place-items-center rounded-full bg-linear-to-br from-rose-500 to-orange-400">
              <Heart className="size-5 fill-white text-white" />
            </span>
            <span className="text-lg font-black">{BRAND.name}</span>
          </Link>
          <p className="text-sm">
            © {new Date().getFullYear()} SparkDates. Built for real chemistry.
          </p>
        </div>
      </footer>
    </main>
  )
}
