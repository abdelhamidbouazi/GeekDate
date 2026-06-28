export function parseTimestamp(value: string | Date | null | undefined): Date | null {
  if (value == null) return null
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value
  // Backend sends DateTime.UtcNow without Z suffix — append it so the browser
  // parses as UTC rather than local time.
  let str = String(value)
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?$/.test(str)) str += "Z"
  const parsed = new Date(str)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function formatRelativeTime(value: string | Date | null | undefined): string {
  const date = parseTimestamp(value)
  if (!date) return ""

  const diffMs = Date.now() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}
