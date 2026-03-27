import { useEffect, useState } from 'react'
import { useWacomStore } from '../store/wacomStore'
import { Orientation, Mode, PressureCurve } from '@shared/types'

// Available button actions - comprehensive list for xsetwacom
const BUTTON_ACTIONS = [
  { value: 'button 1', label: '🔘 Click izquierdo', category: 'Mouse' },
  { value: 'button 2', label: '🔘 Click medio', category: 'Mouse' },
  { value: 'button 3', label: '🔘 Click derecho', category: 'Mouse' },
  { value: 'button 4', label: '🖱️ Scroll arriba', category: 'Mouse' },
  { value: 'button 5', label: '🖱️ Scroll abajo', category: 'Mouse' },
  { value: 'button 6', label: '🖱️ Botón atrás', category: 'Mouse' },
  { value: 'button 7', label: '🖱️ Botón adelante', category: 'Mouse' },
  { value: 'button 8', label: '🖱️ Botón extra 1', category: 'Mouse' },
  { value: 'button 9', label: '🖱️ Botón extra 2', category: 'Mouse' },
  
  { value: 'key +Control_L +Z', label: '↩️ Deshacer (Ctrl+Z)', category: 'Edición' },
  { value: 'key +Shift_L +Control_L +Z', label: '↩️ Rehacer (Ctrl+Shift+Z)', category: 'Edición' },
  { value: 'key +Control_L +Y', label: '↩️ Rehacer (Ctrl+Y)', category: 'Edición' },
  { value: 'key +Control_L +S', label: '💾 Guardar (Ctrl+S)', category: 'Edición' },
  { value: 'key +Control_L +Shift_L +S', label: '💾 Guardar como', category: 'Edición' },
  { value: 'key +Control_L +C', label: '📋 Copiar (Ctrl+C)', category: 'Edición' },
  { value: 'key +Control_L +X', label: '✂️ Cortar (Ctrl+X)', category: 'Edición' },
  { value: 'key +Control_L +V', label: '📋 Pegar (Ctrl+V)', category: 'Edición' },
  { value: 'key Delete', label: '🗑️ Eliminar', category: 'Edición' },
  
  { value: 'key +Control_L +plus', label: '🔍 Zoom +', category: 'Vista' },
  { value: 'key +Control_L +minus', label: '🔍 Zoom -', category: 'Vista' },
  { value: 'key +Control_L +0', label: '🔍 Zoom 100%', category: 'Vista' },
  { value: 'key +Control_L +1', label: '🔍 Zoom 100%', category: 'Vista' },
  { value: 'key +Alt_L +0', label: '🔲 Pantalla completa', category: 'Vista' },
  
  { value: 'key space', label: '🖐️ Mano/Pan', category: 'Herramientas' },
  { value: 'key +Shift_L +space', label: '🖐️ Pan inverso', category: 'Herramientas' },
  { value: 'key b', label: '🖌️ Pincel', category: 'Herramientas' },
  { value: 'key e', label: '🧹 Borrador', category: 'Herramientas' },
  { value: 'key g', label: '🪣 Relleno', category: 'Herramientas' },
  { value: 'key s', label: '✏️ Seleccionar', category: 'Herramientas' },
  { value: 'key l', label: '📏 Línea', category: 'Herramientas' },
  { value: 'key t', label: '📝 Texto', category: 'Herramientas' },
  { value: 'key i', label: '💧 Cuentagotas', category: 'Herramientas' },
  { value: 'key h', label: '🖐️ Mano', category: 'Herramientas' },
  { value: 'key z', label: '🔍 Lupa', category: 'Herramientas' },
  { value: 'key r', label: '🔄 Rotar', category: 'Herramientas' },
  { value: 'key p', label: '🖊️ Pluma', category: 'Herramientas' },
  
  { value: 'key +Control_L +Alt_L', label: '⌨️ Ctrl + Alt', category: 'Sistema' },
  { value: 'key +Alt_L +Tab', label: '🔀 Cambiar ventana', category: 'Sistema' },
  { value: 'key +Alt_L +F4', label: '❌ Cerrar ventana', category: 'Sistema' },
  { value: 'key +Control_L +Escape', label: '🖥️ Menú sistema', category: 'Sistema' },
  { value: 'key Escape', label: '⎋ Escape', category: 'Sistema' },
  { value: 'key Tab', label: '⇥ Tab', category: 'Sistema' },
  { value: 'key +Shift_L +Tab', label: '⇤ Shift+Tab', category: 'Sistema' },
  { value: 'key Return', label: '⏎ Enter', category: 'Sistema' },
  
  { value: 'key [', label: ' Decrease size', category: 'Tamaño pincel' },
  { value: 'key ]', label: '] Increase size', category: 'Tamaño pincel' },
  { value: 'key +Shift_L +[', label: '⬇️ Menor opacidad', category: 'Tamaño pincel' },
  { value: 'key +Shift_L +]', label: '⬆️ Mayor opacidad', category: 'Tamaño pincel' },
  
  { value: 'key 1', label: '1️⃣ Capa 1', category: 'Capas' },
  { value: 'key 2', label: '2️⃣ Capa 2', category: 'Capas' },
  { value: 'key 3', label: '3️⃣ Capa 3', category: 'Capas' },
  { value: 'key 4', label: '4️⃣ Capa 4', category: 'Capas' },
  { value: 'key 5', label: '5️⃣ Capa 5', category: 'Capas' },
  { value: 'key +Shift_L +n', label: '📄 Nueva capa', category: 'Capas' },
  { value: 'key +Control_L +e', label: '📑 Combinar capas', category: 'Capas' },
  
  { value: 'none', label: '🚫 Sin acción', category: 'Especial' },
  { value: 'disabled', label: '⛔ Deshabilitado', category: 'Especial' },
] as const

