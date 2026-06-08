"use client"

import { AppBreadcrumb } from "@/components/layout/breadcrumb"
import { MobileSidebarTrigger } from "@/components/layout/sidebar"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getInitials } from "@/lib/utils"
import { useGetUnreadCountQuery } from "@/store/api/notifications-api"
import { Bell, LogOut, Settings } from "lucide-react"
import { signOut, useSession } from "next-auth/react"
import Link from "next/link"

export function Topbar() {
  const { data: session } = useSession()
  const user = session?.user
  const { data: unread } = useGetUnreadCountQuery()

  return (
    <header className="flex h-14 items-center border-b bg-background px-4">
      <MobileSidebarTrigger />
      <div className="min-w-0 flex-1 overflow-hidden">
        <AppBreadcrumb />
      </div>

      <div className="ml-auto flex items-center gap-1">
        <ThemeToggle />

        <Link
          href="/dashboard/notifications"
          className="relative inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <Bell className="h-4 w-4" />
          {unread && unread.count > 0 && (
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
              {unread.count > 9 ? "9+" : unread.count}
            </span>
          )}
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger className="ml-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[11px] font-medium text-primary-foreground outline-none">
            {user?.name ? getInitials(user.name) : "?"}
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-52">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium leading-none">{user?.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">{user?.email}</p>
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuItem>
              <Link
                href="/dashboard/settings"
                className="flex w-full items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              variant="destructive"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
