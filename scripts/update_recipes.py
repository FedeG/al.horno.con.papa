#!/usr/bin/env python3
"""
Script para actualizar recipes.js desde Instagram
Extrae posts nuevos y los agrega al archivo de recetas
"""

import random
import time
import instaloader
import re
import json
import requests
from pathlib import Path
from datetime import datetime

# Configuración
INSTAGRAM_USERNAME = "al.horno.con.papa"
RECIPES_FILE = "../src/data/recipes.json"
IMAGES_DIR = "../public/images"

# Tags a omitir
TAGS_TO_SKIP = [
    "alhornoconpapa",
    "instagram",
    "instagood",
    "food",
    "foodie",
    "comida",
    "recetas",
    "recetas",
    "recipe",
    "recipes",
    "cocinacasera",
    "comidacasera",
    "casero",
    "hechoencasa",
    "cocina",
    "tipsdecocina",
]

# Sinónimos de tags (key: [sinónimos])
# Si aparece cualquier sinónimo, se reemplaza por la key
TAG_SYNONYMS = {
    "vegano": ["vegan", "vegano"],
    "vegetariano": ["vegetariano", "vegetarian"],
    "postres": ["postre", "postres", "dessert", "desserts"],
    "navidad": ["navidad", "christmas", "navideño", "mesanavideña"],
    "chocolate": ["chocolate", "chocolatoso"],
}

# Crear una instancia de Instaloader
L = instaloader.Instaloader()

# Iniciar sesión para acceder a más datos
try:
    # Mejor usar variables de entorno para las credenciales
    username = INSTAGRAM_USERNAME
    password = "XXXXXXXXXXXXXXXXX"
    L.login(username, password)
except instaloader.exceptions.TwoFactorAuthRequiredException:
    # Si requiere 2FA, solicitar el código
    two_factor_code = input("Ingresa el código de verificación de dos factores: ")
    L.two_factor_login(two_factor_code)
except Exception as e:
    print(f"Error de login: {e}")
    print("Continuando sin autenticación (datos limitados)")

# Crear directorio de imágenes si no existe
Path(__file__).parent.joinpath(IMAGES_DIR).mkdir(parents=True, exist_ok=True)


def extract_hashtags(post):
    """Extrae hashtags del caption y los convierte en tags"""
    if not post.caption:
        return []

    hashtags = post.caption_hashtags
    processed_tags = set()

    for tag in hashtags:
        tag_lower = tag.lower()

        # Omitir tags de la lista de skip
        if tag_lower in TAGS_TO_SKIP:
            continue

        # Buscar si es sinónimo de algún tag
        main_tag = next(
            (
                main
                for main, syns in TAG_SYNONYMS.items()
                if tag_lower in [s.lower() for s in syns]
            ),
            None,
        )

        if main_tag:
            processed_tags.add(main_tag.capitalize())
        else:
            processed_tags.add(tag.capitalize())

    return sorted(processed_tags)


def extract_ingredients(caption):
    """Intenta extraer ingredientes del caption desde la sección 🥣 Ingredientes 🥣"""
    if not caption:
        return []

    lines = caption.split("\n")
    ingredients = []
    in_ingredients_section = False
    section_end_markers = ["👣", "🔪", "👨‍🍳", "📝", "🍽️", "⏰", "💡", "pasos", "Pasos"]

    for line in lines:
        # Detectar inicio de sección de ingredientes
        if "ingredientes" in line.lower() and "🥣" in line:
            in_ingredients_section = True
            continue

        # Si encontramos otra sección, salir
        if in_ingredients_section and any(
            marker in line for marker in section_end_markers
        ):
            break

        # Extraer ingredientes (líneas con •)
        if in_ingredients_section:
            line = line.strip()
            if line.startswith("•"):
                ingredient = line.replace("•", "").strip()
                if ingredient:
                    ingredients.append(ingredient)

    return ingredients


def extract_description(caption):
    """Extrae la descripción limpia (sin hashtags)"""
    if not caption:
        return ""

    # Remover hashtags pero preservar saltos de línea
    desc = re.sub(r"#\w+", "", caption)
    # Limpiar espacios múltiples en cada línea pero mantener \n
    cleaned_lines = [" ".join(line.split()) for line in desc.split("\n")]

    return "\n".join(cleaned_lines)


def extract_recipe_name(caption):
    """Extrae el nombre de la receta de la primera línea"""
    if not caption:
        return "Receta"

    # Primera línea sin hashtags ni emojis
    first_line = caption.split("\n")[0].strip()
    # Remover hashtags
    name = re.sub(r"#\w+", "", first_line)
    name = " ".join(name.split())

    return name


def get_existing_recipes():
    """Lee el recipes.json actual y devuelve todas las recetas existentes"""
    recipes_path = Path(__file__).parent / RECIPES_FILE

    if not recipes_path.exists():
        return [], None

    try:
        with recipes_path.open("r", encoding="utf-8") as f:
            existing_recipes = json.load(f)

        # Encontrar la fecha más reciente
        max_date = None
        for recipe in existing_recipes:
            if "date" in recipe:
                try:
                    date_obj = datetime.fromisoformat(recipe["date"])
                    if max_date is None or date_obj > max_date:
                        max_date = date_obj
                except ValueError:
                    pass

        return existing_recipes, max_date

    except Exception as e:
        print(f"⚠️  Error leyendo recetas existentes: {e}")
        return [], None


