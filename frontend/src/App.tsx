import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { DashboardPage } from './pages/DashboardPage';
import { FeedingCalculatorPage } from './pages/FeedingCalculatorPage';
import { WaterQualityPage } from './pages/WaterQualityPage';
import { PondManagementPage } from './pages/PondManagementPage';
import { FishCountingAiPage } from './pages/FishCountingAiPage';
import { ReportsPage } from './pages/ReportsPage';
import { HistoryPage } from './pages/HistoryPage';
import { HelpGuideModal } from './components/HelpGuideModal';
import { ToastContainer } from './components/Toast';
import { useToast } from './hooks/useToast';
import { Pond, WaterReading, DashboardSummary, AlertRecord } from './types';
import {
  getPonds,
  getLatestReadings,
  getDashboardSummary,
  getAlerts,
  resetDemoData,
  triggerSimulation,
  acknowledgeAlert,
  resolveAlert,
} from './api';
import { AlertTriangle, X } from 'lucide-react';
import { ButtonLoader } from './components/LoadingSpinner';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSimulated, setIsSimulated] = useState(true);

  // Global Data
  const [ponds, setPonds] = useState<Pond[]>([]);
  const [readings, setReadings] = useState<WaterReading[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);
  const [selectedPondId, setSelectedPondId] = useState<string>('all');
  const [showAlertsDrawer, setShowAlertsDrawer] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isResettingDemo, setIsResettingDemo] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [actioningAlertId, setActioningAlertId] = useState<{ id: number; action: 'ack' | 'resolve' } | null>(null);
  const toast = useToast();

  const loadAllData = async () => {
    try {
      const [pondsData, readingsData, summaryData, alertsData] = await Promise.all([
        getPonds(),
        getLatestReadings().catch(() => []),
        getDashboardSummary().catch(() => null),
        getAlerts().catch(() => []),
      ]);
      setPonds(pondsData);
      setReadings(readingsData);
      setSummary(summaryData);
      setAlerts(alertsData);
      setGlobalError(null);
    } catch (err: any) {
      console.error('Failed to load initial data:', err);
      setGlobalError('Backend connection failed. Please ensure the backend server is running and reachable.');
    }
  };

  useEffect(() => {
    loadAllData();
    const interval = setInterval(loadAllData, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleResetDemo = async () => {
    setIsResettingDemo(true);
    try {
      await resetDemoData();
      toast.success('Demo Data Restored', 'All pond data has been reset to the original baseline values.');
      loadAllData();
    } catch (err: any) {
      toast.error('Reset Failed', err.message || 'Could not restore demo data. Please try again.');
    } finally {
      setIsResettingDemo(false);
    }
  };

  const handleTriggerSimulation = async () => {
    setIsSimulating(true);
    try {
      await triggerSimulation();
      toast.info('Simulation Triggered', 'Biological telemetry drift has been applied across all ponds.');
      loadAllData();
    } catch (err: any) {
      toast.error('Simulation Error', err.message || 'Failed to trigger pond simulation.');
    } finally {
      setIsSimulating(false);
    }
  };

  const handleAcknowledgeAlert = async (id: number) => {
    setActioningAlertId({ id, action: 'ack' });
    try {
      await acknowledgeAlert(id);
      toast.success('Alert Acknowledged', 'The alert has been marked as seen.');
      loadAllData();
    } catch (err: any) {
      toast.error('Action Failed', err.message || 'Could not acknowledge alert.');
    } finally {
      setActioningAlertId(null);
    }
  };

  const handleResolveAlert = async (id: number) => {
    setActioningAlertId({ id, action: 'resolve' });
    try {
      await resolveAlert(id);
      toast.success('Alert Resolved', 'The alert has been cleared successfully.');
      loadAllData();
    } catch (err: any) {
      toast.error('Action Failed', err.message || 'Could not resolve alert.');
    } finally {
      setActioningAlertId(null);
    }
  };

  const unreadAlerts = alerts.filter((a) => !a.is_resolved);

  return (
    <div className="min-h-screen bg-[#0a122a] text-slate-100 flex flex-col font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenGuide={() => setShowGuideModal(true)}
      />

      {/* Main Container */}
      <div className="flex-1 lg:pl-72 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <Navbar
          onOpenSidebar={() => setIsSidebarOpen(true)}
          isSimulated={isSimulated}
          onToggleSimulated={() => setIsSimulated(!isSimulated)}
          onTriggerSimulation={handleTriggerSimulation}
          ponds={ponds}
          selectedPondId={selectedPondId}
          onSelectPond={setSelectedPondId}
          activeAlertCount={unreadAlerts.length}
          onOpenAlerts={() => setShowAlertsDrawer(true)}
          onOpenGuide={() => setShowGuideModal(true)}
          isSimulating={isSimulating}
        />

        {/* Global Toast Notification Container */}
        <ToastContainer toasts={toast.toasts} onDismiss={toast.dismiss} />

        {/* Main Page Area */}
        <main className="flex-1 pt-20 px-4 sm:px-6 lg:px-8">
          {globalError ? (
            <div className="p-6 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 max-w-lg mx-auto my-12 text-center flex flex-col items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-rose-400" />
              <h3 className="font-display font-bold text-white text-lg">Backend Communication Error</h3>
              <p className="text-xs text-rose-300 leading-relaxed">{globalError}</p>
              <button
                onClick={loadAllData}
                className="mt-2 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold"
              >
                Retry Connection
              </button>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardPage
                  summary={summary}
                  ponds={ponds}
                  readings={readings}
                  alerts={alerts}
                  isSimulated={isSimulated}
                  isResettingDemo={isResettingDemo}
                  actioningAlertId={actioningAlertId}
                  onResetDemo={handleResetDemo}
                  onNavigateTab={setActiveTab}
                  onAcknowledgeAlert={handleAcknowledgeAlert}
                  onOpenGuide={() => setShowGuideModal(true)}
                />
              )}

              {activeTab === 'calculator' && (
                <FeedingCalculatorPage
                  ponds={ponds}
                  selectedPondId={selectedPondId}
                  onRefreshPonds={loadAllData}
                />
              )}

              {activeTab === 'water-quality' && (
                <WaterQualityPage
                  ponds={ponds}
                  readings={readings}
                  selectedPondId={selectedPondId}
                  onSelectPond={setSelectedPondId}
                  isSimulated={isSimulated}
                  onRefreshData={loadAllData}
                />
              )}

              {activeTab === 'ponds' && (
                <PondManagementPage ponds={ponds} onRefreshPonds={loadAllData} />
              )}

              {activeTab === 'ai-vision' && (
                <FishCountingAiPage ponds={ponds} onRefreshPonds={loadAllData} />
              )}

              {activeTab === 'reports' && (
                <ReportsPage ponds={ponds} selectedPondId={selectedPondId} />
              )}

              {activeTab === 'history' && (
                <HistoryPage
                  ponds={ponds}
                  selectedPondId={selectedPondId}
                  onNavigateTab={setActiveTab}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Alerts Drawer Modal */}
      {showAlertsDrawer && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#131a33] border border-slate-700 rounded-xl p-6 max-w-lg w-full shadow-2xl flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-display font-bold text-lg text-white">
                  Active Telemetry Alerts ({unreadAlerts.length})
                </h3>
              </div>
              <button
                onClick={() => setShowAlertsDrawer(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-3 font-mono text-xs">
              {unreadAlerts.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  No active unresolved alerts at this time.
                </div>
              ) : (
                unreadAlerts.map((alt) => (
                  <div
                    key={alt.id}
                    className="p-3.5 rounded-lg bg-[#0b132b] border border-rose-500/30 flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-400 uppercase text-[11px]">
                        {alt.parameter} &bull; {alt.pond_id}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(alt.triggered_at).toLocaleTimeString()}
                      </span>
                    </div>

                    <p className="text-slate-300 font-sans text-xs leading-relaxed">{alt.message}</p>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-slate-400 text-[10px]">
                        Value: {alt.value} (Limit: {alt.threshold})
                      </span>
                      <div className="flex items-center gap-1.5">
                        {!alt.is_acknowledged && (
                          <button
                            onClick={() => handleAcknowledgeAlert(alt.id)}
                            disabled={actioningAlertId?.id === alt.id}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] disabled:opacity-50"
                          >
                            <ButtonLoader
                              loading={actioningAlertId?.id === alt.id && actioningAlertId.action === 'ack'}
                              size="xs"
                              text="Acking..."
                            >
                              Acknowledge
                            </ButtonLoader>
                          </button>
                        )}
                        <button
                          onClick={() => handleResolveAlert(alt.id)}
                          disabled={actioningAlertId?.id === alt.id}
                          className="px-2 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[10px] border border-emerald-500/30 font-bold disabled:opacity-50"
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
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowAlertsDrawer(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-mono text-xs hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Guide & Onboarding Modal */}
      <HelpGuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
        onNavigateTab={setActiveTab}
      />
    </div>
  );
}

export default App;
