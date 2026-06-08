export const ROUTE_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  projects: "Projects",
  tasks: "Tasks",
  team: "Team",
  analytics: "Analytics",
  notifications: "Notifications",
  settings: "Settings",
}

const ID_RE =
  /^(c[a-z0-9]{20,}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i

export function isIdSegment(segment: string): boolean {
  return ID_RE.test(segment)
}

const PARENT_LABELS: Record<string, string> = {
  projects: "Project",
  tasks: "Task",
}

export function segmentLabel(segment: string, parent?: string): string {
  if (ROUTE_LABELS[segment]) return ROUTE_LABELS[segment]
  if (ID_RE.test(segment)) return parent ? (PARENT_LABELS[parent] ?? "Detail") : "Detail"
  return segment.charAt(0).toUpperCase() + segment.slice(1)
}

export interface Crumb {
  href: string
  label: string
  isLast: boolean
}

export function buildCrumbs(pathname: string): Crumb[] {
  const segments = pathname.split("/").filter(Boolean)
  return segments.map((segment, i) => ({
    href: "/" + segments.slice(0, i + 1).join("/"),
    label: segmentLabel(segment, segments[i - 1]),
    isLast: i === segments.length - 1,
  }))
}
