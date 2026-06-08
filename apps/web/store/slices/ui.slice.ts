import { createSlice, PayloadAction } from "@reduxjs/toolkit"

interface UiState {
  sidebarOpen: boolean
  mobileSidebarOpen: boolean
  activeModal: string | null
  modalData: unknown
}

const initialState: UiState = {
  sidebarOpen: true,
  mobileSidebarOpen: false,
  activeModal: null,
  modalData: null,
}

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen
    },
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload
    },
    setMobileSidebarOpen(state, action: PayloadAction<boolean>) {
      state.mobileSidebarOpen = action.payload
    },
    openModal(state, action: PayloadAction<{ modal: string; data?: unknown }>) {
      state.activeModal = action.payload.modal
      state.modalData = action.payload.data ?? null
    },
    closeModal(state) {
      state.activeModal = null
      state.modalData = null
    },
  },
})

export const { toggleSidebar, setSidebarOpen, setMobileSidebarOpen, openModal, closeModal } =
  uiSlice.actions
