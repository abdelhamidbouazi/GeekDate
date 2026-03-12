"use client"

import { Suspense, useCallback, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, ChevronRight, MapPin, Upload } from "lucide-react"
import { authApi } from "@/lib/auth"
import { api } from "@/lib/api"
import { browseApi } from "@/lib/browse-api"
import { profileApi } from "@/lib/profile-api"
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
import { Checkbox } from "@/components/ui/checkbox"

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

interface InterestItem {
  id?: string
  Id?: string
  name?: string
}

const GUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

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
  const [interests, setInterests] = useState<InterestItem[]>([])
  const [interestsLoading, setInterestsLoading] = useState(false)

  const [profileLoading, setProfileLoading] = useState(false)
  const [verifyLoading, setVerifyLoading] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationMode, setLocationMode] = useState<"choose" | "browser" | "manual">("choose")
  const [manualCity, setManualCity] = useState("")
  const [manualCountry, setManualCountry] = useState("")

  const fetchInterests = useCallback(async () => {
    setInterestsLoading(true)
    setError("")
    try {
      const list = await browseApi.getInterests()
      const mapped = list
        .map((i, idx) => ({
          id: i.id ?? i.Id ?? (i as { Id?: string }).Id,
          Id: i.Id ?? i.id ?? (i as { Id?: string }).Id,
          name: i.name ?? i.Name ?? (i as { Name?: string }).Name ?? `Interest ${idx}`,
        }))
        .filter((i) => i.id || i.Id)
      setInterests(mapped)
      if (mapped.length === 0 && list.length > 0) {
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

  // Fetch interests when entering preferences step (in case they weren't loaded yet)
  useEffect(() => {
    if (step === "preferences" && interests.length === 0) {
      fetchInterests()
    }
  }, [step, interests.length, fetchInterests])

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
      await api.putFormData<unknown>("/api/UserProfile/complete-basic-profile", form)
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
    const allPictures: File[] = mainPicture ? [mainPicture] : []
    if (extraPictures) {
      for (let i = 0; i < Math.min(extraPictures.length, 4); i++) {
        allPictures.push(extraPictures[i])
      }
    }
    if (allPictures.length === 0) {
      setError("Please add at least one picture")
      return
    }
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
      allPictures.forEach((file) => form.append("Pictures", file))
      await api.putFormData<unknown>("/api/UserProfile/complete-preferences", form)
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

  async function geocodeCityCountry(city: string, country: string): Promise<{ lat: number; lon: number }> {
    const query = encodeURIComponent(`${city.trim()}, ${country.trim()}`)
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
      { headers: { "Accept-Language": "en", "User-Agent": "Matcha/1.0" } }
    )
    if (!res.ok) throw new Error("Geocoding failed")
    const data = (await res.json()) as { lat: string; lon: string }[]
    if (!data?.[0]) throw new Error("Location not found. Try a different city or country.")
    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) }
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
      <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
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
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (step === "basic-profile") {
    return (
      <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
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
      </div>
    )
  }

  if (step === "location") {
    return (
      <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
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
      </div>
    )
  }

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
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
                <Field>
                  <FieldLabel>Interests (select at least 1)</FieldLabel>
                  <div className="border-input rounded-md border p-3">
                    {interestsLoading ? (
                      <p className="text-muted-foreground text-sm">Loading interests...</p>
                    ) : interests.length === 0 ? (
                      <div className="flex flex-col gap-2">
                        <p className="text-muted-foreground text-sm">No interests available.</p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fetchInterests()}
                        >
                          Retry
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-3">
                        {interests.map((item) => {
                          const id = String(item.id ?? item.Id ?? "")
                          const name = item.name ?? (item as { Name?: string }).Name ?? id
                          if (!id || !GUID_REGEX.test(id)) return null
                          return (
                            <label
                              key={id}
                              className="border-input flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors hover:bg-muted/50 has-checked:border-primary has-checked:bg-primary/5"
                            >
                              <Checkbox
                                checked={selectedInterestIds.includes(id)}
                                onCheckedChange={() => toggleInterest(id)}
                              />
                              <span>{name}</span>
                            </label>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </Field>
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
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="bg-muted flex min-h-svh items-center justify-center p-6"><p className="text-muted-foreground">Loading...</p></div>}>
      <VerifyContent />
    </Suspense>
  )
}
