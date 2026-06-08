import { createSlice, PayloadAction } from "@reduxjs/toolkit"

interface FilterState {
  tasks: {
    status: string
    priority: string
    assignedToId: string
    projectId: string
    deadlineStatus: string
    search: string
    sort: string
  }
  projects: {
    status: string
    search: string
    sort: string
  }
}

const initialState: FilterState = {
  tasks: {
    status: "",
    priority: "",
    assignedToId: "",
    projectId: "",
    deadlineStatus: "",
    search: "",
    sort: "createdAt_desc",
  },
  projects: { status: "", search: "", sort: "createdAt_desc" },
}

export const filterSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    setTaskFilter(state, action: PayloadAction<Partial<FilterState["tasks"]>>) {
      state.tasks = { ...state.tasks, ...action.payload }
    },
    setProjectFilter(
      state,
      action: PayloadAction<Partial<FilterState["projects"]>>
    ) {
      state.projects = { ...state.projects, ...action.payload }
    },
    resetTaskFilters(state) {
      state.tasks = initialState.tasks
    },
    resetProjectFilters(state) {
      state.projects = initialState.projects
    },
  },
})

export const {
  setTaskFilter,
  setProjectFilter,
  resetTaskFilters,
  resetProjectFilters,
} = filterSlice.actions
