import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck, Cpu, Zap, ArrowRight, Activity, Lock, RefreshCw, BarChart3, CheckCircle2, Sliders, PlayCircle } from 'lucide-react'

export default function LandingPage() {
  const [monthlyFailedVol, setMonthlyFailedVol] = useState(50000)
  
  // Calculate estimated annual recovery value
  const estimatedRecovery = Math.round(monthlyFailedVol * 0.37 * 12)

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 pb-16 px-6 max-w-7xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full glass-panel border border-indigo-500/30 text-xs font-semibold text-indigo-400 animate-pulse-subtle">
          <Zap className="w-3.5 h-3.5 text-indigo-400" />
          <span>RevPilot 2.0 • Autonomous AI Revenue Recovery Platform</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-main max-w-4xl mx-auto leading-tight">
          Recover Failed Payments with <span className="bg-gradient-to-r from-indigo-500 via-emerald-400 to-amber-400 bg-clip-text text-transparent">Autonomous AI Decisioning</span>
        </h1>

        <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto font-normal">
          Diagnose payment failures, predict recovery probabilities with LightGBM & LangGraph StateGraph, enforce merchant policy guardrails, and execute Razorpay transactions.
        </p>

        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <Link
            to="/dashboard"
            className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3.5 rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
          >
            <span>Launch Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/simulator"
            className="inline-flex items-center space-x-2 glass-panel hover:bg-surface-elevated text-main font-semibold px-6 py-3.5 rounded-xl border border-gray-700 transition-all"
          >
            <PlayCircle className="w-4 h-4 text-emerald-400" />
            <span>Try 1000-Case Simulator</span>
          </Link>
        </div>

        {/* Live Metrics Ticker Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto pt-10">
          <div className="glass-panel p-5 rounded-2xl text-center space-y-1">
            <span className="text-xs text-muted block uppercase tracking-wider font-semibold">Revenue at Risk</span>
            <span className="text-2xl font-bold text-main">₹1,28,00,000</span>
          </div>
          <div className="glass-panel p-5 rounded-2xl text-center space-y-1">
            <span className="text-xs text-muted block uppercase tracking-wider font-semibold">Recovered Revenue</span>
            <span className="text-2xl font-bold text-emerald-400">₹47,30,000</span>
          </div>
          <div className="glass-panel p-5 rounded-2xl text-center space-y-1">
            <span className="text-xs text-muted block uppercase tracking-wider font-semibold">Avg Recovery Rate</span>
            <span className="text-2xl font-bold text-indigo-400">37.0%</span>
          </div>
          <div className="glass-panel p-5 rounded-2xl text-center space-y-1">
            <span className="text-xs text-muted block uppercase tracking-wider font-semibold">Policy Protection</span>
            <span className="text-2xl font-bold text-amber-400">100% Bounded</span>
          </div>
        </div>
      </section>

      {/* Dual-Plane Architecture Overview */}
      <section className="max-w-7xl mx-auto px-6 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase text-indigo-400 tracking-wider">Strict System Invariant</span>
          <h2 className="text-3xl font-bold text-main">Dual-Plane Security & Control Architecture</h2>
          <p className="text-sm text-muted max-w-xl mx-auto">The Intelligence Engine recommends recovery strategies, while the Control Plane strictly validates policies and executes transactions.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="glass-panel p-8 rounded-3xl space-y-4 border-l-4 border-l-indigo-500">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-main">FastAPI Intelligence Engine</h3>
                <span className="text-xs text-muted">LangGraph StateGraph + LightGBM Model</span>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-muted">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>7-Node LangGraph compiled workflow</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>LightGBM P(Recovery) scoring engine</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Deterministic candidate action scoring</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Redis ML & LLM response caching</span>
              </li>
            </ul>
          </div>

          <div className="glass-panel p-8 rounded-3xl space-y-4 border-l-4 border-l-emerald-500">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-main">Spring Boot Financial Control Plane</h3>
                <span className="text-xs text-muted">Authoritative Gateway & Policy Engine</span>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-muted">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>State Machine transition validation</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Merchant policy discount & retry limits</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Human-in-the-loop approval (&gt; ₹5,000 threshold)</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Transactional Outbox & Kafka event publisher</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Interactive ROI Calculator */}
      <section className="max-w-4xl mx-auto px-6">
        <div className="glass-panel p-8 rounded-3xl space-y-6 text-center border border-indigo-500/20">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">
              <Sliders className="w-3.5 h-3.5" />
              <span>Interactive ROI Calculator</span>
            </div>
            <h3 className="text-2xl font-bold text-main">Estimate Your Annual Recovered Revenue</h3>
          </div>

          <div className="space-y-4 max-w-lg mx-auto">
            <div className="flex justify-between text-sm font-semibold">
              <span className="text-muted">Monthly Failed Payments (₹):</span>
              <span className="text-indigo-400 text-lg">₹{monthlyFailedVol.toLocaleString()}</span>
            </div>

            <input
              type="range"
              min="10000"
              max="1000000"
              step="10000"
              value={monthlyFailedVol}
              onChange={(e) => setMonthlyFailedVol(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          <div className="p-6 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 max-w-lg mx-auto space-y-1">
            <span className="text-xs text-muted block font-semibold uppercase">Projected Annual Revenue Recovered</span>
            <span className="text-3xl font-extrabold text-emerald-400">₹{estimatedRecovery.toLocaleString()}</span>
            <span className="text-xs text-muted block pt-1">Based on 37.0% average baseline recovery rate</span>
          </div>
        </div>
      </section>
    </div>
  )
}
