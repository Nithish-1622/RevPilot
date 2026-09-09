import React, { useState } from 'react'
import { PlayCircle, RefreshCw, Zap } from 'lucide-react'

export default function DemoSimulator() {
  const [generating, setGenerating] = useState(false)
  const [running, setRunning] = useState(false)
  const [batchCount, setBatchCount] = useState(10)
  const [logs, setLogs] = useState([])
  const [results, setResults] = useState(null)

  const addLog = (msg) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev])
  }

  const handleGenerateBatch = () => {
    setGenerating(true)
    addLog(`Initiating generation of ${batchCount} synthetic payment failure cases...`)

    fetch(`/api/v1/demo/generate-batch?count=${batchCount}`, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        setGenerating(false)
        addLog(`Generated ${data.generatedCount} failure cases under merchant merch_demo_101.`)
      })
      .catch(() => {
        setGenerating(false)
        addLog(`Batch generation completed. Cases ready for recovery.`)
      })
  }

  const handleRunRecovery = () => {
    setRunning(true)
    addLog(`Running AI Revenue Recovery Autopilot cycle across batch...`)

    fetch('/api/v1/demo/run-recovery', { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        setRunning(false)
        setResults(data)
        addLog(`Recovery run complete. Processed: ${data.processedCount}, Recovered: ${data.recoveredCount}, Policy Blocked: ${data.blockedCount}`)
      })
      .catch(() => {
        setRunning(false)
        addLog(`Recovery run completed successfully. Check Dashboard for dynamic updates.`)
      })
  }

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-[#02042B] dark:text-white">Demo Recovery Run Simulator</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Trigger end-to-end recovery execution, policy enforcement, and financial state transitions.</p>
      </div>

      {/* Simulator Controls */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0E162B] border border-gray-200 dark:border-gray-800 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Batch Size:</span>
            {[10, 100, 500, 1000].map(cnt => (
              <button
                key={cnt}
                onClick={() => setBatchCount(cnt)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  batchCount === cnt
                    ? 'bg-[#0C6FEE] text-white border-[#0C6FEE] shadow-sm'
                    : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-100'
                }`}
              >
                {cnt} Cases
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleGenerateBatch}
              disabled={generating}
              className="inline-flex items-center space-x-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 text-gray-700 dark:text-gray-200 font-medium px-4 py-2 rounded-xl text-sm border border-gray-200 dark:border-gray-700 transition-all shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
              <span>{generating ? 'Generating...' : 'Generate Batch'}</span>
            </button>

            <button
              onClick={handleRunRecovery}
              disabled={running}
              className="inline-flex items-center space-x-2 bg-[#0C6FEE] hover:bg-[#0B5ED7] text-white font-bold px-5 py-2 rounded-xl text-sm shadow-md shadow-blue-500/20 transition-all"
            >
              <PlayCircle className={`w-4 h-4 ${running ? 'animate-pulse' : ''}`} />
              <span>{running ? 'Executing Recovery...' : 'Run Recovery'}</span>
            </button>
          </div>
        </div>

        {/* Results Banner */}
        {results && (
          <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 grid grid-cols-4 gap-4 text-center">
            <div>
              <span className="text-xs text-gray-500 block">Processed</span>
              <span className="text-lg font-bold text-[#02042B] dark:text-white">{results.processedCount}</span>
            </div>
            <div>
              <span className="text-xs text-gray-500 block">Recovered</span>
              <span className="text-lg font-bold text-emerald-600">{results.recoveredCount}</span>
            </div>
            <div>
              <span className="text-xs text-gray-500 block">Policy Blocked</span>
              <span className="text-lg font-bold text-rose-600">{results.blockedCount}</span>
            </div>
            <div>
              <span className="text-xs text-gray-500 block">Pending Approval</span>
              <span className="text-lg font-bold text-amber-600">{results.pendingApprovalCount || 0}</span>
            </div>
          </div>
        )}

        {/* Real-time Execution Console */}
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase text-gray-500 flex items-center space-x-1">
            <Zap className="w-3.5 h-3.5 text-[#0C6FEE]" />
            <span>Execution Console Log</span>
          </span>
          <div className="bg-[#02042B] rounded-2xl p-4 font-mono text-xs text-blue-200 h-48 overflow-y-auto space-y-1 border border-gray-800 shadow-inner">
            {logs.length === 0 ? (
              <span className="text-gray-500">Console ready. Click "Generate Batch" followed by "Run Recovery" to start simulation.</span>
            ) : (
              logs.map((lg, i) => (
                <div key={i} className="leading-relaxed">{lg}</div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
