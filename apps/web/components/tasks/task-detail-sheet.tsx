"use client"

import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { TaskPriorityBadge } from "@/components/tasks/task-priority-badge"
import { TaskStatusBadge } from "@/components/tasks/task-status-badge"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { toastError, toastSuccess } from "@/lib/toast"
import { cn, formatDate, formatFileSize, timeAgo } from "@/lib/utils"
import {
  useDeleteAttachmentMutation,
  useGetAttachmentsQuery,
  useUploadAttachmentMutation,
} from "@/store/api/attachments-api"
import {
  useCreateCommentMutation,
  useDeleteCommentMutation,
  useGetCommentsQuery,
} from "@/store/api/comments-api"
import { useHasPermission } from "@/hooks/use-has-permission"
import { useGetTaskQuery } from "@/store/api/tasks-api"
import type { Attachment, Task } from "@/types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import Image from "next/image"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import {
  Calendar,
  Download,
  Eye,
  File,
  FileText,
  Image as FileImage,
  MessageSquare,
  Paperclip,
  Trash2,
  Upload,
  User,
} from "lucide-react"
import { useSession } from "next-auth/react"
import { useRef, useState } from "react"

interface TaskDetailSheetProps {
  taskId: string | null
  onClose: () => void
}

export function TaskDetailSheet({
  taskId,
  onClose,
}: Readonly<TaskDetailSheetProps>) {
  return (
    <Sheet open={!!taskId} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
        {taskId && <TaskDetailContent taskId={taskId} />}
      </SheetContent>
    </Sheet>
  )
}

function TaskDetailContent({ taskId }: Readonly<{ taskId: string }>) {
  const { data: task } = useGetTaskQuery(taskId)
  if (!task)
    return <div className="p-5 text-sm text-muted-foreground">Loading...</div>
  return (
    <div className="flex flex-col divide-y">
      <div className="px-5 pb-5 pt-4">
        <TaskInfo task={task} />
      </div>
      <div className="px-5 py-5">
        <CommentsSection taskId={taskId} />
      </div>
      <div className="px-5 py-5">
        <AttachmentsSection taskId={taskId} />
      </div>
    </div>
  )
}

