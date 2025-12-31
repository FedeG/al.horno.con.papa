#!/usr/bin/env python3
"""
Script para actualizar recipes.js desde Instagram
Extrae posts nuevos y los agrega al archivo de recetas
"""

import instaloader
import re
import json
import requests
from datetime import datetime
from pathlib import Path

# Configuración
INSTAGRAM_USERNAME = "al.horno.con.papa"
RECIPES_FILE = "../src/data/recipes.js"
IMAGES_DIR = "../public/images"
LAST_POST_COUNT = 10  # Número de posts a revisar

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

# Inicializar Instaloader
L = instaloader.Instaloader()

# Crear directorio de imágenes si no existe
Path(__file__).parent.joinpath(IMAGES_DIR).mkdir(parents=True, exist_ok=True)


def extract_hashtags(caption):
    """Extrae hashtags del caption y los convierte en tags"""
    if not caption:
        return []

    hashtags = re.findall(r"#(\w+)", caption)

    # Procesar tags
    processed_tags = set()

    for tag in hashtags:
        tag_lower = tag.lower()

        # Omitir tags de la lista de skip
        if tag_lower in TAGS_TO_SKIP:
            continue

        # Buscar si es sinónimo de algún tag
        found_synonym = False
        for main_tag, synonyms in TAG_SYNONYMS.items():
            if tag_lower in [s.lower() for s in synonyms]:
                processed_tags.add(main_tag.capitalize())
                found_synonym = True
                break

        # Si no es sinónimo, agregar el tag original capitalizado
        if not found_synonym:
            processed_tags.add(tag.capitalize())

    return sorted(list(processed_tags)) if processed_tags else ["Receta"]


def extract_ingredients(caption):
    """Intenta extraer ingredientes del caption desde la sección 🥣 Ingredientes 🥣"""
    if not caption:
        return []

    # Buscar la sección de ingredientes
    lines = caption.split("\n")
    ingredients = []
    in_ingredients_section = False

    for line in lines:
        # Detectar inicio de sección de ingredientes
        if "ingredientes" in line.lower() and "🥣" in line:
            in_ingredients_section = True
            continue

        # Si estamos en la sección y encontramos otra sección con emoji, salir
        if in_ingredients_section and any(
            emoji in line for emoji in ["👣", "🔪", "👨‍🍳", "📝", "🍽️", "⏰", "💡", "pasos", "Pasos"]
        ):
            break

        # Extraer ingredientes (líneas con •)
        if in_ingredients_section:
            line = line.strip()
            if line.startswith("•"):
                # Limpiar y agregar
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
    lines = desc.split("\n")
    cleaned_lines = [" ".join(line.split()) for line in lines]
    desc = "\\n".join(cleaned_lines)

    return desc


def extract_recipe_name(caption):
    """Extrae el nombre de la receta de la primera línea"""
    if not caption:
        return "Receta"

    # Primera línea sin hashtags ni emojis
    first_line = caption.split("\n")[0].strip()
    # Remover hashtags
    name = re.sub(r"#\w+", "", first_line)
    # Limpiar espacios múltiples
    name = " ".join(name.split())

    return name if name else "Receta"


def get_existing_recipes():
    """Lee el recipes.js actual y devuelve los posts existentes"""
    recipes_path = Path(__file__).parent / RECIPES_FILE

    if not recipes_path.exists():
        return [], 0, None

    content = recipes_path.read_text()

    # Extraer URLs existentes para evitar duplicados
    existing_urls = re.findall(r'instagramUrl:\s*"([^"]+)"', content)

    # Encontrar el ID más alto
    ids = re.findall(r"id:\s*(\d+)", content)
    max_id = max([int(i) for i in ids]) if ids else 0

    # Encontrar la fecha más reciente (aproximada por el orden)
    return existing_urls, max_id, None


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


