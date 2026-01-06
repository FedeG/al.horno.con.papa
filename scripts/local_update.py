#!/usr/bin/env python3
"""
Local Update - Actualización local de recetas
Procesa recetas existentes para normalizar tags, aplicar sinónimos, etc.
"""

import argparse
from constants import RECIPES_FILE
from services.parser_service import ParserService


def print_statistics(recipes, title="📊 Estadísticas"):
    """
    Imprime estadísticas de las recetas

    Args:
        recipes: Lista de recetas
        title: Título de la sección
    """
    print(f"\n{title}")
    print("=" * 50)
    print(f"📚 Total de recetas: {len(recipes)}")

    # Estadísticas de tags
    all_tags = []
    for recipe in recipes:
        all_tags.extend(recipe.get("tags", []))

    unique_tags = set(all_tags)
    print(f"🏷️  Total de tags: {len(all_tags)}")
    print(f"🏷️  Tags únicos: {len(unique_tags)}")

    if unique_tags:
        print("\n📋 Tags más usados:")
        tag_counts = {}
        for tag in all_tags:
            tag_counts[tag] = tag_counts.get(tag, 0) + 1

        # Top 10 tags
        sorted_tags = sorted(tag_counts.items(), key=lambda x: x[1], reverse=True)
        for tag, count in sorted_tags[:550]:
            print(f"   • {tag}: {count}")

    # Estadísticas de ingredientes
    total_ingredients = sum(len(r.get("ingredients", [])) for r in recipes)
    recipes_with_ingredients = sum(
        1 for r in recipes if r.get("ingredients") and len(r["ingredients"]) > 0
    )

    print(f"\n🥣 Total de ingredientes: {total_ingredients}")
    print(f"🥣 Recetas con ingredientes: {recipes_with_ingredients}/{len(recipes)}")

    # Estadísticas de fechas
    recipes_with_dates = [r for r in recipes if "date" in r]
    if recipes_with_dates:
        from datetime import datetime

        dates = [datetime.fromisoformat(r["date"]) for r in recipes_with_dates]
        oldest = min(dates)
        newest = max(dates)
        print(f"\n📅 Fecha más antigua: {oldest.strftime('%Y-%m-%d')}")
        print(f"📅 Fecha más reciente: {newest.strftime('%Y-%m-%d')}")


def main():
    """Función principal que ejecuta la actualización local"""
    # Parsear argumentos de línea de comandos
    parser_args = argparse.ArgumentParser(
        description="Actualización local de recetas: normaliza tags, genera campos faltantes, etc."
    )
    parser_args.add_argument(
        "--force",
        action="store_true",
        help="Forzar la actualización de todos los campos, incluso los que ya existen"
    )
    args = parser_args.parse_args()
    
    print("🔄 Local Update - Actualización de Recetas")
    print("=" * 50)
    if args.force:
        print("⚠️  Modo FORCE activado: se actualizarán todos los campos")

    # Inicializar parser
    parser = ParserService(RECIPES_FILE)

    # Leer recetas existentes
    recipes, _ = parser.get_existing_recipes()

    if not recipes:
        print("❌ No se encontraron recetas para actualizar")
        return

    # Mostrar estadísticas iniciales
    print_statistics(recipes, "📊 Estadísticas ANTES del refresh")

    # Aplicar refresh a todas las recetas
    print(f"\n🔄 Aplicando refresh a {len(recipes)} recetas...")
    updated_recipes = []
    changes_count = 0

    for i, recipe in enumerate(recipes, 1):
        updated_recipe, changed = parser.refresh_recipe(recipe, force=args.force)
        updated_recipes.append(updated_recipe)

        if changed:
            changes_count += 1
            original_tags = recipe.get("old_tags", [])
            if not original_tags:
                original_tags = recipe.get("tags", [])

            print(f"  ✨ [{i}/{len(recipes)}] {recipe.get('name', 'Sin nombre')}")
            print(f"     Easy: {recipe.get('easy', False)} -> {updated_recipe.get('easy', False)}")
            print(f"     Originales: {original_tags}")
            print(f"     Antes: {recipe.get('tags', [])}")
            print(f"     Después: {updated_recipe.get('tags', [])}")
        else:
            print(f"  ✓ [{i}/{len(recipes)}] {recipe.get('name', 'Sin nombre')}")

    # Mostrar estadísticas finales
    print_statistics(updated_recipes, "\n📊 Estadísticas DESPUÉS del refresh")

    # Guardar recetas actualizadas
    if changes_count > 0:
        print(f"\n💾 Guardando {changes_count} recetas modificadas...")
        parser.save_recipes(updated_recipes)
        print("✅ Actualización completada con éxito")
    else:
        print("\n✅ No hubo cambios, todas las recetas están actualizadas")


if __name__ == "__main__":
    main()
