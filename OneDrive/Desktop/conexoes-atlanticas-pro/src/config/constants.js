/**
 * Constantes globais da aplicação
 */

export const CONFIG = {
  API_BASE_URL: import.meta.env?.VITE_API_URL || '/api',
  RATE_LIMIT_MS: 1500,
  MAX_RESULTS: 20,
  GRAPH: {
    CHARGE_STRENGTH: -350,
    CHARGE_DISTANCE_MIN: 30,
    CHARGE_DISTANCE_MAX: 400,
    LINK_DISTANCE: 160,
    LINK_STRENGTH: 0.35,
    COLLISION_RADIUS: 30,
    ZOOM_MIN: 0.3,
    ZOOM_MAX: 4,
    DEGREE_LIMIT: 8
  }
};

export const PERIODS = [
  { value: 'all', label: 'Todos' },
  { value: '2020-2021', label: '2020–2021' },
  { value: '2022-2023', label: '2022–2023' },
  { value: '2024+', label: '2024+' },
  { value: 'sem-info', label: 'Sem info' }
];
