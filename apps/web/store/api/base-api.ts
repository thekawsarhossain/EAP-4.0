import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query"
import { auth } from "@/lib/auth"
import { getSession } from "next-auth/react"

const rawQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  prepareHeaders: async (headers) => {
    if (globalThis.window === undefined) {
      const session = await auth()
      const token = session?.user?.accessToken
      if (token) headers.set("Authorization", `Bearer ${token}`)
    } else {
      const session = await getSession()
      const token = session?.user?.accessToken
      if (token) headers.set("Authorization", `Bearer ${token}`)
    }
    return headers
  },
})

const baseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawQuery(args, api, extraOptions)
  if (result.data && typeof result.data === "object" && "data" in result.data) {
    return { ...result, data: result.data.data }
  }
  return result
}

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery,
  tagTypes: [
    "Projects",
    "Project",
    "Tasks",
    "Task",
    "TaskStats",
    "Users",
    "Activity",
    "Notifications",
    "Comments",
  ],
  endpoints: () => ({}),
})
