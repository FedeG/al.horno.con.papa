"""
Tag Optimizer for Recipe Relationships

This script analyzes all recipes with complete context and suggests optimized tags
to improve recipe relationships and search.
"""

import ollama
import json
from collections import Counter


def analyze_existing_tags(recipes):
    """
    Analyze all current tags and generate statistics.
    """
    all_tags = []
    tags_per_recipe = {}

    for r in recipes:
        tags = r.get("tags_salud", []) + r.get("tags", [])
        all_tags.extend(tags)
        tags_per_recipe[r.get("name")] = tags

    # Frecuencia de tags
    frequency = Counter(all_tags)

    return {
        "total_tags_unicos": len(set(all_tags)),
        "tags_mas_comunes": frequency.most_common(20),
        "tags_raros": [tag for tag, count in frequency.items() if count == 1],
        "promedio_tags_por_receta": len(all_tags) / len(recipes) if recipes else 0,
    }


def generate_recipe_context(recipes, max_recipes=100):
    """
    Generate compact summary of all recipes for AI context.
    """
    summary = []
    for idx, r in enumerate(recipes[:max_recipes]):
        summary.append(
            {
                "id": idx,
                "nombre": r.get("name", ""),
                "ingredientes_principales": r.get("ingredients", "")[
                    :100
                ],  # Primeros 100 chars
                "categoria": r.get("categoria_cocina", "sin categoría"),
                "dificultad": r.get("dificultad", "no especificada"),
                "tags_actuales": r.get("tags_salud", []) + r.get("tags", []),
            }
        )
    return summary


def optimize_tags_with_context(input_file, output_file, model="llama3"):
    """
    Analiza todas las recetas y optimiza los tags para mejor relacionamiento.

    IMPORTANTE: Este proceso puede tardar 10-20 minutos para 500 recetas.
    Usa llama3 (8B) para mejor análisis, o llama3.2 si tienes poca VRAM.
    """
    print("📚 Cargando recetas...")
    with open(archivo_recetas, "r", encoding="utf-8") as f:
        recetas = json.load(f)

    total_recetas = len(recetas)
    print(f"✓ {total_recetas} recetas cargadas\n")

    # Analizar tags existentes
    print("🔍 Analizando tags actuales...")
    estadisticas = analizar_tags_existentes(recetas)

    print(f"  • Tags únicos existentes: {estadisticas['total_tags_unicos']}")
    print(
        f"  • Promedio de tags por receta: {estadisticas['promedio_tags_por_receta']:.1f}"
    )
    print(
        f"  • Tags más comunes: {', '.join([t[0] for t in estadisticas['tags_mas_comunes'][:5]])}"
    )
    print(f"  • Tags usados solo 1 vez: {len(estadisticas['tags_raros'])}\n")

    # Generar contexto global
    print("🧠 Generando análisis global con IA...")
    contexto_recetas = generar_contexto_recetas(
        recetas, max_recetas=min(100, total_recetas)
    )

    prompt_analisis_global = f"""
    Eres un experto en organización de recetas y sistemas de etiquetado.
    
    Tengo {total_recetas} recetas en mi base de datos. Aquí una muestra de las primeras:
    {json.dumps(contexto_recetas[:30], ensure_ascii=False, indent=2)}
    
    Tags actuales más usados:
    {json.dumps(estadisticas["tags_mas_comunes"][:15], ensure_ascii=False)}
    
    Tags usados solo una vez (posibles errores o duplicados):
    {json.dumps(estadisticas["tags_raros"][:20], ensure_ascii=False)}
    
    TAREA:
    Analiza este conjunto de recetas y devuelve un JSON con:
    {{
      "tags_sugeridos_nuevos": ["tag1", "tag2", ...],  // Nuevos tags que deberían agregarse
      "tags_redundantes": ["tag_a", "tag_b", ...],      // Tags que se repiten o son redundantes
      "tags_estandar_recomendados": ["tag1", "tag2", ...],  // 20-30 tags estándar para todo el sistema
      "categorias_sugeridas": ["categoria1", "categoria2", ...],  // Categorías principales
      "reglas_relacion": [
        {{"si_tiene": "pasta", "agregar": ["italiano", "carbohidratos"]}},
        {{"si_tiene": "pollo", "agregar": ["proteína", "carne blanca"]}}
      ]
    }}
    
    Objetivo: Crear un sistema de tags que permita relacionar recetas similares y facilitar búsquedas.
    """

    response_global = ollama.generate(
        model=modelo,
        prompt=prompt_analisis_global,
        options={
            "temperature": 0.4,
            "num_predict": 1500,  # Necesitamos más tokens para el análisis completo
        },
    )

    try:
        clean_res = response_global["response"].strip()
        start = clean_res.find("{")
        end = clean_res.rfind("}") + 1
        analisis_global = json.loads(clean_res[start:end])

        print("✓ Análisis global completado\n")
        print(
            f"  • Tags estándar recomendados: {len(analisis_global.get('tags_estandar_recomendados', []))}"
        )
        print(
            f"  • Nuevos tags sugeridos: {len(analisis_global.get('tags_sugeridos_nuevos', []))}"
        )
        print(
            f"  • Tags redundantes detectados: {len(analisis_global.get('tags_redundantes', []))}"
        )
        print(
            f"  • Reglas de relación: {len(analisis_global.get('reglas_relacion', []))}\n"
        )

    except Exception as e:
        print(f"✗ Error en análisis global: {e}")
        return

    # Ahora procesamos cada receta individualmente con el contexto global
    print("🔄 Optimizando tags de cada receta...\n")

    tags_estandar = set(analisis_global.get("tags_estandar_recomendados", []))
    reglas = analisis_global.get("reglas_relacion", [])

    recetas_optimizadas = []

    for idx, receta in enumerate(recetas, 1):
        print(f"[{idx}/{total_recetas}] {receta.get('name', 'Sin nombre')[:40]}...")

        tags_actuales = receta.get("tags_salud", []) + receta.get("tags", [])

        # Aplicar reglas automáticas
        tags_auto = set()
        nombre_lower = receta.get("name", "").lower()
        ingredientes = receta.get("ingredients", "")
        if isinstance(ingredientes, list):
            ingredientes_texto = " ".join(str(i) for i in ingredientes)
        else:
            ingredientes_texto = str(ingredientes)
        ingredientes_lower = ingredientes_texto.lower()
        texto_completo = f"{nombre_lower} {ingredientes_lower}"

        for regla in reglas:
            if regla.get("si_tiene", "").lower() in texto_completo:
                tags_auto.update(regla.get("agregar", []))

        # Pedir a la IA que optimice los tags
        prompt_receta = f"""
        Optimiza los tags de esta receta usando el sistema estándar.
        
        Receta:
        - Nombre: {receta.get("name")}
        - Ingredientes: {receta.get("ingredients", "")[:200]}
        - Categoría: {receta.get("categoria_cocina", "sin categoría")}
        - Tags actuales: {tags_actuales}
        
        Tags estándar disponibles:
        {list(tags_estandar)[:30]}
        
        Tags sugeridos automáticamente: {list(tags_auto)}
        
        Devuelve un JSON con:
        {{
          "tags_optimizados": ["tag1", "tag2", ...],  // 5-8 tags del sistema estándar
          "tags_relacionados": ["receta1", "receta2", ...],  // Nombres de recetas similares que viste antes
          "razon_cambios": "explicación breve de los cambios"
        }}
        
        Usa SOLO tags del sistema estándar. Sé consistente.
        """

        try:
            response = ollama.generate(
                model=modelo,
                prompt=prompt_receta,
                options={"temperature": 0.2, "num_predict": 400},
            )

            clean_res = response["response"].strip()
            start = clean_res.find("{")
            end = clean_res.rfind("}") + 1

            if start != -1 and end > start:
                optimizacion = json.loads(clean_res[start:end])

                # Actualizar receta
                receta["tags_optimizados"] = optimizacion.get("tags_optimizados", [])
                receta["tags_relacionados"] = optimizacion.get("tags_relacionados", [])
                receta["tags_originales"] = tags_actuales  # Guardar los originales
                receta["razon_optimizacion"] = optimizacion.get("razon_cambios", "")

                print(f"  ✓ {len(receta['tags_optimizados'])} tags optimizados")
            else:
                print("  ⚠ Manteniendo tags originales")
                receta["tags_optimizados"] = tags_actuales

        except Exception as e:
            print(f"  ✗ Error: {e}")
            receta["tags_optimizados"] = tags_actuales

        recetas_optimizadas.append(receta)

        # Guardar progreso cada 50 recetas
        if idx % 50 == 0:
            with open(f"temp_optimizacion_{idx}.json", "w", encoding="utf-8") as f:
                json.dump(recetas_optimizadas, f, indent=2, ensure_ascii=False)
            print(f"  💾 Progreso guardado ({idx} recetas)\n")

    # Guardar resultado final
    resultado_final = {
        "analisis_global": analisis_global,
        "estadisticas_originales": estadisticas,
        "recetas": recetas_optimizadas,
        "timestamp": "2026-02-04",
    }

    with open(archivo_salida, "w", encoding="utf-8") as f:
        json.dump(resultado_final, f, indent=2, ensure_ascii=False)

    print("\n✅ Optimización completada!")
    print(f"📁 Resultado guardado en: {archivo_salida}")

    # Generar reporte de cambios
    generar_reporte_optimizacion(recetas_optimizadas, analisis_global)


