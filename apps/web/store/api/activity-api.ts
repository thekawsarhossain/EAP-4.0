import type { ActivityLog } from "@/types"
import { baseApi } from "./base-api"

export const activityApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getActivity: build.query<ActivityLog[], { limit?: number }>({
      query: (params) => ({ url: "activity", params }),
      providesTags: ["Activity"],
    }),
  }),
})

export const { useGetActivityQuery } = activityApi
