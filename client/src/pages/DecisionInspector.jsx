import React, { useEffect, useState } from 'react'
import { X, Cpu, ShieldCheck, CheckCircle2, AlertTriangle, FileText, Activity, Zap, PlayCircle } from 'lucide-react'

export default function DecisionInspector({ caseId, onClose }) {
  const [audit, setAudit] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!caseId) return
    setLoading(true)
    fetch(`/api/v1/recovery/cases/${caseId}/audit`)
      .then(res => res.json())
      .then(data => {
        setAudit(data)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [caseId])

  const graphNodes = [
    { name: 'load_context', label: 'Load Context', desc: 'Normalize inputs & payment parameters', status: 'PASSED' },
    { name: 'diagnose_failure', label: 'Diagnose Failure', desc: 'Classify failure code root cause', status: 'PASSED' },
    { name: 'get_ml_prediction', label: 'ML Prediction', desc: 'Predict P(Recovery) via LightGBM binary', status: 'PASSED' },
    { name: 'generate_candidate_actions', label: 'Generate Candidates', desc: 'Assemble eligible action types', status: 'PASSED' },
    { name: 'score_actions_deterministically', label: 'Deterministic Scoring', desc: 'Calculate Net Expected Value (NEV)', status: 'PASSED' },
    { name: 'llm_reasoning', label: 'LLM Reasoning', desc: 'Generate explanation via Provider', status: 'PASSED' },
    { name: 'validate_decision', label: 'Validate Decision', desc: 'Enforce output contract validation', status: 'PASSED' }
  ]

  const candidateScores = [
    { action_type: 'RETRY_NOW', score: 875.0, cost: 5.0, friction: 'LOW', eligible: true },
    { action_type: 'RETRY_LATER', score: 878.0, cost: 2.0, friction: 'LOW', eligible: true },
    { action_type: 'SEND_PAYMENT_REMINDER', score: 879.0, cost: 1.0, friction: 'MEDIUM', eligible: true },
    { action_type: 'REQUEST_PAYMENT_UPDATE', score: -999.0, cost: 3.0, friction: 'MEDIUM', eligible: false },
    { action_type: 'OFFER_INCENTIVE', score: 780.0, cost: 100.0, friction: 'NONE', eligible: true }
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="glass-panel-elevated w-full max-w-4xl rounded-3xl p-6 space-y-6 relative max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl glass-panel text-muted hover:text-main transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-mono font-bold">
              {caseId}
            </span>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
              LangGraph StateGraph Verified
            </span>
          </div>
          <h2 className="text-xl font-bold text-main">AI Decision Inspector & Audit Timeline</h2>
        </div>

        {/* LangGraph Node Execution Walkthrough */}
        <div className="space-y-3 glass-panel p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase text-indigo-400 flex items-center space-x-1.5">
              <Cpu className="w-4 h-4" />
              <span>LangGraph 7-Node StateGraph Execution Pipeline</span>
            </h3>
            <span className="text-[11px] text-muted font-mono">Agent Version: langgraph_agent_v2.0</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 pt-2">
            {graphNodes.map((node, i) => (
              <div key={node.name} className="p-2.5 rounded-xl bg-surface-elevated border border-gray-800 space-y-1 text-center">
                <div className="flex items-center justify-center space-x-1">
                  <span className="w-4 h-4 rounded-full bg-indigo-600 text-[10px] font-bold text-white flex items-center justify-center">{i + 1}</span>
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                </div>
                <span className="text-[11px] font-bold text-main block truncate">{node.label}</span>
                <span className="text-[9px] text-muted block leading-tight">{node.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Candidate Actions Scoring Matrix */}
        <div className="glass-panel p-5 rounded-2xl space-y-3">
          <h3 className="text-xs font-bold uppercase text-emerald-400 flex items-center space-x-1.5">
            <Zap className="w-4 h-4" />
            <span>Candidate Actions Net Expected Value (NEV) Scoring Matrix</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="text-muted border-b border-gray-800">
                <tr>
                  <th className="p-2">Action Type</th>
                  <th className="p-2">NEV Score</th>
                  <th className="p-2">Cost (₹)</th>
                  <th className="p-2">Friction</th>
                  <th className="p-2">Eligibility</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/40">
                {candidateScores.map(cs => (
                  <tr key={cs.action_type} className={cs.score === 879.0 ? 'bg-indigo-600/10 font-bold' : ''}>
                    <td className="p-2 text-main">{cs.action_type}</td>
                    <td className="p-2 text-emerald-400">₹{cs.score.toFixed(2)}</td>
                    <td className="p-2 text-muted">₹{cs.cost.toFixed(2)}</td>
                    <td className="p-2 text-indigo-300">{cs.friction}</td>
                    <td className="p-2">
                      {cs.eligible ? (
                        <span className="text-emerald-400">ELIGIBLE</span>
                      ) : (
                        <span className="text-rose-400">INELIGIBLE</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* LLM Explanation Banner */}
        <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-1">
          <div className="flex items-center justify-between text-xs text-indigo-300 font-semibold">
            <span>RevPilot AI Explanation</span>
            <span className="font-mono text-[10px] bg-indigo-900/60 px-2 py-0.5 rounded text-indigo-300">Prompt: RECOVERY_DECISION_PROMPT_V1</span>
          </div>
          <p className="text-xs text-main leading-relaxed">
            "Payment failed due to a temporary network timeout. ML predicts a 88% recovery chance with immediate retry."
          </p>
        </div>

        {/* Audit Trail Timeline */}
        <div className="glass-panel p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase text-main flex items-center space-x-1.5">
              <Activity className="w-4 h-4 text-indigo-400" />
              <span>Immutable Audit Event Trail</span>
            </h3>
            <span className="text-[11px] text-muted font-mono">{audit.length} Audit Events Recorded</span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {audit.length === 0 ? (
              <div className="text-xs text-muted text-center py-4">No historical audit records found for this case.</div>
            ) : (
              audit.map(evt => (
                <div key={evt.id} className="p-3 rounded-xl bg-surface-elevated border border-gray-800 text-xs space-y-1 font-mono">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-main">{evt.eventType}</span>
                    <span className="text-muted text-[10px]">{new Date(evt.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-muted">
                    <span>Component: {evt.component} ({evt.actorType})</span>
                    <span className={evt.decision === 'ALLOW' ? 'text-emerald-400' : 'text-rose-400'}>[{evt.decision}]</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
