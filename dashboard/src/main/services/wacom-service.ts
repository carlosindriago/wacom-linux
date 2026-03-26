import { exec } from 'child_process'
import { promisify } from 'util'
import { 
  WacomDevice, 
  DeviceInfo, 
  Orientation, 
  Mode, 
  PressureCurve,
  DisplayInfo,
  WacomError,
  ErrorCode
} from '@shared/types'

const execAsync = promisify(exec)

export class WacomService {
  private currentModel: string | null = null

  constructor() {
    // Initialize service
  }

  async checkX11(): Promise<boolean> {
    try {
      const { stdout } = await execAsync('echo $XDG_SESSION_TYPE')
      return stdout.trim() === 'x11'
    } catch {
      return false
    }
  }

  async getDevices(): Promise<WacomDevice[]> {
    try {
      const { stdout } = await execAsync('xsetwacom --list devices')
      const devices = this.parseDeviceList(stdout)
      return devices
    } catch (error) {
      throw new WacomError(
        'Failed to get Wacom devices',
        ErrorCode.NO_DEVICE_FOUND,
        error
      )
    }
  }

  async getCurrentModel(): Promise<string | null> {
    try {
      const devices = await this.getDevices()
      if (devices.length === 0) return null
      
      // Get the first STYLUS device and extract model name
      const stylus = devices.find(d => d.type === 'STYLUS')
      if (stylus) {
        // Parse device name to extract model
        const match = stylus.name.match(/Wacom (.+?) (?:Pen|Stylus)/i)
        this.currentModel = match ? match[1] : stylus.name
      }
      
      return this.currentModel
    } catch (error) {
      return null
    }
  }

  async refreshDevices(): Promise<DeviceInfo> {
    const devices = await this.getDevices()
    const model = await this.getCurrentModel()
    
    return {
      model: model || 'Unknown',
      devices,
      isConnected: devices.length > 0
    }
  }

  async setOrientation(orientation: Orientation): Promise<void> {
    const devices = await this.getDevices()
    const stylus = devices.find(d => d.type === 'STYLUS')
    
    if (!stylus) {
      throw new WacomError('No stylus device found', ErrorCode.NO_DEVICE_FOUND)
    }

    const rotationMap = {
      'none': '0',
      'half': '2',
      'cw': '1',
      'ccw': '3'
    }

    try {
      await execAsync(`xsetwacom set "${stylus.id}" Rotate ${rotationMap[orientation]}`)
    } catch (error) {
      throw new WacomError(
        'Failed to set orientation',
        ErrorCode.SCRIPT_FAILED,
        error
      )
    }
  }

  async setMode(mode: Mode): Promise<void> {
    const devices = await this.getDevices()
    const stylus = devices.find(d => d.type === 'STYLUS')
    
    if (!stylus) {
      throw new WacomError('No stylus device found', ErrorCode.NO_DEVICE_FOUND)
    }

    const modeValue = mode === 'absolute' ? 'Absolute' : 'Relative'

    try {
      await execAsync(`xsetwacom set "${stylus.id}" Mode ${modeValue}`)
    } catch (error) {
      throw new WacomError(
        'Failed to set mode',
        ErrorCode.SCRIPT_FAILED,
        error
      )
    }
  }

  async setButtonMapping(button: number, action: string): Promise<void> {
    const devices = await this.getDevices()
    const stylus = devices.find(d => d.type === 'STYLUS')
    
    if (!stylus) {
      throw new WacomError('No stylus device found', ErrorCode.NO_DEVICE_FOUND)
    }

    try {
      await execAsync(`xsetwacom set "${stylus.id}" Button ${button} ${action}`)
    } catch (error) {
      throw new WacomError(
        'Failed to set button mapping',
        ErrorCode.SCRIPT_FAILED,
        error
      )
    }
  }

  async setScreen(screen: string): Promise<void> {
    const devices = await this.getDevices()
    const stylus = devices.find(d => d.type === 'STYLUS')
    
    if (!stylus) {
      throw new WacomError('No stylus device found', ErrorCode.NO_DEVICE_FOUND)
    }

    try {
      if (screen === 'ALL') {
        await execAsync(`xsetwacom set "${stylus.id}" MapToOutput "next"`)
      } else {
        await execAsync(`xsetwacom set "${stylus.id}" MapToOutput "${screen}"`)
      }
    } catch (error) {
      throw new WacomError(
        'Failed to set screen mapping',
        ErrorCode.SCRIPT_FAILED,
        error
      )
    }
  }

  async setPressureCurve(curve: PressureCurve): Promise<void> {
    const devices = await this.getDevices()
    const stylus = devices.find(d => d.type === 'STYLUS')
    
    if (!stylus) {
      throw new WacomError('No stylus device found', ErrorCode.NO_DEVICE_FOUND)
    }

    try {
      await execAsync(`xsetwacom set "${stylus.id}" PressureCurve ${curve.join(' ')}`)
    } catch (error) {
      throw new WacomError(
        'Failed to set pressure curve',
        ErrorCode.SCRIPT_FAILED,
        error
      )
    }
  }

  async getDisplays(): Promise<DisplayInfo[]> {
    try {
      const { stdout } = await execAsync('xrandr --listmonitors')
      return this.parseDisplays(stdout)
    } catch {
      return []
    }
  }

  async applyConfig(config: any): Promise<void> {
    // Apply all settings from the config
    await this.setOrientation(config.orientation)
    await this.setMode(config.mode)
    await this.setScreen(config.screen)
    await this.setPressureCurve(config.pressureCurve)
    
    // Apply button mappings
    for (const [button, action] of Object.entries(config.buttonMappings)) {
      await this.setButtonMapping(parseInt(button), action as string)
    }
  }

  private parseDeviceList(output: string): WacomDevice[] {
    const devices: WacomDevice[] = []
    const lines = output.trim().split('\n')
    
    for (const line of lines) {
      // Parse format: "Wacom Intuos S Pen stylus	id: 12	type: STYLUS"
      const match = line.match(/(.+?)\s+id:\s*(\d+)\s+type:\s*(\w+)/)
      if (match) {
        const [, name, id, type] = match
        devices.push({
          name: name.trim(),
          id,
          type: type as any
        })
      }
    }
    
    return devices
  }

  private parseDisplays(output: string): DisplayInfo[] {
    const displays: DisplayInfo[] = []
    const lines = output.trim().split('\n').slice(1) // Skip header
    
    for (const line of lines) {
      const match = line.match(/\d+:\s*\+\*?(\S+)\s+(\d+)\/(\d+)x(\d+)\/(\d+)\+(\d+)\+(\d+)/)
      if (match) {
        const [, name, width, , height] = match
        displays.push({
          name,
          resolution: `${width}x${height}`,
          isPrimary: line.includes('*')
        })
      }
    }
    
    return displays
  }
}