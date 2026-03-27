import { describe, it, expect, vi, beforeEach } from 'vitest'

// We need to mock before importing the module
const mockExecAsync = vi.fn()

vi.mock('util', () => ({
  promisify: () => mockExecAsync
}))

// Import after mock
const { WacomService } = await import('../../src/main/services/wacom-service')

describe('WacomService', () => {
  let wacomService: WacomService

  beforeEach(() => {
    vi.clearAllMocks()
    wacomService = new WacomService()
  })

  describe('checkX11', () => {
    it('should return true when XDG_SESSION_TYPE is x11', async () => {
      mockExecAsync.mockResolvedValue({ stdout: 'x11\n' })
      
      const result = await wacomService.checkX11()
      
      expect(result).toBe(true)
      expect(mockExecAsync).toHaveBeenCalledWith('echo $XDG_SESSION_TYPE')
    })

    it('should return false when XDG_SESSION_TYPE is wayland', async () => {
      mockExecAsync.mockResolvedValue({ stdout: 'wayland\n' })
      
      const result = await wacomService.checkX11()
      
      expect(result).toBe(false)
    })

    it('should return false on error', async () => {
      mockExecAsync.mockRejectedValue(new Error('Command failed'))
      
      const result = await wacomService.checkX11()
      
      expect(result).toBe(false)
    })
  })

  describe('getDevices', () => {
    it('should parse device list correctly', async () => {
      const mockOutput = `Wacom Intuos S Pen stylus	id: 12	type: STYLUS
Wacom Intuos S Pen eraser	id: 13	type: ERASER
Wacom Intuos S Pad pad	id: 14	type: PAD`
      
      mockExecAsync.mockResolvedValue({ stdout: mockOutput })
      
      const devices = await wacomService.getDevices()
      
      expect(devices).toHaveLength(3)
      expect(devices[0]).toEqual({
        name: 'Wacom Intuos S Pen stylus',
        id: '12',
        type: 'STYLUS'
      })
      expect(devices[1]).toEqual({
        name: 'Wacom Intuos S Pen eraser',
        id: '13',
        type: 'ERASER'
      })
      expect(devices[2]).toEqual({
        name: 'Wacom Intuos S Pad pad',
        id: '14',
        type: 'PAD'
      })
    })

    it('should return empty array when no devices', async () => {
      mockExecAsync.mockResolvedValue({ stdout: '' })
      
      const devices = await wacomService.getDevices()
      
      expect(devices).toHaveLength(0)
    })

    it('should throw WacomError on exec failure', async () => {
      mockExecAsync.mockRejectedValue(new Error('xsetwacom not found'))
      
      await expect(wacomService.getDevices()).rejects.toThrow('Failed to get Wacom devices')
    })
  })

  describe('getCurrentModel', () => {
    it('should extract model name from stylus device', async () => {
      const mockOutput = `Wacom Intuos Pro M Pen stylus	id: 10	type: STYLUS
Wacom Intuos Pro M Pen eraser	id: 11	type: ERASER`
      
      mockExecAsync.mockResolvedValue({ stdout: mockOutput })
      
      const model = await wacomService.getCurrentModel()
      
      expect(model).toBe('Intuos Pro M')
    })

    it('should return null when no devices', async () => {
      mockExecAsync.mockResolvedValue({ stdout: '' })
      
      const model = await wacomService.getCurrentModel()
      
      expect(model).toBeNull()
    })

    it('should return device name when model extraction fails', async () => {
      const mockOutput = `Some Unknown Device stylus	id: 10	type: STYLUS`
      
      mockExecAsync.mockResolvedValue({ stdout: mockOutput })
      
      const model = await wacomService.getCurrentModel()
      
      expect(model).toBe('Some Unknown Device stylus')
    })
  })

  describe('refreshDevices', () => {
    it('should return DeviceInfo with connected true', async () => {
      const mockOutput = `Wacom One Pen stylus	id: 9	type: STYLUS`
      
      mockExecAsync.mockResolvedValue({ stdout: mockOutput })
      
      const deviceInfo = await wacomService.refreshDevices()
      
      expect(deviceInfo.isConnected).toBe(true)
      expect(deviceInfo.devices).toHaveLength(1)
      expect(deviceInfo.model).toBe('One')
    })

    it('should return DeviceInfo with connected false when no devices', async () => {
      mockExecAsync.mockResolvedValue({ stdout: '' })
      
      const deviceInfo = await wacomService.refreshDevices()
      
      expect(deviceInfo.isConnected).toBe(false)
      expect(deviceInfo.devices).toHaveLength(0)
      expect(deviceInfo.model).toBe('Unknown')
    })
  })

  describe('setOrientation', () => {
    it('should call xsetwacom with correct rotation values', async () => {
      const mockOutput = `Wacom Test stylus	id: 10	type: STYLUS`
      mockExecAsync.mockResolvedValue({ stdout: mockOutput })
      
      await wacomService.setOrientation('none')
      
      expect(mockExecAsync).toHaveBeenCalledWith(
        expect.stringContaining('xsetwacom set "10" Rotate 0')
      )
    })

    it('should map half to rotation value 2', async () => {
      const mockOutput = `Wacom Test stylus	id: 10	type: STYLUS`
      mockExecAsync.mockResolvedValue({ stdout: mockOutput })
      
      await wacomService.setOrientation('half')
      
      expect(mockExecAsync).toHaveBeenCalledWith(
        expect.stringContaining('xsetwacom set "10" Rotate 2')
      )
    })

    it('should throw error when no stylus found', async () => {
      mockExecAsync.mockResolvedValue({ stdout: '' })
      
      await expect(wacomService.setOrientation('none'))
        .rejects.toThrow('No stylus device found')
    })
  })

  describe('setMode', () => {
    it('should set absolute mode', async () => {
      const mockOutput = `Wacom Test stylus	id: 10	type: STYLUS`
      mockExecAsync.mockResolvedValue({ stdout: mockOutput })
      
      await wacomService.setMode('absolute')
      
      expect(mockExecAsync).toHaveBeenCalledWith(
        expect.stringContaining('xsetwacom set "10" Mode Absolute')
      )
    })

    it('should set relative mode', async () => {
      const mockOutput = `Wacom Test stylus	id: 10	type: STYLUS`
      mockExecAsync.mockResolvedValue({ stdout: mockOutput })
      
      await wacomService.setMode('relative')
      
      expect(mockExecAsync).toHaveBeenCalledWith(
        expect.stringContaining('xsetwacom set "10" Mode Relative')
      )
    })
  })

  describe('setButtonMapping', () => {
    it('should set button mapping correctly', async () => {
      const mockOutput = `Wacom Test stylus	id: 10	type: STYLUS`
      mockExecAsync.mockResolvedValue({ stdout: mockOutput })
      
      await wacomService.setButtonMapping(2, 'button 3')
      
      expect(mockExecAsync).toHaveBeenCalledWith(
        expect.stringContaining('xsetwacom set "10" Button 2 button 3')
      )
    })
  })

  describe('setScreen', () => {
    it('should map to all screens when ALL is passed', async () => {
      const mockOutput = `Wacom Test stylus	id: 10	type: STYLUS`
      mockExecAsync.mockResolvedValue({ stdout: mockOutput })
      
      await wacomService.setScreen('ALL')
      
      expect(mockExecAsync).toHaveBeenCalledWith(
        expect.stringContaining('xsetwacom set "10" MapToOutput "next"')
      )
    })

    it('should map to specific screen', async () => {
      const mockOutput = `Wacom Test stylus	id: 10	type: STYLUS`
      mockExecAsync.mockResolvedValue({ stdout: mockOutput })
      
      await wacomService.setScreen('HDMI-1')
      
      expect(mockExecAsync).toHaveBeenCalledWith(
        expect.stringContaining('xsetwacom set "10" MapToOutput "HDMI-1"')
      )
    })
  })

  describe('setPressureCurve', () => {
    it('should set pressure curve correctly', async () => {
      const mockOutput = `Wacom Test stylus	id: 10	type: STYLUS`
      mockExecAsync.mockResolvedValue({ stdout: mockOutput })
      
      await wacomService.setPressureCurve([0, 20, 80, 100])
      
      expect(mockExecAsync).toHaveBeenCalledWith(
        expect.stringContaining('xsetwacom set "10" PressureCurve 0 20 80 100')
      )
    })
  })

  describe('getDisplays', () => {
    it('should parse display list correctly', async () => {
      const mockOutput = `Monitors: 2
 0: +*HDMI-1 1920/527x1080/296+0+0  HDMI-1
 1: +DP-1 1920/527x1080/296+1920+0  DP-1`
      
      mockExecAsync.mockResolvedValue({ stdout: mockOutput })
      
      const displays = await wacomService.getDisplays()
      
      expect(displays).toHaveLength(2)
      expect(displays[0].name).toBe('HDMI-1')
      expect(displays[0].resolution).toBe('1920x1080')
      expect(displays[0].isPrimary).toBe(true)
      expect(displays[1].isPrimary).toBe(false)
    })

    it('should return empty array on error', async () => {
      mockExecAsync.mockRejectedValue(new Error('xrandr failed'))
      
      const displays = await wacomService.getDisplays()
      
      expect(displays).toHaveLength(0)
    })
  })
})
