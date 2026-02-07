#!/usr/bin/env python3
"""
IA Main - Recipe Enricher with Artificial Intelligence

This script processes existing recipes using local AI models (Ollama)
to add additional information like tags, difficulty, times, etc.
"""

import argparse
import json
import sys
from pathlib import Path
from typing import List, Dict, Any, Optional
from collections import Counter

# Import AI service
from services.ai_service import AIService


def generate_global_context(recipes: List[Dict[str, Any]]) -> str:
    """
    Generate global context from all recipes so the AI has knowledge
    of the complete set before processing individual recipes.
    
    Args:
        recipes: Complete list of recipes
        
    Returns:
        String with formatted context
    """
    total = len(recipes)
    
    # Extraer todos los tags existentes
    all_tags = []
    for r in recipes:
        tags = r.get('tags', [])
        if isinstance(tags, list):
            all_tags.extend(tags)
    
    # Contar TODOS los tags únicos y ordenar por frecuencia
    tag_counter = Counter(all_tags)
    all_tags_sorted = tag_counter.most_common()  # Todos los tags ordenados
    
    # Extraer ingredientes limpios más comunes
    all_cleaned = []
    for r in recipes:
        cleaned = r.get('cleaned_ingredientes', [])
        if isinstance(cleaned, list):
            all_cleaned.extend(cleaned)
    
    cleaned_counter = Counter(all_cleaned)
    common_ingredients = cleaned_counter.most_common(20)
    
    # Muestra de nombres de recetas
    sample_names = [r.get('name', 'Sin nombre') for r in recipes[:10]]
    
    context = f"""
CONTEXTO GLOBAL DE LA BASE DE DATOS DE RECETAS:

Total de recetas en el sistema: {total}

TAGS DISPONIBLES EN EL SISTEMA (usa SOLO estos, verifica relevancia):
{chr(10).join([f"  • {tag} ({count} recetas)" for tag, count in all_tags_sorted])}

INGREDIENTES BASE MÁS COMUNES:
{chr(10).join([f"  • {ing}" for ing, _ in common_ingredients[:15]])}

Muestra de recetas existentes:
{chr(10).join([f"  • {name}" for name in sample_names])}

CAMPOS ACTUALES DEL SISTEMA:
- id, name, description, tags, instagramUrl, imageUrl, ingredients, date, 
  easy, hidden, shortcode, cleaned_ingredientes, tiempo (nuevo)

REGLAS PARA TAGS:
- PRIORIZA usar tags de la lista anterior (ya están validados)
- PUEDES agregar tags nuevos si son realmente relevantes (ej: "Fruta" si la receta es de frutas)
- VERIFICA que cada tag sea REALMENTE relevante para la receta
- NO uses tags genéricos o incorrectos (ej: NO pongas "Postres" en pizza o puré)
- Orden de prioridad: ingrediente principal → tipo de plato → característica especial
- Los tags nuevos deben ser categorías útiles para búsqueda
- cleaned_ingredientes debe ser lista simple de ingredientes base sin cantidades
"""
    
    return context


def load_recipes(file_path: str, limit: int = None) -> List[Dict[str, Any]]:
    """
    Load recipes from a JSON file.
    
    Args:
        file_path: Path to the JSON recipes file
        limit: Maximum number of recipes to load (None = all)
        
    Returns:
        List of recipes
    """
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        recipes = data if isinstance(data, list) else [data]
        
        if limit:
            recipes = recipes[:limit]
        
        return recipes
    except FileNotFoundError:
        print(f"❌ Error: No se encontró el archivo {file_path}")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"❌ Error al parsear JSON: {e}")
        sys.exit(1)


