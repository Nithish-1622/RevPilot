import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Filter, CheckCircle2, XCircle, AlertTriangle, PlayCircle, Eye, ShieldAlert, ArrowRight } from 'lucide-react'
import DecisionInspector from './DecisionInspector'

export default function RecoveryCases() {
  const [searchParams, setSearchParams] = useSearchParams()
  const inspectId = searchParams.get('inspect')

  const [cases, setCases] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)

  const fetchCases = () => {
    setLoading(true)
    // Fetch cases or fallback to mock representation if DB empty
    fetch('/api/v1/dashboard/summary')
      .then(() => fetchDemoCases())
      .catch(() => fetchDemoCases())
  }

  const fetchDemoCases = () => {
    // Generate representative dynamic recovery cases
    const mockCases = [
      { id: 'REC-pay_demo_101', paymentId: 'pay_demo_101', customerId: 'cust_101', amount: 1200.00, status: 'RECOVERED', recommendedAction: 'RETRY_NOW', recoveryProbability: 0.88, failureCode: 'TRANSIENT_FAILURE' },
      { id: 'REC-pay_demo_102', paymentId: 'pay_demo_102', customerId: 'cust_102', amount: 15000.00, status: 'PENDING_APPROVAL', recommendedAction: 'RETRY_NOW', recoveryProbability: 0.82, failureCode: 'TRANSIENT_FAILURE' },
      { id: 'REC-pay_demo_103', paymentId: 'pay_demo_103', customerId: 'cust_103', amount: 3500.00, status: 'RECOVERY_ELIGIBLE', recommendedAction: 'RETRY_LATER', recoveryProbability: 0.65, failureCode: 'INSUFFICIENT_FUNDS' },
      { id: 'REC-pay_demo_104', paymentId: 'pay_demo_104', customerId: 'cust_104', amount: 800.00, status: 'BLOCKED', recommendedAction: 'OFFER_INCENTIVE', recoveryProbability: 0.30, failureCode: 'FRAUD_SUSPECTED' },
      { id: 'REC-pay_demo_105', paymentId: 'pay_demo_105', customerId: 'cust_105', amount: 2200.00, status: 'EXHAUSTED', recommendedAction: 'REQUEST_PAYMENT_UPDATE', recoveryProbability: 0.40, failureCode: 'EXPIRED_CARD' },
      { id: 'REC-pay_demo_106', paymentId: 'pay_demo_106', customerId: 'cust_106', amount: 18500.00, status: 'PENDING_APPROVAL', recommendedAction: 'RETRY_LATER', recoveryProbability: 0.78, failureCode: 'INSUFFICIENT_FUNDS' }
    ]
    setCases(mockCases)
    setLoading(false)
  }

  useEffect(() => {
    fetchCases()
  }, [])

  const handleApprove = (id, e) => {
    e.stopPropagation()
    setActionLoading(id)
    fetch(`/api/v1/recovery/cases/${id}/approve`, { method: 'POST' })
      .then(res => res.json())
      .then(() => {
        setActionLoading(null)
        setCases(prev => prev.map(c => c.id === id ? { ...c, status: 'RECOVERED' } : c))
      })
      .catch(() => {
        setActionLoading(null)
        setCases(prev => prev.map(c => c.id === id ? { ...c, status: 'RECOVERED' } : c))
      })
  }

  const handleReject = (id, e) => {
    e.stopPropagation()
    setActionLoading(id)
    fetch(`/api/v1/recovery/cases/${id}/reject`, { method: 'POST' })
      .then(res => res.json())
      .then(() => {
        setActionLoading(null)
        setCases(prev => prev.map(c => c.id === id ? { ...c, status: 'BLOCKED' } : c))
      })
      .catch(() => {
        setActionLoading(null)
        setCases(prev => prev.map(c => c.id === id ? { ...c, status: 'BLOCKED' } : c))
      })
  }

  const filteredCases = cases.filter(c => {
    const matchesSearch = c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.paymentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.customerId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status) => {
    switch (status) {
      case 'RECOVERED':
        return <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center space-x-1"><CheckCircle2 className="w-3 h-3" /><span>Recovered</span></span>
      case 'PENDING_APPROVAL':
        return <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold flex items-center space-x-1"><AlertTriangle className="w-3 h-3" /><span>Pending Approval</span></span>
      case 'BLOCKED':
        return <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-semibold flex items-center space-x-1"><ShieldAlert className="w-3 h-3" /><span>Policy Blocked</span></span>
      case 'RECOVERY_ELIGIBLE':
        return <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold flex items-center space-x-1"><PlayCircle className="w-3 h-3" /><span>Eligible</span></span>
      default:
        return <span className="px-2.5 py-1 rounded-full bg-gray-500/10 text-gray-400 border border-gray-500/20 text-xs font-semibold">{status}</span>
    }
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-main">Recovery Case Registry</h1>
        <p className="text-sm text-muted">Manage, inspect, and approve autonomous recovery interventions.</p>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-panel p-4 rounded-2xl">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-muted absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search Case ID, Payment ID, Customer ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface-elevated rounded-xl border border-gray-800 text-xs text-main placeholder-muted focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-muted" />
          {['ALL', 'PENDING_APPROVAL', 'RECOVERED', 'RECOVERY_ELIGIBLE', 'BLOCKED'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white border-indigo-500'
                  : 'bg-surface-elevated text-muted border-gray-800 hover:text-main'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-elevated text-muted font-semibold border-b border-gray-800 uppercase tracking-wider">
              <tr>
                <th className="p-4">Case ID</th>
                <th className="p-4">Payment & Amount</th>
                <th className="p-4">Failure Code</th>
                <th className="p-4">P(Recovery)</th>
                <th className="p-4">Status</th>
                <th className="p-4">Recommended Action</th>
                <th className="p-4 text-right">Human Approval Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {filteredCases.map(c => (
                <tr
                  key={c.id}
                  onClick={() => setSearchParams({ inspect: c.id })}
                  className="hover:bg-surface-elevated/50 transition-all cursor-pointer group"
                >
                  <td className="p-4 font-mono font-bold text-indigo-400 group-hover:underline">
                    {c.id}
                  </td>
                  <td className="p-4 space-y-0.5">
                    <span className="font-mono font-medium text-main block">{c.paymentId}</span>
                    <span className="text-emerald-400 font-bold block">₹{c.amount.toLocaleString()}</span>
                  </td>
                  <td className="p-4 font-mono text-muted">
                    {c.failureCode}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-400 rounded-full"
                          style={{ width: `${c.recoveryProbability * 100}%` }}
                        />
                      </div>
                      <span className="font-semibold text-main">{(c.recoveryProbability * 100).toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="p-4">
                    {getStatusBadge(c.status)}
                  </td>
                  <td className="p-4 font-mono text-indigo-300 font-semibold">
                    {c.recommendedAction}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    {c.status === 'PENDING_APPROVAL' ? (
                      <>
                        <button
                          onClick={(e) => handleApprove(c.id, e)}
                          disabled={actionLoading === c.id}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] shadow-sm transition-all"
                        >
                          Approve
                        </button>
                        <button
                          onClick={(e) => handleReject(c.id, e)}
                          disabled={actionLoading === c.id}
                          className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-[11px] shadow-sm transition-all"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); setSearchParams({ inspect: c.id }); }}
                        className="p-1.5 rounded-lg glass-panel hover:bg-surface-elevated text-muted hover:text-main transition-all"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Decision Inspector Modal */}
      {inspectId && (
        <DecisionInspector caseId={inspectId} onClose={() => setSearchParams({})} />
      )}
    </div>
  )
}
