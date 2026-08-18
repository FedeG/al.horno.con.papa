export const normalize = (s) => String(s).trim().toLowerCase();

// Unión ordenada de todos los cleaned_ingredientes de las recetas.
// Es la lista de opciones para los buscadores de la herramienta.
export const ingredientsOptions = (recipes) => {
  const set = new Set();
  recipes.forEach((r) => {
    (r.cleaned_ingredientes || []).forEach((i) => set.add(normalize(i)));
  });
  return Array.from(set).sort();
};

// Matchea recetas contra los ingredientes que el usuario tiene (tengo) y los
// que no tiene (noTengo):
// - toda receta válida debe contener TODOS los de "tengo" y NINGUNO de "noTengo".
// - ranking: más matches de "tengo" primero; luego menos extras (receta más
//   simple); el orden original desempata.
// Devuelve [{ recipe, matched, missing, extra }]. Las recetas sin
// cleaned_ingredientes nunca matchean.
export const matchRecipes = (recipes, tengo, noTengo) => {
  const have = (tengo || []).map(normalize).filter(Boolean);
  const dontHave = (noTengo || []).map(normalize).filter(Boolean);

  const scored = [];
  recipes.forEach((recipe, index) => {
    const cleaned = (recipe.cleaned_ingredientes || []).map(normalize);
    if (!cleaned.length) return;

    const matched = have.filter((h) => cleaned.includes(h));
    if (matched.length !== have.length) return; // falta algún ingrediente

    if (dontHave.some((n) => cleaned.includes(n))) return; // tiene algo que no debería

    const extra = cleaned.filter((c) => !have.includes(c));
    scored.push({
      recipe,
      matched,
      missing: have.filter((h) => !matched.includes(h)),
      extra,
      score: { matches: matched.length, extras: extra.length, index },
    });
  });

  scored.sort(
    (a, b) =>
      b.score.matches - a.score.matches ||
      a.score.extras - b.score.extras ||
      a.score.index - b.score.index
  );

  return scored.map(({ recipe, matched, missing, extra }) => ({
    recipe,
    matched,
    missing,
    extra,
  }));
};

// Receta al azar entre los resultados filtrados (botón "Receta sorpresa").
export const randomRecipe = (results) => {
  if (!results || !results.length) return null;
  return results[Math.floor(Math.random() * results.length)];
};
