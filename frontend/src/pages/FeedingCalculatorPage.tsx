import React, { useState, useEffect } from 'react';
import {
  Calculator,
  Save,
  RotateCcw,
  Sparkles,
  Info,
  Scale,
  Utensils,
  IndianRupee,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Sliders,
  History
} from 'lucide-react';
import { Pond, FeedingCalculationResult, FeedEstimate } from '../types';
import { calculateFeedingEstimate, saveFeedingEstimate, getFeedingHistory } from '../api';
import { ButtonLoader } from '../components/LoadingSpinner';

interface FeedingCalculatorPageProps {
  ponds: Pond[];
  selectedPondId: string;
  onRefreshPonds: () => void;
}

export const FeedingCalculatorPage: React.FC<FeedingCalculatorPageProps> = ({
  ponds,
  selectedPondId,
  onRefreshPonds,
}) => {
  // Form State
  const [pondId, setPondId] = useState<string>(selectedPondId !== 'all' ? selectedPondId : 'pond-01');
  const [fishCount, setFishCount] = useState<number>(12000);
  const [avgWeightG, setAvgWeightG] = useState<number>(80.0);
  const [feedingRatePct, setFeedingRatePct] = useState<number>(2.5);
  const [feedPricePerKg, setFeedPricePerKg] = useState<number>(68.0);
  const [notes, setNotes] = useState<string>('');

  // Result & UI State
  const [calcResult, setCalcResult] = useState<FeedingCalculationResult | null>(null);
  const [history, setHistory] = useState<FeedEstimate[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Sync with selected pond if changed from navbar
  useEffect(() => {
    if (selectedPondId && selectedPondId !== 'all') {
      setPondId(selectedPondId);
      const targetPond = ponds.find((p) => p.id === selectedPondId);
      if (targetPond) {
        setFishCount(targetPond.fish_count);
        setAvgWeightG(targetPond.avg_weight_g);
        setFeedingRatePct(targetPond.feeding_rate_pct);
        setFeedPricePerKg(targetPond.feed_price_per_kg);
      }
    }
  }, [selectedPondId, ponds]);

  // Load history on mount
  useEffect(() => {
    getFeedingHistory()
      .then((data) => setHistory(data))
      .catch((err) => console.error('Failed to load history:', err));
  }, []);

  // Run calculation whenever inputs change (live reactive update)
  useEffect(() => {
    // Client-side quick check
    if (fishCount < 0) {
      setValidationError('Fish count cannot be negative.');
      return;
    }
    if (avgWeightG < 0) {
      setValidationError('Average weight cannot be negative.');
      return;
    }
    if (feedingRatePct < 0 || feedingRatePct > 15) {
      setValidationError('Feeding rate must be between 0% and 15%.');
      return;
    }
    if (feedPricePerKg < 0) {
      setValidationError('Feed price cannot be negative.');
      return;
    }
    setValidationError(null);

    calculateFeedingEstimate({
      fish_count: fishCount,
      avg_weight_g: avgWeightG,
      feeding_rate_pct: feedingRatePct,
      feed_price_per_kg: feedPricePerKg,
    })
      .then((res) => setCalcResult(res))
      .catch((err) => setValidationError(err.message));
  }, [fishCount, avgWeightG, feedingRatePct, feedPricePerKg]);

  // Preset Loaders
  const applyPreset = (preset: 'tilapia' | 'shrimp' | 'fingerlings') => {
    if (preset === 'tilapia') {
      setPondId('pond-01');
      setFishCount(12000);
      setAvgWeightG(80.0);
      setFeedingRatePct(2.5);
      setFeedPricePerKg(68.0);
    } else if (preset === 'shrimp') {
      setPondId('pond-02');
      setFishCount(35000);
      setAvgWeightG(18.5);
      setFeedingRatePct(3.8);
      setFeedPricePerKg(92.0);
    } else if (preset === 'fingerlings') {
      setPondId('pond-04');
      setFishCount(50000);
      setAvgWeightG(4.5);
      setFeedingRatePct(5.0);
      setFeedPricePerKg(110.0);
    }
  };

  const handleResetForm = () => {
    setFishCount(1000);
    setAvgWeightG(50.0);
    setFeedingRatePct(2.0);
    setFeedPricePerKg(60.0);
    setNotes('');
  };

  const handleSaveToHistory = async () => {
    setIsSaving(true);
    setSaveSuccess(null);
    try {
      const saved = await saveFeedingEstimate({
        pond_id: pondId,
        fish_count: fishCount,
        avg_weight_g: avgWeightG,
        feeding_rate_pct: feedingRatePct,
        feed_price_per_kg: feedPricePerKg,
        notes: notes || 'Manual estimate recorded from UI',
      });
      setHistory([saved, ...history]);
      setSaveSuccess('Feeding estimate successfully recorded to telemetry history!');
      setTimeout(() => setSaveSuccess(null), 4000);
      onRefreshPonds();
    } catch (err: any) {
      setValidationError(err.message || 'Failed to save estimate');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-12">
      {/* Header Section with SRS Presets */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs uppercase px-2.5 py-0.5 rounded bg-cyan-500/15 text-cyan-400 font-bold border border-cyan-500/30">
                AquaSmart Model v1.0
              </span>
              <span className="text-slate-500 font-mono text-xs">/</span>
              <span className="font-mono text-xs text-emerald-400 font-semibold">Bioenergetic Ration Optimizer</span>
            </div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight">
              Pond Feeding & Cost Optimizer
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Calculate exact daily feed rations and commercial cost projections based on biomass and growth stage — preventing overfeeding, water pollution, and feed waste.
            </p>
          </div>

          {/* Quick-loader Presets */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-slate-400 mr-1">QUICK PRESETS:</span>
            <button
              onClick={() => applyPreset('tilapia')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-medium transition-colors"
              title="Load Tilapia parameters"
            >
              Pond 1: Tilapia
            </button>
            <button
              onClick={() => applyPreset('shrimp')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 text-xs font-medium transition-colors"
              title="Load Shrimp parameters"
            >
              Pond 2: Shrimp
            </button>
            <button
              onClick={() => applyPreset('fingerlings')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-medium transition-colors"
              title="Load Nursery Fingerlings parameters"
            >
              Pen 4: Nursery
            </button>
            <button
              onClick={handleResetForm}
              className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Reset Form to Defaults"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Biological Advisory Banner */}
        <div className="flex items-center justify-between flex-wrap gap-2 p-3.5 rounded-xl bg-[#0b132b] border border-cyan-500/20 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Info className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              <strong className="text-cyan-400">Biological Guidance:</strong> Feeding rates are calculated against total fish biomass. Always inspect water temperature and dissolved oxygen before feeding — fish digestion decreases significantly if water oxygen drops below 4.0 mg/L.
            </span>
          </div>
        </div>
      </div>

      {/* Two-Column Interactive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form & Telemetry Vector Input */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <div className="bg-[#131a33] border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <h2 className="font-display font-bold text-base text-white">Pond Parameters & Feed Vector</h2>
              </div>
              <span className="font-mono text-[10px] uppercase text-emerald-400 font-bold bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/30">
                Live Sync: Active
              </span>
            </div>

            {/* Error Banner */}
            {validationError && (
              <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {/* 1. Target Pond */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-xs font-semibold text-slate-300 uppercase">
                1. Target Pond Basin
              </label>
              <select
                value={pondId}
                onChange={(e) => setPondId(e.target.value)}
                className="w-full bg-[#0b132b] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-cyan-400 transition-colors"
              >
                {ponds.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#0b132b]">
                    {p.name} ({p.species})
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Fish Population Count (FR-02) */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="font-mono text-xs font-semibold text-slate-300 uppercase">
                  2. Fish Population Count (FR-02)
                </label>
                <span className="font-mono text-[10px] text-slate-400">Integer ≥ 0</span>
              </div>
              <input
                type="number"
                min="0"
                step="1"
                value={fishCount}
                onChange={(e) => setFishCount(parseInt(e.target.value) || 0)}
                className="w-full bg-[#0b132b] border border-slate-700 rounded-lg px-3 py-2 font-mono text-sm text-white outline-none focus:border-cyan-400 transition-colors"
                placeholder="e.g. 12000"
              />
            </div>

            {/* 3. Average Fish Weight (g) (FR-03) */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="font-mono text-xs font-semibold text-slate-300 uppercase">
                  3. Average Fish Weight (grams)
                </label>
                <span className="font-mono text-[10px] text-slate-400">Decimal (g)</span>
              </div>
              <input
                type="number"
                min="0"
                step="0.1"
                value={avgWeightG}
                onChange={(e) => setAvgWeightG(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#0b132b] border border-slate-700 rounded-lg px-3 py-2 font-mono text-sm text-white outline-none focus:border-cyan-400 transition-colors"
                placeholder="e.g. 80.0"
              />
            </div>

            {/* 4. Feeding Rate % of Biomass (FR-04) */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="font-mono text-xs font-semibold text-slate-300 uppercase">
                  4. Daily Feeding Rate (% of Biomass)
                </label>
                <span className="font-mono text-xs font-bold text-cyan-400">
                  {feedingRatePct.toFixed(1)}% / day
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="15"
                step="0.1"
                value={feedingRatePct}
                onChange={(e) => setFeedingRatePct(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>0% Maintenance</span>
                <span>2.5% Standard</span>
                <span>5.0% Rapid</span>
                <span>15.0% Max Cap</span>
              </div>
            </div>

            {/* 5. Feed Unit Price per kg */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="font-mono text-xs font-semibold text-slate-300 uppercase">
                  5. Feed Unit Price (₹ / kg)
                </label>
                <span className="font-mono text-[10px] text-slate-400">INR per kg</span>
              </div>
              <input
                type="number"
                min="0"
                step="0.5"
                value={feedPricePerKg}
                onChange={(e) => setFeedPricePerKg(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#0b132b] border border-slate-700 rounded-lg px-3 py-2 font-mono text-sm text-white outline-none focus:border-cyan-400 transition-colors"
                placeholder="e.g. 68.0"
              />
            </div>

            {/* Notes */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-xs font-semibold text-slate-300 uppercase">
                Notes & Field Observations
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Morning pellet feed ration, observed high appetite"
                className="w-full bg-[#0b132b] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-cyan-400"
              />
            </div>

            {/* Save Action */}
            <button
              onClick={handleSaveToHistory}
              disabled={isSaving || !!validationError}
              className="mt-2 w-full py-2.5 px-4 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm flex items-center justify-center gap-2 shadow-[0_0_16px_rgba(6,182,212,0.3)] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <ButtonLoader loading={isSaving} spinnerColor="border-slate-900">
                <Save className="w-4 h-4" />
                <span>Record Estimate to Pond History</span>
              </ButtonLoader>
            </button>

            {saveSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2 animate-pulse">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-medium">{saveSuccess}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Simulation & Telemetry Readouts */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <div className="bg-[#131a33] border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-emerald-400">
                <Sparkles className="w-4 h-4" />
                <h2 className="font-display font-bold text-base text-white">Calculated Feeding Optimization</h2>
              </div>
              <span className="font-mono text-xs text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">Realtime Dynamic</span>
            </div>

            {/* 4 Big Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Metric 1: Biomass */}
              <div className="p-4 rounded-xl bg-[#0b132b] border border-slate-800 flex flex-col justify-between hover:border-emerald-500/40 transition-colors">
                <div className="text-slate-400 text-xs font-mono flex items-center justify-between">
                  <span>TOTAL BIOMASS</span>
                  <Scale className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="my-2">
                  <div className="font-mono font-bold text-2xl text-emerald-400">
                    {calcResult ? calcResult.display_biomass_kg : '0.00 kg'}
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 mt-1">
                    = ({fishCount.toLocaleString()} fish × {avgWeightG}g) ÷ 1,000
                  </div>
                </div>
              </div>

              {/* Metric 2: Daily Feed */}
              <div className="p-4 rounded-xl bg-[#0b132b] border border-slate-800 flex flex-col justify-between hover:border-cyan-500/40 transition-colors">
                <div className="text-slate-400 text-xs font-mono flex items-center justify-between">
                  <span>DAILY FEED QUANTITY</span>
                  <Utensils className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="my-2">
                  <div className="font-mono font-bold text-2xl text-cyan-400">
                    {calcResult ? calcResult.display_daily_feed_kg : '0.00 kg/day'}
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 mt-1">
                    = Biomass × {feedingRatePct}% daily rate
                  </div>
                </div>
              </div>

              {/* Metric 3: Daily Cost */}
              <div className="p-4 rounded-xl bg-[#0b132b] border border-slate-800 flex flex-col justify-between hover:border-amber-500/40 transition-colors">
                <div className="text-slate-400 text-xs font-mono flex items-center justify-between">
                  <span>DAILY FEED COST</span>
                  <IndianRupee className="w-4 h-4 text-amber-400" />
                </div>
                <div className="my-2">
                  <div className="font-mono font-bold text-2xl text-amber-400">
                    {calcResult ? calcResult.display_daily_cost : '₹0.00'}
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 mt-1">
                    = Daily Feed × ₹{feedPricePerKg}/kg
                  </div>
                </div>
              </div>

              {/* Metric 4: 30-Day Cost Projection */}
              <div className="p-4 rounded-xl bg-[#0b132b] border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-colors">
                <div className="text-slate-400 text-xs font-mono flex items-center justify-between">
                  <span>30-DAY BUDGET</span>
                  <Calendar className="w-4 h-4 text-slate-300" />
                </div>
                <div className="my-2">
                  <div className="font-mono font-bold text-2xl text-white">
                    {calcResult ? calcResult.display_cost_30_days : '₹0.00'}
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 mt-1">
                    = Daily Cost × 30 days
                  </div>
                </div>
              </div>
            </div>

            {/* Practical Real-World Feeding Schedule Breakdown */}
            {calcResult && (
              <div className="p-4 rounded-xl bg-[#0b132b] border border-cyan-500/30 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-cyan-300 flex items-center gap-1.5">
                    <Utensils className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Recommended Daily Feeding Schedule</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">2-Session Standard</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                    <div className="text-[11px] text-slate-400 font-semibold">Morning Session (08:00 AM)</div>
                    <div className="text-sm font-bold font-mono text-cyan-400 mt-0.5">
                      {(calcResult.daily_feed_kg * 0.5).toFixed(2)} kg
                    </div>
                    <div className="text-[10px] text-slate-500">50% daily ration</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                    <div className="text-[11px] text-slate-400 font-semibold">Evening Session (05:00 PM)</div>
                    <div className="text-sm font-bold font-mono text-emerald-400 mt-0.5">
                      {(calcResult.daily_feed_kg * 0.5).toFixed(2)} kg
                    </div>
                    <div className="text-[10px] text-slate-500">50% daily ration</div>
                  </div>
                </div>
              </div>
            )}

            {/* Warnings list */}
            {calcResult && calcResult.warnings.length > 0 && (
              <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs flex flex-col gap-1">
                {calcResult.warnings.map((w, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                    <span>{w}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Estimate Identification Stamp */}
            <div className="p-3 rounded-lg bg-[#0b132b] border border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">STATUS:</span>
              <span className="text-emerald-400 font-semibold">Live Reactive Bio-Calculation</span>
            </div>
          </div>

          {/* Recent Saved History */}
          <div className="bg-[#131a33] border border-slate-800 rounded-xl p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-slate-300 font-medium text-sm">
                <History className="w-4 h-4 text-cyan-400" />
                <span>Recent Estimates for {pondId}</span>
              </div>
              <span className="font-mono text-xs text-slate-400">{history.length} records</span>
            </div>

            <div className="flex flex-col gap-2 mt-3 max-h-56 overflow-y-auto">
              {history.length === 0 ? (
                <div className="text-center text-slate-500 font-mono text-xs py-4">
                  No saved estimate records found.
                </div>
              ) : (
                history.slice(0, 5).map((h) => (
                  <div
                    key={h.id}
                    className="p-2.5 rounded bg-[#0b132b] border border-slate-800/80 flex items-center justify-between text-xs font-mono"
                  >
                    <div>
                      <span className="text-white font-semibold">
                        {h.biomass_kg.toFixed(1)} kg Biomass
                      </span>
                      <span className="text-slate-500 mx-2">•</span>
                      <span className="text-cyan-400">{h.daily_feed_kg.toFixed(1)} kg feed</span>
                    </div>
                    <div className="text-right">
                      <div className="text-amber-400">₹{h.daily_cost.toFixed(1)}/d</div>
                      <div className="text-[10px] text-slate-500">
                        {new Date(h.recorded_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
