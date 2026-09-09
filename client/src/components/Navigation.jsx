import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, FileText, Settings, Cpu, PlayCircle, Sun, Moon, Shield } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function Navigation() {
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()
  const isLanding = location.pathname === '/'

  const links = [
    { path: '/', label: 'Home', icon: Shield },
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/cases', label: 'Cases & HITL', icon: FileText },
    { path: '/policy', label: 'Policy Config', icon: Settings },
    { path: '/models', label: 'ML Analytics', icon: Cpu },
    { path: '/simulator', label: 'Simulator', icon: PlayCircle }
  ]

  return (
    <header className={`sticky top-0 z-50 transition-colors backdrop-blur-md ${
      isLanding
        ? 'bg-[#02042B] border-b border-blue-900/40 text-white'
        : 'bg-white/95 dark:bg-[#070D1E]/90 border-b border-gray-200 dark:border-blue-900/40 text-[#02042B] dark:text-white shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
        {/* Razorpay Brand Logo */}
        <Link to="/" className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#0C6FEE] flex items-center justify-center font-black text-white italic text-base shadow-md shadow-blue-500/20">
            R
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="font-extrabold text-lg tracking-tight text-white dark:text-white">
              RevPilot
            </span>
            <span className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase">
              by Razorpay
            </span>
          </div>
        </Link>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center space-x-1">
          {links.map(link => {
            const Icon = link.icon
            const active = location.pathname === link.path
            
            if (isLanding) {
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-blue-600/20 text-cyan-400 font-bold border border-blue-500/30'
                      : 'text-gray-300 hover:text-white hover:bg-blue-900/30'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              )
            }

            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-[#0C6FEE] dark:text-cyan-400 font-bold border border-blue-200 dark:border-blue-800'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl border transition-all ${
              isLanding
                ? 'border-blue-900/50 bg-blue-950/50 text-cyan-400 hover:text-white'
                : 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-[#0C6FEE]'
            }`}
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#0C6FEE]" />}
          </button>

          <Link
            to="/dashboard"
            className="bg-[#0C6FEE] hover:bg-[#0B5ED7] text-white font-bold text-xs px-5 py-2.5 rounded-lg shadow-md shadow-blue-500/20 transition-all flex items-center space-x-1"
          >
            <span>Launch Dashboard →</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
