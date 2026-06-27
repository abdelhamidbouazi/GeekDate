export async function geocodeCityCountry(city: string, country: string): Promise<{ lat: number; lon: number }> {
  const query = encodeURIComponent(`${city.trim()}, ${country.trim()}`)
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
    { headers: { "Accept-Language": "en", "User-Agent": "SparkDates/1.0" } }
  )
  if (!res.ok) throw new Error("Geocoding failed")
  const data = (await res.json()) as { lat: string; lon: string }[]
  if (!data?.[0]) throw new Error("Location not found. Try a different city or country.")
  return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) }
}

