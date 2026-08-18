import { parseAmount } from './escalado';

export const areaRound = (diameter) => {
  const d = parseAmount(diameter);
  if (d === null || d <= 0) return null;
  return Math.PI * (d / 2) ** 2;
};

export const areaSquare = (side) => {
  const s = parseAmount(side);
  if (s === null || s <= 0) return null;
  return s * s;
};

export const areaFor = (shape, size) =>
  shape === 'cuadrado' ? areaSquare(size) : areaRound(size);

// Factor de cantidad: área del molde que tengo / área del molde de la receta.
export const quantityFactor = (areaTengo, areaReceta) => {
  if (areaTengo === null || areaReceta === null || areaReceta <= 0) return null;
  return areaTengo / areaReceta;
};

// Formatea el factor como porcentaje humano: 1.44 → "+44%", 0.69 → "−31%".
export const formatFactor = (factor) => {
  if (factor === null) return null;
  const pct = Math.round((factor - 1) * 100);
  if (pct === 0) return 'igual que la receta';
  return `${pct > 0 ? '+' : '−'}${Math.abs(pct)}%`;
};

// Guía de tiempo (heurística honesta, no exacta):
// - mismo tamaño: mantener tiempo.
// - más grande: más cantidad/volumen → sumar tiempo y controlar con palillo.
// - más chico: menos cantidad/volumen → restar tiempo y controlar antes.
export const timeGuidance = (factor) => {
  if (factor === null) return null;
  if (factor > 1.05)
    return 'Molde más grande que el de la receta.\nAumentá la cantidad y sumá 5–15 minutos de cocción.\nControlá con palillo antes de sacarlo.';
  if (factor < 0.95)
    return 'Molde más chico que el de la receta.\nReducí la cantidad y restá 5–10 minutos.\nEmpezá a controlar antes.';
  return 'Tamaño equivalente.\nMantené el tiempo y la cantidad de la receta.\nControlá igual con palillo.';
};
