import React from 'react';
import {
  LayoutDashboard,
  Calculator,
  Droplets,
  Waves,
  ScanEye,
  FileBarChart,
  History,
  Activity,
  X,
  HelpCircle
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
  onOpenGuide?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  onClose,
  onOpenGuide,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: '', desc: 'Farm overview & KPIs' },
    { id: 'calculator', label: 'Feeding Calculator', icon: Calculator, badge: '', desc: 'Calculate daily feed' },
    { id: 'water-quality', label: 'Water Quality', icon: Droplets, badge: 'Live', desc: 'Sensor monitoring' },
    { id: 'ponds', label: 'My Ponds', icon: Waves, badge: '', desc: 'Add & manage ponds' },
    { id: 'ai-vision', label: 'AI Fish Counter', icon: ScanEye, badge: 'AI', desc: 'Count fish from photos' },
    { id: 'reports', label: 'Reports & Alerts', icon: FileBarChart, badge: '', desc: 'Trends & CSV export' },
    { id: 'history', label: 'History & Logs', icon: History, badge: '', desc: 'Feed, AI & alert logs' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-[#0e172e] border-r border-slate-800/80 z-50 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col">
          {/* Logo Brand Header */}
          <div className="h-16 px-5 flex items-center justify-between bg-[#050d25] border-b border-slate-800/60">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.25)]">
                <Activity className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-lg text-cyan-400 tracking-tight leading-none">
                  AquaSmart
                </span>
                <span className="font-mono text-[10px] text-emerald-400 uppercase tracking-widest font-semibold mt-0.5">
                  Telemetry Core
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Section Label */}
          <div className="px-5 pt-6 pb-2">
            <span className="font-mono text-[11px] uppercase text-slate-400 tracking-wider font-semibold">
              Main Menu
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1 px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    onClose();
                  }}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg font-medium text-sm transition-all duration-150 ${
                    isActive
                      ? 'bg-slate-800/90 text-cyan-400 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.15)] font-semibold'
                      : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <div className="flex flex-col items-start min-w-0">
                      <span className="leading-tight">{item.label}</span>
                      <span className={`text-[10px] leading-tight mt-0.5 ${isActive ? 'text-cyan-400/60' : 'text-slate-500'}`}>
                        {item.desc}
                      </span>
                    </div>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded font-bold ${
                        item.badge === 'Live'
                          ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-400'
                          : 'bg-cyan-950/70 border border-cyan-500/40 text-cyan-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Guide Trigger */}
          {onOpenGuide && (
            <div className="px-3 pt-3">
              <button
                onClick={() => {
                  onOpenGuide();
                  onClose();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/40 border border-cyan-500/30 text-cyan-300 font-medium text-xs transition-colors"
              >
                <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Beginner Guide & Help</span>
              </button>
            </div>
          )}
        </div>

        {/* Runtime Diagnostics Footer */}
        <div className="p-4 bg-[#050d25] border-t border-slate-800/60 flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-400">CORE STATUS</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              99.98% UP
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-400 h-full w-[99.98%] rounded-full shadow-[0_0_8px_rgba(78,222,163,0.6)]"></div>
          </div>
          <div className="flex items-center justify-between text-slate-400 font-mono text-[10px] mt-1">
            <span>NODE: DELTA-09</span>
            <span>FASTAPI v1.0</span>
          </div>
        </div>
      </aside>
    </>
  );
};
