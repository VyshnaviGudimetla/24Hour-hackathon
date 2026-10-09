import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Filter,
  Download,
  Utensils,
  ScanEye,
  Droplets,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  RefreshCw,
  Scale,
  IndianRupee,
  Layers,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { Pond, FeedEstimate, FishDetection, AlertRecord, WaterReading } from '../types';
import {
  getFeedingHistory,
  getAiHistory,
  getAlerts,
  getLatestReadings,
  getExportFeedingCsvUrl,
  getExportWaterCsvUrl
} from '../api';
import { Spinner } from '../components/LoadingSpinner';

interface HistoryPageProps {
  ponds: Pond[];
  selectedPondId: string;
  onNavigateTab: (tab: string) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  ponds,
  selectedPondId,
  onNavigateTab,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'feeding' | 'ai' | 'alerts'>('feeding');
  const [pondFilter, setPondFilter] = useState<string>(selectedPondId || 'all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Data states
  const [feedingRecords, setFeedingRecords] = useState<FeedEstimate[]>([]);
  const [aiRecords, setAiRecords] = useState<FishDetection[]>([]);
  const [alertRecords, setAlertRecords] = useState<AlertRecord[]>([]);

  const loadHistoryData = async () => {
    setIsLoading(true);
    try {
      const [feedData, aiData, alertData] = await Promise.all([
        getFeedingHistory(pondFilter !== 'all' ? pondFilter : undefined).catch(() => []),
        getAiHistory(50).catch(() => []),
        getAlerts(pondFilter !== 'all' ? pondFilter : undefined).catch(() => []),
      ]);
      setFeedingRecords(feedData);
      setAiRecords(aiData);
      setAlertRecords(alertData);
    } catch (err) {
      console.error('Failed to load history data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistoryData();
  }, [pondFilter]);

  // Sync when navbar global filter changes
  useEffect(() => {
    if (selectedPondId) {
      setPondFilter(selectedPondId);
    }
  }, [selectedPondId]);

  // Filtering calculations
  const filteredFeeding = feedingRecords.filter((rec) => {
    const matchesPond = pondFilter === 'all' || rec.pond_id === pondFilter;
    const matchesSearch =
      searchQuery === '' ||
      rec.pond_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rec.notes && rec.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesPond && matchesSearch;
  });

  const filteredAi = aiRecords.filter((rec) => {
    const matchesPond = !rec.pond_id || pondFilter === 'all' || rec.pond_id === pondFilter;
    const matchesSearch =
      searchQuery === '' ||
      (rec.pond_id && rec.pond_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      rec.status.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPond && matchesSearch;
  });

  const filteredAlerts = alertRecords.filter((rec) => {
    const matchesPond = pondFilter === 'all' || rec.pond_id === pondFilter;
    const matchesSearch =
      searchQuery === '' ||
      rec.pond_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.parameter.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPond && matchesSearch;
  });

  // Aggregate stats
  const totalFeedAllocatedKg = feedingRecords.reduce((acc, r) => acc + (r.daily_feed_kg || 0), 0);
  const totalFeedExpenditure = feedingRecords.reduce((acc, r) => acc + (r.daily_cost || 0), 0);

  const getPondName = (id?: string) => {
    if (!id) return 'General';
    const pond = ponds.find((p) => p.id === id);
    return pond ? pond.name : id;
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs mb-1">
            <History className="w-4 h-4" />
            <span>AUDIT RECORDS & HISTORICAL TELEMETRY</span>
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">
            Pond Activity & Feeding History
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Browse complete historical logs of feed calculations, computer vision counts, and water sensor incidents.
          </p>
        </div>

        {/* CSV Export & Refresh */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={loadHistoryData}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-mono transition-colors"
            title="Refresh history"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
            <span>Refresh</span>
          </button>

          <a
            href={getExportFeedingCsvUrl(pondFilter !== 'all' ? pondFilter : undefined)}
            download="aquasmart_feeding_history.csv"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono shadow-[0_0_12px_rgba(16,185,129,0.3)] transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export Feed CSV</span>
          </a>

          <a
            href={getExportWaterCsvUrl(pondFilter !== 'all' ? pondFilter : undefined)}
            download="aquasmart_water_telemetry.csv"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono shadow-[0_0_12px_rgba(6,182,212,0.3)] transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export Water CSV</span>
          </a>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
        <div className="p-4 rounded-xl bg-[#131a33] border border-slate-800 flex flex-col justify-between hover:border-cyan-500/40 transition-colors">
          <div className="text-slate-400 text-[11px] flex items-center justify-between">
            <span>FEED RECORDS SAVED</span>
            <Utensils className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="my-2">
            <div className="font-display font-bold text-2xl text-white">
              {feedingRecords.length}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 font-sans">
              Logged feeding estimates
            </div>
          </div>
          <div className="text-[10px] text-cyan-400 pt-2 border-t border-slate-800">
            Across {ponds.length} registered ponds
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#131a33] border border-slate-800 flex flex-col justify-between hover:border-emerald-500/40 transition-colors">
          <div className="text-slate-400 text-[11px] flex items-center justify-between">
            <span>TOTAL FEED LOGGED</span>
            <Scale className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="my-2">
            <div className="font-display font-bold text-2xl text-emerald-400">
              {totalFeedAllocatedKg.toFixed(1)}{' '}
              <span className="text-xs font-normal text-slate-400">kg</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 font-sans">
              Cumulative ration quantity
            </div>
          </div>
          <div className="text-[10px] text-emerald-400 pt-2 border-t border-slate-800">
            Based on bioenergetic models
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#131a33] border border-slate-800 flex flex-col justify-between hover:border-amber-500/40 transition-colors">
          <div className="text-slate-400 text-[11px] flex items-center justify-between">
            <span>TOTAL FEED BUDGET</span>
            <IndianRupee className="w-4 h-4 text-amber-400" />
          </div>
          <div className="my-2">
            <div className="font-display font-bold text-2xl text-amber-400">
              ₹{totalFeedExpenditure.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 font-sans">
              Calculated purchase cost
            </div>
          </div>
          <div className="text-[10px] text-amber-400 pt-2 border-t border-slate-800">
            Avg pellet rate: ₹68 - ₹110/kg
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#131a33] border border-slate-800 flex flex-col justify-between hover:border-purple-500/40 transition-colors">
          <div className="text-slate-400 text-[11px] flex items-center justify-between">
            <span>AI SCANS CONDUCTED</span>
            <ScanEye className="w-4 h-4 text-purple-400" />
          </div>
          <div className="my-2">
            <div className="font-display font-bold text-2xl text-purple-300">
              {aiRecords.length}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 font-sans">
              Computer vision scans
            </div>
          </div>
          <div className="text-[10px] text-purple-400 pt-2 border-t border-slate-800">
            Contours & optical detection
          </div>
        </div>
      </div>

      {/* Filter and Tab Controller Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#131a33] p-4 rounded-xl border border-slate-800 shadow-md">
        {/* Sub-tab pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#0b132b] p-1.5 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveSubTab('feeding')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeSubTab === 'feeding'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Feeding Records ({filteredFeeding.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('ai')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeSubTab === 'ai'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <ScanEye className="w-3.5 h-3.5" />
            <span>AI Fish Scans ({filteredAi.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('alerts')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeSubTab === 'alerts'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Sensor Alerts ({filteredAlerts.length})</span>
          </button>
        </div>

        {/* Pond Filter & Keyword Search */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Pond Filter Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <select
              value={pondFilter}
              onChange={(e) => setPondFilter(e.target.value)}
              className="bg-[#0b132b] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none w-full sm:w-44"
            >
              <option value="all">All Ponds Fleet</option>
              {ponds.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by notes or ID..."
              className="w-full bg-[#0b132b] border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white outline-none focus:border-cyan-400"
            />
          </div>
        </div>
      </div>

      {/* SUB-TAB 1: FEEDING HISTORY TABLE */}
      {activeSubTab === 'feeding' && (
        <div className="bg-[#131a33] border border-slate-800 rounded-xl p-5 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="font-display font-bold text-base text-white">
                Feeding Calculation & Ration Log
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Every calculation saved from the Feeding Calculator is permanently recorded here.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('calculator')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 text-cyan-300 text-xs font-semibold transition-colors"
            >
              <span>New Estimate</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {isLoading ? (
            <div className="p-16 flex flex-col items-center justify-center">
              <Spinner size="lg" label="Loading feeding records..." />
            </div>
          ) : filteredFeeding.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center text-slate-400 gap-3">
              <Utensils className="w-10 h-10 text-slate-600" />
              <div className="font-semibold text-white text-sm">No Feeding Records Found</div>
              <p className="text-xs text-slate-400 max-w-sm">
                No feeding calculations match your current pond filter. Open the Feeding Calculator to compute and record your first estimate.
              </p>
              <button
                onClick={() => onNavigateTab('calculator')}
                className="mt-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
              >
                Open Feeding Calculator
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#0b132b] text-slate-400 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-3 rounded-l-lg">Date & Time</th>
                    <th className="py-3 px-3">Pond Basin</th>
                    <th className="py-3 px-3 text-right">Fish Count</th>
                    <th className="py-3 px-3 text-right">Avg Weight</th>
                    <th className="py-3 px-3 text-right">Biomass (kg)</th>
                    <th className="py-3 px-3 text-right">Feed (kg/d)</th>
                    <th className="py-3 px-3 text-right">Daily Cost</th>
                    <th className="py-3 px-3 rounded-r-lg">Field Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredFeeding.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                        <div className="text-white font-sans font-medium">
                          {new Date(rec.recorded_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {new Date(rec.recorded_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>

                      <td className="py-3 px-3 font-sans font-semibold text-white whitespace-nowrap">
                        {getPondName(rec.pond_id)}
                        <div className="text-[10px] font-mono text-slate-500 font-normal">
                          {rec.pond_id}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-right text-slate-200">
                        {rec.fish_count.toLocaleString()}
                      </td>

                      <td className="py-3 px-3 text-right text-slate-200">
                        {rec.avg_weight_g.toFixed(1)}g
                      </td>

                      <td className="py-3 px-3 text-right font-bold text-emerald-400">
                        {rec.biomass_kg.toLocaleString()} kg
                      </td>

                      <td className="py-3 px-3 text-right text-cyan-400 font-semibold">
                        {rec.daily_feed_kg.toFixed(1)} kg/d
                        <div className="text-[10px] text-slate-500 font-normal">
                          @{rec.feeding_rate_pct.toFixed(1)}%
                        </div>
                      </td>

                      <td className="py-3 px-3 text-right text-amber-400 font-bold whitespace-nowrap">
                        ₹{rec.daily_cost.toFixed(0)}
                        <div className="text-[10px] text-slate-500 font-normal">
                          ₹{rec.feed_price_per_kg}/kg
                        </div>
                      </td>

                      <td className="py-3 px-3 text-slate-300 font-sans text-xs max-w-xs truncate">
                        {rec.notes || <span className="text-slate-600 italic">No notes</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: AI FISH COUNTING SCANS */}
      {activeSubTab === 'ai' && (
        <div className="bg-[#131a33] border border-slate-800 rounded-xl p-5 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="font-display font-bold text-base text-white">
                Computer Vision Analysis History
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Past images analyzed by the optical contour detector with detected counts and operator confirmations.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('ai-vision')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/40 text-emerald-300 text-xs font-semibold transition-colors"
            >
              <span>Scan New Photo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {isLoading ? (
            <div className="p-16 flex flex-col items-center justify-center">
              <Spinner size="lg" label="Loading computer vision scans..." />
            </div>
          ) : filteredAi.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center text-slate-400 gap-3">
              <ScanEye className="w-10 h-10 text-slate-600" />
              <div className="font-semibold text-white text-sm">No AI Scan Records Found</div>
              <p className="text-xs text-slate-400 max-w-sm">
                No computer vision scans have been performed yet for this filter. Test the AI Fish Counter to populate this log.
              </p>
              <button
                onClick={() => onNavigateTab('ai-vision')}
                className="mt-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
              >
                Go to AI Fish Counter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
              {filteredAi.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-[#0b132b] border border-slate-800 flex flex-col justify-between hover:border-cyan-500/30 transition-all"
                >
                  <div>
                    {/* Header: Date & Status */}
                    <div className="flex items-center justify-between text-xs font-mono mb-2">
                      <span className="text-slate-400">
                        {new Date(item.created_at).toLocaleDateString()} •{' '}
                        {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          item.status === 'confirmed'
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                            : 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    {/* Image Preview */}
                    <div className="w-full h-40 rounded-lg overflow-hidden bg-black border border-slate-800 relative flex items-center justify-center mb-3">
                      <img
                        src={item.annotated_url || item.image_url}
                        alt="Detection Preview"
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 font-mono text-[10px] text-cyan-400 border border-slate-700">
                        {item.detected_count} Detected
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-3">
                      <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                        <div className="text-[10px] text-slate-500">POND BASIN</div>
                        <div className="font-bold text-white mt-0.5">
                          {getPondName(item.pond_id)}
                        </div>
                      </div>
                      <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                        <div className="text-[10px] text-slate-500">AI CONFIDENCE</div>
                        <div className="font-bold text-emerald-400 mt-0.5">
                          {(item.confidence_score * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Confirmed Count Pill */}
                  <div className="pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Final Count Applied:</span>
                    <span className="text-cyan-400 font-bold">
                      {item.confirmed_count ?? item.detected_count} fish
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: SENSOR ALERTS & INCIDENT LOG */}
      {activeSubTab === 'alerts' && (
        <div className="bg-[#131a33] border border-slate-800 rounded-xl p-5 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="font-display font-bold text-base text-white">
                Water Sensor Alerts & Safety Incidents
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Audit trail of water parameter threshold breaches and safety triggers.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('water-quality')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-400/40 text-rose-300 text-xs font-semibold transition-colors"
            >
              <span>Live Sensor Gauges</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {isLoading ? (
            <div className="p-16 flex flex-col items-center justify-center">
              <Spinner size="lg" label="Loading sensor incident records..." />
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center text-slate-400 gap-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              <div className="font-semibold text-white text-sm">No Alerts Recorded</div>
              <p className="text-xs text-slate-400 max-w-sm">
                All physical water parameters are healthy and within safe biological thresholds for this pond.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#0b132b] text-slate-400 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-3 rounded-l-lg">Triggered Time</th>
                    <th className="py-3 px-3">Pond Basin</th>
                    <th className="py-3 px-3">Parameter</th>
                    <th className="py-3 px-3">Severity</th>
                    <th className="py-3 px-3">Observed Value</th>
                    <th className="py-3 px-3">Threshold Limit</th>
                    <th className="py-3 px-3 rounded-r-lg">Resolution Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredAlerts.map((alt) => (
                    <tr key={alt.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                        <div className="text-white font-sans font-medium">
                          {new Date(alt.triggered_at).toLocaleDateString()}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {new Date(alt.triggered_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      <td className="py-3 px-3 font-sans font-semibold text-white">
                        {getPondName(alt.pond_id)}
                        <div className="text-[10px] font-mono text-slate-500 font-normal">
                          {alt.pond_id}
                        </div>
                      </td>

                      <td className="py-3 px-3 uppercase font-bold text-rose-400">
                        {alt.parameter}
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            alt.severity === 'critical'
                              ? 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                              : 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                          }`}
                        >
                          {alt.severity}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-white font-bold">
                        {alt.value}
                      </td>

                      <td className="py-3 px-3 text-slate-400">
                        {alt.threshold}
                      </td>

                      <td className="py-3 px-3">
                        {alt.is_resolved ? (
                          <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Resolved</span>
                          </span>
                        ) : (
                          <span className="text-rose-400 font-bold animate-pulse">
                            ● Active Breach
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
