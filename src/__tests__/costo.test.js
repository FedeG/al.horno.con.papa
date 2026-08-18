import {
  costPerRow,
  totalCost,
  costPerServing,
  formatARS,
} from '../utils/costo';

describe('costPerRow', () => {
  it('250 g de 1 kg a $1500 → $375', () => {
    expect(costPerRow({ price: 1500, bought: 1000, used: 250 })).toBe(375);
  });

  it('acepta coma decimal en precio', () => {
    expect(costPerRow({ price: '1500,50', bought: 1000, used: 250 })).toBeCloseTo(
      375.125,
      3
    );
  });

  it('devuelve null con comprada inválida o <= 0', () => {
    expect(costPerRow({ price: 1500, bought: 0, used: 250 })).toBeNull();
    expect(costPerRow({ price: 1500, bought: 'abc', used: 250 })).toBeNull();
  });

  it('devuelve null con precio o usada no numéricos', () => {
    expect(costPerRow({ price: 'abc', bought: 1000, used: 250 })).toBeNull();
    expect(costPerRow({ price: 1500, bought: 1000, used: 'abc' })).toBeNull();
  });
});

describe('totalCost', () => {
  it('suma filas válidas', () => {
    const rows = [
      { price: 1500, bought: 1000, used: 250 }, // 375
      { price: 500, bought: 4, used: 1 }, // 125
    ];
    expect(totalCost(rows).total).toBe(500);
    expect(totalCost(rows).invalidRows).toBe(0);
  });

  it('ignora filas inválidas y las cuenta', () => {
    const rows = [
      { price: 1500, bought: 0, used: 250 }, // inválida
      { price: 500, bought: 4, used: 1 }, // 125
    ];
    const r = totalCost(rows);
    expect(r.total).toBe(125);
    expect(r.invalidRows).toBe(1);
  });
});

describe('costPerServing', () => {
  it('divide por porciones', () => {
    expect(costPerServing(1000, 8)).toBe(125);
  });

  it('devuelve null con porciones inválidas', () => {
    expect(costPerServing(1000, 0)).toBeNull();
    expect(costPerServing(1000, 'abc')).toBeNull();
  });
});

describe('formatARS', () => {
  it('formatea en pesos argentinos', () => {
    const s = formatARS(1250);
    expect(s).toContain('1.250');
  });
});