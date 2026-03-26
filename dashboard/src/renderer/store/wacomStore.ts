import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { DashboardConfig, DeviceInfo, Orientation, Mode, PressureCurve, DisplayInfo } from '@shared/types'

interface WacomState {
  // Config
  config: DashboardConfig
  isLoading: boolean
  error: string | null
  
  // Device
  deviceInfo: DeviceInfo | null
  isDeviceConnected: boolean
  
  // System
  displays: DisplayInfo[]
  isX11: boolean
  
  // Actions
  loadConfig: () => Promise<void>
  updateConfig: (config: Partial<DashboardConfig>) => Promise<void>
  setOrientation: (orientation: Orientation) => Promise<void>
  setMode: (mode: Mode) => Promise<void>
  setButtonMapping: (button: number, action: string) => Promise<void>
  setScreen: (screen: string) => Promise<void>
  setPressureCurve: (curve: PressureCurve) => Promise<void>
  applyConfig: () => Promise<void>
  resetToDefaults: () => Promise<void>
  refreshDevices: () => Promise<void>
  loadDisplays: () => Promise<void>
  checkX11: () => Promise<void>
  clearError: () => void
}

const useWacomStore = create<WacomState>()(
  immer((set) => ({
    // Initial state
    config: {
      orientation: 'none',
      mode: 'absolute',
      buttonMappings: {
        1: 'button 1',
        2: 'button 2',
        3: 'button 3',
      },
      screen: 'ALL',
      pressureCurve: [0, 0, 100, 100]
    },
    isLoading: false,
    error: null,
    deviceInfo: null,
    isDeviceConnected: false,
    displays: [],
    isX11: true,

    // Actions
    loadConfig: async () => {
      set({ isLoading: true, error: null })
      try {
        const config = await window.wacomAPI.getConfig()
        set({ config, isLoading: false })
      } catch (err) {
        set({ 
          error: err instanceof Error ? err.message : 'Failed to load config', 
          isLoading: false 
        })
      }
    },

    updateConfig: async (newConfig) => {
      set({ isLoading: true, error: null })
      try {
        await window.wacomAPI.setConfig(newConfig)
        const config = await window.wacomAPI.getConfig()
        set({ config, isLoading: false })
      } catch (err) {
        set({ 
          error: err instanceof Error ? err.message : 'Failed to update config', 
          isLoading: false 
        })
      }
    },

    setOrientation: async (orientation) => {
      set({ isLoading: true, error: null })
      try {
        await window.wacomAPI.setOrientation(orientation)
        const config = await window.wacomAPI.getConfig()
        set(state => {
          state.config = config
          state.isLoading = false
        })
      } catch (err) {
        set({ 
          error: err instanceof Error ? err.message : 'Failed to set orientation', 
          isLoading: false 
        })
      }
    },

    setMode: async (mode) => {
      set({ isLoading: true, error: null })
      try {
        await window.wacomAPI.setMode(mode)
        const config = await window.wacomAPI.getConfig()
        set(state => {
          state.config = config
          state.isLoading = false
        })
      } catch (err) {
        set({ 
          error: err instanceof Error ? err.message : 'Failed to set mode', 
          isLoading: false 
        })
      }
    },

    setButtonMapping: async (button, action) => {
      set({ isLoading: true, error: null })
      try {
        await window.wacomAPI.setButtonMapping(button, action)
        const config = await window.wacomAPI.getConfig()
        set(state => {
          state.config = config
          state.isLoading = false
        })
      } catch (err) {
        set({ 
          error: err instanceof Error ? err.message : 'Failed to set button mapping', 
          isLoading: false 
        })
      }
    },

    setScreen: async (screen) => {
      set({ isLoading: true, error: null })
      try {
        await window.wacomAPI.setScreen(screen)
        const config = await window.wacomAPI.getConfig()
        set(state => {
          state.config = config
          state.isLoading = false
        })
      } catch (err) {
        set({ 
          error: err instanceof Error ? err.message : 'Failed to set screen', 
          isLoading: false 
        })
      }
    },

    setPressureCurve: async (curve) => {
      set({ isLoading: true, error: null })
      try {
        await window.wacomAPI.setPressureCurve(curve)
        const config = await window.wacomAPI.getConfig()
        set(state => {
          state.config = config
          state.isLoading = false
        })
      } catch (err) {
        set({ 
          error: err instanceof Error ? err.message : 'Failed to set pressure curve', 
          isLoading: false 
        })
      }
    },

    applyConfig: async () => {
      set({ isLoading: true, error: null })
      try {
        await window.wacomAPI.applyConfig()
        set({ isLoading: false })
      } catch (err) {
        set({ 
          error: err instanceof Error ? err.message : 'Failed to apply config', 
          isLoading: false 
        })
      }
    },

    resetToDefaults: async () => {
      set({ isLoading: true, error: null })
      try {
        await window.wacomAPI.resetToDefaults()
        const config = await window.wacomAPI.getConfig()
        set({ config, isLoading: false })
      } catch (err) {
        set({ 
          error: err instanceof Error ? err.message : 'Failed to reset config', 
          isLoading: false 
        })
      }
    },

    refreshDevices: async () => {
      try {
        const deviceInfo = await window.wacomAPI.refreshDevices()
        set({ 
          deviceInfo, 
          isDeviceConnected: deviceInfo.isConnected 
        })
      } catch (err) {
        set({ 
          error: err instanceof Error ? err.message : 'Failed to refresh devices',
          isDeviceConnected: false 
        })
      }
    },

    loadDisplays: async () => {
      try {
        const displays = await window.wacomAPI.getDisplays()
        set({ displays })
      } catch (err) {
        console.error('Failed to load displays:', err)
      }
    },

    checkX11: async () => {
      try {
        const isX11 = await window.wacomAPI.checkX11()
        set({ isX11 })
      } catch (err) {
        console.error('Failed to check X11:', err)
      }
    },

    clearError: () => set({ error: null })
  }))
)

export { useWacomStore }