function TaskInfo({ task }: Readonly<{ task: Task }>) {
  return (
    <div className="space-y-4">
      <SheetHeader className="p-0 pr-8">
        <SheetTitle className="text-left text-base leading-snug">
          {task.title}
        </SheetTitle>
      </SheetHeader>

      <div className="flex flex-wrap gap-2">
        <TaskStatusBadge status={task.status} />
        <TaskPriorityBadge priority={task.priority} />
      </div>

      {task.description && (
        <p className="text-sm text-muted-foreground">{task.description}</p>
      )}

      <div className="space-y-2.5 rounded-lg border bg-muted/30 p-3 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <User className="h-3.5 w-3.5 shrink-0" />
          <span>{task.assignedTo?.name ?? "Unassigned"}</span>
        </div>
        {task.dueDate && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>Due {formatDate(task.dueDate)}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="text-xs font-medium">Project:</span>
          <span>{task.project.name}</span>
        </div>
      </div>
    </div>
  )
}

function CommentsSection({ taskId }: Readonly<{ taskId: string }>) {
  const { data: session } = useSession()
  const userId = (session?.user as any)?.id
  const { data: comments = [] } = useGetCommentsQuery(taskId)
  const [createComment, { isLoading: posting }] = useCreateCommentMutation()
  const [deleteComment] = useDeleteCommentMutation()
  const [text, setText] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handlePost = async () => {
    if (!text.trim()) return
    try {
      await createComment({ taskId, content: text.trim() }).unwrap()
      setText("")
    } catch (err) {
      toastError(err, "Failed to post comment")
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteComment({ taskId, commentId: deleteId }).unwrap()
      toastSuccess("Comment deleted")
    } catch (err) {
      toastError(err, "Failed to delete comment")
    } finally {
      setDeleteId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">Comments</h3>
        <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
          {comments.length}
        </span>
      </div>

      <div className="space-y-4">
        {comments.map((c) => (
          <div key={c.id} className="group flex items-start gap-2.5">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
              {c.user.name.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-medium">{c.user.name}</span>
                <span className="text-[11px] text-muted-foreground">
                  {timeAgo(c.createdAt)}
                </span>
              </div>
              <p className="mt-0.5 text-sm text-foreground/90">{c.content}</p>
            </div>
            {c.userId === userId && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDeleteId(c.id)}
                className="h-6 w-6 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-xs text-muted-foreground">No comments yet.</p>
        )}
      </div>

      <div className="relative">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              handlePost()
            }
          }}
          placeholder="Write a comment… (Enter to submit)"
          rows={3}
          className="w-full resize-none pb-10"
        />
        <Button
          size="sm"
          onClick={handlePost}
          disabled={posting || !text.trim()}
          className="absolute bottom-2 right-2 h-7 text-xs"
        >
          {posting && <Spinner className="mr-1.5 h-3 w-3" />}
          Post
        </Button>
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete comment"
        description="This cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  )
}

function attachmentIcon(mimeType: string | null) {
  if (mimeType?.startsWith("image/")) return { Icon: FileImage, color: "text-blue-500" }
  if (mimeType === "application/pdf") return { Icon: FileText, color: "text-red-500" }
  if (mimeType?.startsWith("text/")) return { Icon: FileText, color: "text-muted-foreground" }
  return { Icon: File, color: "text-muted-foreground" }
}

async function handleDownload(url: string, fileName: string) {
  try {
    const res = await fetch(url)
    const blob = await res.blob()
    const blobUrl = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = blobUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(blobUrl)
  } catch {
    window.open(url, "_blank", "noopener,noreferrer")
  }
}

function AttachmentsSection({ taskId }: Readonly<{ taskId: string }>) {
  const { data: attachments = [] } = useGetAttachmentsQuery(taskId)
  const { data: task } = useGetTaskQuery(taskId)
  const { data: session } = useSession()
  const canManage = useHasPermission("ADMIN", "PROJECT_MANAGER")
  const userId = (session?.user as { id?: string })?.id
  const [upload, { isLoading: uploading }] = useUploadAttachmentMutation()
  const [deleteAttachment, { isLoading: isDeleting }] = useDeleteAttachmentMutation()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const canDeleteAttachment =
    canManage ||
    (!!userId && (task?.createdById === userId || task?.assignedToId === userId))

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      await upload({ taskId, file }).unwrap()
      toastSuccess("File uploaded")
    } catch (err) {
      toastError(err, "Upload failed")
    } finally {
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteAttachment({ taskId, attachmentId: deleteId }).unwrap()
      toastSuccess("Attachment removed")
    } catch (err) {
      toastError(err, "Failed to remove attachment")
    } finally {
      setDeleteId(null)
    }
  }

  const handleView = (a: Attachment) => {
    if (a.mimeType?.startsWith("image/")) {
      setPreviewUrl(a.url)
    } else {
      window.open(a.url, "_blank", "noopener,noreferrer")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Paperclip className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Attachments</h3>
          <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
            {attachments.length}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="h-7 gap-1.5 text-xs"
        >
          {uploading ? <Spinner className="h-3 w-3" /> : <Upload className="h-3 w-3" />}
          {uploading ? "Uploading…" : "Upload"}
        </Button>
        <input ref={fileRef} type="file" className="hidden" onChange={handleFile} />
      </div>

      <div className="space-y-2">
        {attachments.map((a) => {
          const { Icon, color } = attachmentIcon(a.mimeType)
          return (
            <div
              key={a.id}
              className="flex items-center gap-2.5 rounded-lg border bg-muted/30 p-2.5"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-card">
                <Icon className={cn("h-4 w-4", color)} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium leading-snug">
                  {a.fileName}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {formatFileSize(a.size)} · {formatDate(a.createdAt, "MMM d")}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleView(a)}
                  title="Open"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                >
                  <Eye className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDownload(a.url, a.fileName)}
                  title="Download"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                >
                  <Download className="h-3.5 w-3.5" />
                </Button>
                {canDeleteAttachment && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteId(a.id)}
                    title="Delete"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          )
        })}
        {attachments.length === 0 && (
          <p className="text-xs text-muted-foreground">No attachments yet.</p>
        )}
      </div>

      <Dialog open={!!previewUrl} onOpenChange={(o) => !o && setPreviewUrl(null)}>
        <DialogContent className="max-w-3xl p-2">
          {previewUrl && (
            <div className="relative max-h-[80vh] w-full overflow-hidden rounded">
              <Image
                src={previewUrl}
                alt="Preview"
                width={1200}
                height={800}
                className="h-auto max-h-[80vh] w-full object-contain"
                unoptimized
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Remove attachment"
        description="This cannot be undone."
        confirmLabel="Remove"
        destructive
        loading={isDeleting}
        onConfirm={handleDelete}
      />
    </div>
  )
}
