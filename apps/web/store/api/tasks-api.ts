import type { PaginatedResponse, Task, TaskStats, TaskStatus } from "@/types"
import { baseApi } from "./base-api"

type GetTasksArgs = {
  projectId?: string
  status?: string
  priority?: string
  assignedToId?: string
  deadlineStatus?: string
  search?: string
  page?: number
  limit?: number
  sort?: string
}

export const tasksApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getTasks: build.query<PaginatedResponse<Task>, GetTasksArgs>({
      query: (params) => ({ url: "tasks", params }),
      providesTags: ["Tasks"],
    }),
    getTask: build.query<Task, string>({
      query: (id) => `tasks/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Task", id }],
    }),
    getTaskStats: build.query<TaskStats, void>({
      query: () => "tasks/stats",
      providesTags: ["Tasks"],
    }),
    createTask: build.mutation<Task, Partial<Task> & { projectId: string }>({
      query: (body) => ({ url: "tasks", method: "POST", body }),
      invalidatesTags: ["Tasks"],
    }),
    updateTask: build.mutation<Task, { id: string; body: Partial<Task> }>({
      query: ({ id, body }) => ({ url: `tasks/${id}`, method: "PATCH", body }),
      invalidatesTags: (_r, _e, { id }) => ["Tasks", { type: "Task", id }],
      onQueryStarted: async ({ id, body }, { dispatch, queryFulfilled }) => {
        const patch = dispatch(
          tasksApi.util.updateQueryData("getTask", id, (draft) => {
            Object.assign(draft, body)
          })
        )
        try {
          const { data } = await queryFulfilled
          dispatch(
            tasksApi.util.updateQueryData("getTask", id, (draft) => {
              Object.assign(draft, data)
            })
          )
        } catch {
          patch.undo()
        }
      },
    }),
    updateTaskStatus: build.mutation<Task, { id: string; status: TaskStatus }>({
      query: ({ id, status }) => ({
        url: `tasks/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (_r, _e, { id }) => ["Tasks", { type: "Task", id }],
      onQueryStarted: async ({ id, status }, { dispatch, queryFulfilled, getState }) => {
        const detailPatch = dispatch(
          tasksApi.util.updateQueryData("getTask", id, (draft) => {
            draft.status = status
          })
        )
        const listPatches = baseApi.util
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .selectInvalidatedBy(getState() as any, [{ type: "Tasks" as const }])
          .filter(({ endpointName }) => endpointName === "getTasks")
          .map(({ originalArgs }) =>
            dispatch(
              tasksApi.util.updateQueryData(
                "getTasks",
                originalArgs as GetTasksArgs,
                (draft) => {
                  const task = draft.items.find((t) => t.id === id)
                  if (task) task.status = status
                }
              )
            )
          )
        try {
          await queryFulfilled
        } catch {
          detailPatch.undo()
          listPatches.forEach((p) => p.undo())
        }
      },
    }),
    deleteTask: build.mutation<void, string>({
      query: (id) => ({ url: `tasks/${id}`, method: "DELETE" }),
      invalidatesTags: ["Tasks"],
      onQueryStarted: async (id, { dispatch, queryFulfilled, getState }) => {
        const patches = baseApi.util
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .selectInvalidatedBy(getState() as any, [{ type: "Tasks" as const }])
          .filter(({ endpointName }) => endpointName === "getTasks")
          .map(({ originalArgs }) =>
            dispatch(
              tasksApi.util.updateQueryData(
                "getTasks",
                originalArgs as GetTasksArgs,
                (draft) => {
                  const idx = draft.items.findIndex((t) => t.id === id)
                  if (idx !== -1) {
                    draft.items.splice(idx, 1)
                    draft.total = Math.max(0, draft.total - 1)
                  }
                }
              )
            )
          )
        try {
          await queryFulfilled
        } catch {
          patches.forEach((p) => p.undo())
        }
      },
    }),
  }),
})

export const {
  useGetTasksQuery,
  useGetTaskQuery,
  useGetTaskStatsQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useUpdateTaskStatusMutation,
  useDeleteTaskMutation,
} = tasksApi
