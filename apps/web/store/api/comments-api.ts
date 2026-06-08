import type { Comment } from "@/types"
import { baseApi } from "./base-api"

export const commentsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getComments: build.query<Comment[], string>({
      query: (taskId) => `tasks/${taskId}/comments`,
      providesTags: (_r, _e, taskId) => [{ type: "Comments", id: taskId }],
    }),
    createComment: build.mutation<Comment, { taskId: string; content: string }>(
      {
        query: ({ taskId, content }) => ({
          url: `tasks/${taskId}/comments`,
          method: "POST",
          body: { content },
        }),
        invalidatesTags: (_r, _e, { taskId }) => [
          { type: "Comments", id: taskId },
        ],
      }
    ),
    deleteComment: build.mutation<void, { taskId: string; commentId: string }>({
      query: ({ taskId, commentId }) => ({
        url: `tasks/${taskId}/comments/${commentId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, { taskId }) => [
        { type: "Comments", id: taskId },
      ],
    }),
  }),
})

export const {
  useGetCommentsQuery,
  useCreateCommentMutation,
  useDeleteCommentMutation,
} = commentsApi
