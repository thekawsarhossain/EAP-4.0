import type { Attachment } from "@/types"
import { baseApi } from "./base-api"

export const attachmentsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAttachments: build.query<Attachment[], string>({
      query: (taskId) => `tasks/${taskId}/attachments`,
      providesTags: (_r, _e, taskId) => [
        { type: "Comments", id: `attach-${taskId}` },
      ],
    }),
    uploadAttachment: build.mutation<
      Attachment,
      { taskId: string; file: File }
    >({
      queryFn: async ({ taskId, file }, _api, _extra, baseQuery) => {
        const form = new FormData()
        form.append("file", file)
        const result = await baseQuery({
          url: `tasks/${taskId}/attachments`,
          method: "POST",
          body: form,
        })
        if (result.error) return { error: result.error }
        return { data: result.data as Attachment }
      },
      invalidatesTags: (_r, _e, { taskId }) => [
        { type: "Comments", id: `attach-${taskId}` },
      ],
    }),
    deleteAttachment: build.mutation<
      void,
      { taskId: string; attachmentId: string }
    >({
      query: ({ taskId, attachmentId }) => ({
        url: `tasks/${taskId}/attachments/${attachmentId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, { taskId }) => [
        { type: "Comments", id: `attach-${taskId}` },
      ],
    }),
  }),
})

export const {
  useGetAttachmentsQuery,
  useUploadAttachmentMutation,
  useDeleteAttachmentMutation,
} = attachmentsApi
