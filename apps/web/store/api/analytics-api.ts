import type { AnalyticsDashboard } from "@/types"
import { baseApi } from "./base-api"

export const analyticsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAnalyticsDashboard: build.query<AnalyticsDashboard, void>({
      query: () => "analytics/dashboard",
      providesTags: ["Tasks", "Projects", "Users"],
    }),
  }),
})

export const { useGetAnalyticsDashboardQuery } = analyticsApi
