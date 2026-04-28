"use client"

import { useCallback, useId, useMemo, useState } from "react"
import { browseApi, type GetInterestsDto } from "@/lib/services/browse-api"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

const GUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function interestName(i: GetInterestsDto): string {
  return i.name ?? i.Name ?? ""
}

function interestId(i: GetInterestsDto): string | null {
  const id = i.id ?? i.Id
  return id && GUID_REGEX.test(String(id)) ? String(id) : null
}

export type InterestsFieldProps = {
  interests: GetInterestsDto[]
  loading: boolean
  selectedIds: string[]
  onToggle: (id: string) => void
  onInterestCreated: (item: { id: string; name: string }) => void
  onRequestError: (message: string) => void
}

/**
 * Search narrows the visible interest list in memory only (one GET loads the catalog).
 * Creating an interest issues a single POST /api/Interest and updates local state via `onInterestCreated`.
 */
export function InterestsField({
  interests,
  loading,
  selectedIds,
  onToggle,
  onInterestCreated,
  onRequestError,
}: InterestsFieldProps) {
  const searchId = useId()
  const hintId = useId()
  const [query, setQuery] = useState("")
  const [creating, setCreating] = useState(false)

  const q = query.trim()
  const qLower = q.toLowerCase()

  const filtered = useMemo(() => {
    if (!qLower) {
      return [...interests].sort((a, b) => interestName(a).localeCompare(interestName(b), undefined, { sensitivity: "base" }))
    }
    return interests
      .filter((i) => interestName(i).toLowerCase().includes(qLower))
      .sort((a, b) => interestName(a).localeCompare(interestName(b), undefined, { sensitivity: "base" }))
  }, [interests, qLower])

  const hasExactName = useMemo(
    () => interests.some((i) => interestName(i).toLowerCase() === qLower),
    [interests, qLower]
  )

  const canAddNew = Boolean(q) && !hasExactName && !creating && !loading

  const submitNewInterest = useCallback(async () => {
    if (!canAddNew) return
    setCreating(true)
    try {
      const created = await browseApi.createInterest(q)
      onInterestCreated(created)
      setQuery("")
    } catch (err) {
      onRequestError(err instanceof Error ? err.message : "Could not create interest.")
    } finally {
      setCreating(false)
    }
  }, [canAddNew, q, onInterestCreated, onRequestError])

  return (
    <div className="space-y-2">
      <FieldLabel htmlFor={searchId}>Interests (select at least 1)</FieldLabel>
      <div className="border-input rounded-md border p-3 space-y-3">
        <Input
          id={searchId}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              void submitNewInterest()
            }
          }}
          placeholder="Search interests or type a new name to add…"
          autoComplete="off"
          disabled={creating || loading}
          aria-describedby={hintId}
        />
        <p id={hintId} className="text-muted-foreground text-xs">
          Search filters this list locally (no extra requests). New interests use one POST each.
        </p>

        {loading ? (
          <p className="text-muted-foreground text-sm">Loading interests...</p>
        ) : (
          <>
            {!interests.length && !q && (
              <p className="text-muted-foreground text-sm">No interests yet — add the first one above.</p>
            )}

            {canAddNew && (
              <Button type="button" variant="secondary" size="sm" disabled={creating} onClick={() => void submitNewInterest()}>
                {creating ? "Adding…" : `Add “${q}”`}
              </Button>
            )}

            {filtered.length > 0 && (
              <div className="max-h-48 overflow-y-auto flex flex-wrap gap-3 pt-1">
                {filtered.map((item) => {
                  const id = interestId(item)
                  const name = interestName(item)
                  if (!id) return null
                  return (
                    <label
                      key={id}
                      className="border-input flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors hover:bg-muted/50 has-checked:border-primary has-checked:bg-primary/5"
                    >
                      <Checkbox checked={selectedIds.includes(id)} onCheckedChange={() => onToggle(id)} />
                      <span>{name}</span>
                    </label>
                  )
                })}
              </div>
            )}

            {q && filtered.length === 0 && !canAddNew && (
              <p className="text-muted-foreground text-sm">No matches. Adjust your search.</p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