def generar_reporte_optimizacion(recetas, analisis_global):
    """
    Genera un reporte legible de los cambios realizados.
    """
    print("\n" + "=" * 60)
    print("📊 REPORTE DE OPTIMIZACIÓN DE TAGS")
    print("=" * 60 + "\n")

    # Contar cambios
    total_cambios = 0
    tags_agregados_total = 0
    tags_removidos_total = 0

    for r in recetas:
        orig = set(r.get("tags_originales", []))
        opt = set(r.get("tags_optimizados", []))

        if orig != opt:
            total_cambios += 1
            tags_agregados_total += len(opt - orig)
            tags_removidos_total += len(orig - opt)

    print(f"Recetas modificadas: {total_cambios}/{len(recetas)}")
    print(f"Tags agregados en total: {tags_agregados_total}")
    print(f"Tags removidos en total: {tags_removidos_total}\n")

    print("Tags estándar recomendados:")
    for tag in analisis_global.get("tags_estandar_recomendados", [])[:20]:
        print(f"  • {tag}")

    print("\nTags redundantes a considerar eliminar:")
    for tag in analisis_global.get("tags_redundantes", [])[:10]:
        print(f"  • {tag}")


# Ejecución
if __name__ == "__main__":
    print("🚀 Iniciando optimización de tags con contexto completo\n")
    print("⚠️  IMPORTANTE: Este proceso puede tardar 10-20 minutos")
    print("⚠️  Asegúrate de tener suficiente RAM/VRAM libre\n")

    input("Presiona ENTER para continuar...")

    optimize_tags_with_context(
        input_file="src/data/recipes.json",
        output_file="src/data/recipes_tags_optimizados.json",
        model="llama3.2",  # Usa 'llama3' si tienes VRAM suficiente
    )
