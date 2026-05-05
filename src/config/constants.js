// ===== Paleta de Colores =====
export const COLORS = {
  BG_DARK: '#0a0d14',
  BG_MID: '#1e2532',
  ACCENT_BLUE: '#4fc3f7',
  ACCENT_ORANGE: '#f97316',
  SOFT_RED: '#e74c3c',
  PANEL_BG: 'rgba(15, 20, 30, 0.98)',
  TEXT_PRIMARY: '#e0e6f0',
  TEXT_SECONDARY: '#8892a4',
  GLASS_LINE: 0x4fc3f7,
  GLASS_BODY: 0x0f172a,
};

// ===== Categorías de Estaciones (matching prototype) =====
export const CATEGORIES = {
  VR: {
    label: 'VR',
    color: '#8b5cf6',
    icon: 'vr',
  },
  TACTIL: {
    label: 'Táctil',
    color: '#10b981',
    icon: 'tactil',
  },
  PORTATIL: {
    label: 'Portátil',
    color: '#06b6d4',
    icon: 'portatil',
  },
  AUDIO: {
    label: 'Audio',
    color: '#f59e0b',
    icon: 'audio',
  },
  AR: {
    label: 'AR',
    color: '#ec4899',
    icon: 'ar',
  },
  REPOSITORIO: {
    label: 'Repositorio',
    color: '#6366f1',
    icon: 'repositorio',
  },
  PANTALLA: {
    label: 'Pantalla',
    color: '#14b8a6',
    icon: 'pantalla',
  },
  TOTEM: {
    label: 'Totem',
    color: '#ef4444',
    icon: 'totem',
  },
};

// ===== SVG Paths para Íconos (matching the circular icons in prototype) =====
export const ICON_PATHS = {
  // VR headset
  vr: 'M20.74 6H3.26C2.57 6 2 6.57 2 7.26v9.49c0 .69.57 1.26 1.26 1.26h5.92c.49 0 .93-.3 1.11-.76l.83-2.07c.19-.48.66-.76 1.13-.76h1.5c.47 0 .94.28 1.13.76l.83 2.07c.18.46.62.76 1.11.76h5.92c.69 0 1.26-.57 1.26-1.26V7.26C22 6.57 21.43 6 20.74 6zM7.5 14c-1.38 0-2.5-1.12-2.5-2.5S6.12 9 7.5 9 10 10.12 10 11.5 8.88 14 7.5 14zm9 0c-1.38 0-2.5-1.12-2.5-2.5S15.12 9 16.5 9 19 10.12 19 11.5 17.88 14 16.5 14z',
  // Touch/finger icon
  tactil: 'M9 11.24V7.5C9 6.12 10.12 5 11.5 5S14 6.12 14 7.5v3.74c1.21-.81 2-2.18 2-3.74C16 5.01 13.99 3 11.5 3S7 5.01 7 7.5c0 1.56.79 2.93 2 3.74zm9.84 4.63l-4.54-2.26c-.17-.07-.35-.11-.54-.11H13v-6c0-.83-.67-1.5-1.5-1.5S10 6.67 10 7.5v10.74l-3.43-.72c-.08-.01-.15-.03-.24-.03-.31 0-.59.13-.79.33l-.79.8 4.94 4.94c.27.27.65.44 1.06.44h6.79c.75 0 1.33-.55 1.44-1.28l.75-5.27c.01-.07.02-.14.02-.2 0-.62-.38-1.16-.91-1.38z',
  // Laptop/portable
  portatil: 'M20 18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z',
  // Headphones
  audio: 'M12 1c-4.97 0-9 4.03-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7c0-4.97-4.03-9-9-9z',
  // AR cube / augmented reality
  ar: 'M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H4V4h16v16zm-8-2l4-8-4-2-4 2 4 8zm0-8.5L15.3 12 12 16.2 8.7 12 12 9.5z',
  // Archive/repository
  repositorio: 'M20 6H12L10 4H4C2.9 4 2 4.9 2 6v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z',
  // Screen/display
  pantalla: 'M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h7v2H8v2h8v-2h-2v-2h7c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z',
  // Totem/kiosk
  totem: 'M8 2v2H4v4h2V4h2v4h2V4h2v4h2V4h-2V2H8zm-2 8v10c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V10H6zm8 2v6h-4v-6h4z',
  // User icon
  user: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
  // Admin shield
  admin: 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z',
  // Disabled/ghost
  ghost: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9A7.902 7.902 0 0 1 4 12zm8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1A7.902 7.902 0 0 1 20 12c0 4.42-3.58 8-8 8z',
  // Camera icon for video/screen
  camera: 'M17 10.5V7c0-.55-.45-1-1-1H2c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h14c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z',
  // Microphone
  mic: 'M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z',
};

// ===== Constantes de la escena =====
export const SCENE = {
  MARKER_Y_OFFSET: 2.5,
  TOOLTIP_Y_OFFSET: 4.5,
  AVATAR_Y_OFFSET: 0.5,
  DRAG_PLANE_Y: 0,
  MODEL_SCALE: 1,
};
