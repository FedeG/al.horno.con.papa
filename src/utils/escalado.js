// Parsea un valor numérico aceptando coma o punto decimal.
export const parseAmount = (value) => {
  const n = parseFloat(String(value).replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};

// Factor de escalado: porciones objetivo / porciones originales.
// Devuelve null si las originales no son válidas o son <= 0.
export const scaleFactor = (original, target) => {
  const from = parseAmount(original);
  const to = parseAmount(target);
  if (from === null || to === null || from <= 0) return null;
  return to / from;
};

// Escala una cantidad por el factor.
// - isDiscrete (huevos, unidades): redondea hacia arriba al entero.
// - continuo: redondea a 2 decimales para evitar ruido de punto flotante.
// Devuelve { value, roundedUp } o null si la cantidad no es válida.
export const scaleQuantity = (amount, factor, isDiscrete = false) => {
  const base = parseAmount(amount);
  const f = parseAmount(factor);
  if (base === null || f === null || base <= 0) return null;

  const scaled = base * f;
  if (isDiscrete) {
    const value = Math.ceil(scaled);
    return { value, roundedUp: value !== scaled };
  }
  return { value: Math.round(scaled * 100) / 100, roundedUp: false };
};