def enrich_recipe(
    recipe: Dict[str, Any], 
    ai_service: AIService, 
    global_context: str = ""
) -> Dict[str, Any]:
    """
    Enrich an individual recipe with AI-generated data.
    
    Args:
        recipe: Dictionary with recipe data
        ai_service: AI service instance
        global_context: Context of all recipes in the system
        
    Returns:
        Enriched recipe with new fields
    """
    prompt_template = """
{context}

---

TAREA: Analiza la siguiente receta y MEJORA los campos existentes.

Receta actual:
Nombre: {name}
Tags actuales: {current_tags}
Ingredientes: {ingredients}
Ingredientes limpios actuales: {cleaned_ingredients}
Descripción: {description}

Devuelve un objeto JSON con SOLO estos campos (respeta los nombres exactos):
{{
  "tags": ["tag1", "tag2", "tag3"],
  "cleaned_ingredientes": ["ingrediente1", "ingrediente2"],
  "tiempo": 30
}}

INSTRUCCIONES CRÍTICAS:

1. TAGS (3-6 tags):
   - PRIORIZA los tags de la lista del contexto global (ya validados)
   - PUEDES agregar tags nuevos si son relevantes y útiles para búsqueda
   - ADVERTENCIA RESTRICCIONES DIETÉTICAS: Ten MUCHO CUIDADO con tags como "Sin gluten", "Vegano", "Vegetariano"
     * "Sin gluten": SOLO si NO tiene harina de trigo, avena, cebada o centeno
     * "Vegano": SOLO si NO tiene ningún ingrediente animal (carne, huevo, lácteos, miel)
     * "Vegetariano": SOLO si NO tiene carne ni pescado (puede tener huevo/lácteos)
   - NO asumas: "harina 000" = harina de trigo (contiene gluten)
   - VERIFICA que cada tag sea RELEVANTE para esta receta específica
   - Ejemplos de errores: NO pongas "Postres" en pizza, puré o platos salados
   - Prioridad: ingrediente principal → tipo de plato → característica especial
   - Mantén formato: primera letra mayúscula, consistente

2. CLEANED_INGREDIENTES:
   - Lista simple de ingredientes base sin cantidades (ej: ["papa", "cebolla", "ajo"])
   - Normaliza nombres (ej: "papas" → "papa", "cebollas" → "cebolla")

3. TIEMPO:
   - Estima el tiempo total de preparación en minutos (solo el número)

NO agregues campos nuevos. SOLO devuelve estos 3 campos.
    """
    
    prompt = prompt_template.format(
        context=global_context,
        name=recipe.get("name", "Sin nombre"),
        current_tags=recipe.get("tags", []),
        ingredients=recipe.get("ingredients", []),
        cleaned_ingredients=recipe.get("cleaned_ingredientes", []),
        description=recipe.get("description", "")[:300]  # Solo primeros 300 chars
    )
    
    # Generar respuesta JSON usando el servicio
    result = ai_service.generar_json(prompt, temperatura=0.3, max_tokens=600)
    
    if result:
        # Actualizar SOLO los campos que la IA devolvió
        enriched_recipe = recipe.copy()
        
        # Actualizar tags si existen en el resultado
        if "tags" in result and result["tags"]:
            enriched_recipe["tags"] = result["tags"]
        
        # Actualizar cleaned_ingredientes si existen
        if "cleaned_ingredientes" in result and result["cleaned_ingredientes"]:
            enriched_recipe["cleaned_ingredientes"] = result["cleaned_ingredientes"]
        
        # Agregar tiempo solo si no existe
        if "tiempo" in result and "tiempo" not in enriched_recipe:
            enriched_recipe["tiempo"] = result["tiempo"]
        
        return enriched_recipe
    else:
        print(f"  ⚠️  No se pudo extraer JSON válido")
        return recipe


