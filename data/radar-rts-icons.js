// Original line symbols, kept in code for sharp small controls without an asset pipeline.
const PATHS = {
  structures: 'M3 21V9L12 3l9 6v12H3m5 0v-8h8v8',
  infantry: 'M8 7a4 4 0 1 0 8 0a4 4 0 1 0-8 0M5 22v-5a7 7 0 0 1 14 0v5',
  vehicles: 'M3 10h15l3 7H3zM7 10V6h7v4m-8 7v4m12-4v4M14 6h8',
  special: 'M12 2v5m0 10v5M2 12h5m10 0h5M5 5l4 4m6 6l4 4M5 19l4-4m6-6l4-4',
  powerPlant: 'M14 2L5 14h7l-2 8 9-13h-7z',
  refinery: 'M3 22V9h5V3h5v10h8v9H3m3-5h12',
  barracks: 'M3 22V5h18v17H3m5 0v-7h8v7M7 9h2m6 0h2',
  warFactory: 'M2 22V10l7 3V8l7 4V4h5v18H2',
  turret: 'M5 22h14l-3-9H8zM12 13V7h10M8 7h8',
  uplink: 'M5 22h14M12 22V12M4 4a11 11 0 0 0 16 0M6 2l6 10 6-10',
  rifle: 'M4 19L19 4m-9 8l5 5M2 17l5 5M15 4l5 5',
  rocket: 'M3 21L17 7m-2-2l5-3 2 5-3 3zM6 14l4 4',
  marksman: 'M12 2v5m0 10v5M2 12h5m10 0h5M5 12a7 7 0 1 0 14 0a7 7 0 1 0-14 0',
  tank: 'M3 10h18v10H3zM7 10V6h10v4m-5-4V1M3 15h18',
  scout: 'M2 12l8-7h6l6 7-6 7h-6zM12 5v14',
  bulwark: 'M3 5h18v16H3zM7 5v16m10-16v16M12 12V1',
  harvester: 'M2 10h17l3 11H2zM7 10V5h8v5m-3-9v3m-5 11h10',
  pause: 'M8 3v18M16 3v18',
  credits: 'M4 7l8-5 8 5-8 5zM4 12l8 5 8-5M4 17l8 5 8-5'
};
export function radarIcon(id) {
  return `<svg class="radar-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round"><path d="${PATHS[id] || PATHS.special}"/></svg>`;
}
