import React, { useState, useEffect } from 'react';
import {
  Waves,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Scale,
  Utensils,
  Maximize2,
  AlertCircle,
  X,
  CheckCircle2,
  Box,
  Circle,
  Shapes
} from 'lucide-react';
import { Pond } from '../types';
import { getPonds, createPond, updatePond, deletePond, calculatePondVolume } from '../api';
import { ButtonLoader } from '../components/LoadingSpinner';

interface PondManagementPageProps {
  ponds: Pond[];
  onRefreshPonds: () => void;
}

export const PondManagementPage: React.FC<PondManagementPageProps> = ({
  ponds,
  onRefreshPonds,
}) => {
  const [search, setSearch] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState('all');

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPond, setEditingPond] = useState<Pond | null>(null);
  const [deletingPondId, setDeletingPondId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('Nile Tilapia');
  const [fishCount, setFishCount] = useState<number>(10000);
  const [avgWeightG, setAvgWeightG] = useState<number>(75.0);
  const [feedingRatePct, setFeedingRatePct] = useState<number>(2.5);
  const [feedPricePerKg, setFeedPricePerKg] = useState<number>(68.0);
  const [shape, setShape] = useState<'rectangular' | 'circular' | 'irregular'>('rectangular');
  const [lengthM, setLengthM] = useState<number>(30.0);
  const [widthM, setWidthM] = useState<number>(15.0);
  const [diameterM, setDiameterM] = useState<number>(20.0);
  const [surfaceAreaM2, setSurfaceAreaM2] = useState<number>(450.0);
  const [depthM, setDepthM] = useState<number>(1.8);
  const [previewVolumeM3, setPreviewVolumeM3] = useState<number>(0);

  // Update real-time volume preview
  useEffect(() => {
    try {
      calculatePondVolume({
        shape,
        length_m: lengthM,
        width_m: widthM,
        diameter_m: diameterM,
        surface_area_m2: surfaceAreaM2,
        depth_m: depthM,
      }).then((res) => setPreviewVolumeM3(res.volume_m3));
    } catch {
      // ignore
    }
  }, [shape, lengthM, widthM, diameterM, surfaceAreaM2, depthM]);

  const handleOpenAddModal = () => {
    setEditingPond(null);
    setName('');
    setSpecies('Nile Tilapia');
    setFishCount(10000);
    setAvgWeightG(75.0);
    setFeedingRatePct(2.5);
    setFeedPricePerKg(68.0);
    setShape('rectangular');
    setLengthM(30.0);
    setWidthM(15.0);
    setDepthM(1.8);
    setErrorMsg(null);
    setShowAddModal(true);
  };

  const handleOpenEditModal = (pond: Pond) => {
    setEditingPond(pond);
    setName(pond.name);
    setSpecies(pond.species);
    setFishCount(pond.fish_count);
    setAvgWeightG(pond.avg_weight_g);
    setFeedingRatePct(pond.feeding_rate_pct);
    setFeedPricePerKg(pond.feed_price_per_kg);
    setShape(pond.shape);
    setLengthM(pond.length_m || 30.0);
    setWidthM(pond.width_m || 15.0);
    setDiameterM(pond.diameter_m || 20.0);
    setSurfaceAreaM2(pond.surface_area_m2 || 450.0);
    setDepthM(pond.depth_m || 1.8);
    setErrorMsg(null);
    setShowAddModal(true);
  };

  const handleSubmitPond = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Pond name is required.');
      return;
    }
    if (fishCount < 0) {
      setErrorMsg('Fish population cannot be negative.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const payload: any = {
        name: name.trim(),
        species,
        fish_count: fishCount,
        avg_weight_g: avgWeightG,
        feeding_rate_pct: feedingRatePct,
        feed_price_per_kg: feedPricePerKg,
        shape,
        depth_m: depthM,
        length_m: shape === 'rectangular' ? lengthM : undefined,
        width_m: shape === 'rectangular' ? widthM : undefined,
        diameter_m: shape === 'circular' ? diameterM : undefined,
        surface_area_m2: shape === 'irregular' ? surfaceAreaM2 : undefined,
      };

      if (editingPond) {
        await updatePond(editingPond.id, payload);
      } else {
        await createPond(payload);
      }

      setShowAddModal(false);
      onRefreshPonds();
    } catch (err: any) {
      setErrorMsg(err.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingPondId) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deletePond(deletingPondId);
      setDeletingPondId(null);
      onRefreshPonds();
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete pond. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered ponds
  const filteredPonds = ponds.filter((p) => {
    const matchesSearch =
      search === '' ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.species.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase());
    const matchesSpecies = speciesFilter === 'all' || p.species.toLowerCase().includes(speciesFilter.toLowerCase());
    return matchesSearch && matchesSpecies;
  });

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs mb-1">
            <Waves className="w-4 h-4" />
            <span>FACILITY INFRASTRUCTURE • BASIN MANAGER</span>
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">
            My Ponds & Basins
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Add, configure, and monitor commercial ponds with automated volume calculation and stocking density tracking.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-[0_0_16px_rgba(6,182,212,0.3)] transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Pond</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#131a33] p-3 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ponds by name or ID..."
            className="w-full bg-[#0b132b] border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={speciesFilter}
            onChange={(e) => setSpeciesFilter(e.target.value)}
            className="bg-[#0b132b] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300 outline-none"
          >
            <option value="all">All Species</option>
            <option value="tilapia">Nile Tilapia</option>
            <option value="shrimp">Vannamei Shrimp</option>
          </select>
        </div>
      </div>

      {/* Pond Fleet Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPonds.map((pond) => (
          <div
            key={pond.id}
            className="bg-[#131a33] border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between hover:border-cyan-500/30 transition-all group"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-[10px] text-slate-500 uppercase">{pond.id}</span>
                  <h3 className="font-display font-bold text-base text-white mt-0.5 group-hover:text-cyan-400 transition-colors">
                    {pond.name}
                  </h3>
                  <span className="text-xs text-cyan-400 font-medium">{pond.species}</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    pond.status === 'Optimal'
                      ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-500/30'
                      : pond.status === 'Caution'
                      ? 'bg-amber-950/70 text-amber-400 border border-amber-500/30'
                      : 'bg-rose-950/70 text-rose-400 border border-rose-500/30 animate-pulse'
                  }`}
                >
                  {pond.status}
                </span>
              </div>

              {/* Volume & Dimensions Pill */}
              <div className="my-3 p-2.5 rounded-lg bg-[#0b132b] border border-slate-800/80 font-mono text-[11px] flex items-center justify-between">
                <span className="text-slate-400 capitalize">Shape: {pond.shape}</span>
                <span className="text-white font-bold">{pond.volume_m3.toLocaleString()} m³</span>
                <span className="text-slate-400">({(pond.volume_litres).toLocaleString()} L)</span>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-2 font-mono text-xs my-3">
                <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                  <div className="text-[10px] text-slate-500">POPULATION</div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    {pond.fish_count.toLocaleString()} fish
                  </div>
                  <div className="text-[10px] text-slate-400">@{pond.avg_weight_g}g avg</div>
                </div>

                <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                  <div className="text-[10px] text-slate-500">BIOMASS</div>
                  <div className="text-sm font-bold text-emerald-400 mt-0.5">
                    {pond.biomass_kg.toLocaleString()} kg
                  </div>
                  <div className="text-[10px] text-cyan-400">{pond.daily_feed_kg.toFixed(1)} kg/d feed</div>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <div className="font-mono text-xs text-amber-400 font-semibold">
                ₹{pond.daily_cost.toFixed(0)}/day
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEditModal(pond)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                  title="Edit Pond"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeletingPondId(pond.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  title="Delete Pond"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Pond Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#131a33] border border-slate-700 rounded-xl p-6 max-w-lg w-full shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-display font-bold text-lg text-white">
                {editingPond ? `Edit ${editingPond.name}` : 'Add New Pond Basin'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmitPond} className="flex flex-col gap-3.5 text-xs">
              <div>
                <label className="font-mono text-slate-300 uppercase">Pond Identifier / Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Pond Epsilon (E-01) - Tilapia"
                  className="w-full bg-[#0b132b] border border-slate-700 rounded-lg p-2.5 text-sm text-white mt-1 outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="font-mono text-slate-300 uppercase">Species</label>
                <select
                  value={species}
                  onChange={(e) => setSpecies(e.target.value)}
                  className="w-full bg-[#0b132b] border border-slate-700 rounded-lg p-2.5 text-xs text-white mt-1 outline-none"
                >
                  <option value="Nile Tilapia">Nile Tilapia (Oreochromis niloticus)</option>
                  <option value="Vannamei Shrimp">Vannamei White Shrimp (Penaeus vannamei)</option>
                  <option value="Catfish">African Catfish (Clarias gariepinus)</option>
                  <option value="Common Carp">Common Carp (Cyprinus carpio)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono text-slate-300 uppercase">Fish Count (FR-02)</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={fishCount}
                    onChange={(e) => setFishCount(parseInt(e.target.value) || 0)}
                    className="w-full bg-[#0b132b] border border-slate-700 rounded-lg p-2 font-mono text-white mt-1"
                  />
                </div>
                <div>
                  <label className="font-mono text-slate-300 uppercase">Avg Weight (g)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={avgWeightG}
                    onChange={(e) => setAvgWeightG(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#0b132b] border border-slate-700 rounded-lg p-2 font-mono text-white mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono text-slate-300 uppercase">Feeding Rate (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="15"
                    step="0.1"
                    value={feedingRatePct}
                    onChange={(e) => setFeedingRatePct(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#0b132b] border border-slate-700 rounded-lg p-2 font-mono text-white mt-1"
                  />
                </div>
                <div>
                  <label className="font-mono text-slate-300 uppercase">Feed Price (₹/kg)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={feedPricePerKg}
                    onChange={(e) => setFeedPricePerKg(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#0b132b] border border-slate-700 rounded-lg p-2 font-mono text-white mt-1"
                  />
                </div>
              </div>

              {/* Geometry & Water Volume Form (VOL-01..10) */}
              <div className="p-3 rounded-lg bg-[#0b132b] border border-slate-800 flex flex-col gap-2 mt-1">
                <span className="font-mono text-[11px] text-cyan-400 font-bold uppercase">
                  Pond Geometry & Water-Volume Calculation (VOL-01..10)
                </span>

                <div className="flex gap-2 my-1">
                  {(['rectangular', 'circular', 'irregular'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setShape(s)}
                      className={`flex-1 py-1.5 px-2 rounded font-mono text-[11px] capitalize border ${
                        shape === s
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-400 font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                {shape === 'rectangular' && (
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400">Length (m):</span>
                      <input
                        type="number"
                        step="0.5"
                        value={lengthM}
                        onChange={(e) => setLengthM(parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1 font-mono text-white"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400">Width (m):</span>
                      <input
                        type="number"
                        step="0.5"
                        value={widthM}
                        onChange={(e) => setWidthM(parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1 font-mono text-white"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400">Depth (m):</span>
                      <input
                        type="number"
                        step="0.1"
                        value={depthM}
                        onChange={(e) => setDepthM(parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1 font-mono text-white"
                      />
                    </div>
                  </div>
                )}

                {shape === 'circular' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400">Diameter (m):</span>
                      <input
                        type="number"
                        step="0.5"
                        value={diameterM}
                        onChange={(e) => setDiameterM(parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1 font-mono text-white"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400">Depth (m):</span>
                      <input
                        type="number"
                        step="0.1"
                        value={depthM}
                        onChange={(e) => setDepthM(parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1 font-mono text-white"
                      />
                    </div>
                  </div>
                )}

                {shape === 'irregular' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400">Surface Area (m²):</span>
                      <input
                        type="number"
                        step="1"
                        value={surfaceAreaM2}
                        onChange={(e) => setSurfaceAreaM2(parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1 font-mono text-white"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400">Avg Depth (m):</span>
                      <input
                        type="number"
                        step="0.1"
                        value={depthM}
                        onChange={(e) => setDepthM(parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1 font-mono text-white"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] font-mono text-emerald-400 pt-1">
                  <span>Calculated Water Volume:</span>
                  <span className="font-bold">
                    {previewVolumeM3.toFixed(2)} m³ ({Math.round(previewVolumeM3 * 1000).toLocaleString()} L)
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <ButtonLoader loading={isSubmitting} spinnerColor="border-slate-900">
                    <span>{editingPond ? 'Save Changes' : 'Create Pond'}</span>
                  </ButtonLoader>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog (POND-12) */}
      {deletingPondId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#131a33] border border-rose-500/40 rounded-xl p-6 max-w-sm w-full shadow-2xl flex flex-col gap-4">
            <div className="flex items-center gap-2 text-rose-400">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <h3 className="font-display font-bold text-base text-white">Confirm Pond Deletion</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to delete pond <code className="text-rose-400">{deletingPondId}</code>? All associated historical feeding estimates, water telemetry records, and alerts will follow the cascade policy.
            </p>

            {deleteError && (
              <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => { setDeletingPondId(null); setDeleteError(null); }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-mono"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-bold flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <ButtonLoader loading={isDeleting} spinnerColor="border-white">
                  <span>Delete Pond</span>
                </ButtonLoader>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
