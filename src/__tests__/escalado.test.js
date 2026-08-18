import { parseAmount, scaleFactor, scaleQuantity } from '../utils/escalado';

describe('parseAmount', () => {
  it('acepta punto y coma decimal', () => {
    expect(parseAmount('2.5')).toBe(2.5);
    expect(parseAmount('2,5')).toBe(2.5);
    expect(parseAmount(' 1,5 ')).toBe(1.5);
  });

  it('devuelve null para no numéricos', () => {
    expect(parseAmount('abc')).toBeNull();
    expect(parseAmount('')).toBeNull();
  });
});

describe('scaleFactor', () => {
  it('de 4 a 8 porciones', () => {
    expect(scaleFactor(4, 8)).toBe(2);
  });

  it('de 4 a 2 porciones', () => {
    expect(scaleFactor(4, 2)).toBe(0.5);
  });

  it('acepta strings', () => {
    expect(scaleFactor('4', '8')).toBe(2);
  });

  it('devuelve null con porciones originales inválidas', () => {
    expect(scaleFactor(0, 8)).toBeNull();
    expect(scaleFactor(-4, 8)).toBeNull();
    expect(scaleFactor('abc', 8)).toBeNull();
    expect(scaleFactor(4, 'abc')).toBeNull();
  });
});

describe('scaleQuantity', () => {
  it('escala cantidades continuas', () => {
    expect(scaleQuantity(250, 2).value).toBe(500);
    expect(scaleQuantity(250, 0.5).value).toBe(125);
    expect(scaleQuantity(1.5, 2).value).toBe(3);
  });

  it('redondea ruido de punto flotante a 2 decimales', () => {
    expect(scaleQuantity(0.1, 3).value).toBe(0.3);
  });

  it('redondea unidades discretas hacia arriba', () => {
    const r = scaleQuantity(1, 1.5, true);
    expect(r.value).toBe(2);
    expect(r.roundedUp).toBe(true);
  });

  it('no marca roundedUp cuando el entero es exacto', () => {
    const r = scaleQuantity(2, 2, true);
    expect(r.value).toBe(4);
    expect(r.roundedUp).toBe(false);
  });

  it('redondea a 1 cuando el factor reduce por debajo de 1 unidad', () => {
    const r = scaleQuantity(1, 0.5, true);
    expect(r.value).toBe(1);
    expect(r.roundedUp).toBe(true);
  });

  it('devuelve null para cantidades inválidas', () => {
    expect(scaleQuantity('abc', 2)).toBeNull();
    expect(scaleQuantity(250, null)).toBeNull();
  });
});
