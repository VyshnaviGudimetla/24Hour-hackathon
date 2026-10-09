import React, { useState } from 'react';
import {
  Droplets,
  Thermometer,
  Activity,
  AlertTriangle,
  RotateCw,
  Wrench,
  Sliders,
  CheckCircle2,
  X,
  RefreshCw,
  Info,
  Utensils,
  ShieldCheck,
  Wind
} from 'lucide-react';
import { Pond, WaterReading, SensorThreshold } from '../types';
import { calibrateSensor, triggerSimulation, updatePondThresholds } from '../api';
import { ButtonLoader } from '../components/LoadingSpinner';

interface WaterQualityPageProps {
  ponds: Pond[];
  readings: WaterReading[];
  selectedPondId: string;
  onSelectPond: (id: string) => void;
  isSimulated: boolean;
  onRefreshData: () => void;
}

export const WaterQualityPage: React.FC<WaterQualityPageProps> = ({
  ponds,
  readings,
  selectedPondId,
  onSelectPond,
  isSimulated,
  onRefreshData,
}) => {
  const currentPondId = selectedPondId !== 'all' ? selectedPondId : 'pond-03';
  const currentPond = ponds.find((p) => p.id === currentPondId) || ponds[0];
  const currentReading = readings.find((r) => r.pond_id === currentPondId) || {
    id: 0,
    pond_id: currentPondId,
    temperature_c: 28.4,
    ph: 7.65,
    dissolved_oxygen_mg_l: currentPondId === 'pond-03' ? 2.85 : 6.8,
    salinity_ppt: currentPond?.species.toLowerCase().includes('shrimp') ? 18.0 : 0.2,
    ammonia_mg_l: currentPondId === 'pond-04' ? 0.062 : 0.018,
    source: 'simulated' as const,
    status: currentPondId === 'pond-03' ? 'critical' as const : 'optimal' as const,
    is_stale: false,
    recorded_at: new Date().toISOString(),
  };

  // Calibration Modal State
  const [showCalibrationModal, setShowCalibrationModal] = useState(false);
  const [calibSensor, setCalibSensor] = useState('ph');
  const [calibRefVal, setCalibRefVal] = useState<number>(7.0);
  const [calibRawVal, setCalibRawVal] = useState<number>(7.18);
  const [calibResult, setCalibResult] = useState<string | null>(null);
  const [calibError, setCalibError] = useState<string | null>(null);
  const [isCalibrating, setIsCalibrating] = useState(false);

  // Thresholds Modal State
  const [showThresholdsModal, setShowThresholdsModal] = useState(false);
  const [minDo, setMinDo] = useState<number>(5.0);
  const [minPh, setMinPh] = useState<number>(6.5);
  const [maxPh, setMaxPh] = useState<number>(8.5);
  const [minTemp, setMinTemp] = useState<number>(24.0);
  const [maxTemp, setMaxTemp] = useState<number>(32.0);
  const [thresholdSaved, setThresholdSaved] = useState(false);
  const [isSavingThresholds, setIsSavingThresholds] = useState(false);
  const [thresholdError, setThresholdError] = useState<string | null>(null);
  const [isSimulationTicking, setIsSimulationTicking] = useState(false);

  const handleRunCalibration = async () => {
    setIsCalibrating(true);
    setCalibError(null);
    setCalibResult(null);
    try {
      const res = await calibrateSensor({
        sensor_type: calibSensor,
        reference_value: calibRefVal,
        measured_raw_value: calibRawVal,
        notes: `Calibrated probe for ${currentPondId}`,
      });
      setCalibResult(
        `Calibrated! Applied offset ${res.offset_applied > 0 ? '+' : ''}${res.offset_applied} with ${res.tolerance_pct}% error.`
      );
      onRefreshData();
    } catch (err: any) {
      setCalibError(err.message || 'Calibration failed. Please check input values.');
    } finally {
      setIsCalibrating(false);
    }
  };

  const handleSaveThresholds = async () => {
    setIsSavingThresholds(true);
    setThresholdError(null);
    try {
      await updatePondThresholds(currentPondId, {
        min_do: minDo,
        min_ph: minPh,
        max_ph: maxPh,
        min_temp: minTemp,
        max_temp: maxTemp,
      });
      setThresholdSaved(true);
      setTimeout(() => {
        setThresholdSaved(false);
        setShowThresholdsModal(false);
      }, 1800);
      onRefreshData();
    } catch (err: any) {
      setThresholdError(err.message || 'Failed to update thresholds. Please try again.');
    } finally {
      setIsSavingThresholds(false);
    }
  };

  const handleSimulateTick = async () => {
    setIsSimulationTicking(true);
    try {
      await triggerSimulation();
      onRefreshData();
    } finally {
      setIsSimulationTicking(false);
    }
  };

  const doVal = currentReading.dissolved_oxygen_mg_l ?? 0;
  const isDoBreach = doVal < 4.0;
  const isAmmoniaHigh = (currentReading.ammonia_mg_l ?? 0) > 0.05;

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-12">
      {/* Simulation Banner (FR-08) */}
      <div className="w-full bg-[#131a33]/90 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold">
                FR-08 Telemetry Bridge
              </span>
              <span className="font-display font-bold text-sm text-white">
                {isSimulated ? 'SIMULATED DATA ENVIRONMENT' : 'VERIFIED HARDWARE SENSORS'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Continuous monitoring of multi-basin physical variables with species threshold checking.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCalibrationModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono transition-colors"
          >
            <Wrench className="w-3.5 h-3.5 text-cyan-400" />
            <span>CALIBRATE PROBE</span>
          </button>
          <button
            onClick={() => setShowThresholdsModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            <span>THRESHOLDS</span>
          </button>
          <button
            onClick={handleSimulateTick}
            disabled={isSimulationTicking}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/40 text-xs font-mono transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <ButtonLoader loading={isSimulationTicking} spinnerColor="border-cyan-400">
              <RefreshCw className={`w-3.5 h-3.5 ${isSimulationTicking ? 'hidden' : ''}`} />
              <span>SYNC TICK</span>
            </ButtonLoader>
          </button>
        </div>
      </div>

      {/* Page Title & Pond Switcher Navigation */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs mb-1">
            <Droplets className="w-4 h-4" />
            <span>AQUACULTURE TELEMETRY CORE // FR-05 & FR-06</span>
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">
            Water Quality Telemetry & Thresholds
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Realtime parameter readouts for {currentPond?.name || currentPondId}
          </p>
        </div>

        {/* Pond Selector Pill Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#0b132b] p-1.5 rounded-xl border border-slate-800">
          {ponds.map((p) => {
            const isSelected = p.id === currentPondId;
            const isCritical = p.id === 'pond-03';
            return (
              <button
                key={p.id}
                onClick={() => onSelectPond(p.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? isCritical
                      ? 'bg-rose-950/80 border border-rose-500/40 text-rose-300 font-bold shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                      : 'bg-cyan-500/20 border border-cyan-400/40 text-cyan-400 font-bold shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                {isCritical && <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping"></span>}
                <span>{p.name.split('-')[0].trim()}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stale Data Warning Banner if applicable */}
      {currentReading.is_stale && (
        <div className="p-3 rounded-lg bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Sensor Warning:</strong> Stale telemetry received. No fresh reading transmitted in over 15 minutes.
            </span>
          </div>
          <span className="font-mono text-[10px] text-amber-400 font-bold uppercase">DISCONNECTED</span>
        </div>
      )}

      {/* 5 High-Fidelity Gauge Cards Grid (FR-05) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Dissolved Oxygen */}
        <div
          className={`relative rounded-xl p-5 shadow-xl flex flex-col justify-between overflow-hidden border ${
            isDoBreach
              ? 'bg-[#1e1325] border-rose-500/50 shadow-[0_0_24px_rgba(244,63,94,0.25)]'
              : 'bg-[#131a33] border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`font-mono text-xs font-bold uppercase ${
                isDoBreach ? 'text-rose-400' : 'text-cyan-400'
              }`}
            >
              Dissolved O2
            </span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                isDoBreach
                  ? 'bg-rose-950/80 text-rose-300 border border-rose-500/40 animate-pulse'
                  : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
              }`}
            >
              {isDoBreach ? 'BREACH' : 'OPTIMAL'}
            </span>
          </div>

          <div className="my-4 text-center">
            <div
              className={`font-mono font-bold text-4xl ${
                isDoBreach ? 'text-rose-400' : 'text-cyan-400'
              }`}
            >
              {doVal.toFixed(2)}
            </div>
            <div className="text-xs text-slate-400 font-mono mt-1">mg / L (ppm)</div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>SAFE: &gt; 5.0 mg/L</span>
            <span>CRIT: &lt; 3.0</span>
          </div>
        </div>

        {/* Card 2: Water pH */}
        <div className="relative rounded-xl p-5 shadow-xl bg-[#131a33] border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold uppercase text-emerald-400">Water pH</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
              OPTIMAL
            </span>
          </div>

          <div className="my-4 text-center">
            <div className="font-mono font-bold text-4xl text-emerald-400">
              {(currentReading.ph ?? 7.65).toFixed(2)}
            </div>
            <div className="text-xs text-slate-400 font-mono mt-1">pH Acidity / Alkalinity</div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>TARGET: 6.5 - 8.5</span>
            <span>NEUTRAL: 7.0</span>
          </div>
        </div>

        {/* Card 3: Water Temperature */}
        <div className="relative rounded-xl p-5 shadow-xl bg-[#131a33] border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold uppercase text-slate-200">Temperature</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
              OPTIMAL
            </span>
          </div>

          <div className="my-4 text-center">
            <div className="font-mono font-bold text-4xl text-white">
              {(currentReading.temperature_c ?? 28.4).toFixed(1)}°
            </div>
            <div className="text-xs text-slate-400 font-mono mt-1">Celsius (°C)</div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>TARGET: 26° - 31°C</span>
            <span>THERMAL OK</span>
          </div>
        </div>

        {/* Card 4: Salinity */}
        <div className="relative rounded-xl p-5 shadow-xl bg-[#131a33] border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold uppercase text-slate-200">Salinity</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
              NORMAL
            </span>
          </div>

          <div className="my-4 text-center">
            <div className="font-mono font-bold text-4xl text-slate-200">
              {(currentReading.salinity_ppt ?? 0.2).toFixed(1)}
            </div>
            <div className="text-xs text-slate-400 font-mono mt-1">ppt (g/L)</div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>FRESH: &lt; 0.5</span>
            <span>BRACKISH: 15-25</span>
          </div>
        </div>

        {/* Card 5: Ammonia NH3/NH4 */}
        <div
          className={`relative rounded-xl p-5 shadow-xl flex flex-col justify-between border ${
            isAmmoniaHigh
              ? 'bg-[#1e1325] border-amber-500/50 shadow-[0_0_24px_rgba(245,158,11,0.2)]'
              : 'bg-[#131a33] border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`font-mono text-xs font-bold uppercase ${
                isAmmoniaHigh ? 'text-amber-400' : 'text-slate-200'
              }`}
            >
              Ammonia NH3
            </span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                isAmmoniaHigh
                  ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                  : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
              }`}
            >
              {isAmmoniaHigh ? 'ELEVATED' : 'SAFE'}
            </span>
          </div>

          <div className="my-4 text-center">
            <div
              className={`font-mono font-bold text-4xl ${
                isAmmoniaHigh ? 'text-amber-400' : 'text-slate-200'
              }`}
            >
              {(currentReading.ammonia_mg_l ?? 0.018).toFixed(3)}
            </div>
            <div className="text-xs text-slate-400 font-mono mt-1">mg / L (ppm)</div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>MAX CAP: 0.050</span>
            <span>TOXIC: &gt; 0.1</span>
          </div>
        </div>
      </div>

      {/* Feeding Adjustment Recommendation Based on Water Quality */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card A: Feeding Directive */}
        <div
          className={`p-5 rounded-xl border shadow-xl flex flex-col justify-between ${
            isDoBreach
              ? 'bg-[#1e1325] border-rose-500/50 shadow-[0_0_24px_rgba(244,63,94,0.2)]'
              : isAmmoniaHigh
              ? 'bg-[#201815] border-amber-500/50 shadow-[0_0_24px_rgba(245,158,11,0.2)]'
              : 'bg-[#131a33] border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
          }`}
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Utensils
                  className={`w-4 h-4 ${
                    isDoBreach ? 'text-rose-400' : isAmmoniaHigh ? 'text-amber-400' : 'text-emerald-400'
                  }`}
                />
                <h3 className="font-display font-bold text-base text-white">
                  Feeding Rate Adjustment Directive
                </h3>
              </div>
              <span
                className={`font-mono text-xs px-2.5 py-0.5 rounded font-bold uppercase ${
                  isDoBreach
                    ? 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                    : isAmmoniaHigh
                    ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                    : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                }`}
              >
                {isDoBreach ? 'REDUCE FEED -50%' : isAmmoniaHigh ? 'PAUSE FEED' : '100% FULL RATION'}
              </span>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <p className="text-sm text-slate-200 leading-relaxed font-medium">
                {isDoBreach
                  ? `Dissolved Oxygen in ${currentPond?.name} is critically low (${doVal.toFixed(2)} mg/L). Fish respiration is impaired; feeding now will induce biological stress and potential fish loss.`
                  : isAmmoniaHigh
                  ? `Ammonia is elevated in ${currentPond?.name} (${(currentReading.ammonia_mg_l ?? 0).toFixed(3)} mg/L). Pause feeding immediately to reduce metabolic excretion.`
                  : `All water parameters for ${currentPond?.name} are within optimal biological ranges. Fish appetite and nutrient uptake are peak.`}
              </p>
              <div className="p-3 rounded-lg bg-[#0b132b] border border-slate-800 mt-2 text-xs text-slate-300 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Recommended Feed Action:</span>
                  <span className="font-bold text-white">
                    {isDoBreach
                      ? `Feed ${(currentPond?.daily_feed_kg ? currentPond.daily_feed_kg * 0.5 : 0).toFixed(1)} kg/day (Cut 50%)`
                      : isAmmoniaHigh
                      ? 'Hold Feeding (0.0 kg/day)'
                      : `Feed ${(currentPond?.daily_feed_kg || 0).toFixed(1)} kg/day (Full 100%)`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Expected Biological Impact:</span>
                  <span className="text-slate-200">
                    {isDoBreach ? 'Conserves dissolved oxygen for fish survival' : isAmmoniaHigh ? 'Stops gill irritation & ammonia spike' : 'Maximized Daily Growth & FCR'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card B: Corrective Farm Action Plan */}
        <div className="p-5 rounded-xl bg-[#131a33] border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-cyan-400">
                <Wind className="w-4 h-4" />
                <h3 className="font-display font-bold text-base text-white">
                  Field Action & Aeration Protocol
                </h3>
              </div>
              <span className="font-mono text-xs text-slate-400">Standard SOP</span>
            </div>

            <div className="mt-4 flex flex-col gap-3 text-xs">
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[#0b132b] border border-slate-800">
                <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold font-mono shrink-0">
                  1
                </div>
                <div>
                  <span className="font-semibold text-white block">Mechanical Aeration</span>
                  <span className="text-slate-400 leading-snug">
                    {isDoBreach
                      ? 'Engage secondary paddlewheel aerators and check surface turbulence immediately.'
                      : 'Maintain standard nocturnal aeration schedule from 11:00 PM to 06:00 AM.'}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[#0b132b] border border-slate-800">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold font-mono shrink-0">
                  2
                </div>
                <div>
                  <span className="font-semibold text-white block">Water Exchange & Filtration</span>
                  <span className="text-slate-400 leading-snug">
                    {isAmmoniaHigh
                      ? 'Perform a 15-20% bottom-water siphon exchange to remove accumulated organic sediment.'
                      : 'Ensure intake screens are clear of detritus to maintain inflow volume.'}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[#0b132b] border border-slate-800">
                <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold font-mono shrink-0">
                  3
                </div>
                <div>
                  <span className="font-semibold text-white block">Sensor Verification</span>
                  <span className="text-slate-400 leading-snug">
                    Calibrate probes bi-weekly using certified reference buffers to maintain ±0.1 pH and ±0.2 mg/L DO precision.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calibration Modal */}
      {showCalibrationModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#131a33] border border-slate-700 rounded-xl p-6 max-w-md w-full shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-cyan-400">
                <Wrench className="w-5 h-5" />
                <h3 className="font-display font-bold text-lg text-white">Sensor Probe Calibration</h3>
              </div>
              <button
                onClick={() => setShowCalibrationModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Perform 2-point calibration against certified laboratory standard buffer (WQ-12).
            </p>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono text-slate-300 uppercase">Sensor Probe Type</label>
              <select
                value={calibSensor}
                onChange={(e) => setCalibSensor(e.target.value)}
                className="bg-[#0b132b] border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 outline-none"
              >
                <option value="ph">pH Electrode Probe</option>
                <option value="dissolved_oxygen">Dissolved Oxygen Galvanic/Optical Sensor</option>
                <option value="temperature">PT100 Temperature Probe</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono text-slate-300 uppercase">
                Reference Buffer Value (Certified Standard)
              </label>
              <input
                type="number"
                step="0.01"
                value={calibRefVal}
                onChange={(e) => setCalibRefVal(parseFloat(e.target.value) || 0)}
                className="bg-[#0b132b] border border-slate-700 rounded-lg p-2.5 text-xs font-mono text-white outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono text-slate-300 uppercase">
                Raw Instrument Measurement (Observed)
              </label>
              <input
                type="number"
                step="0.01"
                value={calibRawVal}
                onChange={(e) => setCalibRawVal(parseFloat(e.target.value) || 0)}
                className="bg-[#0b132b] border border-slate-700 rounded-lg p-2.5 text-xs font-mono text-white outline-none"
              />
            </div>

            {calibResult && (
              <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{calibResult}</span>
              </div>
            )}

            {calibError && (
              <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <X className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{calibError}</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowCalibrationModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-mono hover:bg-slate-700"
              >
                Close
              </button>
              <button
                onClick={handleRunCalibration}
                disabled={isCalibrating}
                className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-mono font-bold flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <ButtonLoader loading={isCalibrating} spinnerColor="border-slate-900">
                  <span>Calculate &amp; Save Offset</span>
                </ButtonLoader>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Thresholds Modal */}
      {showThresholdsModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#131a33] border border-slate-700 rounded-xl p-6 max-w-md w-full shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-emerald-400">
                <Sliders className="w-5 h-5" />
                <h3 className="font-display font-bold text-lg text-white">
                  Alert Thresholds for {currentPond?.name}
                </h3>
              </div>
              <button
                onClick={() => setShowThresholdsModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div>
                <label className="font-mono text-slate-300">Minimum Safe DO (mg/L):</label>
                <input
                  type="number"
                  step="0.1"
                  value={minDo}
                  onChange={(e) => setMinDo(parseFloat(e.target.value))}
                  className="w-full bg-[#0b132b] border border-slate-700 rounded-lg p-2 font-mono text-white mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-mono text-slate-300">Min pH:</label>
                  <input
                    type="number"
                    step="0.1"
                    value={minPh}
                    onChange={(e) => setMinPh(parseFloat(e.target.value))}
                    className="w-full bg-[#0b132b] border border-slate-700 rounded-lg p-2 font-mono text-white mt-1"
                  />
                </div>
                <div>
                  <label className="font-mono text-slate-300">Max pH:</label>
                  <input
                    type="number"
                    step="0.1"
                    value={maxPh}
                    onChange={(e) => setMaxPh(parseFloat(e.target.value))}
                    className="w-full bg-[#0b132b] border border-slate-700 rounded-lg p-2 font-mono text-white mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-mono text-slate-300">Min Temp (°C):</label>
                  <input
                    type="number"
                    step="0.5"
                    value={minTemp}
                    onChange={(e) => setMinTemp(parseFloat(e.target.value))}
                    className="w-full bg-[#0b132b] border border-slate-700 rounded-lg p-2 font-mono text-white mt-1"
                  />
                </div>
                <div>
                  <label className="font-mono text-slate-300">Max Temp (°C):</label>
                  <input
                    type="number"
                    step="0.5"
                    value={maxTemp}
                    onChange={(e) => setMaxTemp(parseFloat(e.target.value))}
                    className="w-full bg-[#0b132b] border border-slate-700 rounded-lg p-2 font-mono text-white mt-1"
                  />
                </div>
              </div>
            </div>

            {thresholdSaved && (
              <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Threshold limits updated successfully!</span>
              </div>
            )}

            {thresholdError && (
              <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-1.5">
                <X className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{thresholdError}</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowThresholdsModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-mono hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveThresholds}
                disabled={isSavingThresholds}
                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-bold flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <ButtonLoader loading={isSavingThresholds} spinnerColor="border-slate-900">
                  <span>Save Thresholds</span>
                </ButtonLoader>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