def get_instagram_posts():
    """Obtiene posts de Instagram"""
    print(f"📸 Obteniendo posts de @{INSTAGRAM_USERNAME}...")

    try:
        profile = instaloader.Profile.from_username(L.context, INSTAGRAM_USERNAME)
        posts = []

        for i, post in enumerate(profile.get_posts()):
            if i >= LAST_POST_COUNT:
                break

            # Incluir fotos, carruseles y reels
            if post.typename in ["GraphImage", "GraphSidecar", "GraphVideo"]:
                posts.append(post)

        print(f"✅ Encontrados {len(posts)} posts")
        return posts

    except Exception as e:
        print(f"❌ Error obteniendo posts: {e}")
        print("💡 Tip: Si es cuenta privada, necesitas login:")
        print("   L.login('tu_usuario', 'tu_password')")
        return []


def generate_recipes_js(new_recipes):
    """Genera el archivo recipes.js con las recetas nuevas y existentes"""
    recipes_path = Path(__file__).parent / RECIPES_FILE

    # Leer archivo existente
    if recipes_path.exists():
        content = recipes_path.read_text()
        # Encontrar el array de recetas
        match = re.search(r"export const recipesData = \[(.*)\];", content, re.DOTALL)
        if match:
            existing_content = match.group(1).strip()
        else:
            existing_content = ""
    else:
        existing_content = ""

    # Generar nuevas recetas
    new_recipes_str = ""
    for recipe in new_recipes:
        new_recipes_str += f"""  {{
    id: {recipe["id"]},
    name: "{recipe["name"]}",
    description: "{recipe["description"]}",
    tags: {json.dumps(recipe["tags"], ensure_ascii=False)},
    instagramUrl: "{recipe["instagramUrl"]}",
    facebookUrl: "",
    imageUrl: "{recipe["imageUrl"]}",
    ingredients: {json.dumps(recipe["ingredients"], ensure_ascii=False)}
  }},
"""

    # Combinar (nuevas primero)
    if existing_content:
        combined = new_recipes_str + existing_content
    else:
        combined = new_recipes_str.rstrip(",\n")

    # Generar archivo completo
    output = f"""export const recipesData = [
{combined}
];
"""

    recipes_path.write_text(output, encoding="utf-8")
    print(f"✅ Archivo actualizado: {recipes_path}")


def main():
    print("🍳 Instagram to Recipes.js Updater")
    print("=" * 50)

    # Obtener recetas existentes
    existing_urls, max_id, _ = get_existing_recipes()
    print(f"📚 Recetas existentes: {len(existing_urls)}")
    print(f"🔢 Último ID: {max_id}")

    # Obtener posts de Instagram
    posts = get_instagram_posts()
    if not posts:
        print("\n⚠️  No se encontraron posts. Verifica:")
        print("   1. El usuario de Instagram es correcto")
        print("   2. La cuenta es pública (o usa login si es privada)")
        print("   3. El perfil tiene posts recientes")
        return

    # Filtrar posts nuevos
    new_recipes = []
    next_id = max_id + 1

    for post in posts:
        post_url = f"https://www.instagram.com/p/{post.shortcode}/"

        # Skip si ya existe
        if post_url in existing_urls:
            continue

        # Extraer datos
        caption = post.caption if post.caption else ""

        # Descargar imagen localmente
        local_image = download_image(post.url, post.shortcode)

        recipe = {
            "id": next_id,
            "name": extract_recipe_name(caption),
            "description": extract_description(caption),
            "tags": extract_hashtags(caption),
            "instagramUrl": post_url,
            "imageUrl": local_image,
            "ingredients": extract_ingredients(caption),
        }

        new_recipes.append(recipe)
        next_id += 1

        print(f"✨ Nueva: {recipe['name']} - {len(recipe['tags'])} tags")

    # Generar archivo
    if new_recipes:
        print(f"\n🎉 {len(new_recipes)} recetas nuevas encontradas")
        generate_recipes_js(new_recipes)
    else:
        print("\n✅ No hay recetas nuevas")


if __name__ == "__main__":
    main()
