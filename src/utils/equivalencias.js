import { INGREDIENTS, UNITS } from './constants';

export const UNITS_BY_ID = Object.fromEntries(UNITS.map((u) => [u.id, u]));

/**
 * Convierte una cantidad entre unidades de cocina (ml, gr, tazas, cucharadas,
 * cucharaditas). El peso depende del ingrediente (densidad en g/ml).
 *
 * @param {string|number} value - Cantidad a convertir (acepta coma decimal)
 * @param {string} fromUnit - Unidad origen (id de UNITS)
 * @param {string} toUnit - Unidad destino (id de UNITS)
 * @param {string} ingredientId - Ingrediente (id de INGREDIENTS)
 * @returns {number|null} Resultado en la unidad destino, o null si no es numérico
 */
export const convertUnits = ({ value, fromUnit, toUnit, ingredientId }) => {
  const amount = parseFloat(String(value).replace(',', '.'));
  if (isNaN(amount)) return null;

  const from = UNITS_BY_ID[fromUnit];
  const to = UNITS_BY_ID[toUnit];
  const ingredient = INGREDIENTS.find((i) => i.id === ingredientId);
  const density = ingredient ? ingredient.density : 1.0;

  // Pasar todo a la base: volumen → ml, peso → gramos.
  let ml = null;
  let grams = null;
  if (from.id === 'gr') {
    grams = amount;
    ml = amount / density;
  } else {
    ml = amount * from.ml;
    grams = ml * density;
  }

  // Convertir de la base a la unidad destino.
  if (to.id === 'gr') return grams;
  return ml / to.ml;
};

// Fracciones prácticas para tazas y cucharadas (1/5 incluida por pedido).
const FRACTION_CANDIDATES = [
  0, 1 / 8, 1 / 5, 1 / 4, 1 / 3, 1 / 2, 2 / 3, 3 / 4, 1,
];
const FRACTION_NAMES = {
  0.125: '1/8',
  0.2: '1/5',
  0.25: '1/4',
  0.333: '1/3',
  0.5: '1/2',
  0.667: '2/3',
  0.75: '3/4',
};

// Redondea la parte fraccionaria a la opción práctica más cercana.
const nearestFraction = (value) => {
  const whole = Math.floor(value + 1e-9);
  const frac = value - whole;
  let best = 0;
  let bestDist = Infinity;
  for (const candidate of FRACTION_CANDIDATES) {
    const dist = Math.abs(frac - candidate);
    if (dist < bestDist - 1e-9) {
      best = candidate;
      bestDist = dist;
    }
  }
  return whole + best;
};

const unitWord = (unitId, total) => {
  const plural = total > 1;
  switch (unitId) {
    case 'taza':
      return plural ? 'tazas' : 'taza';
    case 'cucharada':
      return plural ? 'cucharadas' : 'cucharada';
    case 'cucharadita':
      return plural ? 'cucharaditas' : 'cucharadita';
    case 'ml':
      return plural ? 'mililitros' : 'mililitro';
    case 'gr':
      return plural ? 'gramos' : 'gramo';
    default:
      return UNITS_BY_ID[unitId]?.label || unitId;
  }
};

/**
 * Formatea una cantidad en la unidad destino con redondeo práctico de cocina:
 * máximo 1 decimal; tazas y cucharadas se redondean a fracciones comunes
 * (1/8, 1/4, 1/3, 1/2, 2/3, 3/4…) en lugar de decimales poco útiles.
 *
 * @param {number} value - Cantidad ya convertida
 * @param {string} unitId - Unidad destino (id de UNITS)
 * @returns {string} Texto listo para mostrar, incluye la unidad
 */
export const formatCookingAmount = (value, unitId) => {
  if (!Number.isFinite(value)) return '—';

  const hasFractions = ['taza', 'cucharada', 'cucharadita'].includes(unitId);

  if (!hasFractions) {
    const text = new Intl.NumberFormat('es-AR', {
      maximumFractionDigits: 1,
    }).format(value);
    return `${text} ${unitWord(unitId, value)}`;
  }

  const total = nearestFraction(value);
  if (total < 0.1) return `menos de 1/8 ${unitWord(unitId, 1)}`;

  const whole = Math.floor(total + 1e-9);
  const frac = total - whole;

  if (frac === 0) return `${whole} ${unitWord(unitId, total)}`;

  const fracName = FRACTION_NAMES[Math.round(frac * 1000) / 1000];
  if (whole === 0) return `${fracName} ${unitWord(unitId, total)}`;
  return `${whole} y ${fracName} ${unitWord(unitId, total)}`;
};