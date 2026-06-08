"use client"

import { useAppDispatch } from "@/hooks/use-app-dispatch"
import { useAppSelector } from "@/hooks/use-app-selector"
import type { RootState } from "@/store"
import { setMobileSidebarOpen, setSidebarOpen } from "@/store/slices/ui.slice"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import {
  BarChart3,
  CheckSquare,
  ChevronLeft,
  FolderKanban,
  LayoutDashboard,
  Menu,
  Settings,
  Users,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect } from "react"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/projects", label: "Projects", icon: FolderKanban },
  { href: "/dashboard/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/dashboard/team", label: "Team", icon: Users },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
]

function NavLinks({
  collapsed,
  onNavigate,
}: Readonly<{ collapsed?: boolean; onNavigate?: () => void }>) {
  const pathname = usePathname()

  return (
    <>
      <nav className="flex-1 space-y-0.5 px-2 py-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href ||
            (href !== "/dashboard" && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                "flex h-8 items-center gap-2.5 rounded-md px-2 text-sm transition-colors",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          )
        })}
      </nav>

      <div className="border-t px-2 py-2">
        <Link
          href="/dashboard/settings"
          onClick={onNavigate}
          className={cn(
            "flex h-8 items-center gap-2.5 rounded-md px-2 text-sm transition-colors",
            usePathname() === "/dashboard/settings"
              ? "bg-sidebar-primary text-sidebar-primary-foreground"
              : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          )}
        >
          <Settings className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Settings</span>}
        </Link>
      </div>
    </>
  )
}

export function MobileSidebarTrigger() {
  const dispatch = useAppDispatch()
  const mobileOpen = useAppSelector((s: RootState) => s.ui.mobileSidebarOpen)

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => dispatch(setMobileSidebarOpen(!mobileOpen))}
      aria-label="Open menu"
      className="md:hidden"
    >
      <Menu className="h-4 w-4" />
    </Button>
  )
}

export function Sidebar() {
  const dispatch = useAppDispatch()
  const open = useAppSelector((s: RootState) => s.ui.sidebarOpen)
  const mobileOpen = useAppSelector((s: RootState) => s.ui.mobileSidebarOpen)
  const pathname = usePathname()

  useEffect(() => {
    dispatch(setMobileSidebarOpen(false))
  }, [pathname, dispatch])

  return (
    <>
      <aside
        className={cn(
          "hidden h-screen flex-col border-r bg-sidebar transition-all duration-300 md:flex",
          open ? "w-56" : "w-14"
        )}
      >
        <div className="flex h-14 items-center justify-between px-3">
          {open && (
            <span className="text-sm font-semibold text-sidebar-foreground">
              EAP
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => dispatch(setSidebarOpen(!open))}
            aria-label="Toggle sidebar"
            className="ml-auto h-7 w-7 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <ChevronLeft
              className={cn(
                "h-4 w-4 transition-transform",
                !open && "rotate-180"
              )}
            />
          </Button>
        </div>
        <NavLinks collapsed={!open} />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={(o) => dispatch(setMobileSidebarOpen(o))}>
        <SheetContent side="left" className="flex w-56 flex-col bg-sidebar p-0">
          <div className="flex h-14 items-center border-b px-4">
            <span className="text-sm font-semibold text-sidebar-foreground">
              EAP
            </span>
          </div>
          <NavLinks onNavigate={() => dispatch(setMobileSidebarOpen(false))} />
        </SheetContent>
      </Sheet>
    </>
  )
}
