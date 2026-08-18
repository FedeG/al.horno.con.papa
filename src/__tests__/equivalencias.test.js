import { convertUnits, formatCookingAmount } from '../utils/equivalencias';

describe('convertUnits', () => {
  it('convierte tazas a ml', () => {
    expect(
      convertUnits({ value: 2, fromUnit: 'taza', toUnit: 'ml', ingredientId: 'agua' })
    ).toBe(480);
  });

  it('convierte cucharadas a cucharaditas', () => {
    expect(
      convertUnits({ value: 1, fromUnit: 'cucharada', toUnit: 'cucharadita', ingredientId: 'agua' })
    ).toBe(3);
  });

  it('convierte tazas de harina a gramos usando la densidad', () => {
    // 1 taza (240 ml) × 0.53 g/ml
    expect(
      convertUnits({ value: 1, fromUnit: 'taza', toUnit: 'gr', ingredientId: 'harina' })
    ).toBeCloseTo(127.2, 5);
  });

  it('convierte gramos de harina a tazas', () => {
    // 100 g / 0.53 g/ml = 188.68 ml → / 240 ml
    expect(
      convertUnits({ value: 100, fromUnit: 'gr', toUnit: 'taza', ingredientId: 'harina' })
    ).toBeCloseTo(0.786, 2);
  });

  it('usa densidad de agua (1 g = 1 ml) para gramos sin ingrediente específico', () => {
    expect(
      convertUnits({ value: 250, fromUnit: 'ml', toUnit: 'gr', ingredientId: 'agua' })
    ).toBe(250);
  });

  it('acepta coma decimal', () => {
    expect(
      convertUnits({ value: '1,5', fromUnit: 'taza', toUnit: 'ml', ingredientId: 'agua' })
    ).toBe(360);
  });

  it('devuelve null para valores no numéricos', () => {
    expect(
      convertUnits({ value: 'abc', fromUnit: 'taza', toUnit: 'ml', ingredientId: 'agua' })
    ).toBeNull();
  });
});

describe('formatCookingAmount', () => {
  it('redondea tazas a valores prácticos (100 gr cacao → 1 taza)', () => {
    // 100 g / 0.4 g/ml = 250 ml → 250 / 240 = 1,04 tazas
    const tazas = convertUnits({
      value: 100,
      fromUnit: 'gr',
      toUnit: 'taza',
      ingredientId: 'cacao',
    });
    expect(tazas).toBeCloseTo(1.0417, 3);
    expect(formatCookingAmount(tazas, 'taza')).toBe('1 taza');
  });

  it('usa fracciones prácticas para tazas', () => {
    expect(formatCookingAmount(0.786, 'taza')).toBe('3/4 taza');
    expect(formatCookingAmount(0.5, 'taza')).toBe('1/2 taza');
    expect(formatCookingAmount(0.2, 'taza')).toBe('1/5 taza');
    expect(formatCookingAmount(0.125, 'taza')).toBe('1/8 taza');
    expect(formatCookingAmount(1.333, 'taza')).toBe('1 y 1/3 tazas');
    expect(formatCookingAmount(1.5, 'taza')).toBe('1 y 1/2 tazas');
    expect(formatCookingAmount(2, 'taza')).toBe('2 tazas');
    expect(formatCookingAmount(1, 'taza')).toBe('1 taza');
  });

  it('cantidades mínimas avisan en vez de mostrar cero', () => {
    expect(formatCookingAmount(0.04, 'taza')).toBe('menos de 1/8 taza');
  });

  it('aplica fracciones a cucharadas y cucharaditas', () => {
    expect(formatCookingAmount(1.5, 'cucharada')).toBe('1 y 1/2 cucharadas');
    expect(formatCookingAmount(0.333, 'cucharadita')).toBe('1/3 cucharadita');
  });

  it('máximo 1 decimal para ml y gr', () => {
    expect(formatCookingAmount(236.55, 'ml')).toBe('236,6 mililitros');
    expect(formatCookingAmount(250, 'ml')).toBe('250 mililitros');
    expect(formatCookingAmount(127.2, 'gr')).toBe('127,2 gramos');
  });

  it('devuelve — para no numéricos', () => {
    expect(formatCookingAmount(NaN, 'taza')).toBe('—');
  });
});