import { app, BrowserWindow, ipcMain, nativeTheme } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import { IPC_CHANNELS, ErrorCode, WacomError } from '@shared/types'
import { WacomService } from './services/wacom-service'
import { ConfigService } from './services/config-service'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class WacomDashboard {
  private mainWindow: BrowserWindow | null = null
  private wacomService: WacomService
  private configService: ConfigService

  constructor() {
    this.wacomService = new WacomService()
    this.configService = new ConfigService()
  }

  async initialize(): Promise<void> {
    // Initialize services first
    await this.configService.initialize()
    
    await this.createWindow()
    this.setupIPC()
    this.setupEventHandlers()
    
    // Check if running on X11
    const isX11 = await this.wacomService.checkX11()
    if (!isX11) {
      console.warn('Wayland detected - some features may not work')
    }
  }

  private async createWindow(): Promise<void> {
    // Force dark mode
    nativeTheme.themeSource = 'dark'
    
    this.mainWindow = new BrowserWindow({
      width: 1000,
      height: 700,
      minWidth: 800,
      minHeight: 600,
      show: false,
      frame: false, // Remove title bar and menu
      titleBarStyle: 'hidden',
      webPreferences: {
        preload: path.join(__dirname, '../preload/index.js'),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true
      }
    })

    // Load the app
    if (process.env.VITE_DEV_SERVER_URL) {
      await this.mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
      this.mainWindow.webContents.openDevTools()
    } else {
      await this.mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
    }

    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow?.show()
    })
  }

  private setupIPC(): void {
    // Device operations
    ipcMain.handle(IPC_CHANNELS.GET_DEVICES, async () => {
      try {
        return await this.wacomService.getDevices()
      } catch (error) {
        throw new WacomError(
          'Failed to get devices',
          ErrorCode.NO_DEVICE_FOUND,
          error
        )
      }
    })

    ipcMain.handle(IPC_CHANNELS.GET_CURRENT_MODEL, async () => {
      try {
        return await this.wacomService.getCurrentModel()
      } catch (error) {
        throw new WacomError(
          'Failed to get current model',
          ErrorCode.NO_DEVICE_FOUND,
          error
        )
      }
    })

    ipcMain.handle(IPC_CHANNELS.REFRESH_DEVICES, async () => {
      try {
        return await this.wacomService.refreshDevices()
      } catch (error) {
        throw new WacomError(
          'Failed to refresh devices',
          ErrorCode.NO_DEVICE_FOUND,
          error
        )
      }
    })

    // Configuration operations
    ipcMain.handle(IPC_CHANNELS.GET_CONFIG, async () => {
      return this.configService.getConfig()
    })

    ipcMain.handle(IPC_CHANNELS.SET_CONFIG, async (_, config) => {
      try {
        await this.configService.setConfig(config)
        this.notifyConfigChanged()
      } catch (error) {
        throw new WacomError(
          'Failed to set configuration',
          ErrorCode.INVALID_CONFIG,
          error
        )
      }
    })

    ipcMain.handle(IPC_CHANNELS.SET_ORIENTATION, async (_, orientation) => {
      try {
        await this.wacomService.setOrientation(orientation)
        await this.configService.updateConfig({ orientation })
        this.notifyConfigChanged()
      } catch (error) {
        throw new WacomError(
          'Failed to set orientation',
          ErrorCode.SCRIPT_FAILED,
          error
        )
      }
    })

    ipcMain.handle(IPC_CHANNELS.SET_MODE, async (_, mode) => {
      try {
        await this.wacomService.setMode(mode)
        await this.configService.updateConfig({ mode })
        this.notifyConfigChanged()
      } catch (error) {
        throw new WacomError(
          'Failed to set mode',
          ErrorCode.SCRIPT_FAILED,
          error
        )
      }
    })

    ipcMain.handle(IPC_CHANNELS.SET_BUTTON_MAPPING, async (_, button, action) => {
      try {
        await this.wacomService.setButtonMapping(button, action)
        const currentConfig = this.configService.getConfig()
        const newMappings = { ...currentConfig.buttonMappings, [button]: action }
        await this.configService.updateConfig({ buttonMappings: newMappings })
        this.notifyConfigChanged()
      } catch (error) {
        throw new WacomError(
          'Failed to set button mapping',
          ErrorCode.SCRIPT_FAILED,
          error
        )
      }
    })

    ipcMain.handle(IPC_CHANNELS.SET_SCREEN, async (_, screen) => {
      try {
        await this.wacomService.setScreen(screen)
        await this.configService.updateConfig({ screen })
        this.notifyConfigChanged()
      } catch (error) {
        throw new WacomError(
          'Failed to set screen',
          ErrorCode.SCRIPT_FAILED,
          error
        )
      }
    })

    ipcMain.handle(IPC_CHANNELS.SET_PRESSURE_CURVE, async (_, curve) => {
      try {
        await this.wacomService.setPressureCurve(curve)
        await this.configService.updateConfig({ pressureCurve: curve })
        this.notifyConfigChanged()
      } catch (error) {
        throw new WacomError(
          'Failed to set pressure curve',
          ErrorCode.SCRIPT_FAILED,
          error
        )
      }
    })

    // Actions
    ipcMain.handle(IPC_CHANNELS.APPLY_CONFIG, async () => {
      try {
        const config = this.configService.getConfig()
        await this.wacomService.applyConfig(config)
      } catch (error) {
        throw new WacomError(
          'Failed to apply configuration',
          ErrorCode.SCRIPT_FAILED,
          error
        )
      }
    })

    ipcMain.handle(IPC_CHANNELS.RESET_TO_DEFAULTS, async () => {
      try {
        await this.configService.resetToDefaults()
        const config = this.configService.getConfig()
        await this.wacomService.applyConfig(config)
        this.notifyConfigChanged()
      } catch (error) {
        throw new WacomError(
          'Failed to reset to defaults',
          ErrorCode.SCRIPT_FAILED,
          error
        )
      }
    })

    // System
    ipcMain.handle(IPC_CHANNELS.GET_DISPLAYS, async () => {
      return this.wacomService.getDisplays()
    })

    ipcMain.handle(IPC_CHANNELS.CHECK_X11, async () => {
      return this.wacomService.checkX11()
    })
  }

  private setupEventHandlers(): void {
    // Handle window events
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit()
      }
    })

    app.on('activate', async () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        await this.createWindow()
      }
    })

    // Handle native theme changes
    nativeTheme.on('updated', () => {
      this.mainWindow?.webContents.send('theme-changed', nativeTheme.shouldUseDarkColors)
    })
  }

  private notifyConfigChanged(): void {
    const config = this.configService.getConfig()
    this.mainWindow?.webContents.send(IPC_CHANNELS.CONFIG_CHANGED, config)
  }
}

// Initialize app
const dashboard = new WacomDashboard()

app.whenReady().then(() => {
  dashboard.initialize().catch(console.error)
})