// Tabla de temperaturas de horno (estándar de cocina argentina).
// Cada fila: rango en °F, rango en °C, gas mark y descripción de calor.
export const OVEN_SETTINGS = [
  { f: [200, 225], c: [100, 110], gas: '¼ - ½', heat: 'Muy Bajo (Secado)' },
  { f: [275, 300], c: [140, 150], gas: '1 - 2', heat: 'Bajo (Suave)' },
  { f: [325, 325], c: [160, 170], gas: '3', heat: 'Medio-Bajo' },
  { f: [350, 350], c: [180, 180], gas: '4', heat: 'Medio (Estándar)' },
  { f: [375, 375], c: [190, 190], gas: '5', heat: 'Medio-Alto' },
  { f: [400, 400], c: [200, 200], gas: '6', heat: 'Alto (Fuerte)' },
  { f: [425, 425], c: [220, 220], gas: '7', heat: 'Muy Alto' },
  { f: [450, 475], c: [230, 240], gas: '8 - 9', heat: 'Máximo' },
];

export const celsiusToFahrenheit = (c) => (c * 9) / 5 + 32;

export const fahrenheitToCelsius = (f) => ((f - 32) * 5) / 9;

// Distancia de un valor al rango [min, max]: 0 si está adentro, si no la
// distancia al extremo más cercano.
const distanceTo = (value, [min, max]) =>
  value < min ? min - value : value > max ? value - max : 0;

// Devuelve la fila de OVEN_SETTINGS más cercana al valor en °C (dentro del
// rango suma distancia 0; empate → el nivel más bajo, que es el primero).
export const settingForCelsius = (c) => {
  let best = null;
  let bestDist = Infinity;
  for (const s of OVEN_SETTINGS) {
    const dist = distanceTo(c, s.c);
    if (dist < bestDist) {
      best = s;
      bestDist = dist;
    }
  }
  return best;
};

// Ídem para un valor en °F.
export const settingForFahrenheit = (f) => {
  let best = null;
  let bestDist = Infinity;
  for (const s of OVEN_SETTINGS) {
    const dist = distanceTo(f, s.f);
    if (dist < bestDist) {
      best = s;
      bestDist = dist;
    }
  }
  return best;
};

// Devuelve la fila por gas mark (ej. '4', '¼ - ½', '8 - 9').
export const settingByGas = (gas) =>
  OVEN_SETTINGS.find((s) => s.gas === String(gas)) || null;

// Devuelve la fila por descripción de calor (ej. 'Medio (Estándar)').
export const settingByHeat = (heat) =>
  OVEN_SETTINGS.find((s) => s.heat === heat) || null;

export const formatTemp = (value) => {
  if (!Number.isFinite(value)) return '—';
  return new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 }).format(
    Math.round(value * 10) / 10
  );
};
