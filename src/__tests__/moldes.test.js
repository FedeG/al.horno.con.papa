import {
  areaRound,
  areaSquare,
  quantityFactor,
  formatFactor,
  timeGuidance,
} from '../utils/moldes';

describe('áreas', () => {
  it('área de molde redondo', () => {
    expect(areaRound(20)).toBeCloseTo(314.16, 1);
  });

  it('área de molde cuadrado', () => {
    expect(areaSquare(20)).toBe(400);
  });

  it('devuelve null para tamaños inválidos', () => {
    expect(areaRound(0)).toBeNull();
    expect(areaSquare('abc')).toBeNull();
  });
});

describe('quantityFactor', () => {
  it('tengo 20, receta pide 24 → factor 0.69 (menos 31%)', () => {
    const f = quantityFactor(areaRound(20), areaRound(24));
    expect(f).toBeCloseTo(0.6944, 3); // 20²/24² = 0.6944...
  });

  it('tengo 24, receta pide 20 → factor 1.44 (más 44%)', () => {
    const f = quantityFactor(areaRound(24), areaRound(20));
    expect(f).toBeCloseTo(1.44, 2); // 24²/20² = 1.44
  });

  it('cuadrado 20 → 25 es 1.5625', () => {
    expect(quantityFactor(areaSquare(25), areaSquare(20))).toBeCloseTo(1.5625, 3);
  });

  it('moldes iguales → factor 1', () => {
    expect(quantityFactor(areaRound(22), areaRound(22))).toBe(1);
  });

  it('devuelve null si el molde de la receta es inválido', () => {
    expect(quantityFactor(areaRound(20), null)).toBeNull();
  });
});

describe('formatFactor', () => {
  it('formatea porcentajes', () => {
    expect(formatFactor(1.44)).toBe('+44%');
    expect(formatFactor(0.69)).toBe('−31%');
    expect(formatFactor(1)).toBe('igual que la receta');
  });
});

describe('timeGuidance', () => {
  it('molde más grande → sumar tiempo', () => {
    expect(timeGuidance(1.44)).toContain('sumá 5–15 minutos');
  });

  it('molde más chico → restar tiempo', () => {
    expect(timeGuidance(0.69)).toContain('restá 5–10 minutos');
  });

  it('tamaño equivalente → mantener tiempo', () => {
    expect(timeGuidance(1)).toContain('antené el tiempo');
  });
});