import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useWacomStore } from '../../src/renderer/store/wacomStore'
import { DashboardConfig, DeviceInfo } from '@shared/types'

// Mock the wacomAPI
const mockWacomAPI = {
  getDevices: vi.fn(),
  getCurrentModel: vi.fn(),
  refreshDevices: vi.fn(),
  getConfig: vi.fn(),
  setConfig: vi.fn(),
  setOrientation: vi.fn(),
  setMode: vi.fn(),
  setButtonMapping: vi.fn(),
  setScreen: vi.fn(),
  setPressureCurve: vi.fn(),
  applyConfig: vi.fn(),
  resetToDefaults: vi.fn(),
  getDisplays: vi.fn(),
  checkX11: vi.fn(),
  onDeviceConnected: vi.fn(() => () => {}),
  onDeviceDisconnected: vi.fn(() => () => {}),
  onConfigChanged: vi.fn(() => () => {})
}

// Set up global mock
;(global as any).window = { wacomAPI: mockWacomAPI }

describe('useWacomStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useWacomStore.setState({
      config: {
        orientation: 'none',
        mode: 'absolute',
        buttonMappings: { 1: 'button 1', 2: 'button 2', 3: 'button 3' },
        screen: 'ALL',
        pressureCurve: [0, 0, 100, 100]
      },
      isLoading: false,
      error: null,
      deviceInfo: null,
      isDeviceConnected: false,
      displays: [],
      isX11: true
    })
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should have correct default values', () => {
      const state = useWacomStore.getState()
      
      expect(state.config.orientation).toBe('none')
      expect(state.config.mode).toBe('absolute')
      expect(state.config.screen).toBe('ALL')
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
      expect(state.isDeviceConnected).toBe(false)
    })
  })

  describe('loadConfig', () => {
    it('should load config from API', async () => {
      const mockConfig: DashboardConfig = {
        orientation: 'half',
        mode: 'absolute',
        buttonMappings: { 1: 'button 1', 2: 'button 3', 3: 'key f10' },
        screen: 'HDMI-1',
        pressureCurve: [0, 20, 80, 100]
      }
      
      mockWacomAPI.getConfig.mockResolvedValue(mockConfig)
      
      await useWacomStore.getState().loadConfig()
      
      expect(mockWacomAPI.getConfig).toHaveBeenCalled()
      expect(useWacomStore.getState().config).toEqual(mockConfig)
      expect(useWacomStore.getState().isLoading).toBe(false)
    })

    it('should set error on failure', async () => {
      mockWacomAPI.getConfig.mockRejectedValue(new Error('Failed to load'))
      
      await useWacomStore.getState().loadConfig()
      
      expect(useWacomStore.getState().error).toBe('Failed to load')
      expect(useWacomStore.getState().isLoading).toBe(false)
    })
  })

  describe('setOrientation', () => {
    it('should update orientation and refresh config', async () => {
      mockWacomAPI.setOrientation.mockResolvedValue(undefined)
      mockWacomAPI.getConfig.mockResolvedValue({
        ...useWacomStore.getState().config,
        orientation: 'cw'
      })
      
      await useWacomStore.getState().setOrientation('cw')
      
      expect(mockWacomAPI.setOrientation).toHaveBeenCalledWith('cw')
      expect(useWacomStore.getState().config.orientation).toBe('cw')
    })

    it('should set loading state during operation', async () => {
      let resolveOrientation: () => void
      mockWacomAPI.setOrientation.mockImplementation(() => 
        new Promise(resolve => { resolveOrientation = resolve })
      )
      
      const promise = useWacomStore.getState().setOrientation('half')
      
      // Check loading was set to true
      expect(useWacomStore.getState().isLoading).toBe(true)
      
      // Resolve the promise
      resolveOrientation!()
      mockWacomAPI.getConfig.mockResolvedValue(useWacomStore.getState().config)
      await promise
      
      expect(useWacomStore.getState().isLoading).toBe(false)
    })
  })

  describe('setMode', () => {
    it('should set mode to absolute', async () => {
      mockWacomAPI.setMode.mockResolvedValue(undefined)
      mockWacomAPI.getConfig.mockResolvedValue({
        ...useWacomStore.getState().config,
        mode: 'absolute'
      })
      
      await useWacomStore.getState().setMode('absolute')
      
      expect(mockWacomAPI.setMode).toHaveBeenCalledWith('absolute')
    })

    it('should set mode to relative', async () => {
      mockWacomAPI.setMode.mockResolvedValue(undefined)
      mockWacomAPI.getConfig.mockResolvedValue({
        ...useWacomStore.getState().config,
        mode: 'relative'
      })
      
      await useWacomStore.getState().setMode('relative')
      
      expect(mockWacomAPI.setMode).toHaveBeenCalledWith('relative')
    })
  })

  describe('setButtonMapping', () => {
    it('should update button mapping', async () => {
      mockWacomAPI.setButtonMapping.mockResolvedValue(undefined)
      mockWacomAPI.getConfig.mockResolvedValue({
        ...useWacomStore.getState().config,
        buttonMappings: { 1: 'button 1', 2: 'key +ctrl +z', 3: 'button 3' }
      })
      
      await useWacomStore.getState().setButtonMapping(2, 'key +ctrl +z')
      
      expect(mockWacomAPI.setButtonMapping).toHaveBeenCalledWith(2, 'key +ctrl +z')
    })
  })

  describe('setScreen', () => {
    it('should set screen to ALL', async () => {
      mockWacomAPI.setScreen.mockResolvedValue(undefined)
      mockWacomAPI.getConfig.mockResolvedValue(useWacomStore.getState().config)
      
      await useWacomStore.getState().setScreen('ALL')
      
      expect(mockWacomAPI.setScreen).toHaveBeenCalledWith('ALL')
    })

    it('should set screen to specific monitor', async () => {
      mockWacomAPI.setScreen.mockResolvedValue(undefined)
      mockWacomAPI.getConfig.mockResolvedValue({
        ...useWacomStore.getState().config,
        screen: 'HDMI-1'
      })
      
      await useWacomStore.getState().setScreen('HDMI-1')
      
      expect(mockWacomAPI.setScreen).toHaveBeenCalledWith('HDMI-1')
    })
  })

  describe('setPressureCurve', () => {
    it('should update pressure curve', async () => {
      mockWacomAPI.setPressureCurve.mockResolvedValue(undefined)
      mockWacomAPI.getConfig.mockResolvedValue({
        ...useWacomStore.getState().config,
        pressureCurve: [0, 20, 80, 100]
      })
      
      await useWacomStore.getState().setPressureCurve([0, 20, 80, 100])
      
      expect(mockWacomAPI.setPressureCurve).toHaveBeenCalledWith([0, 20, 80, 100])
    })
  })

  describe('applyConfig', () => {
    it('should call applyConfig API', async () => {
      mockWacomAPI.applyConfig.mockResolvedValue(undefined)
      
      await useWacomStore.getState().applyConfig()
      
      expect(mockWacomAPI.applyConfig).toHaveBeenCalled()
      expect(useWacomStore.getState().isLoading).toBe(false)
    })
  })

  describe('resetToDefaults', () => {
    it('should reset config to defaults', async () => {
      mockWacomAPI.resetToDefaults.mockResolvedValue(undefined)
      mockWacomAPI.getConfig.mockResolvedValue({
        orientation: 'none',
        mode: 'absolute',
        buttonMappings: { 1: 'button 1', 2: 'button 2', 3: 'button 3' },
        screen: 'ALL',
        pressureCurve: [0, 0, 100, 100]
      })
      
      await useWacomStore.getState().resetToDefaults()
      
      expect(mockWacomAPI.resetToDefaults).toHaveBeenCalled()
      expect(useWacomStore.getState().config.orientation).toBe('none')
    })
  })

  describe('refreshDevices', () => {
    it('should update device info when connected', async () => {
      const mockDeviceInfo: DeviceInfo = {
        model: 'Intuos S',
        devices: [
          { name: 'Wacom Intuos S Pen stylus', id: '10', type: 'STYLUS' }
        ],
        isConnected: true
      }
      
      mockWacomAPI.refreshDevices.mockResolvedValue(mockDeviceInfo)
      
      await useWacomStore.getState().refreshDevices()
      
      expect(useWacomStore.getState().deviceInfo).toEqual(mockDeviceInfo)
      expect(useWacomStore.getState().isDeviceConnected).toBe(true)
    })

    it('should set connected to false when no device', async () => {
      mockWacomAPI.refreshDevices.mockResolvedValue({
        model: 'Unknown',
        devices: [],
        isConnected: false
      })
      
      await useWacomStore.getState().refreshDevices()
      
      expect(useWacomStore.getState().isDeviceConnected).toBe(false)
    })

    it('should set error on failure', async () => {
      mockWacomAPI.refreshDevices.mockRejectedValue(new Error('Device error'))
      
      await useWacomStore.getState().refreshDevices()
      
      expect(useWacomStore.getState().error).toBe('Device error')
      expect(useWacomStore.getState().isDeviceConnected).toBe(false)
    })
  })

  describe('loadDisplays', () => {
    it('should load display list', async () => {
      const mockDisplays = [
        { name: 'HDMI-1', resolution: '1920x1080', isPrimary: true },
        { name: 'DP-1', resolution: '1920x1080', isPrimary: false }
      ]
      
      mockWacomAPI.getDisplays.mockResolvedValue(mockDisplays)
      
      await useWacomStore.getState().loadDisplays()
      
      expect(useWacomStore.getState().displays).toEqual(mockDisplays)
    })

    it('should not throw on error', async () => {
      mockWacomAPI.getDisplays.mockRejectedValue(new Error('Failed'))
      
      // Should not throw
      await useWacomStore.getState().loadDisplays()
      
      expect(useWacomStore.getState().displays).toEqual([])
    })
  })

  describe('checkX11', () => {
    it('should set isX11 to true when X11 is detected', async () => {
      mockWacomAPI.checkX11.mockResolvedValue(true)
      
      await useWacomStore.getState().checkX11()
      
      expect(useWacomStore.getState().isX11).toBe(true)
    })

    it('should set isX11 to false when Wayland is detected', async () => {
      mockWacomAPI.checkX11.mockResolvedValue(false)
      
      await useWacomStore.getState().checkX11()
      
      expect(useWacomStore.getState().isX11).toBe(false)
    })
  })

  describe('clearError', () => {
    it('should clear error state', () => {
      useWacomStore.setState({ error: 'Some error' })
      
      useWacomStore.getState().clearError()
      
      expect(useWacomStore.getState().error).toBeNull()
    })
  })
})
