import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import Navigation from './components/Navigation'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import RecoveryCases from './pages/RecoveryCases'
import PolicyConfig from './pages/PolicyConfig'
import ModelMetrics from './pages/ModelMetrics'
import DemoSimulator from './pages/DemoSimulator'

export default function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-main text-main transition-colors duration-300">
        <Navigation />
        <main>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/cases" element={<RecoveryCases />} />
            <Route path="/policy" element={<PolicyConfig />} />
            <Route path="/models" element={<ModelMetrics />} />
            <Route path="/simulator" element={<DemoSimulator />} />
          </Routes>
        </main>
      </div>
    </ThemeProvider>
  )
}
