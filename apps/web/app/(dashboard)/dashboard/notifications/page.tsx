"use client"

import {
  useGetNotificationsQuery,
  useMarkAllReadMutation,
  useMarkReadMutation,
} from "@/store/api/notifications-api"
import { timeAgo } from "@/lib/utils"
import { Bell, CheckCheck } from "lucide-react"
import { EmptyState } from "@/components/shared/empty-state"

export default function NotificationsPage() {
  const { data: notifications = [], isLoading } = useGetNotificationsQuery()
  const [markRead] = useMarkReadMutation()
  const [markAllRead] = useMarkAllReadMutation()

  const unread = notifications.filter((n) => !n.read).length

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        {unread > 0 && (
          <button
            onClick={() => markAllRead()}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-sm hover:bg-accent"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {["a", "b", "c", "d", "e"].map((k) => (
            <div key={k} className="h-16 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="You're all caught up."
        />
      ) : (
        <div className="divide-y overflow-hidden rounded-xl border bg-card">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-3 px-4 py-3 transition-colors ${
                n.read ? "" : "bg-primary/5"
              }`}
            >
              <div
                className={`mt-1 h-2 w-2 shrink-0 rounded-full ${n.read ? "bg-transparent" : "bg-primary"}`}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm">{n.message}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {timeAgo(n.createdAt)}
                </p>
              </div>
              {!n.read && (
                <button
                  onClick={() => markRead(n.id)}
                  className="shrink-0 text-xs text-muted-foreground hover:text-foreground"
                >
                  Mark read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
