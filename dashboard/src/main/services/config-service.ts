import { app } from 'electron'
import * as fs from 'fs/promises'
import * as path from 'path'
import { DashboardConfig } from '@shared/types'

const DEFAULT_CONFIG: DashboardConfig = {
  orientation: 'none',
  mode: 'absolute',
  buttonMappings: {
    1: 'button 1',  // Tip
    2: 'button 2',  // Barrel button 1
    3: 'button 3',  // Barrel button 2
  },
  screen: 'ALL',
  pressureCurve: [0, 0, 100, 100] // Linear curve
}

export class ConfigService {
  private configPath: string
  private currentConfig: DashboardConfig

  constructor() {
    this.configPath = path.join(app.getPath('userData'), 'wacom-config.json')
    this.currentConfig = { ...DEFAULT_CONFIG }
  }

  async initialize(): Promise<void> {
    try {
      await this.loadConfig()
    } catch {
      // If no config exists, save default
      await this.saveConfig()
    }
  }

  getConfig(): DashboardConfig {
    return { ...this.currentConfig }
  }

  async setConfig(config: Partial<DashboardConfig>): Promise<void> {
    this.currentConfig = {
      ...this.currentConfig,
      ...config
    }
    await this.saveConfig()
  }

  async updateConfig(partial: Partial<DashboardConfig>): Promise<void> {
    this.currentConfig = {
      ...this.currentConfig,
      ...partial
    }
    await this.saveConfig()
  }

  async resetToDefaults(): Promise<void> {
    this.currentConfig = { ...DEFAULT_CONFIG }
    await this.saveConfig()
  }

  private async loadConfig(): Promise<void> {
    try {
      const data = await fs.readFile(this.configPath, 'utf-8')
      const parsed = JSON.parse(data)
      this.currentConfig = {
        ...DEFAULT_CONFIG,
        ...parsed
      }
    } catch {
      throw new Error('Failed to load config')
    }
  }

  private async saveConfig(): Promise<void> {
    try {
      await fs.mkdir(path.dirname(this.configPath), { recursive: true })
      await fs.writeFile(
        this.configPath,
        JSON.stringify(this.currentConfig, null, 2),
        'utf-8'
      )
    } catch (error) {
      console.error('Failed to save config:', error)
      throw error
    }
  }
}