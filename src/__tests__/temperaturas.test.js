import {
  OVEN_SETTINGS,
  celsiusToFahrenheit,
  fahrenheitToCelsius,
  settingForCelsius,
  settingForFahrenheit,
  settingByGas,
  settingByHeat,
  formatTemp,
} from '../utils/temperaturas';

describe('conversión C ↔ F', () => {
  it('convierte C a F', () => {
    expect(celsiusToFahrenheit(0)).toBe(32);
    expect(celsiusToFahrenheit(100)).toBe(212);
    expect(celsiusToFahrenheit(180)).toBe(356);
  });

  it('convierte F a C', () => {
    expect(fahrenheitToCelsius(32)).toBe(0);
    expect(fahrenheitToCelsius(212)).toBe(100);
    expect(fahrenheitToCelsius(350)).toBeCloseTo(176.67, 2);
  });
});

describe('mapeo a niveles de horno', () => {
  it('mapea 180°C al nivel Medio (Estándar) gas 4', () => {
    const s = settingForCelsius(180);
    expect(s.gas).toBe('4');
    expect(s.heat).toBe('Medio (Estándar)');
  });

  it('mapea 105°C a Muy Bajo (Secado)', () => {
    expect(settingForCelsius(105).heat).toBe('Muy Bajo (Secado)');
  });

  it('mapea por rango en °F', () => {
    expect(settingForFahrenheit(400).heat).toBe('Alto (Fuerte)');
    expect(settingForFahrenheit(300).heat).toBe('Bajo (Suave)');
  });

  it('respeta los límites exactos de rango', () => {
    expect(settingForCelsius(140).heat).toBe('Bajo (Suave)');
    expect(settingForCelsius(170).heat).toBe('Medio-Bajo');
    expect(settingForCelsius(200).heat).toBe('Alto (Fuerte)');
  });

  it('devuelve el nivel más cercano cuando no coincide exacto', () => {
    expect(settingForCelsius(115).heat).toBe('Muy Bajo (Secado)');
    expect(settingForCelsius(185).heat).toBe('Medio (Estándar)');
    expect(settingForCelsius(210).heat).toBe('Alto (Fuerte)');
  });

  it('empates van al nivel más bajo', () => {
    // 185 está a 5° de Medio (180) y de Medio-Alto (190) → gana Medio.
    expect(settingForCelsius(185).gas).toBe('4');
    // 210 está a 10° de Alto (200) y de Muy Alto (220) → gana Alto.
    expect(settingForCelsius(210).gas).toBe('6');
  });

  it('valores fuera del rango doméstico van al extremo más cercano', () => {
    expect(settingForCelsius(50).heat).toBe('Muy Bajo (Secado)');
    expect(settingForCelsius(260).heat).toBe('Máximo');
    expect(settingForFahrenheit(100).heat).toBe('Muy Bajo (Secado)');
  });

  it('busca por gas mark y por descripción', () => {
    expect(settingByGas('6').heat).toBe('Alto (Fuerte)');
    expect(settingByGas('¼ - ½').heat).toBe('Muy Bajo (Secado)');
    expect(settingByHeat('Máximo').gas).toBe('8 - 9');
  });
});

describe('tabla de referencia', () => {
  it('tiene 8 niveles definidos', () => {
    expect(OVEN_SETTINGS).toHaveLength(8);
  });
});

describe('formatTemp', () => {
  it('formatea con máximo 1 decimal', () => {
    expect(formatTemp(176.666)).toBe('176,7');
    expect(formatTemp(32)).toBe('32');
  });

  it('devuelve — para no numéricos', () => {
    expect(formatTemp(NaN)).toBe('—');
  });
});
