import type { Notification } from "@/types"
import { baseApi } from "./base-api"

export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getNotifications: build.query<Notification[], void>({
      query: () => "notifications",
      providesTags: ["Notifications"],
    }),
    getUnreadCount: build.query<{ count: number }, void>({
      query: () => "notifications/unread-count",
      providesTags: ["Notifications"],
    }),
    markRead: build.mutation<void, string>({
      query: (id) => ({ url: `notifications/${id}/read`, method: "PATCH" }),
      invalidatesTags: ["Notifications"],
      onQueryStarted: async (id, { dispatch, queryFulfilled }) => {
        const patch = dispatch(
          notificationsApi.util.updateQueryData("getNotifications", undefined, (draft) => {
            const n = draft.find((n) => n.id === id)
            if (n) n.read = true
          })
        )
        const countPatch = dispatch(
          notificationsApi.util.updateQueryData("getUnreadCount", undefined, (draft) => {
            draft.count = Math.max(0, draft.count - 1)
          })
        )
        try {
          await queryFulfilled
        } catch {
          patch.undo()
          countPatch.undo()
        }
      },
    }),
    markAllRead: build.mutation<void, void>({
      query: () => ({ url: "notifications/read-all", method: "PATCH" }),
      invalidatesTags: ["Notifications"],
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        const patch = dispatch(
          notificationsApi.util.updateQueryData("getNotifications", undefined, (draft) => {
            draft.forEach((n) => { n.read = true })
          })
        )
        const countPatch = dispatch(
          notificationsApi.util.updateQueryData("getUnreadCount", undefined, (draft) => {
            draft.count = 0
          })
        )
        try {
          await queryFulfilled
        } catch {
          patch.undo()
          countPatch.undo()
        }
      },
    }),
  }),
})

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkReadMutation,
  useMarkAllReadMutation,
} = notificationsApi
