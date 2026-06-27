"use client"

import { Suspense, useCallback, useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, ChevronRight, LogOut, MapPin, Upload } from "lucide-react"
import { authApi, clearAuthCookie } from "@/lib/auth"
import { browseApi, type GetInterestsDto } from "@/lib/services/browse-api"
import { InterestsField } from "./interests-field"
import { profileApi } from "@/lib/services/profile-api"
import { geocodeCityCountry } from "@/lib/api/location"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
type Step = "loading" | "verify-email" | "basic-profile" | "preferences" | "location"

const GENDER_OPTIONS = [
  { value: "1", label: "Male" },
  { value: "2", label: "Female" },
]

const PREFERRED_GENDER_OPTIONS = [
  { value: "0", label: "None" },
  { value: "1", label: "Male" },
  { value: "2", label: "Female" },
  { value: "3", label: "Unknown" },
]

const GUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
function VerifyShell({
  children,
  onLogout,
}: {
  children: React.ReactNode
  onLogout: () => void
}) {
  return (
    <div className="bg-muted relative flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="absolute right-4 top-4">
        <Button variant="ghost" size="sm" onClick={onLogout}>
          <LogOut className="mr-2 size-4" />
          Log out
        </Button>
      </div>
      {children}
    </div>
  )
}

function VerifyContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState<Step>("loading")
  const [error, setError] = useState("")

  // Basic profile state (Step 1)
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [gender, setGender] = useState("0")
  const [mainPicture, setMainPicture] = useState<File | null>(null)
  const [extraPictures, setExtraPictures] = useState<FileList | null>(null)

  // Preferences state (Step 2)
  const [preferredGender, setPreferredGender] = useState("0")
  const [biography, setBiography] = useState("")
  const [selectedInterestIds, setSelectedInterestIds] = useState<string[]>([])
  const [interests, setInterests] = useState<GetInterestsDto[]>([])
  const [interestsLoading, setInterestsLoading] = useState(false)

  const [profileLoading, setProfileLoading] = useState(false)
  const [verifyLoading, setVerifyLoading] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationMode, setLocationMode] = useState<"choose" | "browser" | "manual">("choose")
  const [manualCity, setManualCity] = useState("")
  const [manualCountry, setManualCountry] = useState("")
  const preferencesInterestsLoadStarted = useRef(false)

  const fetchInterests = useCallback(async () => {
    setInterestsLoading(true)
    setError("")
    try {
      const list = await browseApi.getInterests()
      setInterests(list)
      const anyValidId = list.some((i) => {
        const id = i.id ?? i.Id
        return id && GUID_REGEX.test(String(id))
      })
      if (list.length > 0 && !anyValidId) {
        setError("Interests loaded but missing IDs. Please refresh or contact support.")
      }
    } catch (err) {
      setInterests([])
      setError(err instanceof Error ? err.message : "Failed to load interests. Please refresh.")
    } finally {
      setInterestsLoading(false)
    }
  }, [])

  useEffect(() => {
    async function init() {
      if (typeof window === "undefined") return
      const token = localStorage.getItem("accessToken")
      if (!token) {
        router.replace("/login")
        return
      }

      const userId = searchParams.get("userId")
      const codeParam = searchParams.get("code") ?? searchParams.get("token")

      if (userId && codeParam) {
        try {
          await authApi.confirmEmail(userId, codeParam)
          sessionStorage.setItem("emailJustVerified", "1")
        } catch {
          setError("Failed to verify email")
        }
      }

      try {
        const justVerified = sessionStorage.getItem("emailJustVerified")
        if (justVerified) {
          sessionStorage.removeItem("emailJustVerified")
          setStep("basic-profile")
          fetchInterests()
          return
        }

        const res = await authApi.validateToken() as { emailVerified?: boolean; profileCompleted?: boolean }
        const emailVerified = res?.emailVerified ?? false
        const profileCompleted = res?.profileCompleted ?? false

        if (emailVerified && profileCompleted) {
          try {
            const profile = await profileApi.getConnectedProfile()
            const lat = profile?.latitude ?? (profile as { Latitude?: number })?.Latitude ?? 0
            const lng = profile?.longitude ?? (profile as { Longitude?: number })?.Longitude ?? 0
            if (lat !== 0 || lng !== 0) {
              router.replace("/browse")
              return
            }
            setStep("location")
          } catch {
            setStep("location")
          }
          return
        }
        if (!emailVerified) {
          setStep("verify-email")
        } else {
          try {
            const profile = await profileApi.getConnectedProfile()
            const completed =
              profile?.isProfileCompleted ??
              (profile as { IsProfileCompleted?: boolean })?.IsProfileCompleted ??
              false
            if (completed) {
              await refreshProfileCompletedSession()
              const lat = profile?.latitude ?? (profile as { Latitude?: number })?.Latitude ?? 0
              const lng = profile?.longitude ?? (profile as { Longitude?: number })?.Longitude ?? 0
              if (lat !== 0 || lng !== 0) {
                router.replace("/browse")
                return
              }
              setStep("location")
              return
            }
          } catch {
            // Fall through to onboarding from the beginning.
          }
          setStep("basic-profile")
          fetchInterests()
        }
      } catch {
        router.replace("/login")
      }
    }
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetchInterests is stable, init only needs router/searchParams
  }, [router, searchParams])

  useEffect(() => {
    if (step !== "preferences") {
      preferencesInterestsLoadStarted.current = false
      return
    }
    if (preferencesInterestsLoadStarted.current) return
    if (interests.length > 0) return
    preferencesInterestsLoadStarted.current = true
    void fetchInterests()
  }, [step, interests.length, fetchInterests])

  async function handleLogout() {
    try {
      await authApi.logout()
    } catch {
      // ignore
    } finally {
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("user")
      sessionStorage.removeItem("emailJustVerified")
      clearAuthCookie()
      router.push("/login")
    }
  }

  async function handleIveVerified() {
    setVerifyLoading(true)
    setError("")
    try {
      const res = await authApi.validateToken() as { emailVerified?: boolean; profileCompleted?: boolean }
      if (res?.emailVerified) {
        setStep("basic-profile")
        await fetchInterests()
      } else {
        setError("Email not verified yet. Please click the link in your email.")
      }
    } catch {
      setError("Failed to check verification status")
    } finally {
      setVerifyLoading(false)
    }
  }

  async function refreshProfileCompletedSession() {
    try {
      const response = await authApi.refreshToken()
      const token =
        response && typeof response === "object"
          ? ((response as { data?: string; Data?: string }).data ??
            (response as { data?: string; Data?: string }).Data)
          : undefined

      if (typeof token === "string" && token.trim()) {
        localStorage.setItem("accessToken", token.trim())
      }

      const rawUser = localStorage.getItem("user")
      if (rawUser) {
        const user = JSON.parse(rawUser) as Record<string, unknown>
        localStorage.setItem(
          "user",
          JSON.stringify({ ...user, isProfileCompleted: true })
        )
      }
    } catch {
      // The profile is already persisted; stale claims are handled by /verify init.
    }
  }

  async function handleBasicProfileSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (!mainPicture) {
      setError("Please upload a main picture")
      return
    }
    if (gender === "0") {
      setError("Please select your gender")
      return
    }
    setProfileLoading(true)
    try {
      const form = new FormData()
      form.append("MainPicture", mainPicture)
      if (dateOfBirth) form.append("DateOfBirth", new Date(dateOfBirth).toISOString())
      form.append("Gender", gender)
      if (extraPictures) {
        for (let i = 0; i < extraPictures.length; i++) {
          form.append("Photos", extraPictures[i])
        }
      }
      await profileApi.completeBasicProfile(form)
      setStep("preferences")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save basic profile")
    } finally {
      setProfileLoading(false)
    }
  }

  async function handlePreferencesSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    const validIds = selectedInterestIds.filter((id) => GUID_REGEX.test(id))
    if (validIds.length === 0) {
      setError("Please select at least one interest")
      return
    }
    setProfileLoading(true)
    try {
      const form = new FormData()
      form.append("Biography", biography)
      form.append("PreferredGender", preferredGender)
      form.append("Gender", gender)
      validIds.forEach((id) => form.append("UserInterestIds", id))
      await profileApi.completePreferences(form)
      await refreshProfileCompletedSession()
      setStep("location")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to complete profile")
    } finally {
      setProfileLoading(false)
    }
  }

  function toggleInterest(id: string) {
    setSelectedInterestIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  async function handleLocationAllow() {
    setLocationLoading(true)
    setError("")
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        })
      })
      await profileApi.setLocation(pos.coords.latitude, pos.coords.longitude)
      router.replace("/browse")
    } catch (err: unknown) {
      const pe = err as { code?: number }
      if (typeof pe?.code === "number" && pe.code === 1) {
        setError("Location access denied.")
        setLocationMode("manual")
      } else {
        setError("Could not get your location.")
        setLocationMode("manual")
      }
    } finally {
      setLocationLoading(false)
    }
  }

  async function handleManualLocationSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (!manualCity.trim() || !manualCountry.trim()) {
      setError("Please enter both city and country")
      return
    }
    setLocationLoading(true)
    try {
      const { lat, lon } = await geocodeCityCountry(manualCity, manualCountry)
      await profileApi.setLocation(lat, lon)
      router.replace("/browse")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to find location")
    } finally {
      setLocationLoading(false)
    }
  }

  function handleLocationSkip() {
    router.replace("/browse")
  }

  if (step === "loading") {
    return (
      <div className="bg-muted flex min-h-svh items-center justify-center p-6">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (step === "verify-email") {
    return (
      <VerifyShell onLogout={handleLogout}>
        <div className="w-full max-w-sm">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Verify your email</CardTitle>
              <CardDescription>
                We sent a confirmation link to your email. Click it to verify your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button onClick={handleIveVerified} disabled={verifyLoading}>
                {verifyLoading ? "Checking..." : "I've verified"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Resending verification emails is not exposed by the backend.
              </p>
            </CardContent>
          </Card>
        </div>
      </VerifyShell>
    )
  }

  if (step === "basic-profile") {
    return (
      <VerifyShell onLogout={handleLogout}>
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="text-muted-foreground mb-1 text-sm font-medium">Step 1 of 3</div>
              <CardTitle className="text-xl">Basic profile</CardTitle>
              <CardDescription>
                Add your photo and basic info
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBasicProfileSubmit}>
                <FieldGroup>
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <Field>
                    <FieldLabel htmlFor="mainPicture">Main picture</FieldLabel>
                    <div className="border-input flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8">
                      <Upload className="text-muted-foreground mb-2 size-10" />
                      <Label htmlFor="mainPicture" className="cursor-pointer text-sm font-medium">
                        <span className="text-primary underline">Choose file</span>
                        {" "}or drag and drop
                      </Label>
                      <Input
                        id="mainPicture"
                        type="file"
                        accept="image/*"
                        className="mt-2 hidden"
                        onChange={(e) => setMainPicture(e.target.files?.[0] || null)}
                      />
                      {mainPicture && (
                        <p className="text-muted-foreground mt-1 text-xs">{mainPicture.name}</p>
                      )}
                    </div>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="dateOfBirth">Date of birth</FieldLabel>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Gender</FieldLabel>
                    <Select value={gender} onValueChange={setGender}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select your gender" />
                      </SelectTrigger>
                      <SelectContent>
                        {GENDER_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="extraPictures">Extra photos (up to 4)</FieldLabel>
                    <Input
                      id="extraPictures"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => setExtraPictures(e.target.files)}
                    />
                  </Field>
                  <Button type="submit" disabled={profileLoading} className="w-full">
                    {profileLoading ? "Saving..." : "Continue"}
                  </Button>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>
        </div>
      </VerifyShell>
    )
  }

  if (step === "location") {
    return (
      <VerifyShell onLogout={handleLogout}>
        <div className="w-full max-w-sm">
          <Card>
            <CardHeader className="text-center">
              <div className="text-muted-foreground mb-1 text-sm font-medium">Step 3 of 3</div>
              <CardTitle className="text-xl">Share your location</CardTitle>
              <CardDescription>
                Share your location for better matches nearby
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {locationMode === "manual" ? (
                <form onSubmit={handleManualLocationSubmit} className="flex flex-col gap-4">
                  <Field>
                    <FieldLabel htmlFor="manualCity">City</FieldLabel>
                    <Input
                      id="manualCity"
                      type="text"
                      placeholder="e.g. Paris"
                      value={manualCity}
                      onChange={(e) => setManualCity(e.target.value)}
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="manualCountry">Country</FieldLabel>
                    <Input
                      id="manualCountry"
                      type="text"
                      placeholder="e.g. France"
                      value={manualCountry}
                      onChange={(e) => setManualCountry(e.target.value)}
                      required
                    />
                  </Field>
                  <div className="flex flex-col gap-2">
                    <Button type="submit" disabled={locationLoading} className="w-full">
                      <MapPin className="mr-2 size-4" />
                      {locationLoading ? "Finding location..." : "Use this location"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => { setLocationMode("choose"); setError("") }}
                      disabled={locationLoading}
                      className="w-full"
                    >
                      Try browser location again
                    </Button>
                    <Button variant="ghost" onClick={handleLocationSkip} disabled={locationLoading} className="w-full">
                      Skip for now
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col gap-3">
                  <Button onClick={handleLocationAllow} disabled={locationLoading} className="w-full">
                    <MapPin className="mr-2 size-4" />
                    {locationLoading ? "Getting location..." : "Allow location access"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setLocationMode("manual")}
                    disabled={locationLoading}
                    className="w-full"
                  >
                    Enter city and country instead
                  </Button>
                  <Button variant="ghost" onClick={handleLocationSkip} disabled={locationLoading} className="w-full">
                    Skip for now
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </VerifyShell>
    )
  }

  return (
    <VerifyShell onLogout={handleLogout}>
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="text-muted-foreground mb-1 text-sm font-medium">Step 2 of 3</div>
            <CardTitle className="text-xl">Preferences</CardTitle>
            <CardDescription>
              Tell us about yourself and your interests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePreferencesSubmit}>
              <FieldGroup>
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Field>
                  <FieldLabel htmlFor="biography">Bio</FieldLabel>
                  <textarea
                    id="biography"
                    className="border-input flex min-h-[100px] w-full rounded-md border bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="Tell us about yourself"
                    value={biography}
                    onChange={(e) => setBiography(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel>Preferred gender</FieldLabel>
                  <Select value={preferredGender} onValueChange={setPreferredGender}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Who are you interested in?" />
                    </SelectTrigger>
                    <SelectContent>
                      {PREFERRED_GENDER_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <InterestsField
                  interests={interests}
                  loading={interestsLoading}
                  selectedIds={selectedInterestIds}
                  onToggle={toggleInterest}
                  onInterestCreated={(item) => {
                    setInterests((prev) =>
                      [...prev, { id: item.id, name: item.name }].sort((a, b) => {
                        const an = a.name ?? a.Name ?? ""
                        const bn = b.name ?? b.Name ?? ""
                        return an.localeCompare(bn, undefined, { sensitivity: "base" })
                      })
                    )
                    setSelectedInterestIds((ids) => (ids.includes(item.id) ? ids : [...ids, item.id]))
                  }}
                  onRequestError={(msg) => setError(msg)}
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep("basic-profile")}
                    className="flex-1"
                  >
                    <ChevronLeft className="mr-1 size-4" />
                    Back
                  </Button>
                  <Button type="submit" disabled={profileLoading} className="flex-1">
                    {profileLoading ? "Saving..." : "Complete"}
                    <ChevronRight className="ml-1 size-4" />
                  </Button>
                </div>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </VerifyShell>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="bg-muted flex min-h-svh items-center justify-center p-6"><p className="text-muted-foreground">Loading...</p></div>}>
      <VerifyContent />
    </Suspense>
  )
}
