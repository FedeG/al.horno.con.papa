import { parseAmount } from './escalado';

// Unidades soportadas para la calculadora de costo.
// cantidad comprada y cantidad usada van en la misma unidad por fila.
export const COST_UNITS = [
  { id: 'gr', label: 'Gramos (gr)' },
  { id: 'kg', label: 'Kilogramos (kg)' },
  { id: 'ml', label: 'Mililitros (ml)' },
  { id: 'l', label: 'Litros (l)' },
  { id: 'un', label: 'Unidades' },
];

// Costo de una fila: precio pagado × (cantidad usada / cantidad comprada).
// Devuelve null si algún valor no es válido (precio no numérico, comprada <= 0).
export const costPerRow = ({ price, bought, used }) => {
  const p = parseAmount(price);
  const b = parseAmount(bought);
  const u = parseAmount(used);
  if (p === null || b === null || u === null || b <= 0) return null;
  return (p * u) / b;
};

// Costo total: suma de filas válidas (las inválidas se ignoran).
// Devuelve { total, invalidRows } para avisar al usuario.
export const totalCost = (rows) => {
  let total = 0;
  let invalidRows = 0;
  rows.forEach((row) => {
    const c = costPerRow(row);
    if (c === null) invalidRows += 1;
    else total += c;
  });
  return { total, invalidRows };
};

// Costo por porción. Devuelve null si las porciones no son válidas o <= 0.
export const costPerServing = (total, servings) => {
  const s = parseAmount(servings);
  if (s === null || s <= 0) return null;
  return total / s;
};

export const formatARS = (value) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(Math.round(value));
