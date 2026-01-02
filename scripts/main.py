#!/usr/bin/env python3
"""
Main script - Instagram to Recipes.json Updater
Orquesta los servicios de Instagram y Parser para actualizar el archivo de recetas
"""

from constants import (
    INSTAGRAM_USERNAME,
    LOGIN_USERNAME,
    LOGIN_PASSWORD,
    RECIPES_FILE,
    IMAGES_DIR,
)
from services.instagram_service import InstagramService
from services.parser_service import ParserService


def main():
    """Función principal que ejecuta el proceso de actualización"""
    print("🍳 Instagram to Recipes.json Updater")
    print("=" * 50)

    # Inicializar servicios
    instagram = InstagramService(INSTAGRAM_USERNAME, IMAGES_DIR)
    parser = ParserService(RECIPES_FILE)

    # Login en Instagram (opcional pero recomendado para más datos)
    instagram.login(LOGIN_USERNAME, LOGIN_PASSWORD)

    # Obtener recetas existentes
    existing_recipes, max_date = parser.get_existing_recipes()
    existing_ids = {r["id"] for r in existing_recipes if "id" in r}

    print(f"📚 Recetas existentes: {len(existing_recipes)}")
    if max_date:
        print(f"📅 Fecha más reciente: {max_date.strftime('%Y-%m-%d %H:%M:%S')}")

    # Obtener posts de Instagram
    posts = instagram.get_posts(max_date)

    if not posts:
        print("\n⚠️  No se encontraron posts. Verifica:")
        print("   1. El usuario de Instagram es correcto")
        print("   2. La cuenta es pública (o usa login si es privada)")
        print("   3. El perfil tiene posts recientes")
        return

    # Procesar posts nuevos
    new_recipes = []

    for post in posts:
        # Skip si ya existe (por ID)
        if post.mediaid in existing_ids:
            continue

        # Descargar imagen localmente
        local_image = instagram.download_image(post.url, post.shortcode)

        # Convertir post a receta
        recipe = parser.post_to_recipe(post, local_image)

        new_recipes.append(recipe)
        print(f"✨ Nueva: {recipe['name']} - {len(recipe['tags'])} tags")

    # Combinar todas las recetas (existentes + nuevas)
    all_recipes = existing_recipes + new_recipes

    # Guardar archivo actualizado
    if new_recipes:
        print(f"\n🎉 {len(new_recipes)} recetas nuevas encontradas")
        parser.save_recipes(all_recipes)
    elif existing_recipes:
        # Re-ordenar recetas existentes si no hay nuevas
        print("\n✅ No hay recetas nuevas, reordenando existentes")
        parser.save_recipes(all_recipes)
    else:
        print("\n✅ No hay recetas")


if __name__ == "__main__":
    main()
