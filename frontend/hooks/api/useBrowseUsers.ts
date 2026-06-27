"use client"

import { browseApi } from "@/lib/services/browse-api"
import { useAsyncQuery } from "./useAsyncQuery"

export function useBrowseUsers() {
  return useAsyncQuery(() => browseApi.browseUsers())
}
