import { contextBridge, ipcRenderer } from 'electron'
import { 
  IPC_CHANNELS, 
  type DeviceInfo, 
  type DashboardConfig,
  type WacomAPI,
  type Orientation,
  type Mode,
  type PressureCurve
} from '@shared/types'

// Bridge tipado entre main process y renderer
const wacomAPI: WacomAPI = {
  // Device operations
  getDevices: () => ipcRenderer.invoke(IPC_CHANNELS.GET_DEVICES),
  getCurrentModel: () => ipcRenderer.invoke(IPC_CHANNELS.GET_CURRENT_MODEL),
  refreshDevices: () => ipcRenderer.invoke(IPC_CHANNELS.REFRESH_DEVICES),

  // Configuration
  getConfig: () => ipcRenderer.invoke(IPC_CHANNELS.GET_CONFIG),
  setConfig: (config: Partial<DashboardConfig>) => ipcRenderer.invoke(IPC_CHANNELS.SET_CONFIG, config),
  setOrientation: (orientation: Orientation) => ipcRenderer.invoke(IPC_CHANNELS.SET_ORIENTATION, orientation),
  setMode: (mode: Mode) => ipcRenderer.invoke(IPC_CHANNELS.SET_MODE, mode),
  setButtonMapping: (button: number, action: string) => ipcRenderer.invoke(IPC_CHANNELS.SET_BUTTON_MAPPING, button, action),
  setScreen: (screen: string) => ipcRenderer.invoke(IPC_CHANNELS.SET_SCREEN, screen),
  setPressureCurve: (curve: PressureCurve) => ipcRenderer.invoke(IPC_CHANNELS.SET_PRESSURE_CURVE, curve),

  // Actions
  applyConfig: () => ipcRenderer.invoke(IPC_CHANNELS.APPLY_CONFIG),
  resetToDefaults: () => ipcRenderer.invoke(IPC_CHANNELS.RESET_TO_DEFAULTS),

  // System
  getDisplays: () => ipcRenderer.invoke(IPC_CHANNELS.GET_DISPLAYS),
  checkX11: () => ipcRenderer.invoke(IPC_CHANNELS.CHECK_X11),

  // Events
  onDeviceConnected: (callback: (device: DeviceInfo) => void) => {
    const handler = (_: unknown, device: DeviceInfo) => callback(device)
    ipcRenderer.on(IPC_CHANNELS.DEVICE_CONNECTED, handler)
    return () => ipcRenderer.removeListener(IPC_CHANNELS.DEVICE_CONNECTED, handler)
  },
  onDeviceDisconnected: (callback: () => void) => {
    const handler = () => callback()
    ipcRenderer.on(IPC_CHANNELS.DEVICE_DISCONNECTED, handler)
    return () => ipcRenderer.removeListener(IPC_CHANNELS.DEVICE_DISCONNECTED, handler)
  },
  onConfigChanged: (callback: (config: DashboardConfig) => void) => {
    const handler = (_: unknown, config: DashboardConfig) => callback(config)
    ipcRenderer.on(IPC_CHANNELS.CONFIG_CHANGED, handler)
    return () => ipcRenderer.removeListener(IPC_CHANNELS.CONFIG_CHANGED, handler)
  }
}

// Exponer API al renderer
contextBridge.exposeInMainWorld('wacomAPI', wacomAPI)

// Log para debugging
console.log('[Preload] Wacom API exposed successfully')