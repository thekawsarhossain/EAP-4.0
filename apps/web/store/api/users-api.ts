import type { User, Workload } from "@/types"
import { baseApi } from "./base-api"

export const usersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getUsers: build.query<User[], { search?: string }>({
      query: (params) => ({ url: "users", params }),
      providesTags: ["Users"],
    }),
    getUser: build.query<User, string>({
      query: (id) => `users/${id}`,
    }),
    getUserWorkload: build.query<Workload, string>({
      query: (id) => `users/${id}/workload`,
    }),
    getAllWorkloads: build.query<Workload[], void>({
      query: () => "users",
      transformResponse: async (_users: User[]) => [],
    }),
    updateMe: build.mutation<User, { name?: string; avatar?: string }>({
      query: (body) => ({ url: "users/me", method: "PATCH", body }),
      invalidatesTags: ["Users"],
    }),
  }),
})

export const {
  useGetUsersQuery,
  useGetUserQuery,
  useGetUserWorkloadQuery,
  useUpdateMeMutation,
} = usersApi
