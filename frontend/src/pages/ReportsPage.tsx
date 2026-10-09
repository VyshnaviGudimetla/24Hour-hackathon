import React, { useState, useEffect } from 'react';
import {
  FileBarChart,
  Download,
  Filter,
  Calendar,
  AlertTriangle,
  CheckCircle,
  CheckCircle2,
  TrendingUp,
  FileSpreadsheet,
  Check,
  ChevronDown,
  RefreshCw
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { Pond, AlertRecord } from '../types';
import {
  getFeedingTrends,
  getWaterTrends,
  getExportFeedingCsvUrl,
  getExportWaterCsvUrl,
  getAlerts,
  acknowledgeAlert,
  resolveAlert
} from '../api';
import { ButtonLoader, Spinner } from '../components/LoadingSpinner';

interface ReportsPageProps {
  ponds: Pond[];
  selectedPondId: string;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ ponds, selectedPondId }) => {
  const [pondFilter, setPondFilter] = useState(selectedPondId || 'all');
  const [days, setDays] = useState(14);
  const [feedingTrends, setFeedingTrends] = useState<any[]>([]);
  const [waterTrends, setWaterTrends] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actioningAlertId, setActioningAlertId] = useState<{ id: number; action: 'ack' | 'resolve' } | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadReportsData();
  }, [pondFilter, days]);

  const loadReportsData = async () => {
    setIsLoading(true);
    try {
      const ft = await getFeedingTrends(pondFilter, days);
      setFeedingTrends(ft);
      const wt = await getWaterTrends(pondFilter, 30);
      setWaterTrends(wt);
      const al = await getAlerts(pondFilter);
      setAlerts(al);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcknowledge = async (id: number) => {
    setActioningAlertId({ id, action: 'ack' });
    try {
      await acknowledgeAlert(id);
      setActionSuccessMsg(`Alert #${id} has been acknowledged.`);
      setTimeout(() => setActionSuccessMsg(null), 4000);
      await loadReportsData();
    } catch (err: any) {
      console.error(err);
    } finally {
      setActioningAlertId(null);
    }
  };

  const handleResolve = async (id: number) => {
    setActioningAlertId({ id, action: 'resolve' });
    try {
      await resolveAlert(id);
      setActionSuccessMsg(`Alert #${id} has been resolved.`);
      setTimeout(() => setActionSuccessMsg(null), 4000);
      await loadReportsData();
    } catch (err: any) {
      console.error(err);
    } finally {
      setActioningAlertId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-12">
      {/* Header & CSV Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs mb-1">
            <FileBarChart className="w-4 h-4" />
            <span>FARM INTELLIGENCE & AUDIT RECORDS</span>
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">
            Historical Reports & Alerts
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Review feeding consumption trends, feed budget expenditures, sensor telemetry history, and export data as RFC-4180 CSV spreadsheets.
          </p>
        </div>

        {/* CSV Export & Refresh Buttons (REP-07 & REP-08) */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => loadReportsData()}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-mono transition-colors disabled:opacity-50"
            title="Refresh reports data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
            <span>Refresh</span>
          </button>

          <a
            href={getExportFeedingCsvUrl(pondFilter)}
            download="aquasmart_feeding_history.csv"
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono shadow-[0_0_12px_rgba(16,185,129,0.3)] transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export Feeding CSV</span>
          </a>

          <a
            href={getExportWaterCsvUrl(pondFilter)}
            download="aquasmart_water_telemetry.csv"
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono shadow-[0_0_12px_rgba(6,182,212,0.3)] transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Water CSV</span>
          </a>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#131a33] p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="text-xs font-mono text-slate-300">Pond Filter:</span>
          <select
            value={pondFilter}
            onChange={(e) => setPondFilter(e.target.value)}
            className="bg-[#0b132b] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none"
          >
            <option value="all">All Farm Basins</option>
            {ponds.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-xs">
          <span className="text-slate-400 mr-1">Time Horizon:</span>
          {[7, 14, 30].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 rounded-lg text-xs transition-colors font-semibold ${
                days === d
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/40 shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Last {d} Days
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
        <div className="p-4 rounded-xl bg-[#131a33] border border-slate-800 flex flex-col justify-between">
          <div className="text-slate-400 text-[11px]">AVG DAILY FEED (PERIOD)</div>
          <div className="text-2xl font-bold text-cyan-400 mt-1">
            {feedingTrends.length > 0
              ? (
                  feedingTrends.reduce((acc, curr) => acc + (curr.daily_feed_kg || 0), 0) /
                  feedingTrends.length
                ).toFixed(1)
              : '0.0'}{' '}
            <span className="text-xs text-slate-400 font-normal">kg/day</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Calculated across {days} days</div>
        </div>

        <div className="p-4 rounded-xl bg-[#131a33] border border-slate-800 flex flex-col justify-between">
          <div className="text-slate-400 text-[11px]">TOTAL PERIOD FEED EXPENDITURE</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">
            ₹
            {feedingTrends.length > 0
              ? feedingTrends
                  .reduce((acc, curr) => acc + (curr.daily_cost || 0), 0)
                  .toLocaleString(undefined, { maximumFractionDigits: 0 })
              : '0'}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Commercial feed costs</div>
        </div>

        <div className="p-4 rounded-xl bg-[#131a33] border border-slate-800 flex flex-col justify-between">
          <div className="text-slate-400 text-[11px]">LOGGED SENSOR ALERTS</div>
          <div className="text-2xl font-bold text-rose-400 mt-1">
            {alerts.length}{' '}
            <span className="text-xs text-slate-400 font-normal">
              ({alerts.filter((a) => !a.is_resolved).length} active)
            </span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Biological boundary thresholds</div>
        </div>
      </div>

      {/* Recharts Grid (REP-01 & REP-02) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Daily Feed Consumption & Biomass */}
        <div className="bg-[#131a33] border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-display font-bold text-base text-white">Daily Feed Consumption (kg/day)</h3>
            <span className="font-mono text-xs text-cyan-400 font-semibold">Feed Demand Series</span>
          </div>

          <div className="h-64 w-full mt-4">
            {isLoading ? (
              <div className="h-full flex flex-col items-center justify-center gap-2">
                <Spinner size="md" label="Loading consumption data..." />
              </div>
            ) : feedingTrends.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 font-mono text-xs">
                No feeding estimates recorded in this range.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={feedingTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#212942" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={10} unit=" kg" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0b132b',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Line
                    type="monotone"
                    dataKey="daily_feed_kg"
                    name="Daily Feed (kg)"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    dot={{ fill: '#06b6d4', r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 2: Daily Cost Trends */}
        <div className="bg-[#131a33] border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-display font-bold text-base text-white">Feed Cost Expenditure (₹)</h3>
            <span className="font-mono text-xs text-amber-400 font-semibold">Budget Series</span>
          </div>

          <div className="h-64 w-full mt-4">
            {isLoading ? (
              <div className="h-full flex flex-col items-center justify-center gap-2">
                <Spinner size="md" label="Loading expenditure data..." />
              </div>
            ) : feedingTrends.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 font-mono text-xs">
                No cost records available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={feedingTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#212942" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={10} unit=" ₹" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0b132b',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="daily_cost" name="Daily Cost (₹)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Historical Alerts Log Table */}
      <div className="bg-[#131a33] border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            <h3 className="font-display font-bold text-base text-white">System Alert History Log</h3>
          </div>
          <span className="font-mono text-xs text-slate-400">{alerts.length} Total Events</span>
        </div>

        {/* Action Success Feedback Banner */}
        {actionSuccessMsg && (
          <div className="mt-4 p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{actionSuccessMsg}</span>
            </div>
            <button
              onClick={() => setActionSuccessMsg(null)}
              className="text-slate-400 hover:text-white text-xs px-1"
            >
              &times;
            </button>
          </div>
        )}

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#0b132b] text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-2.5 px-3 rounded-l-lg">Severity</th>
                <th className="py-2.5 px-3">Pond</th>
                <th className="py-2.5 px-3">Parameter</th>
                <th className="py-2.5 px-3">Message</th>
                <th className="py-2.5 px-3">Triggered (UTC)</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right rounded-r-lg">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {isLoading && alerts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8">
                    <div className="flex justify-center">
                      <Spinner size="sm" label="Loading alerts..." />
                    </div>
                  </td>
                </tr>
              ) : alerts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-slate-500 font-mono">
                    No alert events recorded for this selection.
                  </td>
                </tr>
              ) : (
                alerts.map((alt) => (
                  <tr key={alt.id} className="hover:bg-slate-800/30">
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          alt.severity === 'critical'
                            ? 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                            : alt.severity === 'warning'
                            ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                            : 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40'
                        }`}
                      >
                        {alt.severity}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-white">{alt.pond_id}</td>
                    <td className="py-3 px-3 text-cyan-400">{alt.parameter}</td>
                    <td className="py-3 px-3 font-sans text-xs text-slate-200 max-w-xs">{alt.message}</td>
                    <td className="py-3 px-3 text-slate-400">
                      {new Date(alt.triggered_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`text-[10px] font-bold uppercase ${
                          alt.is_resolved
                            ? 'text-emerald-400'
                            : alt.is_acknowledged
                            ? 'text-amber-400'
                            : 'text-rose-400 animate-pulse'
                        }`}
                      >
                        {alt.is_resolved
                          ? 'Resolved'
                          : alt.is_acknowledged
                          ? 'Acknowledged'
                          : 'Triggered'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {!alt.is_resolved && (
                        <div className="flex items-center justify-end gap-1.5">
                          {!alt.is_acknowledged && (
                            <button
                              onClick={() => handleAcknowledge(alt.id)}
                              disabled={actioningAlertId?.id === alt.id}
                              className="px-2 py-1 rounded bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 text-[10px] disabled:opacity-50"
                            >
                              <ButtonLoader
                                loading={actioningAlertId?.id === alt.id && actioningAlertId.action === 'ack'}
                                size="xs"
                                text="Acking..."
                              >
                                Ack
                              </ButtonLoader>
                            </button>
                          )}
                          <button
                            onClick={() => handleResolve(alt.id)}
                            disabled={actioningAlertId?.id === alt.id}
                            className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-[10px] border border-emerald-500/30 disabled:opacity-50"
                          >
                            <ButtonLoader
                              loading={actioningAlertId?.id === alt.id && actioningAlertId.action === 'resolve'}
                              size="xs"
                              text="Resolving..."
                            >
                              Resolve
                            </ButtonLoader>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
