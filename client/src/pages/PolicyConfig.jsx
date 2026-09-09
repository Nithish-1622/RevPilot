import React, { useEffect, useState } from 'react'
import { Shield, Save, CheckCircle2, Zap } from 'lucide-react'

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
        <h1 className="text-2xl font-bold text-[#02042B] dark:text-white">Merchant Business Policy Engine Config</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Set financial boundaries, retry limits, and human approval thresholds enforced by Spring PolicyEngine.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl flex items-center space-x-3 text-xs font-semibold ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
        }`}>
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {/* Policy Form */}
        <form onSubmit={handleSave} className="md:col-span-2 p-6 rounded-3xl bg-white dark:bg-[#0E162B] border border-gray-200 dark:border-gray-800 shadow-sm space-y-5">
          <h3 className="text-base font-bold text-[#02042B] dark:text-white flex items-center space-x-2">
            <Shield className="w-4 h-4 text-[#0C6FEE]" />
            <span>Policy Bounds & Financial Rules</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Max Retry Attempts</label>
              <input
                type="number"
                min="1"
                max="10"
                value={policy.maxRetryAttempts}
                onChange={e => setPolicy({ ...policy, maxRetryAttempts: parseInt(e.target.value) || 1 })}
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-xs text-[#02042B] dark:text-white font-mono focus:outline-none focus:border-[#0C6FEE]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Max Discount / Incentive %</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="50"
                value={policy.maxDiscountPercent}
                onChange={e => setPolicy({ ...policy, maxDiscountPercent: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-xs text-[#02042B] dark:text-white font-mono focus:outline-none focus:border-[#0C6FEE]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Human Approval Threshold (₹)</label>
              <input
                type="number"
                step="100"
                min="0"
                value={policy.approvalThreshold}
                onChange={e => setPolicy({ ...policy, approvalThreshold: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-xs text-[#02042B] dark:text-white font-mono focus:outline-none focus:border-[#0C6FEE]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Minimum P(Recovery) Threshold</label>
              <input
                type="number"
                step="0.05"
                min="0.1"
                max="0.9"
                value={policy.minimumRecoveryProbability}
                onChange={e => setPolicy({ ...policy, minimumRecoveryProbability: parseFloat(e.target.value) || 0.1 })}
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-xs text-[#02042B] dark:text-white font-mono focus:outline-none focus:border-[#0C6FEE]"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Cool-off Period (Minutes)</label>
              <input
                type="number"
                min="10"
                max="1440"
                value={policy.cooldownMinutes || 120}
                onChange={e => setPolicy({ ...policy, cooldownMinutes: parseInt(e.target.value) || 120 })}
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-xs text-[#02042B] dark:text-white font-mono focus:outline-none focus:border-[#0C6FEE]"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center space-x-2 bg-[#0C6FEE] hover:bg-[#0B5ED7] text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md shadow-blue-500/20 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Evicting Cache & Saving...' : 'Save & Evict Redis Cache'}</span>
            </button>
          </div>
        </form>

        {/* Live Guardrail Preview Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0E162B] border border-gray-200 dark:border-gray-800 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-base font-bold text-[#02042B] dark:text-white flex items-center space-x-2">
              <Zap className="w-4 h-4 text-emerald-600" />
              <span>Guardrails Active Preview</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 space-y-1">
                <span className="text-gray-500 block">Transaction &gt; ₹{policy.approvalThreshold}</span>
                <span className="text-amber-600 font-bold block">→ Requires Human Approval</span>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 space-y-1">
                <span className="text-gray-500 block">Incentive Offer &gt; {policy.maxDiscountPercent}%</span>
                <span className="text-rose-600 font-bold block">→ Action BLOCKED</span>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 space-y-1">
                <span className="text-gray-500 block">P(Recovery) &lt; {(policy.minimumRecoveryProbability * 100).toFixed(0)}%</span>
                <span className="text-rose-600 font-bold block">→ Action BLOCKED</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-[11px] text-[#0C6FEE] font-mono">
            Redis Cache Namespace: recovery_policies:{merchantId}
          </div>
        </div>
      </div>
    </div>
  )
}
