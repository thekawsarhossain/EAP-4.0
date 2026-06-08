"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { useUpdateMeMutation } from "@/store/api/users-api"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Admin",
  PROJECT_MANAGER: "Project Manager",
  TEAM_MEMBER: "Team Member",
}

export default function SettingsPage() {
  const { data: session, update } = useSession()
  const user = session?.user as any
  const [updateMe, { isLoading }] = useUpdateMeMutation()
  const [name, setName] = useState(user?.name ?? "")
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (user?.name) setName(user.name)
  }, [user?.name])

  const handleSave = async () => {
    await updateMe({ name })
    await update({ name })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const initial = (user?.name ?? "?").charAt(0).toUpperCase()
  const roleLabel = ROLE_LABELS[user?.role] ?? user?.role ?? ""

  return (
    <div className="max-w-2xl space-y-8">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
          {initial}
        </div>
        <div>
          <p className="text-base font-semibold">{user?.name}</p>
          <p className="text-sm text-muted-foreground">{roleLabel}</p>
        </div>
      </div>

      <Separator />

      <div className="space-y-6">
        <div>
          <h2 className="text-sm font-semibold">Profile</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Update your display name.</p>
        </div>

        <div className="grid gap-y-4 sm:grid-cols-[160px_1fr] sm:items-start sm:gap-x-6">
          <Label className="pt-2.5 text-sm text-muted-foreground">Name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Label className="pt-2.5 text-sm text-muted-foreground">Email</Label>
          <div className="space-y-1">
            <Input value={user?.email ?? ""} disabled className="opacity-60" />
            <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={isLoading || !name.trim() || name === user?.name}
          size="sm"
        >
          {isLoading && <Spinner className="mr-2 h-3.5 w-3.5" />}
          {saved ? "Saved!" : isLoading ? "Saving..." : "Save changes"}
        </Button>
      </div>

      <Separator />

      <div className="space-y-4">
        <h2 className="text-sm font-semibold">Account</h2>
        <div className="grid gap-y-3 sm:grid-cols-[160px_1fr]">
          <span className="text-sm text-muted-foreground">Role</span>
          <span className="text-sm font-medium">{roleLabel}</span>
        </div>
      </div>
    </div>
  )
}
