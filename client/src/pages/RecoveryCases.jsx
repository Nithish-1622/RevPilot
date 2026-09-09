import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Filter, CheckCircle2, AlertTriangle, ShieldAlert, PlayCircle, Eye } from 'lucide-react'
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
    fetch('/api/v1/dashboard/summary')
      .then(() => fetchDemoCases())
      .catch(() => fetchDemoCases())
  }

  const fetchDemoCases = () => {
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
        return <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold flex items-center space-x-1"><CheckCircle2 className="w-3 h-3" /><span>Recovered</span></span>
      case 'PENDING_APPROVAL':
        return <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold flex items-center space-x-1"><AlertTriangle className="w-3 h-3" /><span>Pending Approval</span></span>
      case 'BLOCKED':
        return <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center space-x-1"><ShieldAlert className="w-3 h-3" /><span>Policy Blocked</span></span>
      case 'RECOVERY_ELIGIBLE':
        return <span className="px-2.5 py-1 rounded-full bg-blue-50 text-[#0C6FEE] border border-blue-200 text-xs font-semibold flex items-center space-x-1"><PlayCircle className="w-3 h-3" /><span>Eligible</span></span>
      default:
        return <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200 text-xs font-semibold">{status}</span>
    }
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-[#02042B] dark:text-white">Recovery Case Registry</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Manage, inspect, and approve autonomous recovery interventions.</p>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-[#0E162B] border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search Case ID, Payment ID, Customer ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 text-xs text-[#02042B] dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#0C6FEE]"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-400" />
          {['ALL', 'PENDING_APPROVAL', 'RECOVERED', 'RECOVERY_ELIGIBLE', 'BLOCKED'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                statusFilter === st
                  ? 'bg-[#0C6FEE] text-white border-[#0C6FEE] shadow-sm'
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:text-[#02042B]'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden bg-white dark:bg-[#0E162B] border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 font-semibold border-b border-gray-200 dark:border-gray-700 uppercase tracking-wider">
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
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {filteredCases.map(c => (
                <tr
                  key={c.id}
                  onClick={() => setSearchParams({ inspect: c.id })}
                  className="hover:bg-blue-50/40 dark:hover:bg-gray-800/50 transition-all cursor-pointer group"
                >
                  <td className="p-4 font-mono font-bold text-[#0C6FEE] group-hover:underline">
                    {c.id}
                  </td>
                  <td className="p-4 space-y-0.5">
                    <span className="font-mono font-medium text-[#02042B] dark:text-white block">{c.paymentId}</span>
                    <span className="text-emerald-600 font-bold block">₹{c.amount.toLocaleString()}</span>
                  </td>
                  <td className="p-4 font-mono text-gray-500">
                    {c.failureCode}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${c.recoveryProbability * 100}%` }}
                        />
                      </div>
                      <span className="font-semibold text-[#02042B] dark:text-white">{(c.recoveryProbability * 100).toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="p-4">
                    {getStatusBadge(c.status)}
                  </td>
                  <td className="p-4 font-mono text-blue-700 dark:text-cyan-400 font-semibold">
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
                        className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500 hover:text-[#02042B] transition-all"
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
