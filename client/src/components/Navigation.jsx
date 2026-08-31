import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Zap, LayoutDashboard, FileText, Settings, Cpu, PlayCircle, Sun, Moon, Shield } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function Navigation() {
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()

  const links = [
    { path: '/', label: 'Home', icon: Shield },
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/cases', label: 'Recovery Cases', icon: FileText },
    { path: '/policy', label: 'Policy Config', icon: Settings },
    { path: '/models', label: 'ML Models', icon: Cpu },
    { path: '/simulator', label: 'Simulator', icon: PlayCircle }
  ]

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-gray-800/60 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div>
            <span className="font-extrabold text-lg text-main tracking-tight block">RevPilot</span>
            <span className="text-[10px] text-muted uppercase font-semibold tracking-wider block -mt-1">Autonomous AI Recovery</span>
          </div>
        </Link>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center space-x-1">
          {links.map(link => {
            const Icon = link.icon
            const active = location.pathname === link.path
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                    : 'text-muted hover:text-main hover:bg-surface-elevated'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Right Action Tools: Theme Switcher & Status */}
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl glass-panel text-muted hover:text-main transition-all border border-gray-800"
            title="Toggle Light/Dark Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>

          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-semibold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>System Active</span>
          </div>
        </div>
      </div>
    </header>
  )
}
