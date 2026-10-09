import React from 'react';
import {
  Menu,
  Bell,
  RefreshCw,
  Cpu,
  SlidersHorizontal,
  ChevronDown,
  UserCheck,
  HelpCircle
} from 'lucide-react';
import { Pond } from '../types';

interface NavbarProps {
  onOpenSidebar: () => void;
  isSimulated: boolean;
  onToggleSimulated: () => void;
  onTriggerSimulation: () => void;
  ponds: Pond[];
  selectedPondId: string;
  onSelectPond: (pondId: string) => void;
  activeAlertCount: number;
  onOpenAlerts: () => void;
  onOpenGuide: () => void;
  isSimulating?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSidebar,
  isSimulated,
  onToggleSimulated,
  onTriggerSimulation,
  ponds,
  selectedPondId,
  onSelectPond,
  activeAlertCount,
  onOpenAlerts,
  onOpenGuide,
  isSimulating = false,
}) => {
  return (
    <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-[#0a122a]/90 backdrop-blur-xl border-b border-slate-800/80 z-30 flex items-center justify-between px-4 sm:px-6">
      {/* Left Area: Mobile Menu & Location */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-slate-400 font-medium hidden sm:inline">LOC:</span>
          <span className="font-mono text-xs text-cyan-400 font-bold">DELTA BASIN</span>
          <span className="text-slate-600 hidden sm:inline">/</span>
          <span className="text-xs text-slate-300 hidden md:inline">OPERATIONS HUB</span>
        </div>

        {/* Backend & Simulation Status Pills */}
        <div className="hidden xl:flex items-center gap-2 ml-4">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#050d25] border border-emerald-500/20 text-emerald-400 font-mono text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold">FastAPI Core: Connected 8000</span>
          </div>

          <button
            onClick={onToggleSimulated}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border font-mono text-[11px] transition-colors ${
              isSimulated
                ? 'bg-amber-950/40 border-amber-500/40 text-amber-400 hover:bg-amber-950/60'
                : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400 hover:bg-emerald-950/60'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isSimulated ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
            <span>{isSimulated ? 'Simulation Mode: ON' : 'Live Hardware Mode'}</span>
          </button>
        </div>
      </div>

      {/* Right Area: Pond Switcher, Simulation Tick, Alert Bell & Profile */}
      <div className="flex items-center gap-3">
        {/* User Guide & Tour Trigger */}
        <button
          onClick={onOpenGuide}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 text-cyan-300 hover:text-white text-xs font-medium transition-all shadow-[0_0_10px_rgba(6,182,212,0.15)]"
          title="Open interactive beginner guide and glossary"
          aria-label="Open AquaSmart AI User Guide"
        >
          <HelpCircle className="w-4 h-4 text-cyan-400" />
          <span className="hidden sm:inline font-semibold">User Guide</span>
        </button>

        {/* Quick Simulation Drift Button */}
        {isSimulated && (
          <button
            onClick={onTriggerSimulation}
            disabled={isSimulating}
            title="Generate biological drift telemetry tick"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-cyan-400 text-xs font-mono transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin text-cyan-300' : ''}`} />
            <span>{isSimulating ? 'TICKING...' : 'TICK SENSORS'}</span>
          </button>
        )}

        {/* Global Pond Filter Selector */}
        <div className="relative flex items-center bg-[#131a33] border border-slate-700/80 rounded-lg px-2.5 py-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400 mr-2 shrink-0" />
          <select
            value={selectedPondId}
            onChange={(e) => onSelectPond(e.target.value)}
            className="bg-transparent text-slate-200 text-xs font-medium outline-hidden cursor-pointer pr-4 appearance-none"
          >
            <option value="all" className="bg-[#131a33] text-slate-200">
              All Fleet Ponds
            </option>
            {ponds.map((p) => (
              <option key={p.id} value={p.id} className="bg-[#131a33] text-slate-200">
                {p.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 text-slate-400 pointer-events-none absolute right-2" />
        </div>

        {/* Notifications Button */}
        <button
          onClick={onOpenAlerts}
          className="relative p-2 rounded-lg bg-[#131a33] border border-slate-700/80 hover:bg-slate-800 text-slate-300 transition-colors"
          title="Active System Alerts"
        >
          <Bell className="w-4 h-4" />
          {activeAlertCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-mono text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
              {activeAlertCount}
            </span>
          )}
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-2 pl-1 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center text-cyan-400 font-bold text-xs shadow-[0_0_8px_rgba(6,182,212,0.2)]">
            DA
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs text-slate-200 font-semibold leading-tight">Delta Agri</span>
            <span className="font-mono text-[10px] text-emerald-400 leading-tight">Supervisor</span>
          </div>
        </div>
      </div>
    </header>
  );
};
