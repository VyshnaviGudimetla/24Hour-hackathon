import {
  Pond,
  DashboardSummary,
  FeedingCalculationResult,
  PondVolumeResult,
  FeedEstimate,
  WaterReading,
  AlertRecord,
  FishDetection,
  SensorThreshold
} from '../types';

const API_BASE = '/api';

export async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    let errMsg = `Request failed: ${res.statusText} (${res.status})`;
    try {
      const errObj = await res.json();
      if (errObj.detail) {
        if (typeof errObj.detail === 'string') {
          errMsg = errObj.detail;
        } else if (Array.isArray(errObj.detail)) {
          errMsg = errObj.detail.map((e: any) => e.msg || e.message).join(', ');
        }
      }
    } catch {
      // ignore
    }
    throw new Error(errMsg);
  }
  return res.json();
}

// Dashboard
export const getDashboardSummary = () => fetchJson<DashboardSummary>(`${API_BASE}/reports/dashboard-summary`);
export const resetDemoData = () => fetchJson<{ status: string; message: string }>(`${API_BASE}/reset-demo-data`, { method: 'POST' });

// Ponds
export const getPonds = (search?: string, species?: string) => {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (species && species !== 'all') params.append('species', species);
  return fetchJson<Pond[]>(`${API_BASE}/ponds?${params.toString()}`);
};

export const createPond = (pond: Partial<Pond>) =>
  fetchJson<Pond>(`${API_BASE}/ponds`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pond),
  });

export const updatePond = (id: string, pond: Partial<Pond>) =>
  fetchJson<Pond>(`${API_BASE}/ponds/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pond),
  });

export const deletePond = async (id: string) => {
  const res = await fetch(`${API_BASE}/ponds/${id}`, { method: 'DELETE' });
  if (!res.ok && res.status !== 204) {
    throw new Error(`Failed to delete pond: ${res.statusText}`);
  }
  return true;
};

// Calculations
export const calculateFeedingEstimate = (inputs: {
  fish_count: number;
  avg_weight_g: number;
  feeding_rate_pct: number;
  feed_price_per_kg: number;
}) =>
  fetchJson<FeedingCalculationResult>(`${API_BASE}/feeding-estimate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(inputs),
  });

export const calculatePondVolume = (inputs: {
  shape: string;
  length_m?: number;
  width_m?: number;
  diameter_m?: number;
  surface_area_m2?: number;
  depth_m: number;
}) =>
  fetchJson<PondVolumeResult>(`${API_BASE}/volume-estimate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(inputs),
  });

export const saveFeedingEstimate = (estimate: {
  pond_id: string;
  fish_count: number;
  avg_weight_g: number;
  feeding_rate_pct: number;
  feed_price_per_kg: number;
  notes?: string;
}) =>
  fetchJson<FeedEstimate>(`${API_BASE}/feeding-history`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(estimate),
  });

export const getFeedingHistory = (pond_id?: string) => {
  const p = pond_id ? `?pond_id=${pond_id}` : '';
  return fetchJson<FeedEstimate[]>(`${API_BASE}/feeding-history${p}`);
};

// Sensors & Water Quality
export const getLatestReadings = () => fetchJson<WaterReading[]>(`${API_BASE}/sensors/latest`);

export const getPondReadings = (pond_id: string) =>
  fetchJson<WaterReading[]>(`${API_BASE}/sensors/readings/${pond_id}`);

export const recordReading = (reading: Partial<WaterReading>) =>
  fetchJson<WaterReading>(`${API_BASE}/sensors/readings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reading),
  });

export const calibrateSensor = (req: {
  sensor_type: string;
  reference_value: number;
  measured_raw_value: number;
  notes?: string;
}) =>
  fetchJson<{
    sensor_type: string;
    offset_applied: number;
    calibrated_value: number;
    reference_value: number;
    tolerance_pct: number;
    status: string;
    message: string;
  }>(`${API_BASE}/sensors/calibrate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });

export const triggerSimulation = () =>
  fetchJson<{ status: string; message: string }>(`${API_BASE}/sensors/simulate`, { method: 'POST' });

export const getPondThresholds = (pond_id: string) =>
  fetchJson<SensorThreshold>(`${API_BASE}/sensors/thresholds/${pond_id}`);

export const updatePondThresholds = (pond_id: string, update: Partial<SensorThreshold>) =>
  fetchJson<SensorThreshold>(`${API_BASE}/sensors/thresholds/${pond_id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(update),
  });

// AI Fish Counting
export const detectFishInImage = async (file: File, pond_id?: string) => {
  const formData = new FormData();
  formData.append('file', file);
  if (pond_id) formData.append('pond_id', pond_id);

  const res = await fetch(`${API_BASE}/ai/detect`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to detect fish.');
  }
  return res.json() as Promise<FishDetection>;
};

export const confirmFishCount = (detection_id: number, confirmed_count: number, apply_to_pond_id?: string) =>
  fetchJson<FishDetection>(`${API_BASE}/ai/confirm/${detection_id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ confirmed_count, apply_to_pond_id }),
  });

export const getAiEvaluation = () => fetchJson<any>(`${API_BASE}/ai/evaluation`);
export const getAiHistory = (limit = 50) =>
  fetchJson<FishDetection[]>(`${API_BASE}/ai/history?limit=${limit}`);

// Reports & Trends
export const getFeedingTrends = (pond_id?: string, days = 14) => {
  const p = new URLSearchParams();
  if (pond_id && pond_id !== 'all') p.append('pond_id', pond_id);
  p.append('days', days.toString());
  return fetchJson<any[]>(`${API_BASE}/reports/feeding-trends?${p.toString()}`);
};

export const getWaterTrends = (pond_id?: string, limit = 50) => {
  const p = new URLSearchParams();
  if (pond_id && pond_id !== 'all') p.append('pond_id', pond_id);
  p.append('limit', limit.toString());
  return fetchJson<any[]>(`${API_BASE}/reports/water-trends?${p.toString()}`);
};

export const getExportFeedingCsvUrl = (pondId?: string) =>
  `${API_BASE}/reports/export-feeding-csv${pondId && pondId !== 'all' ? `?pond_id=${pondId}` : ''}`;

export const getExportWaterCsvUrl = (pondId?: string) =>
  `${API_BASE}/reports/export-water-csv${pondId && pondId !== 'all' ? `?pond_id=${pondId}` : ''}`;

// Alerts
export const getAlerts = (pond_id?: string, unresolved_only = false) => {
  const p = new URLSearchParams();
  if (pond_id && pond_id !== 'all') p.append('pond_id', pond_id);
  if (unresolved_only) p.append('unresolved_only', 'true');
  return fetchJson<AlertRecord[]>(`${API_BASE}/alerts?${p.toString()}`);
};

export const acknowledgeAlert = (id: number) =>
  fetchJson<AlertRecord>(`${API_BASE}/alerts/${id}/acknowledge`, { method: 'PUT' });

export const resolveAlert = (id: number) =>
  fetchJson<AlertRecord>(`${API_BASE}/alerts/${id}/resolve`, { method: 'PUT' });
