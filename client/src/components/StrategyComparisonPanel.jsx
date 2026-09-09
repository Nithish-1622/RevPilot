import React from 'react'
import { Sparkles, ArrowRight } from 'lucide-react'

export default function StrategyComparisonPanel({ candidatePlans, onSelectStrategy }) {
  const plans = candidatePlans || [
    {
      strategy_id: 'STRAT_A_IMMEDIATE_RETRY',
      name: 'Immediate Gateway Retry',
      steps: [{ step: 1, action: 'RETRY_NOW', delay_minutes: 0, description: 'Execute instant retry via primary payment gateway' }],
      expected_recovery_probability: 0.54,
      expected_revenue: 8100.00,
      intervention_cost: 5.00,
      expected_value: 8095.00,
      risk_score: 0.20,
      confidence: 0.85
    },
    {
      strategy_id: 'STRAT_B_DELAYED_LIQUIDITY',
      name: 'Liquidity Window Retry (6h Cooldown)',
      steps: [
        { step: 1, action: 'SEND_PAYMENT_REMINDER', delay_minutes: 0, description: 'Dispatch SMS/Email notification to customer' },
        { step: 2, action: 'RETRY_LATER', delay_minutes: 360, description: 'Retry payment at peak evening bank liquidity window' }
      ],
      expected_recovery_probability: 0.68,
      expected_revenue: 10200.00,
      intervention_cost: 3.00,
      expected_value: 10197.00,
      risk_score: 0.12,
      confidence: 0.90
    },
    {
      strategy_id: 'STRAT_C_CARD_UPDATE',
      name: 'Payment Method Update + 5% Voucher',
      steps: [
        { step: 1, action: 'OFFER_INCENTIVE', delay_minutes: 0, description: 'Attach 5% checkout voucher to payment recovery link' },
        { step: 2, action: 'REQUEST_PAYMENT_UPDATE', delay_minutes: 60, description: 'Prompt customer to update card or UPI ID' }
      ],
      expected_recovery_probability: 0.76,
      expected_revenue: 11400.00,
      intervention_cost: 75.00,
      expected_value: 11325.00,
      risk_score: 0.08,
      confidence: 0.92
    }
  ]

  const bestStrategy = plans.reduce((max, p) => p.expected_value > max.expected_value ? p : max, plans[0])

  return (
    <div className="space-y-6 p-8 rounded-3xl bg-white dark:bg-[#0A2540] border border-slate-200 dark:border-slate-800 shadow-md">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-xs font-black text-[#0C6FEE] border border-blue-200 dark:border-blue-800">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Strategy Optimization Engine</span>
          </div>
          <h2 className="text-xl font-black text-[#0A2540] dark:text-white pt-2">What-If Strategy Outcome Comparison</h2>
        </div>
        <div className="text-right text-xs">
          <span className="text-slate-500 font-bold block">RevPilot Optimal Recommendation</span>
          <span className="font-black text-[#059669] block text-sm">{bestStrategy.name}</span>
        </div>
      </div>

      {/* Side-by-side Strategy Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan, idx) => {
          const isBest = plan.strategy_id === bestStrategy.strategy_id
          return (
            <div
              key={plan.strategy_id}
              className={`p-6 rounded-2xl border transition-all duration-200 relative flex flex-col justify-between space-y-4 hover-card-pro ${
                isBest
                  ? 'bg-blue-50/60 dark:bg-blue-950/40 border-2 border-[#0C6FEE] shadow-lg shadow-blue-500/10'
                  : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800'
              }`}
            >
              {isBest && (
                <span className="absolute -top-3.5 right-4 bg-[#0C6FEE] text-white text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full shadow-md">
                  Optimal Strategy
                </span>
              )}

              <div className="space-y-4">
                <span className="text-xs font-mono font-bold text-slate-400 block uppercase">Option 0{idx + 1} • {plan.strategy_id}</span>
                <h3 className="text-base font-black text-[#0A2540] dark:text-white">{plan.name}</h3>

                {/* Steps Timeline */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block">Execution Plan Steps</span>
                  {plan.steps.map(st => (
                    <div key={st.step} className="p-2.5 rounded-xl bg-white dark:bg-[#0A2540] border border-slate-200 dark:border-slate-800 text-xs flex items-center space-x-2.5">
                      <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950 text-[#0C6FEE] font-black text-[10px] flex items-center justify-center shrink-0">
                        {st.step}
                      </span>
                      <span className="text-slate-700 dark:text-slate-300 font-mono text-[11px] truncate font-medium">{st.description}</span>
                    </div>
                  ))}
                </div>

                {/* Financial Simulation Grid */}
                <div className="grid grid-cols-2 gap-2 pt-2 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-white dark:bg-[#0A2540] border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 block text-[10px] font-bold">RECOVERY PROB.</span>
                    <span className="font-black text-[#0C6FEE] text-sm">{(plan.expected_recovery_probability * 100).toFixed(1)}%</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-[#0A2540] border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 block text-[10px] font-bold">NET EXP. VALUE</span>
                    <span className="font-black text-[#059669] text-sm">₹{plan.expected_value.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onSelectStrategy && onSelectStrategy(plan)}
                className={`w-full py-3 px-4 rounded-xl text-xs font-extrabold transition-all duration-200 flex items-center justify-center space-x-2 ${
                  isBest
                    ? 'bg-[#0C6FEE] hover:bg-[#0B5ED7] text-white shadow-md shadow-blue-500/25'
                    : 'bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200'
                }`}
              >
                <span>Select {plan.name}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