// Pressure curve presets
const PRESSURE_PRESETS = [
  { value: [0, 0, 100, 100], label: 'Lineal', description: 'Respuesta directa' },
  { value: [0, 50, 50, 100], label: 'Suave', description: 'Fácil control' },
  { value: [0, 0, 50, 100], label: 'Firme', description: 'Más presión requerida' },
  { value: [0, 20, 80, 100], label: 'Suave inicial', description: 'Inicio suave, máximo firme' },
  { value: [20, 0, 100, 80], label: 'Firme inicial', description: 'Inicio firme, máximo suave' },
] as const

// Orientation options
const ORIENTATIONS = [
  { value: 'none', label: 'Normal', icon: '↻' },
  { value: 'cw', label: 'Rotado 90°', icon: '⤵' },
  { value: 'half', label: 'Volteado 180°', icon: '↺' },
  { value: 'ccw', label: 'Rotado -90°', icon: '⤴' },
] as const

export const WacomDashboard: React.FC = () => {
  const {
    config,
    isLoading,
    error,
    deviceInfo,
    isDeviceConnected,
    displays,
    isX11,
    loadConfig,
    setOrientation,
    setMode,
    setScreen,
    setPressureCurve,
    setButtonMapping,
    applyConfig,
    resetToDefaults,
    refreshDevices,
    loadDisplays,
    checkX11,
    clearError
  } = useWacomStore()

  const [selectedPreset, setSelectedPreset] = useState<number>(0)

  // Load initial data
  useEffect(() => {
    loadConfig()
    refreshDevices()
    loadDisplays()
    checkX11()

    // Set up event listeners
    const unsubDeviceConnected = window.wacomAPI.onDeviceConnected(() => {
      refreshDevices()
    })
    
    const unsubDeviceDisconnected = window.wacomAPI.onDeviceDisconnected(() => {
      refreshDevices()
    })

    return () => {
      unsubDeviceConnected()
      unsubDeviceDisconnected()
    }
  }, [])

  // Close window handler
  const handleClose = () => {
    window.close()
  }

  // Minimize window handler
  const handleMinimize = () => {
    // This would need to be exposed via preload
    console.log('Minimize not implemented')
  }

  // Handle pressure preset change
  const handlePresetChange = (presetIndex: number) => {
    setSelectedPreset(presetIndex)
    const preset = PRESSURE_PRESETS[presetIndex]
    setPressureCurve(preset.value as PressureCurve)
  }

  if (!isX11) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
        <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-8 max-w-md">
          <h1 className="text-2xl font-bold text-red-400 mb-4">
            ⚠️ Wayland Detectado
          </h1>
          <p className="text-red-300">
            Esta aplicación requiere X11. Detectamos Wayland.
            Cambiá a sesión X11 para usar todas las funciones.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-950 text-gray-100 flex flex-col overflow-hidden">
      {/* Custom Title Bar */}
      <div className="h-10 flex-shrink-0 bg-gray-900 flex items-center justify-between px-4 select-none app-drag border-b border-gray-800">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-500 to-purple-600"></div>
          <span className="text-xs text-gray-400 font-medium">Wacom Dashboard</span>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleMinimize}
            className="w-7 h-7 rounded hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-gray-200 transition-colors app-no-drag"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <button 
            onClick={handleClose}
            className="w-7 h-7 rounded hover:bg-red-600 flex items-center justify-center text-gray-400 hover:text-white transition-colors app-no-drag"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Scrollable Main Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          
          {/* Header with Device Status */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Configuración Wacom
              </h1>
              <p className="text-gray-500 text-sm mt-1">Personalizá tu tableta gráfica</p>
            </div>
            <div className="flex items-center space-x-3">
              {isDeviceConnected ? (
                <div className="flex items-center space-x-2 bg-green-900/30 border border-green-500/30 px-4 py-2 rounded-full">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-green-400 text-sm font-medium">{deviceInfo?.model}</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 bg-red-900/30 border border-red-500/30 px-4 py-2 rounded-full">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  <span className="text-red-400 text-sm font-medium">Sin dispositivo</span>
                </div>
              )}
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 flex items-center justify-between">
              <p className="text-red-400">{error}</p>
              <button 
                onClick={clearError}
                className="text-red-500 hover:text-red-300 transition-colors"
              >
                ✕
              </button>
            </div>
          )}

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left Column - Orientation & Mode */}
            <div className="space-y-6">
              
              {/* Orientation Card */}
              <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-gray-200 mb-4 flex items-center">
                  <span className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </span>
                  Orientación
                </h2>
                
                <div className="grid grid-cols-2 gap-3">
                  {ORIENTATIONS.map((orient) => (
                    <button
                      key={orient.value}
                      onClick={() => setOrientation(orient.value as Orientation)}
                      disabled={isLoading || !isDeviceConnected}
                      className={`
                        p-4 rounded-xl border-2 transition-all duration-200 text-left
                        ${config.orientation === orient.value 
                          ? 'bg-blue-500/20 border-blue-500 text-blue-400' 
                          : 'bg-gray-800/50 border-gray-700 hover:border-gray-600 text-gray-400'}
                        ${(!isDeviceConnected || isLoading) && 'opacity-50 cursor-not-allowed'}
                      `}
                    >
                      <div className="text-2xl mb-1">{orient.icon}</div>
                      <div className="text-sm font-medium">{orient.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mode Card */}
              <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-gray-200 mb-4 flex items-center">
                  <span className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                    </svg>
                  </span>
                  Modo de Posicionamiento
                </h2>
                
                <div className="space-y-3">
                  <button
                    onClick={() => setMode('absolute')}
                    disabled={isLoading || !isDeviceConnected}
                    className={`
                      w-full p-4 rounded-xl border-2 transition-all duration-200 text-left
                      ${config.mode === 'absolute' 
                        ? 'bg-purple-500/20 border-purple-500' 
                        : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'}
                      ${(!isDeviceConnected || isLoading) && 'opacity-50 cursor-not-allowed'}
                    `}
                  >
                    <div className="font-medium text-gray-200">Absoluto</div>
                    <div className="text-sm text-gray-500">El cursor sigue la posición del lápiz</div>
                  </button>
                  
                  <button
                    onClick={() => setMode('relative')}
                    disabled={isLoading || !isDeviceConnected}
                    className={`
                      w-full p-4 rounded-xl border-2 transition-all duration-200 text-left
                      ${config.mode === 'relative' 
                        ? 'bg-purple-500/20 border-purple-500' 
                        : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'}
                      ${(!isDeviceConnected || isLoading) && 'opacity-50 cursor-not-allowed'}
                    `}
                  >
                    <div className="font-medium text-gray-200">Relativo</div>
                    <div className="text-sm text-gray-500">Como un mouse/touchpad</div>
                  </button>
                </div>
              </div>

              {/* Screen Mapping */}
              <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-gray-200 mb-4 flex items-center">
                  <span className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  Mapeo de Pantalla
                </h2>
                
                <select
                  value={config.screen}
                  onChange={(e) => setScreen(e.target.value)}
                  disabled={isLoading || !isDeviceConnected}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-gray-200 focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                >
                  <option value="ALL">Todas las pantallas</option>
                  {displays.map((display) => (
                    <option key={display.name} value={display.name}>
                      {display.name} ({display.resolution}){display.isPrimary && ' - Principal'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Right Column - Pressure & Buttons */}
            <div className="space-y-6">
              
              {/* Pressure Curve */}
              <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-gray-200 mb-4 flex items-center">
                  <span className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </span>
                  Curva de Presión
                </h2>
                
                {/* Preset buttons */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {PRESSURE_PRESETS.map((preset, index) => (
                    <button
                      key={preset.label}
                      onClick={() => handlePresetChange(index)}
                      disabled={isLoading || !isDeviceConnected}
                      className={`
                        p-3 rounded-xl border-2 transition-all duration-200 text-left
                        ${selectedPreset === index
                          ? 'bg-orange-500/20 border-orange-500'
                          : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'}
                        ${(!isDeviceConnected || isLoading) && 'opacity-50 cursor-not-allowed'}
                      `}
                    >
                      <div className="text-sm font-medium text-gray-200">{preset.label}</div>
                      <div className="text-xs text-gray-500">{preset.description}</div>
                    </button>
                  ))}
                </div>
                
                {/* Visual curve representation */}
                <div className="bg-gray-800 rounded-xl p-4">
                  <svg viewBox="0 0 100 100" className="w-full h-32">
                    {/* Grid */}
                    <line x1="0" y1="100" x2="100" y2="100" stroke="#374151" strokeWidth="0.5" />
                    <line x1="0" y1="0" x2="0" y2="100" stroke="#374151" strokeWidth="0.5" />
                    <line x1="0" y1="50" x2="100" y2="50" stroke="#374151" strokeWidth="0.25" strokeDasharray="2" />
                    <line x1="50" y1="0" x2="50" y2="100" stroke="#374151" strokeWidth="0.25" strokeDasharray="2" />
                    
                    {/* Curve */}
                    <path
                      d={`M 0 ${100 - config.pressureCurve[1]} C ${config.pressureCurve[0]} ${100 - config.pressureCurve[1]}, ${config.pressureCurve[2]} ${100 - config.pressureCurve[3]}, 100 ${100 - config.pressureCurve[3]}`}
                      fill="none"
                      stroke="url(#gradient)"
                      strokeWidth="3"
                    />
                    
                    {/* Gradient definition */}
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#a855f7" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>

          {/* Button Mappings */}
              <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-gray-200 mb-4 flex items-center">
                  <span className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                    </svg>
                  </span>
                  Botones del Lápiz
                </h2>
                
                {/* Button explanation */}
                <p className="text-xs text-gray-500 mb-4">
                  Configurá las acciones para cada botón del lápiz. Las opciones están agrupadas por categoría.
                </p>

                <div className="space-y-4">
                  {/* Stylus buttons: 2 = lower barrel, 3 = upper barrel, 1 = tip */}
                  {[
                    { button: 1, label: 'Punta del Lápiz', icon: '✏️', desc: 'Acción principal de dibujo' },
                    { button: 2, label: 'Botón Inferior', icon: '🔘', desc: 'Botón más cerca de la punta' },
                    { button: 3, label: 'Botón Superior', icon: '🔘', desc: 'Botón más alejado de la punta' },
                  ].map(({ button, label, icon, desc }) => (
                    <div key={button} className="bg-gray-800/30 rounded-xl p-4">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-xl">{icon}</span>
                        <div>
                          <label className="text-sm font-medium text-gray-200">{label}</label>
                          <p className="text-xs text-gray-500">{desc}</p>
                        </div>
                      </div>
                      <select
                        value={config.buttonMappings[button] || 'button 1'}
                        onChange={(e) => setButtonMapping(button, e.target.value)}
                        disabled={isLoading || !isDeviceConnected}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-pink-500 disabled:opacity-50"
                      >
                        {/* Group options by category */}
                        {Array.from(new Set(BUTTON_ACTIONS.map(a => a.category))).map((category) => (
                          <optgroup key={category} label={category}>
                            {BUTTON_ACTIONS.filter(a => a.category === category).map((action) => (
                              <option key={action.value} value={action.value}>
                                {action.label}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
                
                {/* Additional tip */}
                <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                  <p className="text-xs text-blue-400">
                    💡 <strong>Tip:</strong> En programas como Krita, GIMP o Inkscape, podés asignar atajos de teclado personalizados en Editar → Configurar atajos.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-800">
            <button
              onClick={applyConfig}
              disabled={isLoading || !isDeviceConnected}
              className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading && <span className="animate-spin mr-2">⟳</span>}
              Aplicar Cambios
            </button>
            
            <button
              onClick={resetToDefaults}
              disabled={isLoading || !isDeviceConnected}
              className="px-6 py-3 bg-gray-800 border border-gray-700 text-gray-300 rounded-xl font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Restaurar Valores
            </button>
            
            <button
              onClick={refreshDevices}
              disabled={isLoading}
              className="px-6 py-3 bg-gray-800 border border-gray-700 text-gray-300 rounded-xl font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Refrescar
            </button>
          </div>
          
          {/* Device Info Footer */}
          {deviceInfo && (
            <div className="text-xs text-gray-600 pt-4 border-t border-gray-800">
              <div className="flex flex-wrap gap-x-6 gap-y-1">
                <span>Modelo: <span className="text-gray-400">{deviceInfo.model}</span></span>
                <span>Dispositivos: <span className="text-gray-400">{deviceInfo.devices.length}</span></span>
                {deviceInfo.devices.map((device) => (
                  <span key={device.id} className="text-gray-500">
                    {device.type}: <span className="text-gray-600">{device.name}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}