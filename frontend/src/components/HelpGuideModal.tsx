import React, { useState } from 'react';
import {
  HelpCircle,
  X,
  BookOpen,
  Calculator,
  Droplets,
  ScanEye,
  Waves,
  FileBarChart,
  CheckCircle2,
  Info,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingDown,
  Layers,
  History
} from 'lucide-react';

interface HelpGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
}

export const HelpGuideModal: React.FC<HelpGuideModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  const [activeSection, setActiveSection] = useState<'quickstart' | 'tabs' | 'glossary' | 'faq'>('quickstart');

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="guide-title"
    >
      <div className="bg-[#0f172f] border border-cyan-500/30 rounded-2xl max-w-3xl w-full shadow-2xl shadow-cyan-950/50 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4.5 bg-[#0a1228] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.25)]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 id="guide-title" className="text-lg font-bold text-white tracking-tight">
                AquaSmart AI — User Guide & Help
              </h2>
              <p className="text-xs text-slate-300">
                Simple, friendly guidance on how to use every feature of this aquaculture platform
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Navigation Tabs */}
        <div className="px-6 pt-3 pb-2 bg-[#0c142b] border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveSection('quickstart')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              activeSection === 'quickstart'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            🚀 Quick 3-Step Tour
          </button>
          <button
            onClick={() => setActiveSection('tabs')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              activeSection === 'tabs'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            📱 Feature Guide
          </button>
          <button
            onClick={() => setActiveSection('glossary')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              activeSection === 'glossary'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            📖 Aquaculture Terms (Plain English)
          </button>
          <button
            onClick={() => setActiveSection('faq')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              activeSection === 'faq'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            💡 FAQs & Tips
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-200">
          {/* SECTION 1: QUICK START */}
          {activeSection === 'quickstart' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-cyan-200 text-xs leading-relaxed flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white text-sm mb-1">What is AquaSmart AI?</p>
                  AquaSmart AI is a smart digital assistant designed for aquaculture fish & shrimp farmers.
                  It prevents overfeeding (which wastes money and pollutes water), keeps water safe with real-time sensors,
                  and counts fish stock using automated computer vision.
                </div>
              </div>

              <h3 className="font-bold text-white text-base">How to test everything right now:</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                <div className="p-4 rounded-xl bg-[#141d38] border border-slate-700/80 flex flex-col justify-between hover:border-cyan-400/40 transition-colors">
                  <div>
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-xs mb-3">
                      1
                    </div>
                    <h4 className="font-semibold text-white mb-1">Calculate Smart Feed</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Select your pond, load a sample preset (Tilapia or Shrimp), and see your daily feeding split and cost forecast.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateTab('calculator');
                    }}
                    className="mt-4 flex items-center justify-between text-xs font-semibold text-cyan-400 hover:text-cyan-300 pt-2 border-t border-slate-700/60"
                  >
                    <span>Try Calculator</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-[#141d38] border border-slate-700/80 flex flex-col justify-between hover:border-emerald-400/40 transition-colors">
                  <div>
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs mb-3">
                      2
                    </div>
                    <h4 className="font-semibold text-white mb-1">Count Fish with AI</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Click <strong>"Try 8 Fish School"</strong> to load a demonstration image, then hit <strong>"Run AI Fish Detection"</strong> to see AI bounding boxes.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateTab('ai-vision');
                    }}
                    className="mt-4 flex items-center justify-between text-xs font-semibold text-emerald-400 hover:text-emerald-300 pt-2 border-t border-slate-700/60"
                  >
                    <span>Try AI Vision</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-[#141d38] border border-slate-700/80 flex flex-col justify-between hover:border-amber-400/40 transition-colors">
                  <div>
                    <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs mb-3">
                      3
                    </div>
                    <h4 className="font-semibold text-white mb-1">Check Water Health</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      See real-time oxygen, pH, temperature, and ammonia. Test the simulation tick to see how safety alerts trigger.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateTab('water-quality');
                    }}
                    className="mt-4 flex items-center justify-between text-xs font-semibold text-amber-400 hover:text-amber-300 pt-2 border-t border-slate-700/60"
                  >
                    <span>View Sensors</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: TABS GUIDE */}
          {activeSection === 'tabs' && (
            <div className="space-y-4">
              <h3 className="font-bold text-white text-base">Overview of All App Sections:</h3>
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-[#141d38] border border-slate-700/70 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-sm">Dashboard Overview</h4>
                    <p className="text-xs text-slate-300 leading-relaxed mt-0.5">
                      Your farm cockpit. Shows total active ponds, total biomass in kilograms, daily feed required, estimated feed cost, active warnings, and 14-day trends.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#141d38] border border-slate-700/70 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                    <Calculator className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-sm">Feeding Calculator</h4>
                    <p className="text-xs text-slate-300 leading-relaxed mt-0.5">
                      Calculates the exact amount of food to throw into each pond based on fish count, average fish weight, and current water health. Breaks feedings into morning, afternoon, and evening portions.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#141d38] border border-slate-700/70 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0">
                    <Droplets className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-sm">Water Quality & Sensors</h4>
                    <p className="text-xs text-slate-300 leading-relaxed mt-0.5">
                      Monitors Dissolved Oxygen, pH, Temperature, Salinity, and Ammonia. Highlights safe ranges in green and issues warning alerts if oxygen drops or acidity spikes.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#141d38] border border-slate-700/70 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0">
                    <Waves className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-sm">Pond Fleet Management</h4>
                    <p className="text-xs text-slate-300 leading-relaxed mt-0.5">
                      Add, view, and edit rectangular, circular, or irregular ponds. Automatically calculates total water volume in cubic meters and stocking density.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#141d38] border border-slate-700/70 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 shrink-0">
                    <ScanEye className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-sm">AI Fish Counting</h4>
                    <p className="text-xs text-slate-300 leading-relaxed mt-0.5">
                      Upload overhead pond photos or run built-in demo photos. The computer vision model detects fish silhouettes, marks bounding boxes, and lets you verify and update pond stocking numbers with one click.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#141d38] border border-slate-700/70 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
                    <FileBarChart className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-sm">Alerts & Reports</h4>
                    <p className="text-xs text-slate-300 leading-relaxed mt-0.5">
                      Review historical feeding charts and download complete RFC-4180 compliant CSV spreadsheets for farm record-keeping and audit compliance.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#141d38] border border-slate-700/70 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0">
                    <History className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-sm">History & Activity Logs</h4>
                    <p className="text-xs text-slate-300 leading-relaxed mt-0.5">
                      Inspect past feeding estimates, AI computer vision scans, and water sensor incidents in an audit-ready log with full search, pond filtering, and CSV download.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: GLOSSARY */}
          {activeSection === 'glossary' && (
            <div className="space-y-4">
              <h3 className="font-bold text-white text-base">Key Aquaculture Terms in Plain English:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-[#141d38] border border-slate-700/70">
                  <span className="font-semibold text-cyan-400 text-xs uppercase tracking-wider block mb-1">
                    Biomass (kg)
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    The total combined weight of all fish living in a pond. Calculated as: <code className="text-cyan-300">Fish Count × Average Weight</code>.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#141d38] border border-slate-700/70">
                  <span className="font-semibold text-emerald-400 text-xs uppercase tracking-wider block mb-1">
                    Dissolved Oxygen (DO)
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    The amount of oxygen gas in the water for fish to breathe. Must stay above <strong>5.0 mg/L</strong>. Below 3.0 mg/L is dangerous.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#141d38] border border-slate-700/70">
                  <span className="font-semibold text-amber-400 text-xs uppercase tracking-wider block mb-1">
                    Environmental Penalty Factor
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    A smart safety factor between 0.0 and 1.0. If water is too cold, hot, or oxygen is low, fish lose appetite. Feeding is automatically scaled down to prevent waste.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#141d38] border border-slate-700/70">
                  <span className="font-semibold text-purple-400 text-xs uppercase tracking-wider block mb-1">
                    pH Level (Acidity)
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Measures water acidity. Safe range is <strong>6.5 to 8.5</strong>. Levels below 6.5 burn gills; levels above 9.0 indicate toxic algae blooms.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#141d38] border border-slate-700/70">
                  <span className="font-semibold text-cyan-400 text-xs uppercase tracking-wider block mb-1">
                    Stocking Density
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Number of fish or kilograms per cubic meter of water. Keeps ponds from overcrowding and disease.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#141d38] border border-slate-700/70">
                  <span className="font-semibold text-emerald-400 text-xs uppercase tracking-wider block mb-1">
                    FCR (Feed Conversion Ratio)
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Kilograms of feed required to grow 1 kilogram of fish meat. Lower FCR means higher profit and better efficiency.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: FAQ & TIPS */}
          {activeSection === 'faq' && (
            <div className="space-y-3.5 text-xs">
              <div className="p-4 rounded-xl bg-[#141d38] border border-slate-700/70">
                <h4 className="font-bold text-white text-sm mb-1.5">
                  Q: Why does the app say "SAMPLE / SIMULATED ENVIRONMENT"?
                </h4>
                <p className="text-slate-300 leading-relaxed">
                  To ensure full transparency (as mandated by production aquaculture guidelines), any data generated without physical IoT water sensors or camera hardware is explicitly tagged. You can switch to Live Hardware Mode in the top navigation bar when real sensors are connected.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#141d38] border border-slate-700/70">
                <h4 className="font-bold text-white text-sm mb-1.5">
                  Q: Can I restore the original demo ponds if I edit them?
                </h4>
                <p className="text-slate-300 leading-relaxed">
                  Yes! Click the amber <strong>"RESET DEMO DATA"</strong> button on the Dashboard. It restores all 6 ponds, 14-day feeding history, sensor readings, and calibration baselines instantly.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#141d38] border border-slate-700/70">
                <h4 className="font-bold text-white text-sm mb-1.5">
                  Q: How does the AI Vision work if I don't have a camera photo?
                </h4>
                <p className="text-slate-300 leading-relaxed">
                  Go to <strong>AI Fish Counting</strong> and click any of the 3 instant test buttons: <em>"Try 8 Fish School"</em>, <em>"Try 22 Fish Crowded"</em>, or <em>"Try 14 Nursery"</em>. It creates a synthetic pond test sample and detects fish silhouettes automatically!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#0a1228] border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>AquaSmart AI v1.0 • Built for Commercial Aquaculture</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-cyan-500/20"
          >
            Got It, Let's Go
          </button>
        </div>
      </div>
    </div>
  );
};
