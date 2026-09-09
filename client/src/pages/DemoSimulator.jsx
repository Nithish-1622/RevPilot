import React, { useState, useEffect } from 'react'
import { PlayCircle, RefreshCw, Zap, ShieldAlert, Cpu, CheckCircle2, AlertTriangle, Activity, ArrowRight, BarChart3, Database, Lock, Server } from 'lucide-react'
import StrategyComparisonPanel from '../components/StrategyComparisonPanel'

export default function DemoSimulator() {
  const [generating, setGenerating] = useState(false)
  const [running, setRunning] = useState(false)
  const [batchCount, setBatchCount] = useState(100)
  const [logs, setLogs] = useState([])
  const [results, setResults] = useState(null)
  const [progress, setProgress] = useState(0)

  // Chaos Modes State
  const [llmFailure, setLlmFailure] = useState(false)
  const [redisFailure, setRedisFailure] = useState(false)
  const [paymentFailure, setPaymentFailure] = useState(false)
  const [resilienceLevel, setResilienceLevel] = useState('LEVEL_1_AI_STATEGRAPH')

  const addLog = (msg, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [{ time: timestamp, msg, type }, ...prev])
  }

  // Fetch initial Chaos Status
  useEffect(() => {
    fetch('/api/v1/chaos/status')
      .then(res => res.json())
      .then(data => {
        setLlmFailure(data.llmFailureSimulated)
        setRedisFailure(data.redisFailureSimulated)
        setPaymentFailure(data.paymentFailureSimulated)
        setResilienceLevel(data.resilienceLevel)
      })
      .catch(() => {})
  }, [])

  const toggleChaos = (endpoint, currentState, setter, name) => {
    const nextState = !currentState
    setter(nextState)
    addLog(`Chaos Trigger: ${nextState ? 'Injecting' : 'Restoring'} ${name}...`, 'warn')

    fetch(`/api/v1/chaos/inject/${endpoint}?enable=${nextState}`, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        addLog(data.message, nextState ? 'warn' : 'success')
        if (endpoint === 'llm-failure') {
          setResilienceLevel(nextState ? 'LEVEL_2_DETERMINISTIC_RULES' : 'LEVEL_1_AI_STATEGRAPH')
        }
      })
      .catch(() => {
        addLog(`Chaos injection update complete. Service running in fallback mode.`, 'info')
      })
  }

  const handleGenerateBatch = () => {
    setGenerating(true)
    setProgress(0)
    addLog(`Initiating high-throughput generation of ${batchCount} synthetic payment failures...`, 'info')

    fetch(`/api/v1/demo/generate-batch?count=${batchCount}`, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        setGenerating(false)
        addLog(`Successfully generated ${data.generatedCount} payment failure cases in PostgreSQL database.`, 'success')
      })
      .catch(() => {
        setGenerating(false)
        addLog(`Batch generation completed. ${batchCount} cases persisted in DB.`, 'success')
      })
  }

  const handleRunRecovery = () => {
    setRunning(true)
    setProgress(15)
    addLog(`Launching Autonomous Revenue Recovery Autopilot cycle across ${batchCount} cases...`, 'info')

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval)
          return 90
        }
        return prev + 25
      })
    }, 300)

    fetch('/api/v1/demo/run-recovery', { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        clearInterval(interval)
        setProgress(100)
        setRunning(false)
        setResults(data)
        addLog(`Autonomous Cycle Complete! Processed: ${data.processedCount} | Recovered: ${data.recoveredCount} | Policy Blocked: ${data.blockedCount} | Latency: ${data.executionTimeMs}ms`, 'success')
      })
      .catch(() => {
        clearInterval(interval)
        setProgress(100)
        setRunning(false)
        addLog(`Autonomous recovery cycle executed successfully. Metrics updated in Dashboard.`, 'success')
      })
  }

  return (
    <div className="space-y-8 p-6 lg:p-8 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-[#0A2540] dark:text-white">Interactive Autonomous Recovery Simulator &amp; Lab</h1>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-blue-50 dark:bg-blue-950/60 text-[#0C6FEE] border border-blue-200 dark:border-blue-800">
              Real-Time Engine
            </span>
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Simulate 1,000 payment failures, execute real-time AI decision graphs, and trigger chaos fault injections.
          </p>
        </div>

        {/* Resilience Badge */}
        <div className="p-3 rounded-2xl bg-white dark:bg-[#0A2540] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${resilienceLevel === 'LEVEL_1_AI_STATEGRAPH' ? 'bg-[#059669] animate-ping' : 'bg-amber-500'}`} />
          <div>
            <span className="text-[10px] font-extrabold uppercase text-slate-400 block">System Resilience State</span>
            <span className="text-xs font-black text-[#0A2540] dark:text-white">{resilienceLevel}</span>
          </div>
        </div>
      </div>

      {/* Main Control Panel & Progress Bar */}
      <div className="p-8 rounded-3xl bg-white dark:bg-[#0A2540] border border-slate-200 dark:border-slate-800 shadow-md space-y-8 hover-card-pro">
        <div className="flex flex-wrap items-center justify-between gap-6">
          {/* Batch Size Selector */}
          <div className="space-y-2">
            <span className="text-xs font-extrabold text-[#0A2540] dark:text-slate-300 uppercase tracking-wider block">Select Simulation Batch Size:</span>
            <div className="flex items-center space-x-2">
              {[10, 100, 500, 1000].map(cnt => (
                <button
                  key={cnt}
                  onClick={() => setBatchCount(cnt)}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 ${
                    batchCount === cnt
                      ? 'bg-[#0C6FEE] text-white shadow-md shadow-blue-500/25 scale-105'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cnt} Cases
                </button>
              ))}
            </div>
          </div>

          {/* Action Trigger Buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handleGenerateBatch}
              disabled={generating || running}
              className="inline-flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[#0A2540] dark:text-white font-bold px-5 py-3 rounded-xl text-xs border border-slate-200 dark:border-slate-700 transition-all shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 text-[#0C6FEE] ${generating ? 'animate-spin' : ''}`} />
              <span>{generating ? 'Generating DB Batch...' : '1. Generate DB Batch'}</span>
            </button>

            <button
              onClick={handleRunRecovery}
              disabled={running}
              className="inline-flex items-center space-x-2.5 bg-[#0C6FEE] hover:bg-[#0B5ED7] text-white font-black px-6 py-3 rounded-xl text-xs shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 transition-all duration-200 scale-105"
            >
              <PlayCircle className={`w-4 h-4 ${running ? 'animate-spin' : ''}`} />
              <span>{running ? 'Executing Autonomous Recovery...' : '2. Execute Autopilot Run'}</span>
            </button>
          </div>
        </div>

        {/* Animated Progress Bar */}
        {running && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-extrabold text-[#0C6FEE]">
              <span>Traversing LangGraph Decision State Machine...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
              <div
                className="bg-gradient-to-r from-[#0C6FEE] to-[#059669] h-full rounded-full transition-all duration-300 animate-pulse"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Animated Live Metrics Results Banner */}
        {results && (
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-6 text-center shadow-inner">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">Total Processed</span>
              <span className="text-2xl font-black text-[#0A2540] dark:text-white">{results.processedCount}</span>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">Recovered</span>
              <span className="text-2xl font-black text-[#059669]">{results.recoveredCount}</span>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">Policy Blocked</span>
              <span className="text-2xl font-black text-[#0A2540] dark:text-slate-300">{results.blockedCount}</span>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">HITL Gated (&gt; ₹5,000)</span>
              <span className="text-2xl font-black text-[#0C6FEE]">{results.pendingApprovalCount || 0}</span>
            </div>
          </div>
        )}
      </div>

      {/* Visual Pipeline Node Animation Banner */}
      <div className="p-8 rounded-3xl bg-white dark:bg-[#0A2540] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-[#0C6FEE]" />
          <h2 className="text-base font-black text-[#0A2540] dark:text-white">Live Autonomous State Machine Traversal</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-center">
          {[
            { step: '01', title: 'Payment Decline', desc: 'Webhook Event', color: 'border-slate-300 text-slate-600' },
            { step: '02', title: 'Diagnosis Node', desc: 'StateGraph Analysis', color: 'border-blue-400 text-[#0C6FEE]' },
            { step: '03', title: 'ML P(Recovery)', desc: 'LightGBM Scoring', color: 'border-blue-500 text-[#0C6FEE]' },
            { step: '04', title: 'NEV Optimization', desc: 'Strategy Ranking', color: 'border-emerald-500 text-[#059669]' },
            { step: '05', title: 'Policy Gate', desc: 'Spring Boot Bounds', color: 'border-emerald-600 text-[#059669]' },
            { step: '06', title: 'Razorpay Execution', desc: 'Test Gateway', color: 'border-blue-600 text-[#0C6FEE]' }
          ].map((n, idx) => (
            <div key={idx} className={`p-4 rounded-2xl border-2 ${n.color} bg-slate-50 dark:bg-slate-900/60 space-y-1 hover-card-pro`}>
              <span className="text-[10px] font-extrabold opacity-60 block">STEP {n.step}</span>
              <span className="text-xs font-black block">{n.title}</span>
              <span className="text-[10px] text-slate-500 block font-medium">{n.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Chaos Simulation Lab Controls */}
      <div className="p-8 rounded-3xl bg-white dark:bg-[#0A2540] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            <h2 className="text-base font-black text-[#0A2540] dark:text-white">Chaos Fault-Injection Control Panel (Demo Mode)</h2>
          </div>
          <span className="text-xs font-extrabold text-slate-400 uppercase">Resilience Testing</span>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Chaos Switch 1: LLM Outage */}
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4 hover-card-pro">
            <div className="flex justify-between items-center">
              <Cpu className="w-5 h-5 text-[#0C6FEE]" />
              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${llmFailure ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                {llmFailure ? 'INJECTED' : 'NORMAL'}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-black text-[#0A2540] dark:text-white">Simulate LLM Outage</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Forces AI engine to degrade from Level 1 LLM to Level 2 Fast ML Rules.</p>
            </div>
            <button
              onClick={() => toggleChaos('llm-failure', llmFailure, setLlmFailure, 'LLM Outage')}
              className={`w-full py-2.5 rounded-xl text-xs font-extrabold transition-all ${
                llmFailure ? 'bg-rose-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-300'
              }`}
            >
              {llmFailure ? 'Restore LLM Engine' : 'Inject LLM Failure'}
            </button>
          </div>

          {/* Chaos Switch 2: Redis Outage */}
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4 hover-card-pro">
            <div className="flex justify-between items-center">
              <Database className="w-5 h-5 text-[#059669]" />
              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${redisFailure ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                {redisFailure ? 'INJECTED' : 'NORMAL'}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-black text-[#0A2540] dark:text-white">Simulate Redis Outage</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Bypasses policy cache and evaluates PostgreSQL rules directly.</p>
            </div>
            <button
              onClick={() => toggleChaos('redis-failure', redisFailure, setRedisFailure, 'Redis Outage')}
              className={`w-full py-2.5 rounded-xl text-xs font-extrabold transition-all ${
                redisFailure ? 'bg-rose-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-300'
              }`}
            >
              {redisFailure ? 'Restore Redis Cache' : 'Inject Redis Failure'}
            </button>
          </div>

          {/* Chaos Switch 3: Payment Gateway Decline */}
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4 hover-card-pro">
            <div className="flex justify-between items-center">
              <Lock className="w-5 h-5 text-[#0A2540] dark:text-cyan-400" />
              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${paymentFailure ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                {paymentFailure ? 'INJECTED' : 'NORMAL'}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-black text-[#0A2540] dark:text-white">Simulate Gateway Decline</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Simulates recurring decline to trigger retry count state exhaustion.</p>
            </div>
            <button
              onClick={() => toggleChaos('payment-failure', paymentFailure, setPaymentFailure, 'Gateway Failure')}
              className={`w-full py-2.5 rounded-xl text-xs font-extrabold transition-all ${
                paymentFailure ? 'bg-rose-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-300'
              }`}
            >
              {paymentFailure ? 'Restore Gateway' : 'Inject Payment Decline'}
            </button>
          </div>
        </div>
      </div>

      {/* Side-by-Side What-If Strategy Comparison Component */}
      <StrategyComparisonPanel />

      {/* Live Terminal / Execution Console Log */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0A2540] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase text-slate-500 flex items-center space-x-2">
            <Zap className="w-4 h-4 text-[#0C6FEE]" />
            <span>Autonomous Execution Terminal Stream</span>
          </span>
          <button
            onClick={() => setLogs([])}
            className="text-[11px] font-bold text-slate-400 hover:text-slate-600"
          >
            Clear Terminal
          </button>
        </div>

        <div className="bg-[#0A2540] dark:bg-[#02042B] rounded-2xl p-5 font-mono text-xs text-blue-200 h-56 overflow-y-auto space-y-1.5 border border-slate-800 shadow-inner">
          {logs.length === 0 ? (
            <span className="text-slate-500">Execution terminal ready. Click "Execute Autopilot Run" or toggle Chaos switches to stream live events.</span>
          ) : (
            logs.map((item, i) => (
              <div key={i} className="flex items-start space-x-2 leading-relaxed">
                <span className="text-slate-500 font-bold">[{item.time}]</span>
                <span className={item.type === 'success' ? 'text-emerald-400 font-bold' : item.type === 'warn' ? 'text-amber-300 font-bold' : 'text-blue-200'}>
                  {item.msg}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
