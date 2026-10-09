import React from 'react';
import {
  Waves,
  Scale,
  Utensils,
  IndianRupee,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ArrowUpRight,
  Droplet,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Cpu,
  HelpCircle,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Pond, DashboardSummary, WaterReading, AlertRecord } from '../types';
import { ButtonLoader } from '../components/LoadingSpinner';

interface DashboardPageProps {
  summary: DashboardSummary | null;
  ponds: Pond[];
  readings: WaterReading[];
  alerts: AlertRecord[];
  isSimulated: boolean;
  isResettingDemo?: boolean;
  actioningAlertId?: { id: number; action: string } | null;
  onResetDemo: () => void;
  onNavigateTab: (tab: string) => void;
  onAcknowledgeAlert: (id: number) => void;
  onOpenGuide?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  summary,
  ponds,
  readings,
  alerts,
  isSimulated,
  isResettingDemo,
  actioningAlertId,
  onResetDemo,
  onNavigateTab,
  onAcknowledgeAlert,
  onOpenGuide,
}) => {
  const [showFormulas, setShowFormulas] = React.useState(false);
  const activeAlerts = alerts.filter((a) => !a.is_resolved);

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-12">
      {/* Welcome Banner — First-time user CTA */}
      {onOpenGuide && (
        <div className="w-full bg-gradient-to-r from-cyan-950/60 via-[#131a33] to-emerald-950/40 border border-cyan-500/30 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-72 h-72 bg-cyan-400/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5 shadow-[0_0_14px_rgba(6,182,212,0.2)]">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-display font-bold text-lg text-white tracking-tight">
                  Welcome to AquaSmart AI
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed mt-0.5 max-w-xl">
                  Your smart aquaculture command center for optimized feeding, real-time water monitoring, and AI-powered fish counting. New here? Take the quick tour.
                </p>
              </div>
            </div>
            <button
              onClick={onOpenGuide}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-cyan-500/25 shrink-0"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Quick Start Guide</span>
            </button>
          </div>
        </div>
      )}

      {/* Top Compliance Alert & Realtime Connectivity Pill (FR-08) */}
      <div className="w-full bg-[#131a33]/90 border border-slate-700/80 rounded-xl p-4 sm:p-5 shadow-xl relative overflow-hidden flex flex-wrap items-center justify-between gap-4">
        <div className="absolute -right-16 -top-16 w-56 h-56 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-wrap items-center gap-4 relative z-10">
          {/* Simulated / Live Data Banner */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1a2342] border border-slate-700 font-mono text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                isSimulated ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
              }`}
            ></span>
            <span className={`font-bold ${isSimulated ? 'text-amber-400' : 'text-emerald-400'}`}>
              {isSimulated ? 'SAMPLE / SIMULATED ENVIRONMENT' : 'VERIFIED SENSOR TELEMETRY'}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-slate-400 font-mono text-xs">
            <span>FACILITY CODE:</span>
            <span className="text-cyan-400 font-bold">ARC-DELTA-PRIME</span>
            <span className="opacity-40">|</span>
            <span>LAT: 10.742° N • LON: 106.632° E</span>
          </div>
        </div>

        {/* Actions: Reset Demo & API Status */}
        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={onResetDemo}
            disabled={isResettingDemo}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-mono transition-colors disabled:opacity-50"
            title="Reset dataset back to default demo state"
          >
            <ButtonLoader
              loading={!!isResettingDemo}
              text="RESETTING..."
              icon={<RotateCcw className="w-3.5 h-3.5 text-amber-400" />}
            >
              RESET DEMO DATA
            </ButtonLoader>
          </button>
        </div>
      </div>

      {/* Farm Summary KPI Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1: Active Registered Ponds */}
        <div className="p-4 rounded-xl bg-[#131a33] border border-slate-800 shadow-md flex flex-col justify-between hover:border-cyan-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>ACTIVE PONDS</span>
            <Waves className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="my-2">
            <div className="font-display font-bold text-3xl text-white">
              {summary ? summary.active_ponds_count : ponds.length}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">Commercial Ponds</div>
          </div>
          <div className="text-[11px] font-mono text-cyan-400 flex items-center justify-between pt-2 border-t border-slate-800/80">
            <span>Tilapia & Shrimp</span>
            <span className="text-emerald-400 font-semibold">● Online</span>
          </div>
        </div>

        {/* KPI 2: Total Farm Biomass */}
        <div className="p-4 rounded-xl bg-[#131a33] border border-slate-800 shadow-md flex flex-col justify-between hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>TOTAL BIOMASS</span>
            <Scale className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="my-2">
            <div className="font-display font-bold text-3xl text-emerald-400">
              {summary ? summary.total_biomass_kg.toLocaleString() : '0'}{' '}
              <span className="text-sm font-normal text-slate-400">kg</span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">Total live fish weight</div>
          </div>
          <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 pt-2 border-t border-slate-800/80">
            <TrendingUp className="w-3 h-3" />
            <span>Fish count × avg weight</span>
          </div>
        </div>

        {/* KPI 3: Daily Feed Required */}
        <div className="p-4 rounded-xl bg-[#131a33] border border-slate-800 shadow-md flex flex-col justify-between hover:border-cyan-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>DAILY FEED NEEDED</span>
            <Utensils className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="my-2">
            <div className="font-display font-bold text-3xl text-cyan-400">
              {summary ? summary.daily_feed_kg.toLocaleString() : '0'}{' '}
              <span className="text-sm font-normal text-slate-400">kg/day</span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">Recommended daily ration</div>
          </div>
          <div className="text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800/80">
            Biomass × 2.0% - 5.0% rate
          </div>
        </div>

        {/* KPI 4: Daily Feed Cost */}
        <div className="p-4 rounded-xl bg-[#131a33] border border-slate-800 shadow-md flex flex-col justify-between hover:border-amber-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>DAILY FEED COST</span>
            <IndianRupee className="w-4 h-4 text-amber-400" />
          </div>
          <div className="my-2">
            <div className="font-display font-bold text-3xl text-white">
              ₹{summary ? summary.daily_cost.toLocaleString() : '0'}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              30-day: ₹{summary ? summary.monthly_cost_estimate.toLocaleString() : '0'}
            </div>
          </div>
          <div className="text-[11px] font-mono text-amber-400 pt-2 border-t border-slate-800/80">
            Avg feed: ₹68 - ₹110/kg
          </div>
        </div>

        {/* KPI 5: Water Quality Health Overview */}
        <div className="p-4 rounded-xl bg-[#131a33] border border-slate-800 shadow-md flex flex-col justify-between hover:border-rose-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>WATER HEALTH</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span className="font-display font-bold text-2xl text-emerald-400">
                {summary ? summary.optimal_ponds : 0}
              </span>
              <span className="text-xs text-slate-400">Optimal</span>
              <span className="text-slate-600">/</span>
              <span className="font-display font-bold text-2xl text-rose-400">
                {summary ? summary.critical_ponds : 0}
              </span>
              <span className="text-xs text-rose-400">Alert</span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">Safe vs out-of-range ponds</div>
          </div>
          <div className="text-[11px] font-mono text-rose-400 flex items-center justify-between pt-2 border-t border-slate-800/80">
            <span>{activeAlerts.length} Active Alert{activeAlerts.length !== 1 ? 's' : ''}</span>
            <button
              onClick={() => onNavigateTab('water-quality')}
              className="hover:underline flex items-center gap-0.5 text-cyan-400"
            >
              View <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Active Ponds Fleet & Realtime Telemetry Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Ponds Fleet Overview Table */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="p-5 rounded-xl bg-[#131a33] border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Waves className="w-5 h-5 text-cyan-400" />
                <h2 className="font-display font-bold text-lg text-white">Active Registered Fleet Ponds</h2>
              </div>
              <button
                onClick={() => onNavigateTab('ponds')}
                className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-mono"
              >
                <span>Fleet Manager</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#0b132b] text-slate-400 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3 rounded-l-lg">Pond Name</th>
                    <th className="py-2.5 px-3">Species</th>
                    <th className="py-2.5 px-3 text-right">Fish Count</th>
                    <th className="py-2.5 px-3 text-right">Biomass (kg)</th>
                    <th className="py-2.5 px-3 text-right">Daily Feed</th>
                    <th className="py-2.5 px-3 text-right">Daily Cost</th>
                    <th className="py-2.5 px-3 text-center rounded-r-lg">Water Health</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {ponds.map((pond) => (
                    <tr key={pond.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-3 font-sans font-semibold text-white">
                        {pond.name}
                        <div className="text-[10px] font-mono text-slate-500 font-normal">{pond.id}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-400">{pond.species}</td>
                      <td className="py-3 px-3 text-right text-slate-200">
                        {pond.fish_count.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-emerald-400">
                        {pond.biomass_kg.toLocaleString()} kg
                      </td>
                      <td className="py-3 px-3 text-right text-cyan-400 font-semibold">
                        {pond.daily_feed_kg.toFixed(1)} kg/d
                      </td>
                      <td className="py-3 px-3 text-right text-amber-400">
                        ₹{pond.daily_cost.toFixed(0)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            pond.status === 'Optimal'
                              ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-400'
                              : pond.status === 'Caution'
                              ? 'bg-amber-950/70 border border-amber-500/40 text-amber-400'
                              : 'bg-rose-950/70 border border-rose-500/40 text-rose-400 animate-pulse'
                          }`}
                        >
                          {pond.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Quick Action Navigation Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-4 border-t border-slate-800">
              <button
                onClick={() => onNavigateTab('calculator')}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs font-semibold transition-colors"
              >
                <span>Calculate Feed</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onNavigateTab('ai-vision')}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold transition-colors"
              >
                <span>Count Fish with AI</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onNavigateTab('reports')}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-semibold transition-colors"
              >
                <span>Analytics & Reports</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Collapsible Key Metrics & Formulas Guide for Any User */}
          <div className="p-4 rounded-xl bg-[#131a33] border border-slate-800/80 shadow-md">
            <button
              onClick={() => setShowFormulas(!showFormulas)}
              className="w-full flex items-center justify-between text-left text-slate-300 hover:text-white transition-colors"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span className="font-semibold text-sm">How Are These Numbers Calculated? (Quick Reference)</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-400 font-mono">
                <span>{showFormulas ? 'Hide Guide' : 'Show Guide'}</span>
                {showFormulas ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {showFormulas && (
              <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
                <div className="p-3 rounded-lg bg-[#0b132b] border border-slate-800">
                  <div className="font-bold text-emerald-400 mb-1 flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5" />
                    <span>Total Biomass (kg)</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed mb-2">
                    The total live weight of all fish currently in the pond.
                  </p>
                  <code className="text-emerald-300 bg-slate-900 px-2 py-1 rounded block font-mono text-[11px]">
                    (Fish Count × Avg Weight in grams) ÷ 1,000
                  </code>
                </div>

                <div className="p-3 rounded-lg bg-[#0b132b] border border-slate-800">
                  <div className="font-bold text-cyan-400 mb-1 flex items-center gap-1.5">
                    <Utensils className="w-3.5 h-3.5" />
                    <span>Daily Feed Needed (kg)</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed mb-2">
                    Target feed to give per day based on species growth stage.
                  </p>
                  <code className="text-cyan-300 bg-slate-900 px-2 py-1 rounded block font-mono text-[11px]">
                    Total Biomass × Feeding Rate %
                  </code>
                </div>

                <div className="p-3 rounded-lg bg-[#0b132b] border border-slate-800">
                  <div className="font-bold text-amber-400 mb-1 flex items-center gap-1.5">
                    <IndianRupee className="w-3.5 h-3.5" />
                    <span>Daily & Monthly Cost</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed mb-2">
                    Calculated from current feed pellet market price in INR.
                  </p>
                  <code className="text-amber-300 bg-slate-900 px-2 py-1 rounded block font-mono text-[11px]">
                    Daily Feed kg × Price per kg
                  </code>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Active Biological Alerts & Telemetry Feed */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Active Alerts Card */}
          <div className="p-5 rounded-xl bg-[#131a33] border border-slate-800 shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Active Critical Alerts</span>
              </div>
              <span className="font-mono text-xs text-slate-400">{activeAlerts.length} Active</span>
            </div>

            <div className="flex flex-col gap-3 my-3">
              {activeAlerts.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs font-mono bg-[#0b132b] rounded-lg">
                  All pond telemetry parameters within safe biological boundaries.
                </div>
              ) : (
                activeAlerts.map((alt) => (
                  <div
                    key={alt.id}
                    className="p-3 rounded-lg bg-[#0b132b] border border-rose-500/30 flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] uppercase font-bold text-rose-400">
                        {alt.parameter} • {alt.pond_id}
                      </span>
                      <button
                        onClick={() => onAcknowledgeAlert(alt.id)}
                        disabled={actioningAlertId?.id === alt.id}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-50"
                      >
                        <ButtonLoader
                          loading={actioningAlertId?.id === alt.id && actioningAlertId.action === 'ack'}
                          size="xs"
                          text="Acking..."
                        >
                          Acknowledge
                        </ButtonLoader>
                      </button>
                    </div>
                    <p className="text-xs text-slate-300 leading-snug">{alt.message}</p>
                    <div className="text-[10px] font-mono text-slate-500">
                      Triggered: {new Date(alt.triggered_at).toLocaleTimeString()}
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => onNavigateTab('water-quality')}
              className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-medium transition-colors text-center"
            >
              Open Water Quality Gauges
            </button>
          </div>

          {/* Quick Telemetry Matrix Snapshot */}
          <div className="p-5 rounded-xl bg-[#131a33] border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
                <Droplet className="w-4 h-4" />
                <span>Sensor Bus Matrix</span>
              </div>
              <span className="font-mono text-[10px] text-emerald-400 uppercase font-bold">Live Stream</span>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3 font-mono text-xs">
              <div className="p-2.5 rounded bg-[#0b132b] border border-slate-800">
                <div className="text-slate-400 text-[10px]">AVG DISSOLVED O2</div>
                <div className="text-base font-bold text-cyan-400 mt-0.5">5.9 mg/L</div>
              </div>
              <div className="p-2.5 rounded bg-[#0b132b] border border-slate-800">
                <div className="text-slate-400 text-[10px]">AVG TEMPERATURE</div>
                <div className="text-base font-bold text-emerald-400 mt-0.5">28.4 °C</div>
              </div>
              <div className="p-2.5 rounded bg-[#0b132b] border border-slate-800">
                <div className="text-slate-400 text-[10px]">AVG WATER pH</div>
                <div className="text-base font-bold text-slate-200 mt-0.5">7.65 pH</div>
              </div>
              <div className="p-2.5 rounded bg-[#0b132b] border border-slate-800">
                <div className="text-slate-400 text-[10px]">AVG SALINITY</div>
                <div className="text-base font-bold text-slate-200 mt-0.5">9.1 ppt</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
