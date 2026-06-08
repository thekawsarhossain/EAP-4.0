import type { User } from "@/types"
import { baseApi } from "./base-api"

interface AuthResponse {
  user: User
  accessToken: string
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    register: build.mutation<AuthResponse, { name: string; email: string; password: string }>({
      query: (body) => ({ url: "auth/register", method: "POST", body }),
    }),
    login: build.mutation<AuthResponse, { email: string; password: string }>({
      query: (body) => ({ url: "auth/login", method: "POST", body }),
    }),
  }),
})

export const { useRegisterMutation, useLoginMutation } = authApi
