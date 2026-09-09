import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck, Cpu, PlayCircle, Settings, FileText, ArrowRight, Zap, CheckCircle2, DollarSign, TrendingUp, Layers, RefreshCw } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function LandingPage() {
  const { theme } = useTheme()

  // Calculator States
  const [monthlyVolume, setMonthlyVolume] = useState(250000)
  const [avgOrderVal, setAvgOrderVal] = useState(2500)
  
  // Developer Code Snippet Tab
  const [codeLanguage, setCodeLanguage] = useState('curl')

  // Hero Dashboard Active Tab
  const [heroTab, setHeroTab] = useState('recovery')

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(0)

  // Developer Code Samples
  const codeSamples = {
    curl: `curl -X POST "https://api.revpilot.com/v1/recovery/analyze" \\
  -H "Authorization: Bearer rvp_live_9841e74d" \\
  -H "Content-Type: application/json" \\
  -d '{
    "transaction_id": "pay_9841e74d",
    "amount": 4850.00,
    "failure_code": "RAZORPAY_ISSUER_TIMEOUT",
    "merchant_id": "mch_8831"
  }'`,
    node: `import { RevPilot } from '@revpilot/sdk';

const revpilot = new RevPilot('rvp_live_9841e74d');

const decision = await revpilot.recovery.analyze({
  transactionId: 'pay_9841e74d',
  amount: 4850.00,
  failureCode: 'RAZORPAY_ISSUER_TIMEOUT'
});

console.log(decision.recommendedAction); // AUTO_RETRY_WITH_VOUCHER`,
    python: `from revpilot import RevPilotClient

client = RevPilotClient(api_key="rvp_live_9841e74d")

decision = client.recovery.analyze(
    transaction_id="pay_9841e74d",
    amount=4850.00,
    failure_code="RAZORPAY_ISSUER_TIMEOUT"
)

print(decision.nev_score) # 4320.50`,
    java: `RevPilotClient client = new RevPilotClient("rvp_live_9841e74d");

RecoveryDecision decision = client.analyze(
    new AnalysisRequest("pay_9841e74d", 4850.00, "RAZORPAY_ISSUER_TIMEOUT")
);

System.out.println(decision.getStatus()); // APPROVED`
  }

  // Calculate ROI Math
  const estimatedRecoveryAnnual = Math.round(monthlyVolume * 0.374 * 12)
  const netRevenueSaved = Math.round(estimatedRecoveryAnnual * 0.95)
  const recoveredTransactions = Math.round((monthlyVolume * 0.374 * 12) / (avgOrderVal || 1))

  const faqs = [
    {
      q: 'How does RevPilot guarantee zero AI financial hallucinations?',
      a: 'RevPilot uses a strict Dual-Plane Security Invariant Architecture. The FastAPI AI Service (LangGraph + LightGBM) only suggests recovery strategies and calculates Net Expected Value (NEV). The Spring Boot Control Plane independently evaluates every strategy against strict merchant business rules (Max Retry Count, Max Discount %, Monetary Approval Thresholds) before any transaction is executed.'
    },
    {
      q: 'What happens when a payment recovery case exceeds ₹5,000?',
      a: 'Any payment case with a value greater than ₹5,000 is automatically intercepted by our Human-In-The-Loop (HITL) Policy Engine into PENDING_APPROVAL status. An operator must review the AI decision timeline and manually approve or reject the action in the Recovery Cases Dashboard.'
    },
    {
      q: 'Can RevPilot handle high-volume flash sales or batch recoveries?',
      a: 'Yes. RevPilot’s Spring Boot Control Plane incorporates Redis rate limiters, transactional outbox pattern, and optimistic locking to process up to 1,000 recovery cases per minute without race conditions or double captures.'
    },
    {
      q: 'How does the ML LightGBM model score recovery probability?',
      a: 'Our holdout-tested LightGBM model analyzes failure reason codes, merchant vertical, customer transaction history, time-of-day, and payment instrument type to predict recovery likelihood P(Recovery). If unpickling fails across Python environments, our self-healing model registry automatically retrains the pipeline.'
    }
  ]

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#02042B] text-[#0A2540] dark:text-white font-sans transition-colors duration-300">
      {/* Dynamic Hero Section */}
      <section className="bg-[#0A2540] dark:bg-[#02042B] text-white pt-16 pb-28 px-6 lg:px-8 relative overflow-hidden border-b border-blue-900/30">
        {/* Background Radial Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-gradient-to-b from-[#0C6FEE]/20 via-cyan-500/10 to-transparent blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left Column: Headline & Value Proposition */}
          <div className="lg:col-span-6 space-y-6">
            

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] text-white">
              Advanced Payment & <br />
              <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
                Autonomous Revenue Recovery
              </span>
            </h1>

            <p className="text-slate-300 text-base sm:text-lg leading-relaxed font-normal">
              Accept payments seamlessly, diagnose failure root-causes in real time, and recover lost subscription revenue with AI state-graph workflows bounded by strict zero-hallucination policy guardrails.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center space-x-3 text-xs font-bold text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-[#059669]" />
                <span>100% Policy-Bounded Control Plane (Spring Boot 3.2)</span>
              </div>
              <div className="flex items-center space-x-3 text-xs font-bold text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-[#059669]" />
                <span>LangGraph 7-Node StateGraph AI Decision Engine</span>
              </div>
              <div className="flex items-center space-x-3 text-xs font-bold text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-[#059669]" />
                <span>Human-In-The-Loop (HITL) Gatekeeper for transactions &gt; ₹5,000</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link
                to="/dashboard"
                className="bg-[#0C6FEE] hover:bg-[#0B5ED7] text-white font-extrabold text-sm px-8 py-4 rounded-xl shadow-xl shadow-blue-600/30 transition-all flex items-center space-x-2 group"
              >
                <span>Launch Dashboard</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/simulator"
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm px-7 py-4 rounded-xl transition-all"
              >
                Try 1,000-Case Simulator
              </Link>
            </div>
          </div>

          {/* Right Column: Floating Razorpay Merchant Dashboard Mockup */}
          <div className="lg:col-span-6">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0A2540] text-[#0A2540] dark:text-white shadow-2xl overflow-hidden transform hover:-translate-y-1 transition-all">
              {/* Dashboard Mockup Top Bar */}
              <div className="bg-slate-100 dark:bg-slate-900 px-6 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                  <span className="text-slate-500 font-mono text-[11px] ml-2">dashboard.revpilot.com</span>
                </div>
                <span className="text-[#059669] text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                  Live Gateway Sync
                </span>
              </div>

              {/* Dashboard Mockup Tabs */}
              <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-semibold bg-slate-50 dark:bg-slate-900/60">
                <button
                  onClick={() => setHeroTab('recovery')}
                  className={`px-6 py-3 border-b-2 transition-all ${
                    heroTab === 'recovery'
                      ? 'border-[#0C6FEE] text-[#0C6FEE] bg-white dark:bg-[#0A2540] font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Autopilot Recovery Stream
                </button>
                <button
                  onClick={() => setHeroTab('analytics')}
                  className={`px-6 py-3 border-b-2 transition-all ${
                    heroTab === 'analytics'
                      ? 'border-[#0C6FEE] text-[#0C6FEE] bg-white dark:bg-[#0A2540] font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Live Metrics
                </button>
              </div>

              {/* Dashboard Mockup Content Body */}
              <div className="p-6 space-y-6 bg-white dark:bg-[#0A2540]">
                {/* Balance Summary Bar */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                    <span className="text-[11px] text-slate-500 font-bold block uppercase">Recovered Revenue</span>
                    <span className="text-2xl font-black text-[#059669]">₹47,38,920</span>
                    <span className="text-[10px] text-[#059669] font-bold block pt-1">↑ +37.4% recovery rate</span>
                  </div>
                  <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
                    <span className="text-[11px] text-slate-500 font-bold block uppercase">Protected Revenue</span>
                    <span className="text-2xl font-black text-[#0C6FEE]">₹1,28,00,000</span>
                    <span className="text-[10px] text-[#0C6FEE] font-bold block pt-1">100% policy bounded</span>
                  </div>
                </div>

                {/* Transaction Stream Table Mockup */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Recent Autopilot Recovery Events
                  </span>

                  <div className="space-y-2 text-xs font-mono">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-[#0A2540] dark:text-white">PAY_9841E74D</div>
                        <div className="text-[10px] text-slate-500">RAZORPAY_UPI_TIMEOUT • ₹4,850.00</div>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-[#059669] font-bold text-[10px] border border-emerald-200 dark:border-emerald-800">
                        RECOVERED (5% VOUCHER)
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-[#0A2540] dark:text-white">PAY_7719B20X</div>
                        <div className="text-[10px] text-slate-500">CARD_INSUFFICIENT_FUNDS • ₹8,400.00</div>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-[#0C6FEE] font-bold text-[10px] border border-blue-200 dark:border-blue-800">
                        HITL PENDING (&gt; ₹5,000)
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-[#0A2540] dark:text-white">PAY_3320C11M</div>
                        <div className="text-[10px] text-slate-500">BANK_GATEWAY_DOWN • ₹2,100.00</div>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-[#059669] font-bold text-[10px] border border-emerald-200 dark:border-emerald-800">
                        RECOVERED (SMART RETRY)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Stats Strip */}
      <section className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0A2540] py-12 px-6 shadow-sm">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl sm:text-4xl font-black text-[#0A2540] dark:text-white">₹128M+</div>
            <div className="text-xs text-slate-500 font-semibold pt-1">Failed Payments Analyzed</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-[#0C6FEE]">37.4%</div>
            <div className="text-xs text-slate-500 font-semibold pt-1">Average Recovery Rate</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-[#0C6FEE]">&lt; 45ms</div>
            <div className="text-xs text-slate-500 font-semibold pt-1">AI Decision Latency</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-[#059669]">100%</div>
            <div className="text-xs text-slate-500 font-semibold pt-1">Zero-Hallucination Safe</div>
          </div>
        </div>
      </section>

      {/* Dual-Plane Security Architecture Overview */}
      <section className="py-20 px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <span className="text-xs font-bold text-[#0C6FEE] uppercase tracking-widest">Architecture Invariants</span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#0A2540] dark:text-white">Dual-Plane Security Architecture</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm">Separating non-deterministic AI recommendations from authoritative financial transaction execution.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="p-8 rounded-2xl bg-white dark:bg-[#0A2540] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 border-l-4 border-l-[#0C6FEE] hover-card-pro">
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#0C6FEE] uppercase tracking-wider">FastAPI AI Intelligence Service (Port 8000)</span>
              <h3 className="text-xl font-black text-[#0A2540] dark:text-white">LangGraph 7-Node StateGraph Engine</h3>
            </div>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
              <li className="flex items-center space-x-2">
                <span className="text-[#0C6FEE] font-bold">►</span>
                <span>State machine decision graph (load_context → diagnose → predict → NEV score)</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-[#0C6FEE] font-bold">►</span>
                <span>Holdout-tested LightGBM recovery probability classifier P(Recovery)</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-[#0C6FEE] font-bold">►</span>
                <span>Self-healing ML pipeline with automated fallback retraining</span>
              </li>
            </ul>
          </div>

          <div className="p-8 rounded-2xl bg-white dark:bg-[#0A2540] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 border-l-4 border-l-[#059669] hover-card-pro">
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#059669] uppercase tracking-wider">Spring Boot Financial Control Plane (Port 8080)</span>
              <h3 className="text-xl font-black text-[#0A2540] dark:text-white">Authoritative Policy Engine &amp; Gateway</h3>
            </div>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
              <li className="flex items-center space-x-2">
                <span className="text-[#059669] font-bold">►</span>
                <span>Payment state machine transition validation &amp; optimistic locking</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-[#059669] font-bold">►</span>
                <span>Merchant policy discount caps, max retries, &amp; cool-off periods</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-[#059669] font-bold">►</span>
                <span>Human-In-The-Loop (HITL) gatekeeper for cases &gt; ₹5,000</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Complete 6-Module SaaS Feature Suite Section */}
      <section className="py-20 px-6 lg:px-8 max-w-7xl mx-auto space-y-16 border-t border-slate-200 dark:border-slate-800">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <span className="text-xs font-bold text-[#0C6FEE] uppercase tracking-widest">Full SaaS Module Suite</span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#0A2540] dark:text-white">Complete Platform Capabilities</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm">Explore all 6 production modules integrated into the RevPilot management dashboard.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0A2540] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 hover-card-pro">
            <span className="text-[10px] font-bold text-[#0C6FEE] uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 px-2 py-1 rounded">Module 01 • `/dashboard`</span>
            <h3 className="text-lg font-bold text-[#0A2540] dark:text-white">Live Financial Dashboard</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">Real-time aggregated metrics (Revenue at Risk, Recovered Revenue, Recovery Rate %) with live 50-item audit event stream.</p>
            <Link to="/dashboard" className="text-xs font-extrabold text-[#0C6FEE] block pt-2">Explore Dashboard →</Link>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#0A2540] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 hover-card-pro">
            <span className="text-[10px] font-bold text-[#0C6FEE] uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 px-2 py-1 rounded">Module 02 • `/cases`</span>
            <h3 className="text-lg font-bold text-[#0A2540] dark:text-white">Recovery Case Registry &amp; HITL</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">Payment state machine case table with merchant human-in-the-loop manual approval/rejection for cases &gt; ₹5,000.</p>
            <Link to="/cases" className="text-xs font-extrabold text-[#0C6FEE] block pt-2">View Case Registry →</Link>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#0A2540] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 hover-card-pro">
            <span className="text-[10px] font-bold text-[#0C6FEE] uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 px-2 py-1 rounded">Module 03 • `/cases/:id`</span>
            <h3 className="text-lg font-bold text-[#0A2540] dark:text-white">AI Decision Audit Inspector</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">Step-by-step decision breakdown showing raw webhook JSON payloads, ML confidence scores, and NEV strategy ranking.</p>
            <Link to="/cases" className="text-xs font-extrabold text-[#0C6FEE] block pt-2">Inspect Audit Modal →</Link>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#0A2540] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 hover-card-pro">
            <span className="text-[10px] font-bold text-[#0C6FEE] uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 px-2 py-1 rounded">Module 04 • `/policy`</span>
            <h3 className="text-lg font-bold text-[#0A2540] dark:text-white">Merchant Policy Configurator</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">Live policy bounds editor (Max Retries, Max Discount %, Approval Threshold) with automatic Redis cache eviction (`@CacheEvict`).</p>
            <Link to="/policy" className="text-xs font-extrabold text-[#0C6FEE] block pt-2">Configure Policies →</Link>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#0A2540] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 hover-card-pro">
            <span className="text-[10px] font-bold text-[#0C6FEE] uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 px-2 py-1 rounded">Module 05 • `/models`</span>
            <h3 className="text-lg font-bold text-[#0A2540] dark:text-white">ML Performance &amp; Health</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">Holdout-tested LightGBM model metrics: confusion matrix, feature importance rankings, ROC-AUC score, and versioning.</p>
            <Link to="/models" className="text-xs font-extrabold text-[#0C6FEE] block pt-2">View Model Metrics →</Link>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#0A2540] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 hover-card-pro">
            <span className="text-[10px] font-bold text-[#0C6FEE] uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 px-2 py-1 rounded">Module 06 • `/simulator`</span>
            <h3 className="text-lg font-bold text-[#0A2540] dark:text-white">1,000-Case Batch Simulator</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">Synthetic payment failure batch generator and high-throughput autopilot recovery runner for load testing.</p>
            <Link to="/simulator" className="text-xs font-extrabold text-[#0C6FEE] block pt-2">Run Simulator →</Link>
          </div>
        </div>
      </section>

      {/* Developer Section */}
      <section id="developers" className="py-20 px-6 lg:px-8 max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center border-t border-slate-200 dark:border-slate-800">
        <div className="lg:col-span-5 space-y-6">
          <span className="text-xs font-bold text-[#0C6FEE] uppercase tracking-widest">Built for Developers</span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#0A2540] dark:text-white">Simple API Integration in Minutes</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-normal">
            Integrate RevPilot directly into your existing payment checkout pipeline via simple REST APIs or native SDK wrappers.
          </p>

          <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300 font-bold">
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="w-4 h-4 text-[#059669]" />
              <span>Sub-50ms AI Decision Latency</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="w-4 h-4 text-[#059669]" />
              <span>Razorpay &amp; Stripe Webhook Ingestion</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="w-4 h-4 text-[#059669]" />
              <span>Postman Collection Included</span>
            </div>
          </div>
        </div>

        {/* Right Code Editor Box */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-slate-800 bg-[#0A2540] overflow-hidden shadow-2xl">
            {/* Code Tabs Header */}
            <div className="bg-[#02042B] px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex space-x-2 font-mono">
                {['curl', 'node', 'python', 'java'].map(lang => (
                  <button
                    key={lang}
                    onClick={() => setCodeLanguage(lang)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold uppercase transition-all ${
                      codeLanguage === lang
                        ? 'bg-[#0C6FEE] text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
              <span className="text-[10px] text-slate-400 font-mono">POST /v1/recovery/analyze</span>
            </div>

            {/* Syntax Block */}
            <pre className="p-6 font-mono text-xs text-blue-200 overflow-x-auto leading-relaxed bg-[#0A2540]">
              <code>{codeSamples[codeLanguage]}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* ROI Calculator */}
      <section id="calculator" className="py-20 px-6 lg:px-8 max-w-5xl mx-auto border-t border-slate-200 dark:border-slate-800">
        <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-[#0A2540] border border-slate-200 dark:border-slate-800 shadow-xl space-y-8 text-center">
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#0C6FEE] uppercase tracking-widest">ROI Calculator</span>
            <h2 className="text-3xl font-black text-[#0A2540] dark:text-white">Project Your Annual Recovered Revenue</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center max-w-2xl mx-auto text-left">
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-600 dark:text-slate-400">Monthly Failed Payment Volume (₹)</span>
                <span className="text-[#0C6FEE] text-base font-black">₹{monthlyVolume.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="50000"
                max="2000000"
                step="25000"
                value={monthlyVolume}
                onChange={(e) => setMonthlyVolume(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#0C6FEE]"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-600 dark:text-slate-400">Average Order Value (AOV)</span>
                <span className="text-[#0C6FEE] text-base font-black">₹{avgOrderVal.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="500"
                max="25000"
                step="500"
                value={avgOrderVal}
                onChange={(e) => setAvgOrderVal(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#0C6FEE]"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="p-5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-1">
              <span className="text-[11px] text-slate-600 dark:text-slate-400 uppercase font-bold block">Annual Recovered</span>
              <span className="text-2xl font-black text-[#0C6FEE]">₹{estimatedRecoveryAnnual.toLocaleString()}</span>
              <span className="text-[10px] text-slate-500 block">37.4% baseline rate</span>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1">
              <span className="text-[11px] text-slate-600 dark:text-slate-400 uppercase font-bold block">Net Profit Retained</span>
              <span className="text-2xl font-black text-[#059669]">₹{netRevenueSaved.toLocaleString()}</span>
              <span className="text-[10px] text-slate-500 block">After op costs</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-600 dark:text-slate-400 uppercase font-bold block">Recovered Orders</span>
              <span className="text-2xl font-black text-[#0A2540] dark:text-white">~{recoveredTransactions.toLocaleString()}</span>
              <span className="text-[10px] text-slate-500 block">Transactions / year</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="max-w-4xl mx-auto px-6 lg:px-8 py-16 space-y-8 border-t border-slate-200 dark:border-slate-800">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-[#0C6FEE] uppercase tracking-widest">Frequently Asked Questions</span>
          <h2 className="text-3xl font-black text-[#0A2540] dark:text-white">Platform Architecture FAQ</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx
            return (
              <div
                key={idx}
                onClick={() => setOpenFaq(isOpen ? null : idx)}
                className="p-6 rounded-2xl bg-white dark:bg-[#0A2540] border border-slate-200 dark:border-slate-800 hover:border-blue-300 transition-all cursor-pointer space-y-3 shadow-sm"
              >
                <div className="flex justify-between items-center">
                  <h4 className="text-base font-bold text-[#0A2540] dark:text-white pr-4">{faq.q}</h4>
                  <span className="text-[#0C6FEE] font-black text-lg">{isOpen ? '−' : '+'}</span>
                </div>
                {isOpen && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3 font-medium">
                    {faq.a}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0A2540] py-12 px-6 lg:px-8 text-xs text-slate-600 dark:text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 rounded bg-[#0C6FEE] flex items-center justify-center font-black text-white text-xs italic">
              R
            </div>
            <span className="font-bold text-[#0A2540] dark:text-white text-sm">RevPilot Platform</span>
            <span className="text-[10px] text-slate-400">© 2026 Razorpay Architecture Replica</span>
          </div>

          <div className="flex items-center space-x-6 font-semibold">
            <Link to="/dashboard" className="hover:text-[#0C6FEE] transition-colors">Dashboard</Link>
            <Link to="/cases" className="hover:text-[#0C6FEE] transition-colors">Case Registry</Link>
            <Link to="/policy" className="hover:text-[#0C6FEE] transition-colors">Policy Config</Link>
            <Link to="/models" className="hover:text-[#0C6FEE] transition-colors">ML Models</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
