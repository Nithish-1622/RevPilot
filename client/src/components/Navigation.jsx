import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, FileText, Settings, Cpu, PlayCircle, Sun, Moon, Shield, ArrowRight } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function Navigation() {
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()

  const links = [
    { path: '/', label: 'Home', icon: Shield },
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/cases', label: 'Cases & HITL', icon: FileText },
    { path: '/policy', label: 'Policy Config', icon: Settings },
    { path: '/models', label: 'ML Analytics', icon: Cpu },
    { path: '/simulator', label: 'Simulator', icon: PlayCircle }
  ]

  return (
    <header className="sticky top-0 z-50 transition-all backdrop-blur-xl bg-white/95 dark:bg-[#0A2540]/95 border-b border-slate-200/80 dark:border-slate-800/80 text-[#0A2540] dark:text-white shadow-sm">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-3.5 flex items-center justify-between gap-8">
        {/* Brand Logo & Tagline */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-9 h-9 rounded-xl bg-[#0C6FEE] flex items-center justify-center font-black text-white italic text-lg shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform duration-200">
            R
          </div>
          <div className="flex flex-col justify-center">
            <div className="flex items-baseline space-x-1.5">
              <span className="font-black text-xl tracking-tight text-[#0A2540] dark:text-white">
                RevPilot
              </span>
              <span className="text-[9px] font-extrabold tracking-widest text-[#0C6FEE] dark:text-cyan-400 uppercase bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                by Razorpay
              </span>
            </div>
            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 leading-none mt-0.5">
              Autonomous Revenue Recovery
            </span>
          </div>
        </Link>

        {/* Centered Navigation Links with Generous Spacing */}
        <nav className="hidden md:flex items-center space-x-1.5 bg-slate-100/80 dark:bg-slate-900/60 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60">
          {links.map(link => {
            const Icon = link.icon
            const active = location.pathname === link.path
            
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                  active
                    ? 'bg-white dark:bg-[#0C6FEE] text-[#0C6FEE] dark:text-white shadow-sm font-extrabold border border-slate-200 dark:border-blue-600'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Right Controls & CTA Button */}
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-[#0C6FEE] shadow-sm transition-all duration-200"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#0C6FEE]" />}
          </button>

          <Link
            to="/dashboard"
            className="bg-[#0C6FEE] hover:bg-[#0B5ED7] text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200 flex items-center space-x-1.5 group"
          >
            <span>Control Center</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </header>
  )
}
