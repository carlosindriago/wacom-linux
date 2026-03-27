// ============================================================
// Wacom Dashboard - Shared Types
// Contrato entre Main Process, Preload y Renderer
// ============================================================

export interface WacomDevice {
  name: string;
  id: string;
  type: DeviceType;
}

export type DeviceType = 'STYLUS' | 'ERASER' | 'PAD' | 'TOUCH';

export interface DashboardConfig {
  orientation: Orientation;
  mode: Mode;
  buttonMappings: Record<number, string>;
  screen: 'ALL' | string;
  pressureCurve: PressureCurve;
}

export type Orientation = 'none' | 'half' | 'cw' | 'ccw';

export type Mode = 'absolute' | 'relative';

export type PressureCurve = [number, number, number, number];

export interface DeviceInfo {
  model: string;
  devices: WacomDevice[];
  isConnected: boolean;
}

export interface ScriptResult {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number;
}

export interface DisplayInfo {
  name: string;
  resolution: string;
  isPrimary: boolean;
}

// ============================================================
// IPC Channel Names
// ============================================================

export const IPC_CHANNELS = {
  // Device operations
  GET_DEVICES: 'wacom:get-devices',
  GET_CURRENT_MODEL: 'wacom:get-current-model',
  REFRESH_DEVICES: 'wacom:refresh-devices',
  
  // Configuration operations
  GET_CONFIG: 'wacom:get-config',
  SET_CONFIG: 'wacom:set-config',
  SET_ORIENTATION: 'wacom:set-orientation',
  SET_MODE: 'wacom:set-mode',
  SET_BUTTON_MAPPING: 'wacom:set-button-mapping',
  SET_SCREEN: 'wacom:set-screen',
  SET_PRESSURE_CURVE: 'wacom:set-pressure-curve',
  
  // Actions
  APPLY_CONFIG: 'wacom:apply-config',
  RESET_TO_DEFAULTS: 'wacom:reset-to-defaults',
  
  // System info
  GET_DISPLAYS: 'wacom:get-displays',
  CHECK_X11: 'wacom:check-x11',
  
  // Events
  DEVICE_CONNECTED: 'wacom:device-connected',
  DEVICE_DISCONNECTED: 'wacom:device-disconnected',
  CONFIG_CHANGED: 'wacom:config-changed'
} as const;

// ============================================================
// Error Types
// ============================================================

export class WacomError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'WacomError';
  }
}

export enum ErrorCode {
  NO_DEVICE_FOUND = 'NO_DEVICE_FOUND',
  X11_NOT_AVAILABLE = 'X11_NOT_AVAILABLE',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  SCRIPT_FAILED = 'SCRIPT_FAILED',
  INVALID_CONFIG = 'INVALID_CONFIG',
  VERSION_INCOMPATIBLE = 'VERSION_INCOMPATIBLE'
}

// ============================================================
// API Interface (exposed via preload)
// ============================================================

declare global {
  interface Window {
    wacomAPI: WacomAPI;
  }
}

export interface WacomAPI {
  // Device detection
  getDevices(): Promise<WacomDevice[]>;
  getCurrentModel(): Promise<string | null>;
  refreshDevices(): Promise<DeviceInfo>;
  
  // Configuration
  getConfig(): Promise<DashboardConfig>;
  setConfig(config: Partial<DashboardConfig>): Promise<void>;
  setOrientation(orientation: Orientation): Promise<void>;
  setMode(mode: Mode): Promise<void>;
  setButtonMapping(button: number, action: string): Promise<void>;
  setScreen(screen: string): Promise<void>;
  setPressureCurve(curve: PressureCurve): Promise<void>;
  
  // Actions
  applyConfig(): Promise<void>;
  resetToDefaults(): Promise<void>;
  
  // System
  getDisplays(): Promise<DisplayInfo[]>;
  checkX11(): Promise<boolean>;
  
  // Events
  onDeviceConnected(callback: (device: DeviceInfo) => void): () => void;
  onDeviceDisconnected(callback: () => void): () => void;
  onConfigChanged(callback: (config: DashboardConfig) => void): () => void;
}