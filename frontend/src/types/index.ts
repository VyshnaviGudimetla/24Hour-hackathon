export interface Pond {
  id: string;
  name: string;
  species: string;
  fish_count: number;
  avg_weight_g: number;
  feeding_rate_pct: number;
  feed_price_per_kg: number;
  shape: 'rectangular' | 'circular' | 'irregular';
  length_m?: number;
  width_m?: number;
  diameter_m?: number;
  surface_area_m2?: number;
  depth_m: number;
  volume_m3: number;
  volume_litres: number;
  biomass_kg: number;
  daily_feed_kg: number;
  daily_cost: number;
  cost_30_days: number;
  status: 'Optimal' | 'Caution' | 'Critical';
  is_demo: boolean;
  created_at: string;
  updated_at: string;
}

export interface FeedEstimate {
  id: number;
  pond_id: string;
  fish_count: number;
  avg_weight_g: number;
  feeding_rate_pct: number;
  feed_price_per_kg: number;
  biomass_kg: number;
  daily_feed_kg: number;
  daily_cost: number;
  cost_30_days: number;
  notes?: string;
  recorded_at: string;
}

export interface WaterReading {
  id: number;
  pond_id: string;
  temperature_c?: number;
  ph?: number;
  dissolved_oxygen_mg_l?: number;
  salinity_ppt?: number;
  ammonia_mg_l?: number;
  source: 'live' | 'simulated' | 'demo' | 'manual';
  status: 'optimal' | 'caution' | 'critical';
  is_stale: boolean;
  recorded_at: string;
}

export interface AlertRecord {
  id: number;
  pond_id: string;
  parameter: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  value: number;
  threshold: number;
  is_acknowledged: boolean;
  is_resolved: boolean;
  triggered_at: string;
  resolved_at?: string;
}

export interface FishBoundingBox {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  label: string;
}

export interface FishDetection {
  id: number;
  pond_id?: string;
  filename: string;
  image_url: string;
  annotated_url: string;
  detected_count: number;
  confirmed_count?: number;
  confidence_score: number;
  bounding_boxes: FishBoundingBox[];
  status: 'detected' | 'confirmed' | 'rejected';
  created_at: string;
  disclaimer: string;
}

export interface DashboardSummary {
  active_ponds_count: number;
  total_biomass_kg: number;
  daily_feed_kg: number;
  daily_cost: number;
  monthly_cost_estimate: number;
  optimal_ponds: number;
  caution_ponds: number;
  critical_ponds: number;
  active_alerts_count: number;
  backend_status: string;
  demo_mode: boolean;
  server_time: string;
}

export interface FeedingCalculationResult {
  fish_count: number;
  avg_weight_g: number;
  feeding_rate_pct: number;
  feed_price_per_kg: number;
  currency: string;
  biomass_kg: number;
  daily_feed_kg: number;
  daily_cost: number;
  cost_30_days: number;
  display_biomass_kg: string;
  display_daily_feed_kg: string;
  display_daily_cost: string;
  display_cost_30_days: string;
  warnings: string[];
  is_user_selected_estimate: boolean;
  disclaimer: string;
}

export interface PondVolumeResult {
  shape: string;
  volume_m3: number;
  volume_litres: number;
  volume_gallons: number;
  depth_m: number;
  warnings: string[];
  display_volume_m3: string;
  display_volume_litres: string;
  display_volume_gallons: string;
}

export interface SensorThreshold {
  id: number;
  pond_id: string;
  min_temp: number;
  max_temp: number;
  min_ph: number;
  max_ph: number;
  min_do: number;
  max_ammonia: number;
  min_salinity: number;
  max_salinity: number;
}
