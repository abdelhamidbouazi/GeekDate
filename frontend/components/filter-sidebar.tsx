"use client"


import { useState, useCallback, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Toggle } from "@/components/ui/toggle"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Interest {
  id: string
  name: string
}

export interface Filters {
  age: [number, number]
  distance: number
  fameRating: number
  tagIds: string[]
  sortBy: "recommended" | "age" | "distance" | "fame" | "tags"
  sortDir: "asc" | "desc"
}

export const defaultFilters: Filters = {
  age: [18, 50],
  distance: 25,
  fameRating: 50,
  tagIds: [],
  sortBy: "recommended",
  sortDir: "desc",
}

interface FilterSectionProps {
  title: string
  description?: string
  children: React.ReactNode
}

function FilterSection({ title, description, children }: FilterSectionProps) {
  return (
    <div className="space-y-3 min-w-0 w-full">
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      <div className="min-w-0 w-full">
        {children}
      </div>
    </div>
  )
}

interface TagPillsProps {
  interests: Interest[]
  selectedIds: string[]
  onToggle: (id: string) => void
}

function TagPills({ interests, selectedIds, onToggle }: TagPillsProps) {
  return (
    <div className="flex flex-wrap gap-2 min-w-0 w-full">
      {interests.map((interest) => {
        const isSelected = selectedIds.includes(interest.id)
        return (
          <Toggle
            key={interest.id}
            pressed={isSelected}
            onPressedChange={() => onToggle(interest.id)}
            variant="outline"
            className={cn(
              "h-auto px-3 py-1.5 text-xs font-medium transition-all shrink-0",
              isSelected &&
                "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30 text-foreground shadow-sm"
            )}
            aria-label={`Toggle ${interest.name} tag`}
          >
            {interest.name}
          </Toggle>
        )
      })}
    </div>
  )
}

interface RightFilterSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: Filters
  onFiltersChange: (filters: Filters) => void
  onApply: (filters: Filters) => void
  interests: Interest[]
  onReset?: () => void | Promise<void>
}

export function RightFilterSidebar({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
  onApply,
  interests,
  onReset,
}: RightFilterSidebarProps) {
  const [localFilters, setLocalFilters] = useState<Filters>(filters)

  // Sync local filters when dialog opens or parent filters change
  useEffect(() => {
    if (open) setLocalFilters(filters)
  }, [open, filters])

  const handleReset = useCallback(() => {
    setLocalFilters(defaultFilters)
    onFiltersChange(defaultFilters)
    onReset?.()
    onOpenChange(false)
  }, [onFiltersChange, onReset, onOpenChange])

  const handleApply = useCallback(() => {
    onFiltersChange(localFilters)
    onApply(localFilters)
    onOpenChange(false)
  }, [localFilters, onFiltersChange, onApply, onOpenChange])

  const handleTagToggle = useCallback((id: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      tagIds: prev.tagIds.includes(id)
        ? prev.tagIds.filter((t) => t !== id)
        : [...prev.tagIds, id],
    }))
  }, [])

  const handleSortDirToggle = useCallback(() => {
    setLocalFilters((prev) => ({
      ...prev,
      sortDir: prev.sortDir === "asc" ? "desc" : "asc",
    }))
  }, [])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] p-0 flex flex-col overflow-hidden overflow-x-hidden w-full max-w-[min(42rem,calc(100vw-2rem))]">
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
            <DialogTitle className="text-2xl font-semibold">Filters</DialogTitle>
            <DialogDescription>
              Refine your discovery
            </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden min-w-0">
          <ScrollArea className="h-full px-6 py-6">
            <div className="space-y-6 min-w-0 w-full">
            {/* Age Range */}
            <FilterSection
              title="Age Range"
              description="Select your preferred age range"
            >
              <div className="space-y-3 min-w-0 w-full">
                <Slider
                  value={localFilters.age}
                  onValueChange={(value) =>
                    setLocalFilters((prev) => ({ ...prev, age: value as [number, number] }))
                  }
                  min={18}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="flex items-center justify-between text-sm gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Min:</span>
                    <span className="font-medium">{localFilters.age[0]} years</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Max:</span>
                    <span className="font-medium">{localFilters.age[1]} years</span>
                  </div>
                </div>
              </div>
            </FilterSection>

            <Separator />

            {/* Distance */}
            <FilterSection
              title="Distance"
              description="Maximum distance in kilometers"
            >
              <div className="space-y-4 min-w-0 w-full">
                <Slider
                  value={[localFilters.distance]}
                  onValueChange={(value) =>
                    setLocalFilters((prev) => ({ ...prev, distance: value[0] }))
                  }
                  min={1}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Current:</span>
                  <span className="text-sm font-medium">{localFilters.distance} km</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[5, 10, 25, 50].map((preset) => (
                    <Button
                      key={preset}
                      variant={
                        localFilters.distance === preset ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        setLocalFilters((prev) => ({ ...prev, distance: preset }))
                      }
                      className="h-8"
                    >
                      {preset} km
                    </Button>
                  ))}
                </div>
              </div>
            </FilterSection>

            <Separator />

            {/* Fame Rating */}
            <FilterSection
              title="Fame Rating"
              description="Minimum fame rating (0-100)"
            >
              <div className="space-y-3 min-w-0 w-full">
                <Slider
                  value={[localFilters.fameRating]}
                  onValueChange={(value) =>
                    setLocalFilters((prev) => ({ ...prev, fameRating: value[0] }))
                  }
                  min={0}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Current:</span>
                  <span className="text-sm font-medium">{localFilters.fameRating}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Higher ratings indicate more popular profiles
                </p>
              </div>
            </FilterSection>

            <Separator />

            {/* Interest Tags */}
            <FilterSection
              title="Interest Tags"
              description="Select tags to find matching interests"
            >
              <div className="space-y-3 min-w-0">
                <TagPills
                  interests={interests}
                  selectedIds={localFilters.tagIds}
                  onToggle={handleTagToggle}
                />
                {localFilters.tagIds.length > 0 && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary" className="text-xs">
                      {localFilters.tagIds.length} selected
                    </Badge>
                  </div>
                )}
              </div>
            </FilterSection>

            <Separator />

            {/* Sort Options */}
            <FilterSection
              title="Sort By"
              description="Choose how to order results"
            >
              <div className="space-y-3 min-w-0 w-full">
                <Select
                  value={localFilters.sortBy}
                  onValueChange={(value) =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      sortBy: value as Filters["sortBy"],
                    }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recommended">Recommended</SelectItem>
                    <SelectItem value="age">Age</SelectItem>
                    <SelectItem value="distance">Distance</SelectItem>
                    <SelectItem value="fame">Fame Rating</SelectItem>
                    <SelectItem value="tags">Common Tags</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSortDirToggle}
                    className="flex-1"
                  >
                    <ArrowUpDown className="size-4 mr-2" />
                    {localFilters.sortDir === "asc" ? "Ascending" : "Descending"}
                  </Button>
                </div>
              </div>
            </FilterSection>
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shrink-0 min-w-0">
          <div className="flex w-full gap-2 min-w-0">
            <Button variant="outline" onClick={handleReset} className="flex-1">
              Reset
            </Button>
            <Button onClick={handleApply} className="flex-1">
              Apply Filters
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
