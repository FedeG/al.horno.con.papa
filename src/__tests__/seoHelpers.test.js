import { extractDescription } from '../utils/seoHelpers';

// ⚠️ Solo testeamos extractDescription porque parseRecipeTime y
// parseRecipeSteps son funciones internas no exportadas de seoHelpers.
// Si en el futuro se exportan, agregar tests acá.

// ─── extractDescription ────────────────────────────────────────────────────

describe('extractDescription', () => {
  const description = `🍫 Torta de Chocolate
⏳ 45 minutos
🥣 Ingredientes: huevos, harina, chocolate
Una torta esponjosa y húmeda, perfecta para cualquier ocasión.
👣 Pasos:
 Mezclar los ingredientes secos.
 Agregar los húmedos y batir.
 Hornear a 180°C por 30 minutos.
💡 Tip: Usá chocolate amargo para un sabor más intenso.`;

  it('extrae la primera línea de descripción real', () => {
    expect(extractDescription(description)).toBe(
      'Una torta esponjosa y húmeda, perfecta para cualquier ocasión.'
    );
  });

  it('salta la línea del título (con emoji)', () => {
    const desc = `🥣 Ingredientes
Una línea de descripción.`;
    expect(extractDescription(desc)).toBe('Una línea de descripción.');
  });

  it('salta líneas de sección (⏳, 🥣, 👣, 💡)', () => {
    const desc = `Nombre
⏳ 20 min
🥣 Ingredientes
La descripción real está acá.`;
    expect(extractDescription(desc)).toBe('La descripción real está acá.');
  });

  it('devuelve la primera línea si no hay descripción real después del título', () => {
    const desc = `Solo título`;
    expect(extractDescription(desc)).toBe('Solo título');
  });

  it('devuelve string vacío si la descripción está vacía', () => {
    expect(extractDescription('')).toBe('');
  });

  it('devuelve string vacío si la descripción es null/undefined', () => {
    expect(extractDescription(null)).toBe('');
    expect(extractDescription(undefined)).toBe('');
  });

  it('trunea líneas vacías entre el título y la descripción', () => {
    const desc = `Nombre

    
La descripción.`;
    expect(extractDescription(desc)).toBe('La descripción.');
  });
});
