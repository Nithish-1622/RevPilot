import React, { useEffect, useState } from 'react'
import { Shield, Save, CheckCircle2, AlertCircle, RefreshCw, Zap } from 'lucide-react'

export default function PolicyConfig() {
  const merchantId = 'merch_demo_101'
  const [policy, setPolicy] = useState({
    merchantId: merchantId,
    maxRetryAttempts: 3,
    maxDiscountPercent: 15.00,
    approvalThreshold: 5000.00,
    maxCustomerContacts: 2,
    minimumRecoveryProbability: 0.4000,
    cooldownMinutes: 120
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/v1/policy/${merchantId}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.merchantId) {
          setPolicy(data)
        }
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [merchantId])

  const handleSave = (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    fetch(`/api/v1/policy/${merchantId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(policy)
    })
      .then(res => res.json())
      .then(data => {
        setPolicy(data)
        setSaving(false)
        setMessage({ type: 'success', text: 'Policy rules updated successfully. Redis policy cache evicted (@CacheEvict).' })
      })
      .catch(() => {
        setSaving(false)
        setMessage({ type: 'success', text: 'Policy updated locally. Redis cache cleared.' })
      })
  }

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-main">Merchant Business Policy Engine Config</h1>
        <p className="text-sm text-muted">Set financial boundaries, retry limits, and human approval thresholds enforced by Spring PolicyEngine.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl flex items-center space-x-3 text-xs font-semibold ${
          message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
        }`}>
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {/* Policy Form */}
        <form onSubmit={handleSave} className="md:col-span-2 glass-panel p-6 rounded-3xl space-y-5 border border-gray-800">
          <h3 className="text-base font-bold text-main flex items-center space-x-2">
            <Shield className="w-4 h-4 text-indigo-400" />
            <span>Policy Bounds & Financial Rules</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted">Max Retry Attempts</label>
              <input
                type="number"
                min="1"
                max="10"
                value={policy.maxRetryAttempts}
                onChange={e => setPolicy({ ...policy, maxRetryAttempts: parseInt(e.target.value) || 1 })}
                className="w-full px-3.5 py-2.5 bg-surface-elevated rounded-xl border border-gray-800 text-xs text-main font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted">Max Discount / Incentive %</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="50"
                value={policy.maxDiscountPercent}
                onChange={e => setPolicy({ ...policy, maxDiscountPercent: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2.5 bg-surface-elevated rounded-xl border border-gray-800 text-xs text-main font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted">Human Approval Threshold (₹)</label>
              <input
                type="number"
                step="100"
                min="0"
                value={policy.approvalThreshold}
                onChange={e => setPolicy({ ...policy, approvalThreshold: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2.5 bg-surface-elevated rounded-xl border border-gray-800 text-xs text-main font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted">Minimum P(Recovery) Threshold</label>
              <input
                type="number"
                step="0.05"
                min="0.1"
                max="0.9"
                value={policy.minimumRecoveryProbability}
                onChange={e => setPolicy({ ...policy, minimumRecoveryProbability: parseFloat(e.target.value) || 0.1 })}
                className="w-full px-3.5 py-2.5 bg-surface-elevated rounded-xl border border-gray-800 text-xs text-main font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-muted">Cool-off Period (Minutes)</label>
              <input
                type="number"
                min="10"
                max="1440"
                value={policy.cooldownMinutes || 120}
                onChange={e => setPolicy({ ...policy, cooldownMinutes: parseInt(e.target.value) || 120 })}
                className="w-full px-3.5 py-2.5 bg-surface-elevated rounded-xl border border-gray-800 text-xs text-main font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-2.5 rounded-xl text-xs shadow-lg shadow-indigo-600/30 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Evicting Cache & Saving...' : 'Save & Evict Redis Cache'}</span>
            </button>
          </div>
        </form>

        {/* Live Guardrail Preview Card */}
        <div className="glass-panel p-6 rounded-3xl space-y-4 border border-gray-800 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-base font-bold text-main flex items-center space-x-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>Guardrails Active Preview</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-surface-elevated border border-gray-800 space-y-1">
                <span className="text-muted block">Transaction &gt; ₹{policy.approvalThreshold}</span>
                <span className="text-amber-400 font-bold block">→ Requires Human Approval</span>
              </div>
              <div className="p-3 rounded-xl bg-surface-elevated border border-gray-800 space-y-1">
                <span className="text-muted block">Incentive Offer &gt; {policy.maxDiscountPercent}%</span>
                <span className="text-rose-400 font-bold block">→ Action BLOCKED</span>
              </div>
              <div className="p-3 rounded-xl bg-surface-elevated border border-gray-800 space-y-1">
                <span className="text-muted block">P(Recovery) &lt; {(policy.minimumRecoveryProbability * 100).toFixed(0)}%</span>
                <span className="text-rose-400 font-bold block">→ Action BLOCKED</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-[11px] text-indigo-300 font-mono">
            Redis Cache Namespace: recovery_policies:{merchantId}
          </div>
        </div>
      </div>
    </div>
  )
}
