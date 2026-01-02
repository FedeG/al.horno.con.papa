#!/usr/bin/env python3
"""
Constants - Configuración centralizada del proyecto
"""

# Configuración de Instagram
INSTAGRAM_USERNAME = "al.horno.con.papa"
LOGIN_USERNAME = "al.horno.con.papa"
LOGIN_PASSWORD = "xxxxxxxxxxxxxx"

# Rutas de archivos
RECIPES_FILE = "src/data/recipes.json"
IMAGES_DIR = "public/images"

# Tags a omitir durante el procesamiento
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

# Marcadores de fin de sección al parsear ingredientes
SECTION_END_MARKERS = ["👣", "🔪", "👨‍🍳", "📝", "🍽️", "⏰", "💡", "pasos", "Pasos"]

# Post pineados
PINNED_MEDIAIDS = [3283787029367823611, 3280944293224657232]
