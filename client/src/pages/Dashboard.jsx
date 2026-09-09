import React, { useEffect, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { DollarSign, ShieldAlert, TrendingUp, RefreshCw, Activity, ArrowUpRight, ShieldCheck } from 'lucide-react'

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = () => {
    setLoading(true)
    Promise.all([
      fetch('/api/v1/dashboard/summary').then(res => res.json()),
      fetch('/api/v1/dashboard/activity').then(res => res.json())
    ])
      .then(([summaryData, activityData]) => {
        setSummary(summaryData)
        setActivity(activityData)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch dashboard metrics:', err)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Strict 4-Color Palette Chart Data
  const trendData = [
    { day: 'Mon', attempted: 180000, recovered: 66000 },
    { day: 'Tue', attempted: 240000, recovered: 92000 },
    { day: 'Wed', attempted: 210000, recovered: 84000 },
    { day: 'Thu', attempted: 310000, recovered: 118000 },
    { day: 'Fri', attempted: 280000, recovered: 104000 },
    { day: 'Sat', attempted: 190000, recovered: 72000 },
    { day: 'Sun', attempted: 220000, recovered: 88000 }
  ]

  const failureDistribution = [
    { name: 'Transient Failure', value: 45, color: '#0C6FEE' },
    { name: 'Insufficient Funds', value: 30, color: '#059669' },
    { name: 'Expired Card', value: 18, color: '#0A2540' },
    { name: 'Fraud Suspected', value: 7, color: '#64748B' }
  ]

  return (
    <div className="space-y-8 p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-[#0A2540] dark:text-white">Autonomous Revenue Recovery Dashboard</h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Real-time financial performance, policy enforcement analytics, and audit streams.</p>
        </div>

        <button
          onClick={fetchData}
          disabled={loading}
          className="inline-flex items-center space-x-2 bg-white dark:bg-[#0A2540] hover:bg-slate-50 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all text-[#0A2540] dark:text-white"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#0C6FEE] ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* Metrics Cards Grid - Strict 4-Color Palette */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Revenue at Risk - Primary Navy */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0A2540] border border-slate-200 dark:border-slate-800 border-l-4 border-l-[#0A2540] space-y-2 shadow-sm hover-card-pro">
          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0A2540] dark:text-slate-300">Revenue at Risk</span>
            <DollarSign className="w-4 h-4 text-[#0A2540] dark:text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-[#0A2540] dark:text-white">
            ₹{summary ? Number(summary.revenueAtRisk).toLocaleString() : '1,28,00,000'}
          </div>
          <span className="text-[11px] font-medium text-slate-500 block">Failed transactions under evaluation</span>
        </div>

        {/* Recovered Revenue - Tertiary Emerald Green */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0A2540] border border-slate-200 dark:border-slate-800 border-l-4 border-l-[#059669] space-y-2 shadow-sm hover-card-pro">
          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-[#059669]">Recovered Revenue</span>
            <TrendingUp className="w-4 h-4 text-[#059669]" />
          </div>
          <div className="text-2xl font-black text-[#059669]">
            ₹{summary ? Number(summary.recoveredRevenue).toLocaleString() : '47,30,000'}
          </div>
          <span className="text-[11px] text-[#059669] font-bold inline-flex items-center space-x-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+{summary ? summary.recoveryRate : '37.0'}% Recovery Rate</span>
          </span>
        </div>

        {/* Secondary Razorpay Blue - Active Cases */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0A2540] border border-slate-200 dark:border-slate-800 border-l-4 border-l-[#0C6FEE] space-y-2 shadow-sm hover-card-pro">
          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0C6FEE]">Active AI Interventions</span>
            <ShieldCheck className="w-4 h-4 text-[#0C6FEE]" />
          </div>
          <div className="text-2xl font-black text-[#0C6FEE]">
            {summary ? summary.activeCases : 421}
          </div>
          <span className="text-[11px] font-medium text-slate-500 block">Autonomous decision workflows</span>
        </div>

        {/* Policy Shield & HITL Gating - Dark Navy */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0A2540] border border-slate-200 dark:border-slate-800 border-l-4 border-l-[#0A2540] space-y-2 shadow-sm hover-card-pro">
          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0A2540] dark:text-slate-300">Policy Protected</span>
            <ShieldAlert className="w-4 h-4 text-[#0A2540] dark:text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-[#0A2540] dark:text-white">
            {summary ? summary.policyBlocks : 27}
          </div>
          <span className="text-[11px] font-medium text-slate-500 block">Blocked unviable retries &amp; gated HITL</span>
        </div>
      </div>

      {/* Visualizations Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Area Chart: 7-Day Revenue Trend */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-[#0A2540] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-black text-[#0A2540] dark:text-white">7-Day Revenue Recovery Trend</h3>
            <span className="text-xs font-semibold text-slate-500">Attempted (Blue) vs Recovered (Green)</span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorAttempted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0C6FEE" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0C6FEE" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRecovered" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="day" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '12px', color: '#0A2540', fontWeight: 'bold' }} />
                <Area type="monotone" dataKey="attempted" stroke="#0C6FEE" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAttempted)" name="Attempted (₹)" />
                <Area type="monotone" dataKey="recovered" stroke="#059669" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRecovered)" name="Recovered (₹)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart: Failure Code Breakdown */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0A2540] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-base font-black text-[#0A2540] dark:text-white">Failure Distribution</h3>
          <div className="h-56 w-full flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={failureDistribution} innerRadius={55} outerRadius={80} paddingAngle={5} dataKey="value">
                  {failureDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '12px', color: '#0A2540', fontWeight: 'bold' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 text-xs font-semibold">
            {failureDistribution.map(item => (
              <div key={item.name} className="flex justify-between items-center">
                <span className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                </span>
                <span className="font-bold text-[#0A2540] dark:text-white">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Audit Activity Stream */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#0A2540] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-[#0C6FEE]" />
            <h3 className="text-base font-black text-[#0A2540] dark:text-white">Recent Audit Event Stream</h3>
          </div>
          <span className="text-xs font-semibold text-slate-500">Immutable Ledger</span>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {activity.length === 0 ? (
            <div className="text-xs text-slate-500 text-center py-6">Loading audit events stream...</div>
          ) : (
            activity.slice(0, 8).map(event => (
              <div key={event.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <span className={`w-2.5 h-2.5 rounded-full ${event.decision === 'ALLOW' ? 'bg-[#059669]' : 'bg-[#0A2540]'}`} />
                  <span className="font-mono font-bold text-[#0A2540] dark:text-white">{event.recoveryCaseId || event.paymentId}</span>
                  <span className="text-slate-500 font-medium">{event.eventType}</span>
                  <span className="text-[#0C6FEE] font-extrabold">[{event.actionProposed || 'N/A'}]</span>
                </div>
                <span className="text-slate-500 text-[11px] font-mono">{new Date(event.createdAt).toLocaleTimeString()}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
