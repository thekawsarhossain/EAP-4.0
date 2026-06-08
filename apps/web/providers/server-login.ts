import { configureStore } from "@reduxjs/toolkit"
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query"
import type { User } from "@/types"

const api = createApi({
  reducerPath: "auth",
  baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_API_URL }),
  endpoints: (build) => ({
    login: build.mutation<{ user: User; accessToken: string }, { email: string; password: string }>({
      query: (body) => ({ url: "auth/login", method: "POST", body }),
      transformResponse: (res: { data: { user: User; accessToken: string } }) => res.data,
    }),
  }),
})

const store = configureStore({
  reducer: { [api.reducerPath]: api.reducer },
  middleware: (getDefault) => getDefault().concat(api.middleware),
})

export async function serverLogin(email: string, password: string) {
  const result = await store.dispatch(api.endpoints.login.initiate({ email, password }))
  if ("error" in result) return null
  return result.data
}
