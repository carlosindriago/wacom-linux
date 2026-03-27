import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ConfigService } from '../../src/main/services/config-service'
import * as fs from 'fs/promises'
import path from 'path'

// Mock electron app
vi.mock('electron', () => ({
  app: {
    getPath: vi.fn(() => '/mock/user/data')
  }
}))

// Mock fs/promises
vi.mock('fs/promises', () => ({
  mkdir: vi.fn(),
  readFile: vi.fn(),
  writeFile: vi.fn()
}))

describe('ConfigService', () => {
  let configService: ConfigService

  const mockConfigPath = '/mock/user/data/wacom-config.json'

  const defaultConfig = {
    orientation: 'none',
    mode: 'absolute',
    buttonMappings: {
      1: 'button 1',
      2: 'button 2',
      3: 'button 3'
    },
    screen: 'ALL',
    pressureCurve: [0, 0, 100, 100]
  }

  beforeEach(() => {
    vi.clearAllMocks()
    configService = new ConfigService()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('initialize', () => {
    it('should load existing config on initialization', async () => {
      const existingConfig = {
        ...defaultConfig,
        orientation: 'half'
      }
      
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(existingConfig))
      
      await configService.initialize()
      const config = configService.getConfig()
      
      expect(config.orientation).toBe('half')
    })

    it('should save default config when no config exists', async () => {
      vi.mocked(fs.readFile).mockRejectedValue(new Error('ENOENT'))
      vi.mocked(fs.mkdir).mockResolvedValue(undefined)
      vi.mocked(fs.writeFile).mockResolvedValue(undefined)
      
      await configService.initialize()
      
      expect(fs.writeFile).toHaveBeenCalledWith(
        mockConfigPath,
        expect.stringContaining('"orientation": "none"'),
        'utf-8'
      )
    })
  })

  describe('getConfig', () => {
    it('should return a copy of the config', () => {
      const config1 = configService.getConfig()
      const config2 = configService.getConfig()
      
      expect(config1).toEqual(config2)
      expect(config1).not.toBe(config2) // Different references
    })

    it('should return default config before initialization', () => {
      const config = configService.getConfig()
      
      expect(config).toEqual(defaultConfig)
    })
  })

  describe('setConfig', () => {
    it('should merge partial config with existing config', async () => {
      vi.mocked(fs.mkdir).mockResolvedValue(undefined)
      vi.mocked(fs.writeFile).mockResolvedValue(undefined)
      
      await configService.setConfig({ orientation: 'cw' })
      const config = configService.getConfig()
      
      expect(config.orientation).toBe('cw')
      expect(config.mode).toBe('absolute') // Unchanged
    })

    it('should save config to file', async () => {
      vi.mocked(fs.mkdir).mockResolvedValue(undefined)
      vi.mocked(fs.writeFile).mockResolvedValue(undefined)
      
      await configService.setConfig({ mode: 'relative' })
      
      expect(fs.writeFile).toHaveBeenCalledWith(
        mockConfigPath,
        expect.stringContaining('"mode": "relative"'),
        'utf-8'
      )
    })
  })

  describe('updateConfig', () => {
    it('should update config and persist', async () => {
      vi.mocked(fs.mkdir).mockResolvedValue(undefined)
      vi.mocked(fs.writeFile).mockResolvedValue(undefined)
      
      await configService.updateConfig({ 
        buttonMappings: { 1: 'key a', 2: 'button 2', 3: 'button 3' }
      })
      
      const config = configService.getConfig()
      expect(config.buttonMappings[1]).toBe('key a')
    })
  })

  describe('resetToDefaults', () => {
    it('should reset config to default values', async () => {
      vi.mocked(fs.mkdir).mockResolvedValue(undefined)
      vi.mocked(fs.writeFile).mockResolvedValue(undefined)
      
      // First modify the config
      await configService.setConfig({ 
        orientation: 'half',
        mode: 'relative'
      })
      
      // Then reset
      await configService.resetToDefaults()
      const config = configService.getConfig()
      
      expect(config.orientation).toBe('none')
      expect(config.mode).toBe('absolute')
      expect(config.pressureCurve).toEqual([0, 0, 100, 100])
    })
  })

  describe('config persistence', () => {
    it('should create directory if it does not exist', async () => {
      vi.mocked(fs.mkdir).mockResolvedValue(undefined)
      vi.mocked(fs.writeFile).mockResolvedValue(undefined)
      
      await configService.setConfig({ orientation: 'ccw' })
      
      expect(fs.mkdir).toHaveBeenCalledWith(
        path.dirname(mockConfigPath),
        { recursive: true }
      )
    })

    it('should persist pressure curve correctly', async () => {
      vi.mocked(fs.mkdir).mockResolvedValue(undefined)
      vi.mocked(fs.writeFile).mockResolvedValue(undefined)
      
      await configService.setConfig({ 
        pressureCurve: [0, 20, 80, 100] 
      })
      
      const writtenContent = vi.mocked(fs.writeFile).mock.calls[0][1] as string
      const parsed = JSON.parse(writtenContent)
      
      expect(parsed.pressureCurve).toEqual([0, 20, 80, 100])
    })

    it('should persist button mappings correctly', async () => {
      vi.mocked(fs.mkdir).mockResolvedValue(undefined)
      vi.mocked(fs.writeFile).mockResolvedValue(undefined)
      
      await configService.setConfig({ 
        buttonMappings: { 
          1: 'button 1', 
          2: 'key +ctrl +z', 
          3: 'button 3' 
        }
      })
      
      const writtenContent = vi.mocked(fs.writeFile).mock.calls[0][1] as string
      const parsed = JSON.parse(writtenContent)
      
      expect(parsed.buttonMappings['2']).toBe('key +ctrl +z')
    })
  })

  describe('error handling', () => {
    it('should throw error when file write fails', async () => {
      vi.mocked(fs.mkdir).mockResolvedValue(undefined)
      vi.mocked(fs.writeFile).mockRejectedValue(new Error('Write failed'))
      
      await expect(configService.setConfig({ orientation: 'half' }))
        .rejects.toThrow('Write failed')
    })
  })
})
