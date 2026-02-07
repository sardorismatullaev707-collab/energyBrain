// Configuration constants

export const CONFIG = {
  // Simulation parameters
  TOTAL_STEPS: 48,
  DT_HOURS: 0.25, // 15 minutes

  // Battery parameters
  BATTERY_EFFICIENCY: 0.95,
  
  // EV parameters
  EV_CHARGE_EFFICIENCY: 0.92,

  // HVAC parameters
  HVAC_MAX_POWER_KW: 3.5,
  HVAC_TEMP_DIFF_COEFFICIENT: 0.6, // kW per degree difference
  THERMAL_LEAK_RATE: 0.05,         // heat loss to outdoor
  THERMAL_CONTROL_RATE: 0.12,      // HVAC control effectiveness

  // Comfort constraints
  COMFORT_MIN_TEMP_C: 23.0,
  COMFORT_MAX_TEMP_C: 26.0,

  // Grid constraints and economics
  GRID_PENALTY_MULTIPLIER: 2.0, // $/kWh for exceeding grid import limit
  
  // Export/Import model (critical for realistic economics)
  EXPORT_ENABLED: false,           // Default: no export to grid
  FEED_IN_TARIFF_PER_KWH: 0.05,   // Feed-in tariff if export enabled (much lower than retail)
  ALLOW_BATTERY_EXPORT: false,     // Can battery discharge to grid?
  ALLOW_SOLAR_EXPORT: true,        // Can excess solar export to grid?

  // Agent parameters
  PLAN_HORIZON_STEPS: 6, // 90 minutes lookahead
  MEMORY_MAX_DECISIONS: 20,

  // Safety thresholds
  SOC_MIN_SAFETY: 0.05,
  SOC_MAX_SAFETY: 0.98,
  GRID_SAFETY_BUFFER_KW: 0.5,

  // Event detection thresholds
  PRICE_SPIKE_THRESHOLD: 0.6,
  EV_URGENT_STEPS_THRESHOLD: 8,
  BATTERY_LOW_THRESHOLD: 0.15,
};
