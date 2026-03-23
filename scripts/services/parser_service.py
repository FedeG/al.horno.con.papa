#!/usr/bin/env python3
"""
Parser Service
Maneja el procesamiento de datos: parsing de captions, manejo de JSON, etc.
"""

import re
import json
import unicodedata
from pathlib import Path
from datetime import datetime
import sys

# Agregar el directorio padre al path para importar constants
sys.path.insert(0, str(Path(__file__).parent.parent))
from constants import (
    EASY_TAG,
    TAGS_TO_SKIP,
    TAG_SYNONYMS,
    UNIDADES_MEDIDA,
    ARTICULOS_PREPOSICIONES,
    TAMANOS_CUALIDADES,
    FRACCIONES_TEXTO,
    FRACCIONES_UNICODE,
    PATRONES_FINAL,
    PATRONES_INICIO,
)


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

    def generate_slug(self, recipe_name):
        """
        Genera un slug SEO-friendly a partir del nombre de la receta.
        
        Procesa:
        - Convierte a minúsculas
        - Remueve tildes y acentos (toné → tone, café → cafe)
        - Elimina caracteres especiales (incluyendo emojis)
        - Reemplaza espacios con guiones
        - Elimina guiones múltiples
        - Elimina guiones al inicio y final

        Args:
            recipe_name: Nombre de la receta

        Returns:
            str: Slug limpio y SEO-friendly
        """
        if not recipe_name:
            return ""
        
        # 1. Convertir a minúsculas
        slug = recipe_name.lower()
        
        # 2. Remover tildes y acentos normalizando a NFD y eliminando diacríticos
        texto_normalizado = unicodedata.normalize('NFD', slug)
        slug = ''.join(c for c in texto_normalizado if unicodedata.category(c) != 'Mn')
        
        # 3. Eliminar caracteres especiales (mantiene solo letras, números, espacios y guiones)
        # Esto elimina emojis y otros caracteres especiales
        slug = re.sub(r'[^\w\s-]', '', slug, flags=re.UNICODE)
        
        # 4. Reemplazar espacios múltiples con un solo guión
        slug = re.sub(r'\s+', '-', slug.strip())
        
        # 5. Eliminar guiones múltiples
        slug = re.sub(r'-+', '-', slug)
        
        # 6. Eliminar guiones al inicio y final
        slug = slug.strip('-')
        
        return slug

    def generate_unique_slug(self, recipe_name, existing_recipes):
        """
        Genera un slug único verificando que no exista un duplicado en las recetas existentes.
        Si hay un duplicado, agrega un sufijo numérico (-2, -3, -4, ...) al final.

        Args:
            recipe_name: Nombre de la receta
            existing_recipes: Lista de recetas existentes

        Returns:
            str: Slug único con sufijo si es necesario
        """
        # Generar el slug base
        base_slug = self.generate_slug(recipe_name)
        
        if not base_slug:
            return ""
        
        # Obtener todos los slugs existentes
        existing_slugs = set()
        for recipe in existing_recipes:
            if "slug" in recipe and recipe["slug"]:
                existing_slugs.add(recipe["slug"])
        
        # Si el slug base no existe, devolverlo tal cual
        if base_slug not in existing_slugs:
            return base_slug
        
        # Si existe un duplicado, agregar sufijos -2, -3, -4, ...
        counter = 2
        while True:
            new_slug = f"{base_slug}-{counter}"
            if new_slug not in existing_slugs:
                return new_slug
            counter += 1

    def fix_all_duplicate_slugs(self, recipes):
        """
        Busca y corrige TODOS los slugs duplicados en las recetas.
        Regenera los slugs usando generate_unique_slug para asegurar unicidad.

        Args:
            recipes: Lista de recetas

        Returns:
            tuple: (recetas corregidas, lista de cambios realizados)
        """
        if not recipes:
            return recipes, []
        
        # Encontrar duplicados
        slug_map = {}
        for i, r in enumerate(recipes):
            slug = r.get("slug", "")
            if slug:
                if slug not in slug_map:
                    slug_map[slug] = []
                slug_map[slug].append(i)
        
        # Procesar solo los que tienen duplicados
        duplicates = {slug: indices for slug, indices in slug_map.items() if len(indices) > 1}
        
        if not duplicates:
            return recipes, []
        
        updated = [r.copy() for r in recipes]
        changes = []
        
        for base_slug, indices in duplicates.items():
            # Dejar el primero con base_slug para mantener URLs estables,
            # regenerar slugs únicos solo para los restantes duplicados
            for idx in indices[1:]:
                recipe_name = updated[idx].get("name", "")
                old_slug = updated[idx].get("slug", "")
                new_slug = self.generate_unique_slug(recipe_name, updated)
                if new_slug != old_slug:
                    updated[idx]["slug"] = new_slug
                    changes.append({
                        "recipe": recipe_name,
                        "old_slug": old_slug,
                        "new_slug": new_slug
                    })
        
        return updated, changes

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
        Intenta extraer ingredientes del caption desde la sección de ingredientes.
        Soporta múltiples formatos:
        - 🥣Ingredientes
        - 🥣 Ingredientes 🥣
        - 👨🏼‍🍳Ingredientes
        - 👨🏼‍🍳 Ingredientes 👨🏼‍🍳
        - 👨🏼‍🍳Ingredientes👨🏼‍🍳
        (con o sin espacios entre emojis y título)

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
            # Remover todos los emojis y espacios para comparar
            line_clean = re.sub(r"[^\w\s]", "", line.lower()).strip()

            if "ingredientes" in line_clean:
                in_ingredients_section = True
                continue

            # Si encontramos otra sección, salir
            if in_ingredients_section:
                # Verificar si es inicio de nueva sección
                line_stripped = line.strip()

                # Salir si encontramos "pasos", "tareas", u otras secciones
                if any(
                    keyword in line_clean
                    for keyword in ["pasos", "tareas", "preparacion", "procedimiento"]
                ):
                    break

                # Salir si la línea empieza con emojis de sección
                if any(
                    line_stripped.startswith(marker)
                    for marker in ["👣", "🔪", "📝", "🍽️", "⏰", "👨‍👦", "🧒"]
                ):
                    break

            # Extraer ingredientes (líneas con •, -, o 🔸)
            if in_ingredients_section:
                line = line.strip()
                if (
                    line.startswith("•")
                    or line.startswith("-")
                    or line.startswith("🔸")
                ):
                    # Remover el marcador (•, -, o 🔸)
                    ingredient = line[1:].strip()
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
        post_type = "reel" if post.is_video else "p"
        post_url = f"https://www.instagram.com/{post_type}/{post.shortcode}/"
        tags = self.extract_hashtags(post)

        recipe = {
            "id": post.mediaid,
            "name": self.extract_recipe_name(caption),
            "description": self.extract_description(caption),
            "tags": tags,
            "instagramUrl": post_url,
            "facebookUrl": "",
            "imageUrl": local_image,
            "ingredients": self.extract_ingredients(caption),
            "date": post.date_local.isoformat(),
            "easy": EASY_TAG.capitalize() in tags,
            "hidden": False,
            "shortcode": post.shortcode,
        }
        recipe["cleaned_ingredientes"] = self.get_cleaned_ingredients(recipe)

        return recipe

    def get_hidden_status(self, recipe):
        """
        Determina si una receta debe estar oculta

        Args:
            recipe: Receta a verificar

        Returns:
            bool: False por ahora (todas las recetas visibles)
        """
        return False

    def get_cleaned_ingredients(self, recipe, field="ingredients"):
        """
        Limpia los ingredientes removiendo cantidades, unidades, tamaños, etc.
        Toda la configuración de qué remover está en constants.py para fácil modificación.

        Args:
            recipe: Receta con ingredientes

        Returns:
            list: Lista de ingredientes limpios únicos y singularizados
        """
        ingredients = recipe.get(field, [])
        if not ingredients:
            return []

        cleaned_set = set()  # Usar set para evitar duplicados

        for ingredient in ingredients:
            # Separar por " y " o " o " para casos como "sal y pimienta" o "tapita o cucharadita"
            # Primero separar por "o", luego cada parte por "y"
            parts_or = ingredient.split(" o ")
            parts = []
            for part_or in parts_or:
                parts.extend(part_or.split(" y "))

            for part in parts:
                cleaned_ing = part.strip()

                # 1. Remover patrones al final PRIMERO (antes de otras operaciones)
                # Esto resuelve "Alcaparras a gusto (opcional)" correctamente
                for patron, flag in PATRONES_FINAL:
                    flags = re.IGNORECASE if flag == "IGNORECASE" else 0
                    cleaned_ing = re.sub(patron, "", cleaned_ing, flags=flags)

                # 2. Remover patrones al inicio
                for patron, flag in PATRONES_INICIO:
                    flags = re.IGNORECASE if flag == "IGNORECASE" else 0
                    cleaned_ing = re.sub(patron, "", cleaned_ing, flags=flags)

                # 3. Remover tamaños/cualidades al final (antes de procesar el inicio)
                tamanos_pattern = "|".join([re.escape(t) for t in TAMANOS_CUALIDADES])
                cleaned_ing = re.sub(
                    r"\s+(" + tamanos_pattern + r")$",
                    "",
                    cleaned_ing,
                    flags=re.IGNORECASE,
                )

                # 4. Remover fracciones unicode (½, ¼, etc)
                cleaned_ing = re.sub(FRACCIONES_UNICODE, "", cleaned_ing)

                # 5. Remover fracciones en texto al inicio
                fracciones_pattern = "|".join([re.escape(f) for f in FRACCIONES_TEXTO])
                cleaned_ing = re.sub(
                    r"^(" + fracciones_pattern + r")\s+",
                    "",
                    cleaned_ing,
                    flags=re.IGNORECASE,
                )

                # 6. Remover cantidades numéricas al inicio
                cleaned_ing = re.sub(r"^\d+[\./]?\d*\s*", "", cleaned_ing)

                # 7. Remover unidades de medida al inicio (incluye "jugo", "diente", etc)
                unidades_pattern = "|".join([re.escape(u) for u in UNIDADES_MEDIDA])
                cleaned_ing = re.sub(
                    r"^(" + unidades_pattern + r")\b\s*",
                    "",
                    cleaned_ing,
                    flags=re.IGNORECASE,
                )

                # 8. Remover artículos/preposiciones al inicio (repetir para casos como "de medio")
                articulos_pattern = "|".join(
                    [re.escape(a) for a in ARTICULOS_PREPOSICIONES]
                )
                for _ in range(4):  # Aumentar iteraciones para casos complejos
                    before = cleaned_ing
                    cleaned_ing = re.sub(
                        r"^(" + articulos_pattern + r")\b\s+",
                        "",
                        cleaned_ing,
                        flags=re.IGNORECASE,
                    )
                    if before == cleaned_ing:
                        break

                # 9. Remover tamaños/cualidades al principio (si quedaron)
                cleaned_ing = re.sub(
                    r"^(" + tamanos_pattern + r")\s+",
                    "",
                    cleaned_ing,
                    flags=re.IGNORECASE,
                )

                # 10. Limpiar espacios extras
                cleaned_ing = " ".join(cleaned_ing.split())

                # 11. Remover paréntesis sueltos (abiertos sin cerrar o cerrados sin abrir)
                # Contar paréntesis
                open_count = cleaned_ing.count("(")
                close_count = cleaned_ing.count(")")

                # Si hay desbalance, remover todos los paréntesis
                if open_count != close_count:
                    cleaned_ing = cleaned_ing.replace("(", "").replace(")", "")
                    cleaned_ing = cleaned_ing.strip()

                # 12. Convertir a minúsculas
                cleaned_ing = cleaned_ing.lower()

                # 13. Singularizar
                cleaned_ing = self._singularize(cleaned_ing)

                # Agregar al set si no está vacío
                if cleaned_ing:
                    cleaned_set.add(cleaned_ing)

        return sorted(list(cleaned_set))

    def _singularize(self, word):
        """
        Convierte palabras del plural al singular (reglas básicas del español)

        Args:
            word: Palabra o frase a singularizar

        Returns:
            str: Palabra singularizada
        """
        # Si es una frase de múltiples palabras, singularizar la última palabra
        words = word.split()
        if len(words) > 1:
            words[-1] = self._singularize_word(words[-1])
            return " ".join(words)
        else:
            return self._singularize_word(word)

    def _singularize_word(self, word):
        """
        Singulariza una sola palabra

        Args:
            word: Palabra a singularizar

        Returns:
            str: Palabra en singular
        """
        if len(word) < 3:
            return word

        # Reglas de singularización en español
        # -ces -> -z (nueces -> nuez)
        if word.endswith("ces"):
            return word[:-3] + "z"

        # -es después de consonante -> remover -es (limones -> limón)
        if word.endswith("es") and len(word) > 3 and word[-3] not in "aeiouáéíóú":
            return word[:-2]

        # -s después de vocal -> remover -s (huevos -> huevo, tomates -> tomate)
        if word.endswith("s") and word[-2] in "aeiouáéíóú":
            return word[:-1]

        return word

    def get_shortcode(self, recipe):
        """
        Extrae el shortcode de la URL de Instagram
        Formatos soportados:
        - https://<dominio>/p/shortcode/
        - https://<dominio>/reel/shortcode/

        Args:
            recipe: Receta con instagramUrl

        Returns:
            str: Shortcode extraído o cadena vacía si no se encuentra
        """
        instagram_url = recipe.get("instagramUrl", "")
        if not instagram_url:
            return ""

        # Patrón para extraer shortcode de URLs /p/ o /reel/
        match = re.search(r"/(p|reel)/([A-Za-z0-9_-]+)", instagram_url)
        if match:
            return match.group(2)

        return ""

    def normalize_tags(self, tags, recipe_name=""):
        """
        Normaliza una lista de tags aplicando sinónimos y filtros
        También elimina el tag si ya está presente en el nombre de la receta.

        Args:
            tags: Lista de tags a normalizar

        Returns:
            list: Lista de tags normalizados
        """
        if not tags:
            return []

        processed_tags = set()

        # Limpiar el nombre de la receta para comparaciones (quitar emojis y normalizar)
        # Esto hace que "👨🏼‍🍳 Hummus 👨🏼‍🍳" sea simplemente "hummus"
        clean_name = re.sub(r"[^\w\s]", "", recipe_name.lower()).strip()
        clean_name_joined = clean_name.replace(" ", "")
        name_words = set(clean_name.split())

        for tag in tags:
            tag_clean = tag.lower().replace("#", "").strip()

            # 1. Omitir si está en la lista de skip o es muy corto (menos de 3 letras, ej: "de")
            # Excepto casos especiales como "blw"
            if tag_clean in TAGS_TO_SKIP or (len(tag_clean) < 3 and tag_clean != "blw"):
                continue

            # 2. Omitir si el tag ya es parte del nombre de la receta
            # (Si la receta se llama "Pan casero", no hace falta el tag "pan")
            if (
                tag_clean in name_words
                or tag_clean in clean_name
                or tag_clean.replace(" ", "") in clean_name_joined
            ):
                continue

            # 3. Buscar sinónimos para estandarizar
            main_tag = next(
                (
                    main
                    for main, syns in TAG_SYNONYMS.items()
                    if tag_clean in [s.lower() for s in syns]
                ),
                None,
            )

            if main_tag:
                processed_tags.add(main_tag.capitalize())
            else:
                processed_tags.add(tag_clean.capitalize())

        return sorted(processed_tags)

    def refresh_recipe(self, recipe, force=False, existing_recipes=None):
        """
        Actualiza los tags de una receta aplicando normalización
        También verifica y genera campos faltantes: hidden, cleaned_ingredientes, shortcode, slug

        Args:
            recipe: Receta a actualizar
            force: Forzar la actualización de todos los campos
            existing_recipes: Lista de recetas existentes para generar slug único. Si no se proporciona, se obtiene del archivo.

        Returns:
            tuple: (receta actualizada, bool indicando si hubo cambios)
        """
        current_tags = recipe.get("tags", [])
        original_tags = recipe.get("old_tags", [])
        if not original_tags:
            original_tags = current_tags

        recipe_name = recipe.get("name", "")
        normalized_tags = self.normalize_tags(original_tags, recipe_name)

        # Crear copia de la receta
        updated_recipe = recipe.copy()
        updated_recipe["old_tags"] = original_tags
        updated_recipe["tags"] = normalized_tags

        # Verificar si hubo cambios
        changed = force or set(current_tags) != set(normalized_tags)

        if force or (
            EASY_TAG.capitalize() in normalized_tags and not recipe.get("easy", False)
        ):
            updated_recipe["easy"] = True
            changed = True

        # Verificar y generar campo 'hidden' si no existe
        if force or "hidden" not in recipe:
            updated_recipe["hidden"] = self.get_hidden_status(recipe)
            changed = True

        # Verificar y generar campo 'ingredients' si no existe o está vacío
        ingredients = recipe.get("ingredients")
        if force or not ingredients:
            # Intentar extraer desde la descripción
            description = recipe.get("description", "")
            if description:
                extracted_ingredients = self.extract_ingredients(description)
                if extracted_ingredients:
                    updated_recipe["ingredients"] = extracted_ingredients
                    changed = True

        # Verificar y generar campo 'cleaned_ingredientes' si no existe
        if force or "cleaned_ingredientes" not in recipe:
            updated_recipe["cleaned_ingredientes"] = self.get_cleaned_ingredients(
                updated_recipe
            )
            changed = True

        # Verificar y generar campo 'shortcode' si no existe
        if force or "shortcode" not in recipe:
            updated_recipe["shortcode"] = self.get_shortcode(recipe)
            changed = True

        # Verificar y generar campo 'slug' si no existe o forzar regeneración
        if force or "slug" not in recipe:
            # Obtener recetas existentes si no se proporcionaron
            if existing_recipes is None:
                existing_recipes, _ = self.get_existing_recipes()

            # Excluir la propia receta (por slug actual) para no generar sufijos innecesarios
            current_slug = recipe.get("slug")
            if current_slug:
                filtered_existing_recipes = [
                    r for r in existing_recipes if r.get("slug") != current_slug
                ]
            else:
                filtered_existing_recipes = existing_recipes

            generated_slug = self.generate_unique_slug(recipe_name, filtered_existing_recipes)
            updated_recipe["slug"] = generated_slug
            changed = True

        return updated_recipe, changed

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