def process_recipes(
    input_file: str,
    output_file: str,
    num_recipes: int = None,
    dry_run: bool = False,
    model: str = "llama3.2",
    use_context: bool = True
):
    """
    Process recipes using AI to enrich them.
    
    Args:
        input_file: Path to the JSON recipes file
        output_file: Path where to save the result
        num_recipes: Number of recipes to process (None = all)
        dry_run: If True, only show result without saving
        model: Ollama model to use
        use_context: If True, load global context before processing
    """
    print("🤖 IA Main - Mejorador de Recetas")
    print("=" * 60)
    print(f"📂 Archivo entrada: {input_file}")
    print(f"🎯 Recetas a procesar: {num_recipes if num_recipes else 'Todas'}")
    print(f"🧠 Modelo: {model}")
    print(f"🌍 Contexto global: {'Activado ✓' if use_context else 'Desactivado'}")
    print(f"🔍 Modo: {'DRY RUN (solo visualización)' if dry_run else 'Guardar cambios'}")
    print("\n📝 Mejoras que se aplicarán:")
    print("   • Normalización de tags existentes")
    print("   • Limpieza de ingredientes base")
    print("   • Estimación de tiempo de preparación")
    print("=" * 60 + "\n")
    
    # Inicializar servicio de IA
    ai_service = AIService(modelo=model)
    
    # Verificar que el modelo esté disponible
    if not ai_service.verificar_modelo_disponible():
        print(f"❌ El modelo '{model}' no está disponible en Ollama")
        print(f"📋 Modelos disponibles: {', '.join(ai_service.listar_modelos_disponibles())}")
        print(f"\n💡 Descarga el modelo con: ollama pull {model}")
        sys.exit(1)
    
    # Cargar TODAS las recetas para contexto global
    print("📚 Cargando recetas completas para contexto...")
    all_recipes = load_recipes(input_file, limit=None)
    print(f"✓ {len(all_recipes)} recetas cargadas\n")
    
    # Generar contexto global si está activado
    global_context = ""
    if use_context:
        print("🌍 Generando contexto global del sistema...")
        global_context = generate_global_context(all_recipes)
        print("✓ Contexto global generado")
        print(f"   • {len(all_recipes)} recetas en contexto")
        
        # Contar tags únicos
        all_tags = []
        for r in all_recipes:
            tags = r.get('tags', [])
            if isinstance(tags, list):
                all_tags.extend(tags)
        unique_tags = len(set(all_tags))
        print(f"   • {unique_tags} tags únicos identificados")
        print(f"   • {len(global_context)} caracteres de contexto\n")
    
    # Seleccionar recetas a procesar
    recipes_to_process = all_recipes[:num_recipes] if num_recipes else all_recipes
    print(f"🔄 Procesando {len(recipes_to_process)} recetas...\n")
    
    # Procesar cada receta
    enriched_recipes = []
    
    for idx, recipe in enumerate(recipes_to_process, 1):
        name = recipe.get("name", "Sin nombre")[:50]
        print(f"[{idx}/{len(recipes_to_process)}] {name}...")
        
        try:
            enriched_recipe = enrich_recipe(recipe, ai_service, global_context)
            enriched_recipes.append(enriched_recipe)
            print("  ✓ Procesada exitosamente")
            
        except Exception as e:
            print(f"  ❌ Error: {e}")
            enriched_recipes.append(recipe)
    
    # Mostrar o guardar resultado
    if dry_run:
        print("\n" + "=" * 60)
        print("🔍 DRY RUN - Resultado:")
        print("=" * 60)
        print(json.dumps(enriched_recipes, indent=2, ensure_ascii=False))
        print("\n💡 Este es un dry-run. No se guardaron cambios.")
        print(f"   Para guardar, ejecuta sin --dry-run")
    else:
        # Guardar resultado
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(enriched_recipes, f, indent=2, ensure_ascii=False)
        
        print(f"\n✅ Proceso completado!")
        print(f"📁 {len(enriched_recipes)} recetas guardadas en: {output_file}")


def main():
    """Main function with command line arguments"""
    parser = argparse.ArgumentParser(
        description="Enriquece recetas usando IA local (Ollama)",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Ejemplos de uso:
  
  # Procesar 3 recetas en modo dry-run con contexto
  python ia_main.py --recipes 3 --dry-run
  
  # Procesar 10 recetas y guardar resultado
  python ia_main.py --recipes 10
  
  # Procesar sin contexto global (más rápido)
  python ia_main.py --recipes 5 --no-context
  
  # Procesar todas las recetas
  python ia_main.py
  
  # Usar modelo específico
  python ia_main.py --recipes 5 --model llama3
        """
    )
    
    parser.add_argument(
        "--recipes",
        type=int,
        metavar="N",
        help="Número de recetas a procesar (default: todas)"
    )
    
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Solo muestra el resultado sin guardar cambios"
    )
    
    parser.add_argument(
        "--model",
        type=str,
        default="llama3.2",
        help="Modelo de Ollama a utilizar (default: llama3.2)"
    )
    
    parser.add_argument(
        "--input",
        type=str,
        default="../src/data/recipes.json",
        help="Archivo de entrada con recetas (default: ../src/data/recipes.json)"
    )
    
    parser.add_argument(
        "--output",
        type=str,
        default="../src/data/recipes_enriquecidas.json",
        help="Archivo de salida (default: ../src/data/recipes_enriquecidas.json)"
    )
    
    parser.add_argument(
        "--no-context",
        action="store_true",
        help="Desactiva la carga de contexto global (más rápido pero menos consistente)"
    )
    
    args = parser.parse_args()
    
    # Ejecutar procesamiento
    process_recipes(
        input_file=args.input,
        output_file=args.output,
        num_recipes=args.recipes,
        dry_run=args.dry_run,
        model=args.model,
        use_context=not args.no_context
    )


if __name__ == "__main__":
    main()
