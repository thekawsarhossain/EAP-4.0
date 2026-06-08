import { combineReducers, configureStore } from "@reduxjs/toolkit"
import { baseApi } from "./api/base-api"
import { filterSlice } from "./slices/filter.slice"
import { uiSlice } from "./slices/ui.slice"

const rootReducer = combineReducers({
  [baseApi.reducerPath]: baseApi.reducer,
  ui: uiSlice.reducer,
  filters: filterSlice.reducer,
})

export type RootState = ReturnType<typeof rootReducer>

export const makeStore = (preloadedState?: Partial<RootState>) =>
  configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(baseApi.middleware),
    preloadedState,
  })

export type AppStore = ReturnType<typeof makeStore>
export type AppDispatch = AppStore["dispatch"]
