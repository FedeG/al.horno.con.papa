#!/usr/bin/env python3
"""
Parser Service
Maneja el procesamiento de datos: parsing de captions, manejo de JSON, etc.
"""

import re
import json
from pathlib import Path
from datetime import datetime
import sys

# Agregar el directorio padre al path para importar constants
sys.path.insert(0, str(Path(__file__).parent.parent))
from constants import TAGS_TO_SKIP, TAG_SYNONYMS, SECTION_END_MARKERS


class ParserService:
    """Servicio para procesar y parsear datos de recetas"""

    def __init__(self, recipes_file="src/data/recipes.json"):
        """
        Inicializa el servicio de parsing

        Args:
            recipes_file: Path al archivo recipes.json
        """
        self.recipes_file = recipes_file
        self.recipes_path = Path(__file__).parent.parent.parent / self.recipes_file

    def extract_hashtags(self, post):
        """
        Extrae hashtags del caption y los convierte en tags

        Args:
            post: Post de Instagram

        Returns:
            list: Lista de tags procesados
        """
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

    def extract_ingredients(self, caption):
        """
        Intenta extraer ingredientes del caption desde la sección 🥣 Ingredientes 🥣

        Args:
            caption: Caption del post de Instagram

        Returns:
            list: Lista de ingredientes
        """
        if not caption:
            return []

        lines = caption.split("\n")
        ingredients = []
        in_ingredients_section = False

        for line in lines:
            # Detectar inicio de sección de ingredientes
            if "ingredientes" in line.lower() and "🥣" in line:
                in_ingredients_section = True
                continue

            # Si encontramos otra sección, salir
            if in_ingredients_section and any(
                marker in line for marker in SECTION_END_MARKERS
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

    def extract_description(self, caption):
        """
        Extrae la descripción limpia (sin hashtags)

        Args:
            caption: Caption del post de Instagram

        Returns:
            str: Descripción limpia
        """
        if not caption:
            return ""

        # Remover hashtags pero preservar saltos de línea
        desc = re.sub(r"#\w+", "", caption)
        # Limpiar espacios múltiples en cada línea pero mantener \n
        cleaned_lines = [" ".join(line.split()) for line in desc.split("\n")]

        return "\n".join(cleaned_lines)

    def extract_recipe_name(self, caption):
        """
        Extrae el nombre de la receta de la primera línea

        Args:
            caption: Caption del post de Instagram

        Returns:
            str: Nombre de la receta
        """
        if not caption:
            return "Receta"

        # Primera línea sin hashtags ni emojis
        first_line = caption.split("\n")[0].strip()
        # Remover hashtags
        name = re.sub(r"#\w+", "", first_line)
        name = " ".join(name.split())

        return name

    def get_existing_recipes(self):
        """
        Lee el recipes.json actual y devuelve todas las recetas existentes

        Returns:
            tuple: (lista de recetas, fecha más reciente)
        """
        if not self.recipes_path.exists():
            return [], None

        try:
            with self.recipes_path.open("r", encoding="utf-8") as f:
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

    def post_to_recipe(self, post, local_image):
        """
        Convierte un post de Instagram en un objeto de receta

        Args:
            post: Post de Instagram
            local_image: Path local de la imagen

        Returns:
            dict: Objeto de receta
        """
        caption = post.caption if post.caption else ""
        post_url = f"https://www.instagram.com/p/{post.shortcode}/"

        recipe = {
            "id": post.mediaid,
            "name": self.extract_recipe_name(caption),
            "description": self.extract_description(caption),
            "tags": self.extract_hashtags(post),
            "instagramUrl": post_url,
            "facebookUrl": "",
            "imageUrl": local_image,
            "ingredients": self.extract_ingredients(caption),
            "date": post.date_local.isoformat(),
        }

        return recipe

    def save_recipes(self, recipes):
        """
        Guarda las recetas en el archivo recipes.json ordenadas por fecha

        Args:
            recipes: Lista de recetas a guardar
        """
        # Ordenar recetas por fecha (más reciente primero)
        sorted_recipes = sorted(
            recipes,
            key=lambda r: datetime.fromisoformat(r.get("date", "1970-01-01")),
            reverse=True,
        )

        # Guardar como JSON
        with self.recipes_path.open("w", encoding="utf-8") as f:
            json.dump(sorted_recipes, f, ensure_ascii=False, indent=2)

        print(f"✅ Archivo actualizado: {self.recipes_path}")
        print(f"📊 Total de recetas: {len(sorted_recipes)}")
