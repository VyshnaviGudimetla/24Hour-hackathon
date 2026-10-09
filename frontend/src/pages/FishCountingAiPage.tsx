import React, { useState, useEffect } from 'react';
import {
  ScanEye,
  Upload,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Info,
  Layers,
  Award,
  Save,
  FileCheck,
  ChevronRight,
  X
} from 'lucide-react';
import { Pond, FishDetection } from '../types';
import { detectFishInImage, confirmFishCount, getAiEvaluation, getAiHistory } from '../api';
import { ButtonLoader, Spinner } from '../components/LoadingSpinner';

interface FishCountingAiPageProps {
  ponds: Pond[];
  onRefreshPonds: () => void;
}

export const FishCountingAiPage: React.FC<FishCountingAiPageProps> = ({
  ponds,
  onRefreshPonds,
}) => {
  const [selectedPondId, setSelectedPondId] = useState<string>(ponds[0]?.id || 'pond-01');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [detectionResult, setDetectionResult] = useState<FishDetection | null>(null);

  // Manual Override State
  const [manualCount, setManualCount] = useState<number>(0);
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmSuccess, setConfirmSuccess] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  // Evaluation Modal
  const [showEvalModal, setShowEvalModal] = useState(false);
  const [isLoadingEval, setIsLoadingEval] = useState(false);
  const [evalMetrics, setEvalMetrics] = useState<any>(null);

  // History
  const [history, setHistory] = useState<FishDetection[]>([]);

  useEffect(() => {
    getAiHistory()
      .then((h) => setHistory(h))
      .catch((err) => console.error(err));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    setErrorMsg(null);
    setDetectionResult(null);
  };

  // Generate synthetic sample image for testing
  const loadSampleImage = (scenario: 'school' | 'crowded' | 'nursery') => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dark water background
    ctx.fillStyle = '#0f2438';
    ctx.fillRect(0, 0, 400, 300);

    const fishCount = scenario === 'school' ? 8 : scenario === 'crowded' ? 22 : 14;

    // Draw bright fish silhouettes
    for (let i = 0; i < fishCount; i++) {
      ctx.save();
      const x = 40 + (i % 6) * 55 + (Math.random() * 20 - 10);
      const y = 45 + Math.floor(i / 6) * 65 + (Math.random() * 20 - 10);
      const angle = (Math.random() * 60 - 30) * (Math.PI / 180);

      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillStyle = scenario === 'crowded' ? '#e2f5f9' : '#d1f4fa';
      ctx.beginPath();
      ctx.ellipse(0, 0, 22, 8, 0, 0, 2 * Math.PI);
      ctx.fill();
      ctx.restore();
    }

    canvas.toBlob((blob) => {
      if (!blob) return;
      const sampleFile = new File([blob], `sample_${scenario}_pond.jpg`, { type: 'image/jpeg' });
      setFile(sampleFile);
      setPreviewUrl(URL.createObjectURL(sampleFile));
      setErrorMsg(null);
      setDetectionResult(null);
    }, 'image/jpeg');
  };

  const handleRunDetection = async () => {
    if (!file) {
      setErrorMsg('Please select or drop a pond image first.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);
    setConfirmSuccess(null);
    setConfirmError(null);

    try {
      const res = await detectFishInImage(file, selectedPondId);
      setDetectionResult(res);
      setManualCount(res.detected_count);
      setHistory([res, ...history]);
    } catch (err: any) {
      setErrorMsg(err.message || 'Detection failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmCount = async () => {
    if (!detectionResult) return;
    setIsConfirming(true);
    setConfirmError(null);
    setConfirmSuccess(null);
    try {
      const updated = await confirmFishCount(detectionResult.id, manualCount, selectedPondId);
      setDetectionResult(updated);
      setConfirmSuccess(
        `Count confirmed (${manualCount} fish) and applied to ${selectedPondId} biomass calculation!`
      );
      onRefreshPonds();
    } catch (err: any) {
      setConfirmError(err.message || 'Failed to confirm count');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleOpenEval = async () => {
    setShowEvalModal(true);
    if (!evalMetrics) {
      setIsLoadingEval(true);
      try {
        const res = await getAiEvaluation();
        setEvalMetrics(res);
      } catch (err: any) {
        console.error(err);
      } finally {
        setIsLoadingEval(false);
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-12">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs mb-1">
            <ScanEye className="w-4 h-4" />
            <span>AI COMPUTER VISION • CONTOUR & BLOB DETECTION</span>
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">
            Fish Counting & Population AI
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Detect and count fish in camera frames with computer vision, bounding boxes, and instant biomass synchronization.
          </p>
        </div>

        <button
          onClick={handleOpenEval}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-semibold transition-colors shrink-0 shadow-md"
        >
          <Award className="w-4 h-4 text-emerald-400" />
          <span>Model Accuracy Benchmark</span>
        </button>
      </div>

      {/* Biological Limitation Disclaimer */}
      <div className="p-3.5 rounded-lg bg-[#0b132b] border border-amber-500/30 text-xs text-slate-300 flex items-start gap-3">
        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-amber-400 uppercase font-mono text-[11px]">
            Biological Surface Sampling Notice:
          </span>
          <span className="text-slate-400">
            Detected count represents visible fish in the surface camera frame, not the entire depth of the pond. For total population census, multiply visible density by pond volume and stratification factor.
          </span>
        </div>
      </div>

      {/* Main Two-Column Analysis Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Upload & Sample Picker */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-[#131a33] border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col gap-4">
            <h3 className="font-display font-bold text-base text-white">Upload Pond Imagery</h3>

            {/* Target Pond Association */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-xs text-slate-300 uppercase">Target Pond Basin</label>
              <select
                value={selectedPondId}
                onChange={(e) => setSelectedPondId(e.target.value)}
                className="w-full bg-[#0b132b] border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 outline-none"
              >
                {ponds.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.fish_count.toLocaleString()} fish currently)
                  </option>
                ))}
              </select>
            </div>

            {/* Sample Images Quick Pick */}
            <div className="flex flex-col gap-1.5">
              <span className="font-mono text-xs text-slate-400 uppercase">Load Preset Test Images:</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => loadSampleImage('school')}
                  className="p-2 rounded bg-[#0b132b] hover:bg-slate-800 border border-slate-700 text-[11px] font-mono text-cyan-400 text-center transition-colors"
                >
                  Surface School
                </button>
                <button
                  type="button"
                  onClick={() => loadSampleImage('crowded')}
                  className="p-2 rounded bg-[#0b132b] hover:bg-slate-800 border border-slate-700 text-[11px] font-mono text-emerald-400 text-center transition-colors"
                >
                  Feeding Frenzy
                </button>
                <button
                  type="button"
                  onClick={() => loadSampleImage('nursery')}
                  className="p-2 rounded bg-[#0b132b] hover:bg-slate-800 border border-slate-700 text-[11px] font-mono text-amber-400 text-center transition-colors"
                >
                  Nursery Pen
                </button>
              </div>
            </div>

            {/* File Drag and Drop / Input Zone */}
            <div className="relative border-2 border-dashed border-slate-700 hover:border-cyan-400/60 rounded-xl p-6 flex flex-col items-center justify-center text-center bg-[#0b132b]/60 transition-colors">
              <Upload className="w-8 h-8 text-cyan-400 mb-2" />
              <p className="text-xs text-slate-200 font-medium">
                Drag and drop pond image here, or{' '}
                <span className="text-cyan-400 cursor-pointer underline">browse</span>
              </p>
              <p className="text-[10px] font-mono text-slate-500 mt-1">
                Supported: JPEG, PNG, WebP (Max 10MB)
              </p>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>

            {/* Error Banner */}
            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Preview & Action Button */}
            {previewUrl && (
              <div className="flex flex-col gap-2">
                <div className="w-full h-44 rounded-lg overflow-hidden border border-slate-700 bg-black flex items-center justify-center relative">
                  <img src={previewUrl} alt="Upload preview" className="w-full h-full object-contain" />
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 font-mono text-[10px] text-slate-300">
                    Input Image Preview
                  </span>
                </div>

                <button
                  onClick={handleRunDetection}
                  disabled={isProcessing}
                  className="w-full py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm font-mono flex items-center justify-center gap-2 shadow-[0_0_16px_rgba(6,182,212,0.3)] transition-all disabled:opacity-50"
                >
                  <ButtonLoader loading={isProcessing} text="Analyzing Contours & Blobs..." icon={<Sparkles className="w-4 h-4" />}>
                    Analyze Image with AI
                  </ButtonLoader>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Detection Results & Manual Confirmation */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {detectionResult ? (
            <div className="bg-[#131a33] border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-cyan-400">
                  <FileCheck className="w-5 h-5" />
                  <h3 className="font-display font-bold text-base text-white">Detection Output Vector</h3>
                </div>
                <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30 uppercase font-bold">
                  OpenCV Contours Active
                </span>
              </div>

              {/* Annotated Image View */}
              <div className="w-full h-72 rounded-xl overflow-hidden border border-slate-700 bg-black relative flex items-center justify-center shadow-inner">
                <img
                  src={detectionResult.annotated_url}
                  alt="Annotated detection output"
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-2 left-2 px-2 py-1 rounded bg-black/80 backdrop-blur-xs font-mono text-[10px] text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                  <span>ANNOTATED BOUNDING BOXES</span>
                </div>
              </div>

              {/* Metrics Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
                <div className="p-3 rounded-lg bg-[#0b132b] border border-slate-800">
                  <div className="text-[10px] text-slate-500">DETECTED COUNT</div>
                  <div className="text-2xl font-bold text-cyan-400 mt-1">
                    {detectionResult.detected_count} fish
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#0b132b] border border-slate-800">
                  <div className="text-[10px] text-slate-500">MEAN CONFIDENCE</div>
                  <div className="text-2xl font-bold text-emerald-400 mt-1">
                    {(detectionResult.confidence_score * 100).toFixed(1)}%
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#0b132b] border border-slate-800 col-span-2 sm:col-span-1">
                  <div className="text-[10px] text-slate-500">DETECTION STATUS</div>
                  <div className="text-sm font-bold text-white uppercase mt-2">
                    {detectionResult.status}
                  </div>
                </div>
              </div>

              {/* User Manual Correction & Confirmation (AI-09) */}
              <div className="p-4 rounded-xl bg-[#0b132b] border border-slate-800 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-white font-bold uppercase">
                    Operator Manual Verification (AI-09)
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Ground-Truth Override</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="w-full sm:w-48">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={manualCount}
                      onChange={(e) => setManualCount(parseInt(e.target.value) || 0)}
                      className="w-full bg-[#131a33] border border-slate-700 rounded-lg p-2 font-mono text-sm text-white"
                      placeholder="Confirmed count"
                    />
                  </div>

                  <button
                    onClick={handleConfirmCount}
                    disabled={isConfirming}
                    className="w-full sm:flex-1 py-2 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.3)] transition-all disabled:opacity-50"
                  >
                    <ButtonLoader loading={isConfirming} text="Applying Count..." icon={<Save className="w-3.5 h-3.5" />}>
                      Confirm & Apply Count to Pond
                    </ButtonLoader>
                  </button>
                </div>

                {confirmSuccess && (
                  <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{confirmSuccess}</span>
                  </div>
                )}

                {confirmError && (
                  <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{confirmError}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-[#131a33] border border-slate-800 rounded-xl p-6 sm:p-8 flex flex-col gap-6 shadow-xl">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                  <ScanEye className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-white text-base">How AI Fish Counting Works</h4>
                  <p className="text-xs text-slate-400">Follow these 3 simple steps to update your pond population</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-[#0b132b] border border-slate-800 flex flex-col gap-2">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 font-bold text-xs flex items-center justify-center font-mono">
                    1
                  </div>
                  <h5 className="font-bold text-white text-xs">Choose or Upload Photo</h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Upload an overhead pond photo, or click one of the preset sample buttons on the left (<strong className="text-cyan-400">Surface School</strong>, <strong className="text-emerald-400">Feeding Frenzy</strong>).
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#0b132b] border border-slate-800 flex flex-col gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center font-mono">
                    2
                  </div>
                  <h5 className="font-bold text-white text-xs">Run Computer Vision</h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Click <strong>Analyze Image with AI</strong>. The model detects fish silhouettes, draws green bounding boxes, and tallies the count.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#0b132b] border border-slate-800 flex flex-col gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center font-mono">
                    3
                  </div>
                  <h5 className="font-bold text-white text-xs">Review & Apply to Pond</h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Verify the count on the annotated preview. You can manually adjust the number before clicking <strong>Confirm & Apply</strong> to update biomass!
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-cyan-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>
                  Tip: Click <strong>"Surface School"</strong> on the left to immediately test AI detection with a pre-configured sample frame!
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Held-Out Evaluation Modal (AI-11 & AI-12) */}
      {showEvalModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#131a33] border border-slate-700 rounded-xl p-6 max-w-lg w-full shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-cyan-400">
                <Award className="w-5 h-5 text-emerald-400" />
                <h3 className="font-display font-bold text-lg text-white">
                  Held-Out Evaluation Benchmark (AI-11)
                </h3>
              </div>
              <button onClick={() => setShowEvalModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Performance measured against held-out labelled test images with ground-truth counting annotations.
            </p>

            {isLoadingEval && (
              <div className="py-12 flex justify-center">
                <Spinner size="md" label="Loading benchmark metrics..." />
              </div>
            )}

            {!isLoadingEval && evalMetrics && (
              <div className="flex flex-col gap-3 font-mono text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded bg-[#0b132b] border border-slate-800">
                    <div className="text-[10px] text-slate-500">PRECISION</div>
                    <div className="text-xl font-bold text-emerald-400 mt-1">
                      {(evalMetrics.precision * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="p-3 rounded bg-[#0b132b] border border-slate-800">
                    <div className="text-[10px] text-slate-500">RECALL</div>
                    <div className="text-xl font-bold text-cyan-400 mt-1">
                      {(evalMetrics.recall * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="p-3 rounded bg-[#0b132b] border border-slate-800">
                    <div className="text-[10px] text-slate-500">F1-SCORE</div>
                    <div className="text-xl font-bold text-white mt-1">
                      {(evalMetrics.f1_score * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="p-3 rounded bg-[#0b132b] border border-slate-800">
                    <div className="text-[10px] text-slate-500">MEAN ABS ERROR (MAE)</div>
                    <div className="text-xl font-bold text-amber-400 mt-1">
                      {evalMetrics.mean_absolute_error_mae} fish
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded bg-[#0b132b] border border-slate-800 flex flex-col gap-1 text-[11px]">
                  <span className="font-bold text-slate-300">Documented Operational Limitations:</span>
                  {evalMetrics.limitations.map((lim: string, idx: number) => (
                    <div key={idx} className="text-slate-400 flex items-start gap-1.5">
                      <span className="text-cyan-400">•</span>
                      <span>{lim}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowEvalModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-mono text-xs hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
