"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { toastError, toastSuccess } from "@/lib/toast"
import {
  useAddProjectMemberMutation,
  useRemoveProjectMemberMutation,
} from "@/store/api/projects-api"
import { useGetUsersQuery } from "@/store/api/users-api"
import type { Project } from "@/types"
import { UserMinus, UserPlus } from "lucide-react"
import { useState } from "react"

interface ManageMembersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: Project
}

export function ManageMembersDialog({
  open,
  onOpenChange,
  project,
}: Readonly<ManageMembersDialogProps>) {
  const [selectedUserId, setSelectedUserId] = useState("")
  const [removingId, setRemovingId] = useState<string | null>(null)

  const { data: allUsers = [] } = useGetUsersQuery({})
  const [addMember, { isLoading: isAdding }] = useAddProjectMemberMutation()
  const [removeMember] = useRemoveProjectMemberMutation()

  const memberIds = new Set(project.members.map((m) => m.userId))
  const addableUsers = allUsers.filter((u) => !memberIds.has(u.id))

  const handleAdd = async () => {
    if (!selectedUserId) return
    try {
      await addMember({ projectId: project.id, userId: selectedUserId }).unwrap()
      toastSuccess("Member added")
      setSelectedUserId("")
    } catch (err) {
      toastError(err, "Failed to add member")
    }
  }

  const handleRemove = async (memberId: string) => {
    setRemovingId(memberId)
    try {
      await removeMember({ projectId: project.id, memberId }).unwrap()
      toastSuccess("Member removed")
    } catch (err) {
      toastError(err, "Failed to remove member")
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage members</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {addableUsers.length > 0 && (
            <div className="flex gap-2">
              <Select value={selectedUserId} onValueChange={(v) => setSelectedUserId(v ?? "")}>
                <SelectTrigger className="flex-1">
                  <SelectValue>
                    {selectedUserId
                      ? (addableUsers.find((u) => u.id === selectedUserId)?.name ?? "Add a member...")
                      : "Add a member..."}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {addableUsers.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name}
                      <span className="ml-1 text-xs text-muted-foreground">
                        ({u.email})
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleAdd}
                disabled={!selectedUserId || isAdding}
                size="sm"
                className="shrink-0"
              >
                {isAdding ? (
                  <Spinner className="h-3.5 w-3.5" />
                ) : (
                  <UserPlus className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          )}

          <div className="divide-y rounded-lg border">
            {project.members.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                No members yet
              </p>
            ) : (
              project.members.map(({ userId, user }) => (
                <div
                  key={userId}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                    onClick={() => handleRemove(userId)}
                    disabled={removingId === userId}
                  >
                    {removingId === userId ? (
                      <Spinner className="h-3.5 w-3.5" />
                    ) : (
                      <UserMinus className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
