import type { PaginatedResponse, Project } from "@/types"
import { baseApi } from "./base-api"

type GetProjectsArgs = {
  status?: string
  search?: string
  page?: number
  limit?: number
  sort?: string
}

export const projectsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getProjects: build.query<PaginatedResponse<Project>, GetProjectsArgs>({
      query: (params) => ({ url: "projects", params }),
      providesTags: ["Projects"],
    }),
    getProject: build.query<Project, string>({
      query: (id) => `projects/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Project", id }],
    }),
    createProject: build.mutation<Project, Partial<Project>>({
      query: (body) => ({ url: "projects", method: "POST", body }),
      invalidatesTags: ["Projects"],
    }),
    updateProject: build.mutation<Project, { id: string; body: Partial<Project> }>({
      query: ({ id, body }) => ({
        url: `projects/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => ["Projects", { type: "Project", id }],
      onQueryStarted: async ({ id, body }, { dispatch, queryFulfilled }) => {
        const detailPatch = dispatch(
          projectsApi.util.updateQueryData("getProject", id, (draft) => {
            Object.assign(draft, body)
          })
        )
        try {
          const { data } = await queryFulfilled
          dispatch(
            projectsApi.util.updateQueryData("getProject", id, (draft) => {
              Object.assign(draft, data)
            })
          )
        } catch {
          detailPatch.undo()
        }
      },
    }),
    deleteProject: build.mutation<void, string>({
      query: (id) => ({ url: `projects/${id}`, method: "DELETE" }),
      invalidatesTags: ["Projects"],
      onQueryStarted: async (id, { dispatch, queryFulfilled, getState }) => {
        const patches = baseApi.util
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .selectInvalidatedBy(getState() as any, [{ type: "Projects" as const }])
          .filter(({ endpointName }) => endpointName === "getProjects")
          .map(({ originalArgs }) =>
            dispatch(
              projectsApi.util.updateQueryData(
                "getProjects",
                originalArgs as GetProjectsArgs,
                (draft) => {
                  const idx = draft.items.findIndex((p) => p.id === id)
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
    addProjectMember: build.mutation<
      Project,
      { projectId: string; userId: string }
    >({
      query: ({ projectId, userId }) => ({
        url: `projects/${projectId}/members`,
        method: "POST",
        body: { userId },
      }),
      invalidatesTags: (_r, _e, { projectId }) => [
        { type: "Project", id: projectId },
      ],
    }),
    removeProjectMember: build.mutation<
      void,
      { projectId: string; memberId: string }
    >({
      query: ({ projectId, memberId }) => ({
        url: `projects/${projectId}/members/${memberId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, { projectId }) => [
        { type: "Project", id: projectId },
      ],
    }),
  }),
})

export const {
  useGetProjectsQuery,
  useGetProjectQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useAddProjectMemberMutation,
  useRemoveProjectMemberMutation,
} = projectsApi
