import type { MetadataRoute } from "next"

const routes = [
  "/",
  "/home",
  "/login",
  "/signup",
  "/browse",
  "/matches",
  "/likes",
  "/messages",
  "/profile",
]

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `https://sparkdates.com${route}`,
    lastModified: new Date(),
  }))
}
