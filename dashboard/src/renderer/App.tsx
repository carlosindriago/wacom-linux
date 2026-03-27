import { useEffect } from 'react'
import { useWacomStore } from './store/wacomStore'
import { WacomDashboard } from './components/WacomDashboard'

function App() {
  const { loadConfig, refreshDevices, checkX11 } = useWacomStore()

  useEffect(() => {
    // Initialize app on mount
    checkX11()
    loadConfig()
    refreshDevices()
  }, [])

  return <WacomDashboard />
}

export default App