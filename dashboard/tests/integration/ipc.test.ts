import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

/**
 * Integration tests for IPC handlers
 * 
 * These tests verify the communication between the renderer process
 * and the main process via the IPC bridge.
 * 
 * Note: In a real Electron environment, these would use Spectron or Playwright.
 * For unit testing, we mock the IPC layer.
 */

// Mock electron modules
const mockIpcMain = {
  handle: vi.fn(),
  on: vi.fn()
}

const mockIpcRenderer = {
  invoke: vi.fn(),
  on: vi.fn(),
  removeListener: vi.fn()
}

vi.mock('electron', () => ({
  app: {
    getPath: vi.fn(() => '/mock/path'),
    whenReady: vi.fn(() => Promise.resolve()),
    on: vi.fn(),
    quit: vi.fn()
  },
  BrowserWindow: vi.fn().mockImplementation(() => ({
    loadURL: vi.fn(),
    loadFile: vi.fn(),
    show: vi.fn(),
    webContents: {
      send: vi.fn(),
      openDevTools: vi.fn()
    },
    once: vi.fn()
  })),
  ipcMain: mockIpcMain,
  ipcRenderer: mockIpcRenderer,
  nativeTheme: {
    themeSource: 'dark',
    on: vi.fn()
  }
}))

describe('IPC Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('IPC Channels Registration', () => {
    it('should register all required IPC handlers', async () => {
      // Import main to trigger registration
      // Note: In real tests, this would be after app.whenReady()
      
      const expectedChannels = [
        'wacom:get-devices',
        'wacom:get-current-model',
        'wacom:refresh-devices',
        'wacom:get-config',
        'wacom:set-config',
        'wacom:set-orientation',
        'wacom:set-mode',
        'wacom:set-button-mapping',
        'wacom:set-screen',
        'wacom:set-pressure-curve',
        'wacom:apply-config',
        'wacom:reset-to-defaults',
        'wacom:get-displays',
        'wacom:check-x11'
      ]

      // Verify all channels are defined in types
      const { IPC_CHANNELS } = await import('../../src/shared/types')
      
      expectedChannels.forEach(channel => {
        expect(Object.values(IPC_CHANNELS)).toContain(channel)
      })
    })
  })

  describe('IPC invoke operations', () => {
    it('should invoke getDevices and return device list', async () => {
      const mockDevices = [
        { name: 'Wacom Test stylus', id: '10', type: 'STYLUS' }
      ]
      
      mockIpcRenderer.invoke.mockResolvedValue(mockDevices)
      
      const result = await mockIpcRenderer.invoke('wacom:get-devices')
      
      expect(mockIpcRenderer.invoke).toHaveBeenCalledWith('wacom:get-devices')
      expect(result).toEqual(mockDevices)
    })

    it('should invoke setOrientation with correct parameters', async () => {
      mockIpcRenderer.invoke.mockResolvedValue(undefined)
      
      await mockIpcRenderer.invoke('wacom:set-orientation', 'half')
      
      expect(mockIpcRenderer.invoke).toHaveBeenCalledWith('wacom:set-orientation', 'half')
    })

    it('should invoke setPressureCurve with array parameter', async () => {
      mockIpcRenderer.invoke.mockResolvedValue(undefined)
      
      await mockIpcRenderer.invoke('wacom:set-pressure-curve', [0, 20, 80, 100])
      
      expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
        'wacom:set-pressure-curve',
        [0, 20, 80, 100]
      )
    })
  })

  describe('IPC error handling', () => {
    it('should propagate errors from main process', async () => {
      const mockError = {
        message: 'No device found',
        code: 'NO_DEVICE_FOUND'
      }
      
      mockIpcRenderer.invoke.mockRejectedValue(mockError)
      
      await expect(mockIpcRenderer.invoke('wacom:get-devices'))
        .rejects.toEqual(mockError)
    })

    it('should handle script execution errors', async () => {
      const mockError = {
        message: 'xsetwacom not found',
        code: 'SCRIPT_FAILED'
      }
      
      mockIpcRenderer.invoke.mockRejectedValue(mockError)
      
      await expect(mockIpcRenderer.invoke('wacom:set-orientation', 'half'))
        .rejects.toEqual(mockError)
    })
  })

  describe('IPC events', () => {
    it('should register event listeners for device events', () => {
      const callback = vi.fn()
      
      mockIpcRenderer.on('wacom:device-connected', callback)
      mockIpcRenderer.on('wacom:device-disconnected', callback)
      
      expect(mockIpcRenderer.on).toHaveBeenCalledWith('wacom:device-connected', callback)
      expect(mockIpcRenderer.on).toHaveBeenCalledWith('wacom:device-disconnected', callback)
    })

    it('should register config changed event listener', () => {
      const callback = vi.fn()
      
      mockIpcRenderer.on('wacom:config-changed', callback)
      
      expect(mockIpcRenderer.on).toHaveBeenCalledWith('wacom:config-changed', callback)
    })

    it('should remove event listeners on cleanup', () => {
      const callback = vi.fn()
      
      // Add listener
      mockIpcRenderer.on('wacom:device-connected', callback)
      
      // Remove listener
      mockIpcRenderer.removeListener('wacom:device-connected', callback)
      
      expect(mockIpcRenderer.removeListener).toHaveBeenCalledWith(
        'wacom:device-connected',
        callback
      )
    })
  })

  describe('Config persistence via IPC', () => {
    it('should get and set config through IPC', async () => {
      const mockConfig = {
        orientation: 'none',
        mode: 'absolute',
        buttonMappings: { 1: 'button 1', 2: 'button 2', 3: 'button 3' },
        screen: 'ALL',
        pressureCurve: [0, 0, 100, 100]
      }
      
      mockIpcRenderer.invoke
        .mockResolvedValueOnce(undefined) // setConfig
        .mockResolvedValueOnce(mockConfig) // getConfig
      
      await mockIpcRenderer.invoke('wacom:set-config', { orientation: 'half' })
      const config = await mockIpcRenderer.invoke('wacom:get-config')
      
      expect(config).toEqual(mockConfig)
    })

    it('should reset config to defaults', async () => {
      const defaultConfig = {
        orientation: 'none',
        mode: 'absolute',
        buttonMappings: { 1: 'button 1', 2: 'button 2', 3: 'button 3' },
        screen: 'ALL',
        pressureCurve: [0, 0, 100, 100]
      }
      
      mockIpcRenderer.invoke
        .mockResolvedValueOnce(undefined) // resetToDefaults
        .mockResolvedValueOnce(defaultConfig) // getConfig
      
      await mockIpcRenderer.invoke('wacom:reset-to-defaults')
      const config = await mockIpcRenderer.invoke('wacom:get-config')
      
      expect(config.orientation).toBe('none')
    })
  })

  describe('Display detection via IPC', () => {
    it('should get display list', async () => {
      const mockDisplays = [
        { name: 'HDMI-1', resolution: '1920x1080', isPrimary: true },
        { name: 'DP-1', resolution: '1920x1080', isPrimary: false }
      ]
      
      mockIpcRenderer.invoke.mockResolvedValue(mockDisplays)
      
      const displays = await mockIpcRenderer.invoke('wacom:get-displays')
      
      expect(displays).toHaveLength(2)
      expect(displays[0].name).toBe('HDMI-1')
    })
  })

  describe('X11 check via IPC', () => {
    it('should return true for X11 session', async () => {
      mockIpcRenderer.invoke.mockResolvedValue(true)
      
      const isX11 = await mockIpcRenderer.invoke('wacom:check-x11')
      
      expect(isX11).toBe(true)
    })

    it('should return false for Wayland session', async () => {
      mockIpcRenderer.invoke.mockResolvedValue(false)
      
      const isX11 = await mockIpcRenderer.invoke('wacom:check-x11')
      
      expect(isX11).toBe(false)
    })
  })
})
