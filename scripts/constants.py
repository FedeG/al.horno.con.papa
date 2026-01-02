# ruff: noqa
# fmt: off
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
    # Redes y Marketing
    "alhornoconpapa", "instagram", "instagood", "food", "foodie", "comida", 
    "reels", "instafood", "instareels", "reelsinstagram", "instagramreels",
    "comidarica", "recetadeldía", "delicioso", "momentosgourmet", "gourmet",
    "caseroesmejor", "sabor", "sabores", "anushcuidarte", "pruebencocinando",
    "recetadeliciosa", "comidareal", "realfood", "telefe", "masterchef",
    "bakeoff", "bakeoffargentina", "sharktank",
    
    # Genéricos de cocina (No ayudan a filtrar)
    "recetas", "recipe", "recipes", "cocinacasera", "comidacasera", "casero",
    "hechoencasa", "cocina", "tipsdecocina", "receta", "cocinasaludable",
    "saludable", "recetassaludables", "recetasricas", "cocinarencasa",
    "cocinaenfamilia", "familia", "family", "saborcasero", "saborencasa",
    "recetasfamiliares", "cocinaconsabor", "cocinafresca", "aprendiendoacocinar",
    "recetacasera", "recetascaseras", "recetasclásicas", "alimentacionreal",
    "cocinscasera", "cocinaencasa", "natural", "hogar", "horno", "comidasaludable",
    "comidasana", "delicias",
    
    # Meta-datos o Institucionales
    "ingenieriaensistemas", "modelodenegocio", "proyectosuniversitarios", 
    "utn", "facultad", "emprendimiento",

    # Otros
    "agroecologico"
]

EASY_TAG = "facil"

# Sinónimos de tags (key: [sinónimos])
# Si aparece cualquier sinónimo, se reemplaza por la key
TAG_SYNONYMS = {
    "vegano": [
        "vegan", "vegano", "vegana", "veganfood", "proteinavegana", 
        "recetasveganas", "cocinavegana", "comidavegana", "plantbased", "veganesa"
    ],
    "vegetariano": ["vegetariano", "vegetarian", "veggie", "veggiefood", "recetasveggie", "vegfood"],
    "postres": [
        "postre", "postres", "dessert", "desserts", "postrescaseros", 
        "postrecasero", "postreslatinos", "postresnavideños", "dulce", "dulces", "momentosdulces"
    ],
    "navidad": ["navidad", "christmas", "navideño", "mesanavideña", "recetanavideña", "fiestas", "findeaño"],
    "chocolate": ["chocolate", "chocolatoso", "chocolatelovers", "chocolatedulce"],
    "argentina": [
        "argentina", "argentinian", "argento", "argentinafood", "cocinaargentina", 
        "9dejulio", "recetasargentinas", "argentinacocina", "asadoargentino", 
        "cocinargentina", "saboresargentinos", "guisoargentino", "matesargentino", "comidatradicional"
    ],
    EASY_TAG: [
        "facil", "fácil", "easy", "simple", "rapido", "recetarapida", 
        "recetasfaciles", "cocinafacil", "recetafacil", "recetasrapidas", 
        "recetasfáciles", "recetarápida", "cocinasimple", "cocinarapido"
    ],
    "sin_gluten": ["sintacc", "glutenfree", "singluten", "singlúten", "sinharina"],
    "pollo": ["pollo", "pechugadepollo", "pollojugoso", "pollopicante", "alitasdepollo", "alitas", "nuggetsdepollo"],
    "carne": ["carne", "carnes", "carneacuchillo", "carnesrojas", "peceto", "bifes"],
    "pasta": ["pasta", "pastas", "pastacasera", "pastalovers", "fideos", "sorrentinos", "lasagna", "lasagña"],
    "panaderia": ["pan", "pancasero", "panes", "panaderia", "panadero", "amasar", "masa", "pandepapa", "naan", "pannaan", "naanbread"],
    "salsas": ["salsa", "salsas", "salsita", "salsitas", "salsadeajo", "salsacasera", "aderezo", "dip", "guasacaca"],
    "zapallo": ["zapallo", "zapallito", "zapallitos", "calabaza", "cabutia", "sopadezapallo"],
    "salud o seguridad": ["sanitización", "seguridadalimentaria", "bromatologia", "higienealimentaria", "esterilización", "esteriliza", "conservacion", "cuidados"],
    "desayuno y merienda": ["desayuno", "merienda", "breakfast", "mate", "yerba", "curadodemate"],
    "japonesa": ["japonesas", "japonesa", "japanfood", "recetasjaponesas", "ramen", "sushi", "tonkatsu", "donburi"],
    "pescado": ["pescado", "merluza", "pezcado", "merluzaalhorno"],
    "tips": ["tipsdecocina", "consejosdecocina", "trucosdecocina", "cocinasaludable", "cocinaconsciente", "teoria", "concepto", "conceptos", "conceptoscocina"],
    "blw": ["blw", "babyledweaning", "alimentacioncomplementaria", "alimentacioninfantil", "comidaparabebes", "bliss"],
    "internacional": ["comidainternacional", "internationalfood", "worldcuisine", "recetasinternacionales", "saboresdelmundo", "asia"],
    "cookies": ["cookies", "cookiescaseras"]
}

# Marcadores de fin de sección al parsear ingredientes
SECTION_END_MARKERS = ["👣", "🔪", "👨‍🍳", "📝", "🍽️", "⏰", "💡", "pasos", "Pasos"]

# Post pineados
PINNED_MEDIAIDS = [3283787029367823611, 3280944293224657232]