def download_image(url, shortcode):
    """Descarga la imagen y la guarda localmente"""
    try:
        images_path = Path(__file__).parent / IMAGES_DIR
        filename = f"{shortcode}.jpg"
        filepath = images_path / filename

        # Si ya existe, no descargar de nuevo
        if filepath.exists():
            return f"images/{filename}"

        print(f"  ⬇️  Descargando imagen {shortcode}...")
        response = requests.get(url, timeout=10)
        response.raise_for_status()

        filepath.write_bytes(response.content)
        print(f"  ✅ Imagen guardada: {filename}")
        return f"images/{filename}"

    except Exception as e:
        print(f"  ⚠️  Error descargando imagen: {e}")
        return url  # Fallback a la URL original


def get_instagram_posts(max_date=None):
    """Obtiene posts de Instagram hasta encontrar uno no pinned más antiguo que max_date"""
    print(f"📸 Obteniendo posts de @{INSTAGRAM_USERNAME}...")
    if max_date:
        print(
            f"📅 Buscando posts hasta fecha: {max_date.strftime('%Y-%m-%d %H:%M:%S')}"
        )

    profile = instaloader.Profile.from_username(L.context, INSTAGRAM_USERNAME)
    posts = []
    found_older_post = False

    try:
        for i, post in enumerate(profile.get_posts()):
            # Incluir fotos, carruseles y reels
            print(
                f"  🔍 Revisando post {i + 1}: {post.shortcode} ({post.date_local.strftime('%Y-%m-%d')})"
            )
            if post.typename not in ["GraphImage", "GraphSidecar", "GraphVideo"]:
                continue

            # Si el post no está pinned y tenemos fecha máxima
            if not post.is_pinned and max_date:
                # Si encontramos un post más antiguo que nuestra fecha máxima, paramos
                if post.date_local < max_date:
                    print(
                        f"⏹️  Post {post.shortcode} es más antiguo ({post.date_local.strftime('%Y-%m-%d')}), deteniendo búsqueda"
                    )
                    found_older_post = True
                    break

            posts.append(post)

            # Pausa de medio segundo a un segundo para evitar rate limiting
            time.sleep(0.5 + (random.random() * 0.5))

        if found_older_post:
            print("📌 Se encontró un post no pinned más antiguo que la fecha máxima")

    except Exception as e:
        print(f"📦 Deteniendo búsqueda con {len(posts)} posts encontrados")
        print(f"❌ Error obteniendo posts: {e}")
        print("💡 Tip: Si es cuenta privada, necesitas login:")
        print("   L.login('tu_usuario', 'tu_password')")

    print(f"✅ Encontrados {len(posts)} posts")
    return posts


def generate_recipes_json(all_recipes):
    """Genera el archivo recipes.json con todas las recetas ordenadas por fecha"""
    recipes_path = Path(__file__).parent / RECIPES_FILE

    # Ordenar recetas por fecha (más reciente primero)
    sorted_recipes = sorted(
        all_recipes,
        key=lambda r: datetime.fromisoformat(r.get("date", "1970-01-01")),
        reverse=True,
    )

    # Guardar como JSON
    with recipes_path.open("w", encoding="utf-8") as f:
        json.dump(sorted_recipes, f, ensure_ascii=False, indent=2)

    print(f"✅ Archivo actualizado: {recipes_path}")
    print(f"📊 Total de recetas: {len(sorted_recipes)}")


def main():
    print("🍳 Instagram to Recipes.js Updater")
    print("=" * 50)

    # Obtener recetas existentes
    existing_recipes, max_date = get_existing_recipes()
    existing_ids = {r["id"] for r in existing_recipes if "id" in r}

    print(f"📚 Recetas existentes: {len(existing_recipes)}")
    if max_date:
        print(f"📅 Fecha más reciente: {max_date.strftime('%Y-%m-%d %H:%M:%S')}")

    # Obtener posts de Instagram
    posts = get_instagram_posts(max_date)
    if not posts:
        print("\n⚠️  No se encontraron posts. Verifica:")
        print("   1. El usuario de Instagram es correcto")
        print("   2. La cuenta es pública (o usa login si es privada)")
        print("   3. El perfil tiene posts recientes")
        return

    # Filtrar posts nuevos
    new_recipes = []

    for post in posts:
        post_url = f"https://www.instagram.com/p/{post.shortcode}/"

        # Skip si ya existe (por ID)
        if post.mediaid in existing_ids:
            continue

        # Extraer datos
        caption = post.caption if post.caption else ""

        # Descargar imagen localmente
        local_image = download_image(post.url, post.shortcode)

        recipe = {
            "id": post.mediaid,
            "name": extract_recipe_name(caption),
            "description": extract_description(caption),
            "tags": extract_hashtags(post),
            "instagramUrl": post_url,
            "facebookUrl": "",
            "imageUrl": local_image,
            "ingredients": extract_ingredients(caption),
            "date": post.date_local.isoformat(),
        }

        new_recipes.append(recipe)
        print(f"✨ Nueva: {recipe['name']} - {len(recipe['tags'])} tags")

    # Combinar todas las recetas (existentes + nuevas)
    all_recipes = existing_recipes + new_recipes

    # Generar archivo ordenado
    if new_recipes:
        print(f"\n🎉 {len(new_recipes)} recetas nuevas encontradas")
        generate_recipes_json(all_recipes)
    elif existing_recipes:
        # Re-ordenar recetas existentes si no hay nuevas
        print("\n✅ No hay recetas nuevas, reordenando existentes")
        generate_recipes_json(all_recipes)
    else:
        print("\n✅ No hay recetas")


if __name__ == "__main__":
    main()
