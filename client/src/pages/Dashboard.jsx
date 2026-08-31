import React, { useEffect, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts'
import { DollarSign, ShieldAlert, CheckCircle2, AlertTriangle, TrendingUp, RefreshCw, Activity, ArrowUpRight } from 'lucide-react'

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

  // Sample Trend Visualization Data
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
    { name: 'Transient Failure', value: 45, color: '#6366F1' },
    { name: 'Insufficient Funds', value: 30, color: '#10B981' },
    { name: 'Expired Card', value: 18, color: '#F59E0B' },
    { name: 'Fraud Suspected', value: 7, color: '#EF4444' }
  ]

  const actionPerformance = [
    { action: 'RETRY_NOW', expectedValue: 8500, cost: 50 },
    { action: 'RETRY_LATER', expectedValue: 6200, cost: 20 },
    { action: 'CARD_UPDATE', expectedValue: 4800, cost: 30 },
    { action: 'INCENTIVE', expectedValue: 3900, cost: 400 },
    { action: 'ESCALATE', expectedValue: 2100, cost: 500 }
  ]

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-main">Autonomous Revenue Recovery Dashboard</h1>
          <p className="text-sm text-muted">Real-time financial performance, policy enforcement analytics, and audit streams.</p>
        </div>

        <button
          onClick={fetchData}
          disabled={loading}
          className="inline-flex items-center space-x-2 glass-panel hover:bg-surface-elevated text-xs font-semibold px-4 py-2 rounded-xl border border-gray-700 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* Metrics Cards Grid (Primary, Secondary, Tertiary Format) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Primary Color Card: Revenue at Risk */}
        <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-indigo-500 space-y-2">
          <div className="flex justify-between items-center text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Revenue at Risk</span>
            <DollarSign className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-extrabold text-main">
            ₹{summary ? Number(summary.revenueAtRisk).toLocaleString() : '1,28,00,000'}
          </div>
          <span className="text-[11px] text-muted block">Failed transactions under evaluation</span>
        </div>

        {/* Secondary Color Card: Recovered Revenue */}
        <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-emerald-500 space-y-2">
          <div className="flex justify-between items-center text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Recovered Revenue</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400">
            ₹{summary ? Number(summary.recoveredRevenue).toLocaleString() : '47,30,000'}
          </div>
          <span className="text-[11px] text-emerald-400/80 font-medium inline-flex items-center space-x-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>+{summary ? summary.recoveryRate : '37.0'}% Recovery Rate</span>
          </span>
        </div>

        {/* Tertiary Color Card: Policy Blocks */}
        <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-rose-500 space-y-2">
          <div className="flex justify-between items-center text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Policy Blocks</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-extrabold text-rose-400">
            {summary ? summary.policyBlocks : 27}
          </div>
          <span className="text-[11px] text-muted block">Prevented unviable interventions</span>
        </div>

        {/* Tertiary Color Card: Pending Approvals */}
        <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-amber-500 space-y-2">
          <div className="flex justify-between items-center text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Approval</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400">
            {summary ? (summary.humanEscalations || 19) : 19}
          </div>
          <span className="text-[11px] text-muted block">Transactions &gt; ₹5,000 threshold</span>
        </div>
      </div>

      {/* Visualizations Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Area Chart: 7-Day Revenue Trend */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-main">7-Day Revenue Recovery Trend</h3>
            <span className="text-xs text-muted">Attempted vs Recovered</span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorAttempted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRecovered" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="attempted" stroke="#6366F1" fillOpacity={1} fill="url(#colorAttempted)" name="Attempted (₹)" />
                <Area type="monotone" dataKey="recovered" stroke="#10B981" fillOpacity={1} fill="url(#colorRecovered)" name="Recovered (₹)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart: Failure Code Breakdown */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h3 className="text-base font-bold text-main">Failure Code Distribution</h3>
          <div className="h-56 w-full flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={failureDistribution} innerRadius={55} outerRadius={80} paddingAngle={5} dataKey="value">
                  {failureDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1 text-xs">
            {failureDistribution.map(item => (
              <div key={item.name} className="flex justify-between items-center">
                <span className="flex items-center space-x-2 text-muted">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                </span>
                <span className="font-semibold text-main">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Audit Activity Stream */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-indigo-400" />
            <h3 className="text-base font-bold text-main">Recent Audit Event Stream</h3>
          </div>
          <span className="text-xs text-muted">Immutable Ledger</span>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {activity.length === 0 ? (
            <div className="text-xs text-muted text-center py-6">Loading audit events stream...</div>
          ) : (
            activity.slice(0, 8).map(event => (
              <div key={event.id} className="p-3 rounded-xl bg-surface-elevated border border-gray-800 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <span className={`w-2 h-2 rounded-full ${event.decision === 'ALLOW' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                  <span className="font-mono font-semibold text-main">{event.recoveryCaseId || event.paymentId}</span>
                  <span className="text-muted">{event.eventType}</span>
                  <span className="text-indigo-400 font-medium">[{event.actionProposed || 'N/A'}]</span>
                </div>
                <span className="text-muted text-[11px] font-mono">{new Date(event.createdAt).toLocaleTimeString()}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
